import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TestQuizService } from './test-quiz.service';
import { CreateTestQuizDto } from './dto/create-test-quiz.dto';
import { UpdateTestQuizDto } from './dto/update-test-quiz.dto';
import { AccessControlGuard } from '../Guards/roles.guard';

@Controller('quiz')
export class TestQuizController {
  constructor(private readonly testQuizService: TestQuizService) {}

  /**
   * Seed test quizzes from JSON file
   */
  @Get('testseed')
  async seedTestQuizzes() {
    await this.testQuizService.seedTestQuizzes();
    return { message: 'Test quizzes seeded successfully' };
  }

  /**
   * Create a single test quiz (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Post()
  async createQuiz(@Body() createTestQuizDto: CreateTestQuizDto) {
    await this.testQuizService.create(createTestQuizDto);
    return { message: 'Test quiz created successfully' };
  }

  /**
   * Create domain-specific quizzes (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Post('/createquizzes')
  async createDomainQuizzes() {
    await this.testQuizService.createDomainQuizzes();
    return { message: 'Domain quizzes created successfully' };
  }

  /**
   * Get all test quizzes
   */
  @Get()
  async findAll() {
    return await this.testQuizService.findAll();
  }

  /**
   * Get a test quiz by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.testQuizService.findOne(id);
  }

  /**
   * Get a test quiz by title
   */
  @Get('/title/:title')
  async findByTitle(@Param('title') title: string) {
    return await this.testQuizService.findByTitle(title);
  }

  /**
   * Update a test quiz by ID (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateTestQuizDto: UpdateTestQuizDto) {
    await this.testQuizService.update(id, updateTestQuizDto);
    return { message: 'Test quiz updated successfully' };
  }


  @UseGuards(AccessControlGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.testQuizService.remove(id);
    return { message: 'Test quiz deleted successfully' };
  }
}