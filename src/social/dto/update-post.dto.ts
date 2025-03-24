import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({
    description: 'Updated content of the post',
    required: true
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Updated media URL for the post',
    required: false
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}