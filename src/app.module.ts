import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [PrismaModule, SocialModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
