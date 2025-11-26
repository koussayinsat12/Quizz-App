import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { Repository, In } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { TestQuiz } from '../test-quiz/entities/test-quiz.entity';
import { Roadmap } from '../roadmaps/entities/roadmap.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from '../common/crud.service';
import * as fs from 'fs/promises';
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
    const { roadmapId, description, orderNumber, quizId } = createMilestoneDto;

    const roadmap = await this.roadmapRepository.findOne({ where: { id: roadmapId } });
    if (!roadmap) throw new NotFoundException(`Roadmap with ID "${roadmapId}" not found.`);

    let testQuiz = await this.testQuizRepository.findOne({ where: { id: quizId } });
    if (!testQuiz) {
      testQuiz = this.testQuizRepository.create({ id: quizId });
      await this.testQuizRepository.save(testQuiz);
    }

    const milestone = this.milestoneRepository.create({
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
  async hardDelete(id: string): Promise<string> {
    const milestone = await this.milestoneRepository.findOne({ where: { id } });
    if (!milestone) return `Milestone with ID "${id}" not found`;

    await this.milestoneRepository.remove(milestone);
    return `Milestone with ID "${id}" has been permanently deleted`;
  }

  // Soft delete milestone
  async softDelete(id: string): Promise<string> {
    const result = await this.milestoneRepository.softDelete(id);
    if (result.affected === 0) return `Milestone with ID "${id}" not found`;

    return `Milestone with ID "${id}" has been successfully soft deleted`;
  }

  // Seed milestones from JSON file
  async seedMilestones(): Promise<void> {
    const filePath = path.join(__dirname, '../../data/milestone.json');
    const rawData = await fs.readFile(filePath, 'utf8');
    const milestoneData: CreateMilestoneDto[] = JSON.parse(rawData);

    // Fetch all roadmaps and quizzes once to reduce DB calls
    const roadmapIds = milestoneData.map(m => m.roadmapId);
    const quizIds = milestoneData.map(m => m.quizId);

    const roadmaps = await this.roadmapRepository.find({ where: { id: In(roadmapIds) } });
    const quizzes = await this.testQuizRepository.find({ where: { id: In(quizIds) } });

    const roadmapMap = new Map(roadmaps.map(r => [r.id, r]));
    const quizMap = new Map(quizzes.map(q => [q.id, q]));

    for (const mData of milestoneData) {
      const roadmap = roadmapMap.get(mData.roadmapId);
      const quiz = quizMap.get(mData.quizId);

      if (!roadmap) {
        console.warn(`Roadmap "${mData.roadmapId}" not found. Skipping milestone "${mData.description}".`);
        continue;
      }
      if (!quiz) {
        console.warn(`TestQuiz "${mData.quizId}" not found. Skipping milestone "${mData.description}".`);
        continue;
      }

      const milestone = this.milestoneRepository.create({
        description: mData.description,
        orderNumber: mData.orderNumber,
        roadmap,
        quiz,
      });

      await this.milestoneRepository.save(milestone);
    }
  }
}
