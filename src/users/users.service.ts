import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  EDITOR = 'editor',
  ADMIN = 'admin',
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (createUserDto.password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.USER,
      isVerified: false,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const decryptedPassword = await bcrypt.compare(pass, user.password);

    if (!decryptedPassword) {
      throw new Error('Invalid password');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
