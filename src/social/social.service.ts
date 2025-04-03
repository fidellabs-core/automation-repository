import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AddPlatformCredentialDto } from './dto/add-platform-credential.dto';
import { PlatformService } from './services/platform.service';
import { Platform } from './enums/platform.enum';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private prisma: PrismaService,
    private platformService: PlatformService,
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
      const platformPostIds = {};
      
      for (const platform of post.platforms) {
        const response = await this.platformService.postToPlatform(
          platform as Platform,
          post.content,
          post.mediaUrl
        );
        
        // Store the platform-specific post ID if available
        if (response && 'platformPostId' in response) {
          platformPostIds[platform] = response.platformPostId;
        }
      }

      await this.prisma.post.update({
        where: { id: post.id },
        data: { 
          status: 'published',
          platformPostIds: JSON.stringify(platformPostIds)
        }
      });
    } catch (error) {
      this.logger.error(`Failed to publish post ${post.id}: ${JSON.stringify(error.message)}`);
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
    // Use credentialsData directly without nesting under platform name
    const credentialsData = credentialDto.credentialsData || {};
    
    return this.prisma.platformCredential.create({
      data: {
        platform: credentialDto.platform,
        accessToken: credentialDto.accessToken,
        credentialsData: JSON.stringify(credentialsData),
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

  async updatePost(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Update the post in the database
    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        content: updatePostDto.content,
        mediaUrl: updatePostDto.mediaUrl,
        status: 'updated'
      },
      include: { user: true }
    });

    // If the post is published and has platform-specific IDs, update on platforms
    if (post.status === 'published' && post.platformPostIds) {
      try {
        const platformPostIds = JSON.parse(post.platformPostIds as string);
        
        for (const platform of post.platforms) {
          if (platformPostIds[platform]) {
            await this.platformService.updatePost(
              platform as Platform,
              platformPostIds[platform], // Use platform-specific post ID
              updatePostDto.content,
              updatePostDto.mediaUrl
            );
          }
        }
      } catch (error) {
        this.logger.error(`Failed to update published post ${id} on platforms: ${error.message}`);
        // Continue with the database update even if platform updates fail
      }
    }

    return updatedPost;
  }

  async deletePost(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // If the post is published and has platform-specific IDs, delete from platforms
    if (post.status === 'published' && post.platformPostIds) {
      try {
        const platformPostIds = JSON.parse(post.platformPostIds as string);
        
        for (const platform of post.platforms) {
          if (platformPostIds[platform]) {
            await this.platformService.deletePost(
              platform as Platform,
              platformPostIds[platform] // Use platform-specific post ID
            );
          }
        }
      } catch (error) {
        this.logger.error(`Failed to delete published post ${id} from platforms: ${error.message}`);
        // Continue with the database deletion even if platform deletions fail
      }
    }

    // Delete the post from the database
    return this.prisma.post.delete({
      where: { id }
    });
  }
}