import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from '@hris/contracts';
import { JwtPayload } from '@hris/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        username: dto.fullName,
      },
      select: { id: true, email: true, username: true },
    });

    return user;
  }

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
      throw new UnauthorizedException('Email atau password salah');

    const accessToken = await this.generateToken(user.id, email);
    const refreshToken = await this.generateRefreshToken(user.id, email);

    if (accessToken && refreshToken) {
      await this.prisma.$transaction(async (tx) => {
        await tx.refreshToken.create({
          data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ipAddress,
            userAgent,
          },
        });

        await tx.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress,
            userAgent,
            status: 'SUCCESS',
          },
        });
      });
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const { sub } = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (tokenRecord.isRevoked) {
        throw new UnauthorizedException('Refresh token revoked');
      }

      if (tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.prisma.user.findUnique({ where: { id: sub } });
      if (!user) throw new UnauthorizedException('User not found');

      const accessToken = await this.generateToken(user.id, user.email);

      return {
        accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { isRevoked: true },
      });
    }
  }

  private async generateToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
  }

  private async generateRefreshToken(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload = { sub: userId, email };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }
}
