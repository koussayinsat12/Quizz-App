import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { Repository } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { TestQuiz } from '../test-quiz/entities/test-quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Roadmap } from '../roadmaps/entities/roadmap.entity';
import { CrudService } from '../common/crud.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MilestoneService extends CrudService<Milestone> {
  constructor(
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,

    @InjectRepository(TestQuiz)
    private readonly testQuizRepository: Repository<TestQuiz>,

    @InjectRepository(Roadmap)
    private readonly roadmapRepository: Repository<Roadmap>,
  ) {
    super(milestoneRepository);
  }

  // Create a new milestone
  async create(createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
    const { id, roadmapId, description, orderNumber } = createMilestoneDto;

    const roadmap = await this.roadmapRepository.findOne({ where: { id: roadmapId } });
    if (!roadmap) throw new NotFoundException(`Roadmap with ID "${roadmapId}" not found.`);

    let testQuiz = await this.testQuizRepository.findOne({ where: { title: id } });
    if (!testQuiz) {
      testQuiz = this.testQuizRepository.create({ title: id });
      await this.testQuizRepository.save(testQuiz);
    }

    const milestone = this.milestoneRepository.create({
      id,
      roadmap,
      quiz: testQuiz,
      description,
      orderNumber,
    });

    return this.milestoneRepository.save(milestone);
  }

  // Get milestones by roadmap ID
  async findMilestonesByRoadmap(roadmapId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { roadmap: { id: roadmapId } },
      relations: ['quiz'],
      order: { orderNumber: 'ASC' },
      select: ['id', 'description', 'orderNumber', 'createdAt', 'updatedAt', 'deletedAt', 'quiz'],
    });
  }

  // Hard delete milestone
  async deleteMilestone(id: string): Promise<string> {
    try {
      await super.removewithsoft(id);
      return `Milestone with ID "${id}" has been successfully deleted`;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return `Milestone with ID "${id}" not found`;
      }
      throw error;
    }
  }

  // Soft delete milestone
  async deleteMilestonev2(id: string): Promise<string> {
    try {
      await super.removewithsoft(id);
      return `Milestone with ID "${id}" has been successfully soft deleted`;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return `Milestone with ID "${id}" not found`;
      }
      throw error;
    }
  }

  // Seed milestones from JSON file
  async seedMilestones(): Promise<void> {
    const filePath = path.join(__dirname, '../../data/milestone.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const milestoneData = JSON.parse(rawData);

    for (const mData of milestoneData) {
      const roadmap = await this.roadmapRepository.findOne({ where: { id: mData.roadmapId } });
      if (!roadmap) {
        console.warn(`Roadmap "${mData.roadmapId}" not found. Skipping milestone "${mData.title}".`);
        continue;
      }

      let testQuiz = await this.testQuizRepository.findOne({ where: { title: mData.quizId } });
      if (!testQuiz) {
        console.warn(`TestQuiz "${mData.quizId}" not found. Skipping milestone "${mData.title}".`);
        continue;
      }

      const milestone = this.milestoneRepository.create({
        id: mData.title,
        description: mData.description,
        orderNumber: mData.orderNumber,
        roadmap,
        quiz: testQuiz,
      });

      await this.milestoneRepository.save(milestone);
    }
  }
}
