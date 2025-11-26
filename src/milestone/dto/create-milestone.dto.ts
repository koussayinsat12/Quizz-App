import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMilestoneDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  roadmapId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  orderNumber: number;
}
