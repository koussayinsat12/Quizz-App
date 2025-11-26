import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { Repository, In, DataSource } from 'typeorm';
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

  async create(createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
    const { roadmapId, description, orderNumber, quizId } = createMilestoneDto;

    const roadmap = await this.roadmapRepository.findOne({ 
      where: { id: roadmapId } 
    });
    if (!roadmap) {
      throw new NotFoundException(`Roadmap with ID "${roadmapId}" not found`);
    }

    let testQuiz = await this.testQuizRepository.findOne({ 
      where: { id: quizId } 
    });
    if (!testQuiz) {
      throw new NotFoundException(`TestQuiz with ID "${quizId}" not found`);
    }

    const milestone = this.milestoneRepository.create({
      roadmap,
      quiz: testQuiz,
      description,
      orderNumber,
    });

    return await this.milestoneRepository.save(milestone);
  }

  async findMilestonesByRoadmap(roadmapId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { roadmap: { id: roadmapId } },
      relations: ['quiz'],
      order: { orderNumber: 'ASC' },
    });
  }

  async seedMilestones(): Promise<void> {
    try {
      const filePath = path.join(__dirname, '../../data/milestone.json');
      const rawData = await fs.readFile(filePath, 'utf8');
      const milestoneData: CreateMilestoneDto[] = JSON.parse(rawData);

      const roadmapIds = [...new Set(milestoneData.map(m => m.roadmapId))];
      const quizIds = [...new Set(milestoneData.map(m => m.quizId))];

      const [roadmaps, quizzes] = await Promise.all([
        this.roadmapRepository.find({ where: { id: In(roadmapIds) } }),
        this.testQuizRepository.find({ where: { id: In(quizIds) } }),
      ]);

      const roadmapMap = new Map(roadmaps.map(r => [r.id, r]));
      const quizMap = new Map(quizzes.map(q => [q.id, q]));

      const milestonesToCreate = milestoneData
        .filter(m => roadmapMap.has(m.roadmapId) && quizMap.has(m.quizId))
        .map(m => this.milestoneRepository.create({
          description: m.description,
          orderNumber: m.orderNumber,
          roadmap: roadmapMap.get(m.roadmapId)!,
          quiz: quizMap.get(m.quizId)!,
        }));

      await this.milestoneRepository.save(milestonesToCreate);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to seed milestones: ${error.message}`);
    }
  }
}