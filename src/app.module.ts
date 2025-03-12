import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SocialModule } from './social/social.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, SocialModule, UserModule],
})
export class AppModule {}
