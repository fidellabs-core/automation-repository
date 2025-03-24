import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '../enums/platform.enum';

export class AddPlatformCredentialDto {
  @ApiProperty({ 
    enum: Platform, 
    description: 'Social media platform identifier',
    example: Platform.TWITTER
  })
  @IsEnum(Platform)
  platform: Platform;

  @ApiProperty({ 
    description: 'Access token obtained from the social media platform. For Twitter, this is the OAuth 1.0a Access Token',
    example: '1234567890-abcdefghijklmnopqrstuvwxyz'
  })
  @IsString()
  accessToken: string;

  @ApiProperty({ 
    required: false, 
    description: 'Refresh token (not used for Twitter OAuth 1.0a)',
    example: 'refresh-token-example'
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiProperty({ 
    required: true, 
    description: 'Twitter API Consumer Key (API Key)',
    example: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef'
  })
  @IsString()
  consumerKey: string;

  @ApiProperty({ 
    required: true, 
    description: 'Twitter API Consumer Secret (API Secret)',
    example: '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGH'
  })
  @IsString()
  consumerSecret: string;

  @ApiProperty({ 
    required: true, 
    description: 'Twitter OAuth 1.0a Token Secret',
    example: 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEF'
  })
  @IsString()
  tokenSecret: string;

  @ApiProperty({ 
    description: 'User ID for whom these credentials are being stored',
    example: 'user123'
  })
  @IsString()
  userId: string;
}