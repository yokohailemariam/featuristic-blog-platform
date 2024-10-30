import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const decryptedPassword = await bcrypt.compare(password, user.password);

    if (!decryptedPassword) {
      throw new BadRequestException('Invalid email or password');
    }

    const payload = {
      email: user.email,
      sub: user.id,
    };
    return {
      username: user.username,
      name: user.name,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new Error('User not found');
    }

    const decryptedPassword = await bcrypt.compare(password, user.password);

    if (decryptedPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
