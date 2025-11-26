import { Entity,Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Roadmap } from '../../roadmaps/entities/roadmap.entity';
import { TestQuiz } from '../../test-quiz/entities/test-quiz.entity';
import { Validation } from '../../validations/entities/validation.entity';

@Entity()
export class Milestone {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Roadmap, roadmap => roadmap.milestones,{eager:true , onDelete: 'CASCADE' })
  roadmap: Roadmap;

  @OneToMany(() => Validation, validations => validations.milestone)
  validations: Validation[]

  @OneToOne(() => TestQuiz, testQuiz => testQuiz.milestone)
  @JoinColumn()
  quiz: TestQuiz;

  @Column()
  description: string;

  @Column()
  orderNumber:number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}