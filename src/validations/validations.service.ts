// validations.service.ts

import { Injectable, NotFoundException, UpdateResult } from '@nestjs/common';
import { Repository, FindOneOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../common/crud.service';

import { Validation } from './entities/validation.entity';
import { CreateValidationDto } from './dto/create-validation.dto';
import { UpdateValidationDto } from './dto/update-validation.dto';
import { ConfirmValidationDto } from './dto/confirm-validation.dto';

import { Milestone } from '../milestone/entities/milestone.entity';
import { User } from '../users/entities/user.entity';
import { TestQuiz } from '../test-quiz/entities/test-quiz.entity';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class ValidationsService extends CrudService<Validation> {
  constructor(
    @InjectRepository(Validation)
    private readonly validationRepository: Repository<Validation>,
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TestQuiz)
    private readonly testRepository: Repository<TestQuiz>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {
    super(validationRepository);
  }

  /**
   * Create a new validation record for a user and milestone.
   */
  async createValidation(createDto: CreateValidationDto): Promise<Validation> {
    const { userId, milestoneId, passed, score } = createDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const milestone = await this.milestoneRepository.findOne({ where: { id: milestoneId } });

    if (!user || !milestone) {
      throw new NotFoundException('User or Milestone not found.');
    }

    const newValidation = this.validationRepository.create({
      user,
      milestone,
      passed,
      score,
    });

    return this.validationRepository.save(newValidation);
  }

  /**
   * Update an existing validation by user ID and milestone ID.
   */
  async updateValidationByUserAndMilestone(
    userId: number,
    milestoneId: string,
    updateDto: UpdateValidationDto,
  ): Promise<Validation> {
    const { passed, score } = updateDto;

    const options: FindOneOptions<Validation> = {
      where: { user: { id: userId }, milestone: { id: milestoneId } },
    };
    const existingValidation = await this.validationRepository.findOne(options);

    if (!existingValidation) {
      throw new NotFoundException(`Validation for User ID ${userId} and Milestone ID ${milestoneId} not found.`);
    }

    if (passed !== undefined) existingValidation.passed = passed;
    if (score !== undefined) existingValidation.score = score;

    return this.validationRepository.save(existingValidation);
  }

  /**
   * Calculate score for a milestone and update validation.
   * Creates a new validation record if it does not exist.
   */
  async calculateAndUpdateScore(confirmDto: ConfirmValidationDto): Promise<UpdateResult> {
    const { userId, milestoneId, score } = confirmDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const milestone = await this.milestoneRepository.findOne({ where: { id: milestoneId } });

    if (!user || !milestone) {
      throw new NotFoundException('User or Milestone not found.');
    }

    // Find or create validation record
    let validation = await this.validationRepository.findOne({
      where: { user: { id: user.id }, milestone: { id: milestone.id } },
    });
    if (!validation) {
      validation = await this.validationRepository.save({ user, milestone, score, passed: false });
    }

    const threshold = 70;
    const passed = score >= threshold;

    validation.score = score;
    validation.passed = passed;

    return this.validationRepository.update(
      { user, milestone },
      { score: validation.score, passed: validation.passed },
    );
  }

  /**
   * Get validation result for a user and milestone.
   */
  async getValidationByUserAndMilestone(milestoneId: string, userId: number) {
    const validation = await this.validationRepository.findOne({
      where: { user: { id: userId }, milestone: { id: milestoneId } },
    });

    if (!validation) {
      throw new NotFoundException('User or Milestone validation not found.');
    }

    return { passed: validation.passed, score: validation.score };
  }
}