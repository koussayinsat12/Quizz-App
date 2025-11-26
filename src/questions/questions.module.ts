import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

import { Question } from './entities/question.entity';
import { TestQuiz } from '../test-quiz/entities/test-quiz.entity';
import { Validation } from '../validations/entities/validation.entity';
import { User } from '../users/entities/user.entity';
import { Milestone } from '../milestone/entities/milestone.entity';
import { Roadmap } from '../roadmaps/entities/roadmap.entity';
import { Progress } from '../progress/entities/progress.entity';

import { ValidationsModule } from '../validations/validations.module';
import { ProgressModule } from '../progress/progress.module';
import { MilestoneModule } from '../milestone/milestone.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Question, TestQuiz, Validation, User, Milestone, Roadmap, Progress]),
    ValidationsModule,
    ProgressModule,
    MilestoneModule
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}