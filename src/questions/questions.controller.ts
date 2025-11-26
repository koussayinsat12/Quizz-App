import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuizAnswersDto } from './dto/quiz-answers.dto';
import { AccessConctrolGuard } from '../Gaurds/roles.guard';
import { AuthGuard } from '../Gaurds/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Seed questions
  @Get('testseed')
  async seedQuestions() {
    await this.questionsService.seedQuestions(); // <-- add await
    return { message: 'Questions seeded successfully' };
  }

  // Get questions by quiz ID
  @Get('by-quiz/:quizID')
  async getByQuiz(@Param('quizID') quizID: number) {
    const questions = await this.questionsService.getQuestionsByQuiz1(quizID);
    return questions;
  }

  // Get count of questions for a quiz
  @Get('count/:quizId')
  async getCountByQuizId(@Param('quizId') quizId: number) {
    return await this.questionsService.getCountByQuizId(quizId);
  }

  // Create a new question (admin only)
  @UseGuards(AccessConctrolGuard)
  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    await this.questionsService.create(createQuestionDto);
    return { message: 'Question created successfully' };
  }

  // Get all questions
  @Get()
  async findAll() {
    return await this.questionsService.findAll();
  }

  // Get a single question by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.questionsService.findOne(+id);
  }

  // Update a question (admin only)
  @UseGuards(AccessConctrolGuard)
  @Patch(':id')
  async updateQuestion(@Param('id') questionID: number, @Body() updateQuestionDto: UpdateQuestionDto) {
    await this.questionsService.updateQuestion(questionID, updateQuestionDto);
    return { message: 'Question updated successfully' };
  }

  // Hard delete a question (admin only)
  @UseGuards(AccessConctrolGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.questionsService.deleteQuestion(+id);
    return { message: 'Question deleted successfully' };
  }

  // Soft delete a question (admin only)
  @UseGuards(AccessConctrolGuard)
  @Delete('/soft/:id')
  async removesoft(@Param('id') id: string) {
    await this.questionsService.deleteQuestionv2(+id);
    return { message: 'Question soft-deleted successfully' };
  }

  // Verify a single answer
  @UseGuards(AccessConctrolGuard)
  @Post(':id/verify')
  async verify(@Param('id') id: string, @Body('answer') answer: number) {
    const verificationResult = await this.questionsService.verifyAnswer(+id, answer);
    return { message: 'Verification successful', data: verificationResult };
  }

  // Verify a full quiz (authenticated user)
  @UseGuards(AuthGuard)
  @Post('verify-quiz')
  async verifyQuiz(@Body() quizAnswersDto: QuizAnswersDto, @User() user) {
    quizAnswersDto.userId = user.id;
    return await this.questionsService.verifyQuizAnswers(quizAnswersDto);
  }
}
