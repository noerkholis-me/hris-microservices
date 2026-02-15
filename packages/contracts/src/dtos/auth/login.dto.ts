import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email user' })
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password user' })
  @IsString()
  password: string;
}
