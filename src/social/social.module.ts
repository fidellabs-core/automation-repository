import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { PlatformService } from './services/platform.service';
import { OAuthService } from './services/oauth.service';

@Module({
  controllers: [SocialController],
  providers: [SocialService, PlatformService, OAuthService],
})
export class SocialModule {} 