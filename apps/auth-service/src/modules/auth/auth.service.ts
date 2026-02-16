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
import { JwtPayload } from '@hris/contracts';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get all permissions for a user based on their assigned roles
   * This method is optimized with a single query and proper joins
   *
   * @param userId - User ID to fetch permissions for
   * @returns Array of permission strings in format "resource:action:scope"
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              select: {
                name: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        resource: true,
                        action: true,
                        scope: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    const permissionSet = new Set<string>();

    user.roles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        const { resource, action, scope } = rolePermission.permission;
        const permissionString = `${resource}:${action}:${scope || 'all'}`;
        permissionSet.add(permissionString);
      });
    });

    return Array.from(permissionSet);
  }

  /**
   * Get all roles for a user
   *
   * @param userId - User ID to fetch roles for
   * @returns Array of role names
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    return user.roles.map((ur) => ur.role.name);
  }

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

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Email or password is wrong');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          status: 'FAILED',
          failReason: 'Invalid password',
        },
      });

      throw new UnauthorizedException('Email or password is wrong');
    }

    if (!user.isActive || user.isSuspended) {
      throw new UnauthorizedException('User is incactive or suspended');
    }

    const permissions = await this.getUserPermissions(user.id);
    const roles = await this.getUserRoles(user.id);

    const accessToken = await this.generateToken(
      user.id,
      email,
      permissions,
      roles,
    );

    const refreshToken = await this.generateRefreshToken(user.id, email);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress,
        userAgent,
      },
    });

    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles,
        permissions,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const { sub } = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
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

      const permissions = await this.getUserPermissions(sub);
      const roles = await this.getUserRoles(sub);

      const user = await this.prisma.user.findUnique({
        where: { id: sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = await this.generateToken(
        user.id,
        user.email,
        permissions,
        roles,
      );

      return {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          roles,
          permissions,
        },
      };
    } catch (error) {
      this.logger.error(error);
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

  private async generateToken(
    userId: string,
    email: string,
    permissions: string[],
    roles: string[],
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      permissions,
      roles,
      type: 'access',
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
    });
  }

  private async generateRefreshToken(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload = { sub: userId, email };

    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });
  }
}
