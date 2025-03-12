import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '../enums/platform.enum';

export class AddPlatformCredentialDto {
  @ApiProperty({ 
    enum: Platform, 
    description: 'Social media platform identifier',
    example: Platform.FACEBOOK
  })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({ 
    description: 'Access token obtained from the social media platform',
    example: 'EAABwzLixnjYBOZBZBR6ZA...'
  })
  @IsString()
  accessToken: string;

  @ApiProperty({ 
    required: false, 
    description: 'Refresh token from the platform (if provided)',
    example: 'IQBwzLixnjYBOZBZBR6ZA...'
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiProperty({ 
    description: 'User ID for whom these credentials are being stored',
    example: 'user123'
  })
  @IsString()
  userId: string;
}