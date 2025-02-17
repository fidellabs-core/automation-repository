import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PlatformService } from './services/platform.service';
import { Platform } from './enums/platform.enum';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private prisma: PrismaService,
    private platformService: PlatformService
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        content: createPostDto.content,
        platforms: createPostDto.platforms,
        mediaUrl: createPostDto.mediaUrl,
        scheduledDate: createPostDto.scheduledDate ? new Date(createPostDto.scheduledDate) : null,
        status: createPostDto.scheduledDate ? 'scheduled' : 'pending',
      },
    });

    if (!post.scheduledDate) {
      await this.publishPost(post);
    }

    return post;
  }

  private async publishPost(post: any) {
    try {
      for (const platform of post.platforms) {
        await this.platformService.postToPlatform(
          platform as Platform,
          post.content,
          post.mediaUrl
        );
      }

      await this.prisma.post.update({
        where: { id: post.id },
        data: { status: 'published' }
      });
    } catch (error) {
      this.logger.error(`Failed to publish post ${post.id}: ${error.message}`);
      await this.prisma.post.update({
        where: { id: post.id },
        data: { status: 'failed' }
      });
      throw error;
    }
  }

  async getPosts() {
    return this.prisma.post.findMany();
  }

  async getPost(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }
} 