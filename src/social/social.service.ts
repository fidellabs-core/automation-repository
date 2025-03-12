import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AddPlatformCredentialDto } from './dto/add-platform-credential.dto';
import { PlatformService } from './services/platform.service';
import { Platform } from './enums/platform.enum';
import { OAuthService } from './services/oauth.service';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private prisma: PrismaService,
    private platformService: PlatformService,
    private oauthService: OAuthService
  ) {}

  async createPost(createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        content: createPostDto.content,
        platforms: createPostDto.platforms,
        mediaUrl: createPostDto.mediaUrl,
        scheduledDate: createPostDto.scheduledDate ? new Date(createPostDto.scheduledDate) : null,
        status: createPostDto.scheduledDate ? 'scheduled' : 'pending',
        userId: createPostDto.userId,
      },
      include: {
        user: true
      }
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
    return this.prisma.post.findMany({
      include: {
        user: true
      }
    });
  }

  async getPost(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
  }

  async addPlatformCredential(credentialDto: AddPlatformCredentialDto) {
    return this.prisma.platformCredential.create({
      data: {
        platform: credentialDto.platform,
        accessToken: credentialDto.accessToken,
        refreshToken: credentialDto.refreshToken,
        userId: credentialDto.userId,
      },
    });
  }

  async getPlatformCredentials() {
    return this.prisma.platformCredential.findMany({
      select: {
        platform: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        // Excluding sensitive data like tokens
      },
    });
  }

  async getPlatformCredential(platform: string) {
    const credential = await this.prisma.platformCredential.findFirst({
      where: { platform },
      select: {
        platform: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        // Excluding sensitive data
      },
    });

    if (!credential) {
      throw new NotFoundException(`No credentials found for ${platform}`);
    }

    return credential;
  }
}