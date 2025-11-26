import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { CrudService } from '../common/crud.service';
import { TestQuiz } from './entities/test-quiz.entity';
import { Question } from '../questions/entities/question.entity';
import { CreateTestQuizDto } from './dto/create-test-quiz.dto';
import { UpdateTestQuizDto } from './dto/update-test-quiz.dto';

@Injectable()
export class TestQuizService extends CrudService<TestQuiz> {
  constructor(
    @InjectRepository(TestQuiz)
    private readonly testQuizRepository: Repository<TestQuiz>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {
    super(testQuizRepository);
  }

  /**
   * Create a quiz if it doesn't exist
   */
  async createQuizIfNotExists(title: string): Promise<TestQuiz> {
    let quiz = await this.testQuizRepository.findOneBy({ title });
    if (!quiz) {
      quiz = this.testQuizRepository.create({ title });
      quiz = await this.testQuizRepository.save(quiz);
    }
    return quiz;
  }

  /**
   * Add a question to a quiz
   */
  async addQuestionToQuiz(quiz: TestQuiz, questionData: any): Promise<Question> {
    const question = this.questionRepository.create({
      content: questionData.content,
      options: questionData.options,
      correctOption: questionData.correctOption,
      testQuiz: quiz,
    });

    return await this.questionRepository.save(question);
  }


  /**
   * Create default domain quizzes
   */
  async createDomainQuizzes(): Promise<void> {
    const domains = ['Machine Learning', 'DevOps', 'Sécurité', 'Réseau'];

    for (const title of domains) {
      await this.createQuizIfNotExists(title);
    }
  }

  /**
   * Get all quizzes
   */
  async findAll(): Promise<TestQuiz[]> {
    return await this.testQuizRepository.find();
  }

  /**
   * Get a quiz by ID
   */
  async findOne(id: number): Promise<TestQuiz> {
    const quiz = await this.testQuizRepository.findOneBy({ id });
    if (!quiz) throw new NotFoundException(`Quiz with ID ${id} not found`);
    return quiz;
  }

  /**
   * Get a quiz by title
   */
  async findByTitle(title: string): Promise<TestQuiz> {
    const quiz = await this.testQuizRepository.findOneBy({ title });
    if (!quiz) throw new NotFoundException(`Quiz with title "${title}" not found`);
    return quiz;
  }



  /**
   * Seed quizzes from a JSON file
   */
  async seedTestQuizzes(): Promise<void> {
    const filePath = path.join(__dirname, '../../data/test_quiz.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const quizData: CreateTestQuizDto[] = JSON.parse(rawData);

    for (const quizDto of quizData) {
      await this.createQuizIfNotExists(quizDto.title);
    }
  }
}