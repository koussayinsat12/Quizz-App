import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ValidationsService } from './validations.service';
import { CreateValidationDto } from './dto/create-validation.dto';
import { ConfirmValidationDto } from './dto/confirm-validation.dto';
import { AuthGuard } from '../Guards/jwt-auth.guard';
import { AccessControlGuard } from '../Guards/roles.guard';
import { User } from '../decorators/user.decorator';

@Controller('validations')
export class ValidationsController {
  constructor(private readonly validationsService: ValidationsService) {}

  /**
   * Create a new validation entry for the authenticated user
   */
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createValidationDto: CreateValidationDto,
    @User() user
  ) {
    createValidationDto.userId = user.id;
    const createdValidation = await this.validationsService.createValidation(createValidationDto);
    return { message: 'Validation created successfully', validation: createdValidation };
  }

  /**
   * Confirm validation and calculate the score for the authenticated user
   */
  @UseGuards(AuthGuard)
  @Post('confirm')
  async validate(
    @Body() confirmValidationDto: ConfirmValidationDto,
    @User() user
  ) {
    confirmValidationDto.userId = user.id;
    await this.validationsService.calculateAndUpdateScore(confirmValidationDto);
    return { message: 'Validation confirmed successfully' };
  }

  /**
   * Get validation data for a user by milestone
   */
  @UseGuards(AuthGuard)
  @Get('getData/:milestoneId')
  async getValidationByUserAndMilestone(
    @Param('milestoneId') milestoneId: string,
    @User() user
  ) {
    return await this.validationsService.getValidationByUserAndMilestone(milestoneId, user.id);
  }

  /**
   * Get all validations
   */
  @Get()
  async findAll() {
    return await this.validationsService.findAll();
  }

  /**
   * Get a specific validation by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.validationsService.findOne(id);
  }

  /**
   * Remove a validation by ID (admin only)
   */
  @UseGuards(AccessControlGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.validationsService.remove(+id);
    return { message: 'Validation removed successfully' };
  }
}