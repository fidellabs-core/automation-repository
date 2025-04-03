import { IsString, IsEnum, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '../enums/platform.enum';
import { Type } from 'class-transformer';

// Platform-specific credential classes
class TwitterCredentials {
  @ApiProperty({ description: 'Twitter API Consumer Key (API Key)' })
  @IsString()
  consumerKey: string;

  @ApiProperty({ description: 'Twitter API Consumer Secret (API Secret)' })
  @IsString()
  consumerSecret: string;

  @ApiProperty({ description: 'Twitter OAuth 1.0a Token Secret' })
  @IsString()
  tokenSecret: string;
}

class LinkedInCredentials {
  @ApiProperty({ description: 'LinkedIn User ID (sub value from ID token)' })
  @IsString()
  userId: string;
}

class PinterestCredentials {
  @ApiProperty({ description: 'Pinterest Board ID' })
  @IsString()
  boardId: string;
}

export class AddPlatformCredentialDto {
  @ApiProperty({ 
    enum: Platform, 
    description: 'Social media platform identifier',
    example: Platform.TWITTER
  })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({ 
    description: 'Access token obtained from the social media platform',
    example: '1234567890-abcdefghijklmnopqrstuvwxyz'
  })
  @IsString()
  accessToken: string;

  @ApiProperty({ 
    required: false, 
    description: 'Refresh token (if applicable)',
    example: 'refresh-token-example'
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

  @ApiProperty({
    required: false,
    description: 'Platform-specific credentials as a JSON object',
    example: {
      consumerKey: 'abc123',
      consumerSecret: 'def456',
      tokenSecret: 'ghi789'
    }
  })
  @IsObject()
  @IsOptional()
  credentialsData?: any;
}