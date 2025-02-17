import { IsString, IsArray, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '../enums/platform.enum';

export class CreatePostDto {
  @ApiProperty({ description: 'Content of the social media post' })
  @IsString()
  content: string;

  @ApiProperty({ 
    description: 'List of platforms to post to',
    enum: Platform,
    isArray: true,
    example: [Platform.FACEBOOK, Platform.TWITTER]
  })
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms: Platform[];

  @ApiProperty({ required: false, description: 'URL of media to attach' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({ required: false, description: 'Schedule date for the post' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;
} 