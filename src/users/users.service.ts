import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Progress } from '../progress/entities/progress.entity';
import { CrudService } from '../common/crud.service';

@Injectable()
export class UsersService extends CrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
  ) {
    super(userRepository);
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }


  /**
   * Get a user by ID
   */
  async getUserById(id: number): Promise<User> {
    const user = await super.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  /**
   * Get the total score of a user across all their progresses
   */
  async getTotalScore(userId: number): Promise<number> {
    const userProgresses = await this.progressRepository.find({
      where: { user: { id: userId } },
    });

    return userProgresses.reduce((total, progress) => total + progress.percentage, 0);
  }

  /**
   * Update a user's details
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.getUserById(id);

    if (updateUserDto.username) {
      existingUser.username = updateUserDto.username;
    }

    if (updateUserDto.email) {
      existingUser.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      existingUser.password = await this.hashPassword(updateUserDto.password);
    }

    return await this.userRepository.save(existingUser);
  }

  /**
   * Hash a password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}