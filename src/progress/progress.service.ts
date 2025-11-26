import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, FindManyOptions, FindOneOptions, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../common/crud.service';

import { Progress } from './entities/progress.entity';
import { CreateProgressDto } from './dto/create-progress.dto';
import { ConfirmUpdateProgressDto } from './dto/confirm-progress.dto';
import { Milestone } from '../milestone/entities/milestone.entity';
import { Validation } from '../validations/entities/validation.entity';
import User from '../users/entities/user.entity';
import { Roadmap } from '../roadmaps/entities/roadmap.entity';

@Injectable()
export class ProgressService extends CrudService<Progress> {
  constructor(
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Roadmap)
    private readonly roadmapRepository: Repository<Roadmap>,

    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,

    @InjectRepository(Validation)
    private readonly validationRepository: Repository<Validation>,
  ) {
    super(progressRepository);
  }

  // Create a new progress record
  async create(createDto: CreateProgressDto): Promise<Progress> {
    const { roadmapId, userId, percentage } = createDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const roadmap = await this.roadmapRepository.findOne({ where: { id: roadmapId } });

    if (!user || !roadmap) {
      throw new NotFoundException('User or Roadmap not found.');
    }

    const newProgress = this.progressRepository.create({
      user,
      roadmap,
      percentage,
    });

    return await this.progressRepository.save(newProgress);
  }

  // Update progress percentage based on validations for a user's roadmap
  async updateProgressByUserAndRoadmap(confirmUpdateProgressDto: ConfirmUpdateProgressDto): Promise<UpdateResult> {
    const { userId, roadmapId } = confirmUpdateProgressDto;

    const existingProgress = await this.progressRepository.findOne({
      where: { user: { id: userId }, roadmap: { id: roadmapId } },
    });

    if (!existingProgress) {
      throw new NotFoundException('Progress for User and Roadmap not found.');
    }

    const milestones = await this.milestoneRepository.find({
      where: { roadmap: { id: roadmapId } },
    });

    if (!milestones || milestones.length === 0) {
      throw new NotFoundException(`No milestones found for Roadmap ID ${roadmapId}.`);
    }

    // Count validations that passed
    const validations = await this.validationRepository.find({
      where: { user: { id: userId }, milestone: { id: In(milestones.map(m => m.id)) } },
    });

    const validatedCount = validations.filter(v => v.passed).length;
    const ratio = (validatedCount / milestones.length) * 100;

    existingProgress.percentage = Number(ratio.toFixed(1));

    return await this.progressRepository.update(existingProgress.id, {
      percentage: existingProgress.percentage,
    });
  }

  // Get progress percentage for a user and roadmap
  async getProgressByUserAndRoadmap(userId: number, roadmapId: string): Promise<number> {
    const existingProgress = await this.progressRepository.findOne({
      where: { user: { id: userId }, roadmap: { id: roadmapId } },
    });

    if (!existingProgress) {
      throw new NotFoundException(`Progress for User ID ${userId} and Roadmap ID ${roadmapId} not found.`);
    }

    return existingProgress.percentage;
  }
}
