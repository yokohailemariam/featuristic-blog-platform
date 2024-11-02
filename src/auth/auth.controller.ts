import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Public } from './auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Public()
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  handleLogin() {
    return 'Google authentiction';
  }

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/redirect')
  async handleRedirect(@Req() req, @Res() res) {
    if (!req.user) {
      throw new InternalServerErrorException('No user from Google');
    }

    try {
      // Get the user from the request object
      const { user } = req;

      const payload = {
        email: user.email,
        sub: user.id,
      };

      // Generate access token
      const access_token = await this.jwtService.signAsync(payload);
      console.log({ usersss: user.id, token: access_token });

      return res.redirect(
        `${process.env.FRONTEND_URL}/google?token=${access_token}`,
      );
    } catch (err) {
      console.log(err);
    }
  }

  @Public()
  @Post('/google/callback')
  async googleAuthCallback(@Req() req, @Res() res) {
    const user = req.user;
    const token = this.jwtService.sign({ userId: user.id });
    res.json({ token });
  }
}
