import { Controller, Post, Body, Get, Param, UseGuards, Query, HttpStatus, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AddPlatformCredentialDto } from './dto/add-platform-credential.dto';
import { Logger } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('Social Media')
@Controller('social')
@ApiBearerAuth()
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(private readonly socialService: SocialService) {}

  @Post('post')
  @ApiOperation({ summary: 'Create a new social media post' })
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.socialService.createPost(createPostDto);
  }

  @Get('platform/credentials')
  @ApiOperation({ summary: 'Get all platform credentials' })
  getPlatformCredentials() {
    return this.socialService.getPlatformCredentials();
  }

  @Get('platform/credential/:platform')
  @ApiOperation({ summary: 'Get credentials for specific platform' })
  getPlatformCredential(@Param('platform') platform: string) {
    return this.socialService.getPlatformCredential(platform);
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

  @Put('posts/:id')
  @ApiOperation({ summary: 'Update a social media post' })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    return this.socialService.updatePost(id, updatePostDto);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a social media post' })
  async deletePost(@Param('id') id: string) {
    return this.socialService.deletePost(id);
  }
  // Keep the platform credential endpoints as they are:
  @Post('platform/credential')
  @ApiOperation({ 
    summary: 'Add platform credentials',
    description: 'Store social media platform access tokens obtained from frontend OAuth flow'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The credentials have been successfully stored' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid platform or missing required fields' 
  })
  async addPlatformCredentials(@Body() credentialDto: AddPlatformCredentialDto) {
    return this.socialService.addPlatformCredential(credentialDto);
  }
}
