import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { CrudService } from '../common/crud.service';
import { Roadmap } from './entities/roadmap.entity';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';

@Injectable()
export class RoadmapService extends CrudService<Roadmap> {
  constructor(
    @InjectRepository(Roadmap)
    private readonly roadmapRepository: Repository<Roadmap>,
  ) {
    super(roadmapRepository);
  }

 

  /**
   * Seed roadmaps from JSON file
   */
  async seedRoadmaps(): Promise<void> {
    const filePath = path.join(__dirname, '../../data/roadmap.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const roadmapData: CreateRoadmapDto[] = JSON.parse(rawData);

    for (const roadmapDto of roadmapData) {
      const roadmap = this.roadmapRepository.create(roadmapDto);
      await this.roadmapRepository.save(roadmap);
    }
  }

}