import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AccessControlGuard } from '../Guards/roles.guard';

@Controller('milestone')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  // Test seeding milestones (for development/testing)
  @Get('testseed')
  async seedsMilestones() {
    const milestones = await this.milestoneService.seedMilestones();
    return { message: 'Milestones seeded successfully', data: milestones };
  }

  // Create a milestone
  @UseGuards(AccessControlGuard)
  @Post()
  async create(@Body() createMilestoneDto: CreateMilestoneDto) {
    const milestone = await this.milestoneService.create(createMilestoneDto);
    return { message: 'Milestone created successfully', data: milestone };
  }

  // Update a milestone (partial update)
  @UseGuards(AccessControlGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    const updated = await this.milestoneService.update(id, updateMilestoneDto);
    return { message: 'Milestone updated successfully', data: updated };
  }

  // Get all milestones
  @Get()
  async findAll() {
    const milestones = await this.milestoneService.findAll();
    return milestones;
  }

  // Get a milestone by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const milestone = await this.milestoneService.findOne(id);
    return milestone;
  }

  // Soft delete a milestone
  @UseGuards(AccessControlGuard)
  @Delete('/soft/:id')
  async removeSoft(@Param('id') id: string) {
    const result = await this.milestoneService.removewithsoft(id);
    return { message: 'Soft milestone deleted successfully', data: result };
  }

  // Hard delete a milestone
  @UseGuards(AccessControlGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.milestoneService.remove(id);
    return { message: 'Milestone deleted successfully', data: result };
  }

  // Get milestones by roadmap ID
  @Get('byRoadmap/:roadmapId')
  async findMilestonesByRoadmap(@Param('roadmapId') roadmapId: string) {
    const milestones = await this.milestoneService.findMilestonesByRoadmap(roadmapId);
    return milestones;
  }
}