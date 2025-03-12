import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '../enums/platform.enum';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(private prisma: PrismaService) {}

  async saveTokens(platform: Platform, accessToken: string, userId: string, refreshToken?: string) {
    this.logger.debug(`Saving tokens for platform: ${platform}`);
    
    return await this.prisma.platformCredential.create({
      data: {
        platform,
        accessToken,
        refreshToken,
        userId,
      },
    });
  }
}