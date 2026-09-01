import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './entites/user.entites.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        username,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }
}
