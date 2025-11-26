import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConfirmUpdateProgressDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  roadmapId: string;
}