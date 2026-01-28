import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { XpModule } from '../xp/xp.module';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';

@Module({
  imports: [XpModule],
  controllers: [InterviewController],
  providers: [InterviewService, PrismaService],
})
export class InterviewModule {}
