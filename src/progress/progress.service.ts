import { Injectable, NotFoundException, ConflictException  } from '@nestjs/common';
import { Repository, In, DataSource } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {
    super(progressRepository);
  }

  async create(createDto: CreateProgressDto): Promise<Progress> {
    const { roadmapId, userId, percentage = 0 } = createDto;

    const [user, roadmap] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.roadmapRepository.findOne({ where: { id: roadmapId } }),
    ]);

    if (!user || !roadmap) {
      throw new NotFoundException('User or Roadmap not found');
    }

    // Check if progress already exists
    const existing = await this.progressRepository.findOne({
      where: { user: { id: userId }, roadmap: { id: roadmapId } },
    });
    if (existing) {
      throw new ConflictException('Progress already exists for this user and roadmap');
    }

    const newProgress = this.progressRepository.create({
      user,
      roadmap,
      percentage,
    });

    return await this.progressRepository.save(newProgress);
  }

  async updateProgressByUserAndRoadmap(
    confirmUpdateProgressDto: ConfirmUpdateProgressDto,
  ): Promise<void> {
    const { userId, roadmapId } = confirmUpdateProgressDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingProgress = await queryRunner.manager.findOne(Progress, {
        where: { user: { id: userId }, roadmap: { id: roadmapId } },
      });
      if (!existingProgress) {
        throw new NotFoundException('Progress not found');
      }

      const milestones = await queryRunner.manager.find(Milestone, {
        where: { roadmap: { id: roadmapId } },
      });
      if (!milestones.length) {
        throw new NotFoundException('No milestones found for this roadmap');
      }

      const validations = await queryRunner.manager.find(Validation, {
        where: {
          user: { id: userId },
          milestone: { id: In(milestones.map(m => m.id)) },
          passed: true,
        },
      });

      const ratio = (validations.length / milestones.length) * 100;
      existingProgress.percentage = Number(ratio.toFixed(1));

      await queryRunner.manager.save(existingProgress);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProgressByUserAndRoadmap(userId: number, roadmapId: string): Promise<number> {
    const progress = await this.progressRepository.findOne({
      where: { user: { id: userId }, roadmap: { id: roadmapId } },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    return progress.percentage;
  }
}