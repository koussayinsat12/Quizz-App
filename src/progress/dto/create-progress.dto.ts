import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProgressDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  roadmapId: string;

  @IsOptional()
  @IsNumber()
  percentage?: number; // Remove default, handle in service
}