import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SuccessMessage,
  Cookies,
  JwtAuthGuard,
  CurrentUser,
} from '@hris/common';
import type { AuthenticatedUser } from '@hris/contracts';
import { RegisterDto, LoginDto } from '@hris/contracts';
import type { Response } from 'express';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ description: 'login' })
  @SuccessMessage('Register success, check your email for verification')
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ description: 'login' })
  @ApiBody({ type: LoginDto })
  @SuccessMessage('Login success')
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto,
      ip,
      userAgent || '',
    );

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken, refreshToken, user };
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ description: 'refresh token' })
  @SuccessMessage('Refresh token success')
  @Post('refresh')
  async refresh(
    @Cookies({
      key: 'refreshToken',
      required: true,
      errorMessage: 'Refresh token is required',
    })
    refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, user } = await this.authService.refresh(refreshToken);

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    return { accessToken, user };
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ description: 'logout' })
  @SuccessMessage('Logout success')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: AuthenticatedUser,
    @Cookies({
      key: 'refreshToken',
      required: false,
    })
    refreshToken?: string,
  ) {
    await this.authService.logout(user.sub, refreshToken);
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
  }
}
