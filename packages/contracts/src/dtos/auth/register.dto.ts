import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email user' })
  @IsEmail({}, { message: 'Email tidak valid' })
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password user',
  })
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(50, { message: 'Password maksimal 50 karakter' })
  password: string;

  @ApiProperty({ example: 'Nurkholis Majid', description: 'Nama lengkap user' })
  @IsString()
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  fullName: string;
}
