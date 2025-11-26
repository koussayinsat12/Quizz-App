import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { CrudService } from '../common/crud.service';
import { Question } from './entities/question.entity';
import { TestQuiz } from '../test-quiz/entities/test-quiz.entity';
import { Milestone } from 'src/milestone/entities/milestone.entity';
import { QuizAnswersDto } from './dto/quiz-answers.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ValidationsService } from '../validations/validations.service';
import { ConfirmValidationDto } from '../validations/dto/confirm-validation.dto';
import { ProgressService } from 'src/progress/progress.service';
import { ConfirmUpdateProgressDto } from 'src/progress/dto/confirm-progress.dto';

@Injectable()
export class QuestionsService extends CrudService<Question> {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,

    @InjectRepository(TestQuiz)
    private readonly testQuizRepository: Repository<TestQuiz>,

    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,

    private readonly validationService: ValidationsService,
    private readonly progressService: ProgressService,
  ) {
    super(questionsRepository);
  }

  /**
   * Seed questions from JSON file
   */
  async seedQuestions(): Promise<void> {
    const filePath = path.join(__dirname, '../../data/question (shrot version).json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const questionData = JSON.parse(rawData);

    for (const qData of questionData) {
      const question = new Question();
      question.content = qData.content;
      question.options = qData.options;
      question.correctOption = qData.correctOption;

      const testQuiz = await this.testQuizRepository.findOne({
        where: { title: qData.testQuizId },
      });

      if (testQuiz) {
        question.testQuiz = testQuiz;
      } else {
        console.warn(`TestQuiz "${qData.testQuizId}" not found for question.`);
      }

      await this.questionsRepository.save(question);
    }
  }

  /**
   * Get all questions for a specific quiz
   */
  async getQuestionsByQuiz1(id: number): Promise<Question[]> {
    return await this.questionsRepository.find({ where: { testQuiz: { id } } });
  }

  /**
   * Count number of questions in a quiz
   */
  async getCountByQuizId(id: number): Promise<number> {
    return await this.questionsRepository.count({ where: { testQuiz: { id } } });
  }

  /**
   * Create a new question
   */
  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const quiz = await this.testQuizRepository.findOne({
      where: { title: createQuestionDto.testQuizId },
    });

    if (!quiz) {
      throw new NotFoundException(
        `Quiz with ID ${createQuestionDto.testQuizId} not found. Please create the quiz first.`,
      );
    }

    const question = this.questionsRepository.create({
      content: createQuestionDto.content,
      options: createQuestionDto.options,
      correctOption: createQuestionDto.correctOption,
      testQuiz: quiz,
    });

    return await this.questionsRepository.save(question);
  }

  /**
   * Get all questions
   */
  async findAll(): Promise<Question[]> {
    return await super.findAll();
  }

  /**
   * Update a question
   */
  async updateQuestion(id: number, updateDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionsRepository.findOneBy({ id });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found.`);
    }

    if (updateDto.testQuizId) {
      const testQuiz = await this.testQuizRepository.findOne({
        where: { title: updateDto.testQuizId },
      });
      if (!testQuiz) {
        throw new NotFoundException(`TestQuiz with ID ${updateDto.testQuizId} not found.`);
      }
      question.testQuiz = testQuiz;
    }

    return await super.update(id, updateDto);
  }

  /**
   * Hard delete a question
   */
  async deleteQuestion(id: number): Promise<string> {
    try {
      await super.remove(id);
      return `Question with ID "${id}" has been successfully deleted`;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return `Question with ID "${id}" not found`;
      }
      throw error;
    }
  }

  /**
   * Soft delete a question
   */
  async deleteQuestionv2(id: number): Promise<string> {
    try {
      await super.removewithsoft(id);
      return `Question with ID "${id}" has been successfully soft deleted`;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return `Question with ID "${id}" not found`;
      }
      throw error;
    }
  }

  /**
   * Verify a single question answer
   */
  async verifyAnswer(questionId: number, userAnswer: number): Promise<boolean> {
    const question = await this.questionsRepository.findOneBy({ id: questionId });
    if (!question) throw new NotFoundException('Question not found');
    return question.correctOption === userAnswer;
  }

  /**
   * Verify all answers for a quiz and update validation & progress
   */
  async verifyQuizAnswers(quizAnswersDto: QuizAnswersDto): Promise<{ message: string; score: string }> {
    const quiz = await this.testQuizRepository.findOne({ where: { id: quizAnswersDto.quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let correctCount = 0;

    // Verify each answer
    const results = await Promise.all(
      quizAnswersDto.answers.map(async (answer) => {
        const isCorrect = await this.verifyAnswer(answer.questionId, answer.userAnswer);
        if (isCorrect) correctCount++;
        return { questionId: answer.questionId, isCorrect };
      }),
    );

    const score = (correctCount / quizAnswersDto.answers.length) * 100;

    // Update Validation
    const confirmValidationDto = new ConfirmValidationDto();
    confirmValidationDto.milestoneId = quiz.title;
    confirmValidationDto.userId = quizAnswersDto.userId;
    confirmValidationDto.score = score;
    await this.validationService.calculateAndUpdateScore(confirmValidationDto);

    // Update Progress
    const milestone = await this.milestoneRepository.findOne({ where: { id: quiz.title }, relations: ['roadmap'] });
    if (milestone) {
      const confirmProgressDto = new ConfirmUpdateProgressDto();
      confirmProgressDto.userId = quizAnswersDto.userId;
      confirmProgressDto.roadmapId = milestone.roadmap.id;
      await this.progressService.updateProgressByUserAndRoadmap(confirmProgressDto);
    }

    return { message: 'Verifying successful', score: score.toFixed(2) };
  }
}
