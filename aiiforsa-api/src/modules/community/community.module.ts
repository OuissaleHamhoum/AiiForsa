import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { XpModule } from '../xp/xp.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [PrismaModule, XpModule],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
