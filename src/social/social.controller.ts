import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('Social Media')
@Controller('social')
@ApiBearerAuth()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('post')
  @ApiOperation({ summary: 'Create a new social media post' })
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.socialService.createPost(createPostDto);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get all posts' })
  getPosts() {
    return this.socialService.getPosts();
  }

  @Get('post/:id')
  @ApiOperation({ summary: 'Get a specific post' })
  getPost(@Param('id') id: string) {
    return this.socialService.getPost(id);
  }
} 