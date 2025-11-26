import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../Guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { AccessControlGuard } from '../Guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Hard delete a user by ID
   */
  @UseGuards(AccessControlGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const message = await this.usersService.remove(id);
    return { message };
  }

  /**
   * Soft delete a user by ID
   */
  @UseGuards(AccessControlGuard)
  @Delete('/soft/:id')
  async removesoft(@Param('id') id: string) {
    const message = await this.usersService.removewithsoft(id);
    return { message };
  }

  /**
   * Get all users
   */
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  /**
   * Get the currently logged-in user
   */
  @UseGuards(AuthGuard)
  @Get('getuser')
  async getUserById(@User() user) {
    return await this.usersService.getUserById(user.id);
  }

  /**
   * Get total score of a user
   */
  @Get(':id/totalscore')
  async getTotalScore(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getTotalScore(id);
  }

  /**
   * Update the currently logged-in user
   */
  @UseGuards(AuthGuard)
  @Post('reset')
  async update(@Body() updateUserDto: UpdateUserDto, @User() user) {
    await this.usersService.updateUser(user.id, updateUserDto);
    return { message: 'User updated successfully' };
  }
}