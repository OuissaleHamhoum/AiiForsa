import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { VoiceInterviewController } from './voice-interview.controller';
import { VoiceInterviewService } from './voice-interview.service';

@Module({
  imports: [PrismaModule],
  controllers: [VoiceInterviewController],
  providers: [VoiceInterviewService],
  exports: [VoiceInterviewService],
})
export class VoiceInterviewModule {}
