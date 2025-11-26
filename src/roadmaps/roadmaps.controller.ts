import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoadmapService } from './roadmaps.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { AccessControlGuard } from '../Guards/roles.guard';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapService) {}

  /**
   * Create a new roadmap (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Post()
  async create(@Body() createRoadmapDto: CreateRoadmapDto) {
    await this.roadmapsService.create(createRoadmapDto);
    return { message: 'Roadmap created successfully' };
  }

  /**
   * Update an existing roadmap (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoadmapDto: UpdateRoadmapDto) {
    await this.roadmapsService.update(id, updateRoadmapDto);
    return { message: 'Roadmap updated successfully' };
  }

  /**
   * Get all roadmaps
   */
  @Get()
  async findAll() {
    return await this.roadmapsService.findAll();
  }

  /**
   * Get a single roadmap by ID
   */
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.roadmapsService.findOne(id);
  }

  /**
   * Hard delete a roadmap (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.roadmapsService.remove(id);
    return { message: 'Roadmap deleted successfully' };
  }

  /**
   * Soft delete a roadmap (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Delete('/soft/:id')
  async removesoft(@Param('id') id: string) {
    await this.roadmapsService.removewithsoft(id);
    return { message: 'Roadmap soft-deleted successfully' };
  }
}