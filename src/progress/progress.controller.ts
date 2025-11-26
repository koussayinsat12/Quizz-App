import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { ConfirmUpdateProgressDto } from './dto/confirm-progress.dto';
import { AuthGuard } from '../Gaurds/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @UseGuards(AuthGuard)
  @Post('createRoadmap')
  async create(@Body() createProgressDto: CreateProgressDto, @User() user) {
    createProgressDto.userId = user.id;
    await this.progressService.create(createProgressDto);
    return { message: 'Progress created successfully' };
  }

  @UseGuards(AuthGuard)
  @Patch('confirm')
  async confirm(@Body() confirmUpdateProgressDto: ConfirmUpdateProgressDto, @User() user) {
    confirmUpdateProgressDto.userId = user.id;
    await this.progressService.updateProgressByUserAndRoadmap(confirmUpdateProgressDto);
    return { message: 'Progress confirmed successfully' };
  }

  @Get()
  async findAll() {
    return await this.progressService.findAll():
  }

  @UseGuards(AuthGuard)
  @Get('getprogress/:roadmapId')
  async getProgressByUserAndRoadmap(
    @Param('roadmapId') roadmapId: string,
    @User() user,
  ) {
    return await this.progressService.getProgressByUserAndRoadmap(user.id, roadmapId);
  }
}
