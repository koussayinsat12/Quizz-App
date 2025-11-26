import { Module } from '@nestjs/common';


import {Progress} from "./entities/progress.entity";

import {Milestone} from "../milestone/entities/milestone.entity";
import {Validation} from "../validations/entities/validation.entity";
import {User} from "../users/entities/user.entity";
import {Roadmap} from "../roadmaps/entities/roadmap.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';


@Module({
  imports: [TypeOrmModule.forFeature([Progress,User,Roadmap,Validation,Milestone])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService]
})
export class ProgressModule {}
