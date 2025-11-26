import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerDto {
  @IsInt()
  questionId: number;

  @IsInt()
  userAnswer: number;
}

export class QuizAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];

  @IsInt()
  @IsNotEmpty()
  quizId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}