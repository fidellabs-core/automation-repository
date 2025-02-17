import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { PlatformService } from './services/platform.service';

@Module({
  controllers: [SocialController],
  providers: [SocialService, PlatformService],
})
export class SocialModule {} 