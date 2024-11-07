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
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email.toLowerCase() }],
    });

    const baseUsername = createUserDto.email.split('@')[0];
    const username = await this.generateUniqueUsername(baseUsername);

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
      username,
      password: hashedPassword,
      role: UserRole.USER,
      isVerified: false,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async findOne(email: string) {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async generateUniqueUsername(baseName: string): Promise<string> {
    let username = baseName;
    let suffix = 1;

    while (await this.usernameTaken(username)) {
      username = `${baseName}${suffix}`;
      suffix++;
    }

    return username.toLowerCase();
  }

  private async usernameTaken(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { username } });
    return !!user;
  }
}
