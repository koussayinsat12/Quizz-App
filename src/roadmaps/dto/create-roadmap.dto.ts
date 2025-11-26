import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRoadmapDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  domain: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}