import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { XpModule } from '../xp/xp.module';
import { GradioService } from './gradio.service';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';

/**
 * Resume Module - Complete resume builder with AI features
 * Features:
 * - Resume CRUD operations
 * - File upload/download
 * - AI parsing (Gemini & Qwen)
 * - AI review & ATS scoring
 * - AI rewriting & suggestions
 * - Career advisor with personalized guidance
 */
@Module({
  imports: [PrismaModule, forwardRef(() => XpModule)],
  controllers: [ResumeController],
  providers: [ResumeService, GradioService],
  exports: [ResumeService, GradioService],
})
export class ResumeModule {}
