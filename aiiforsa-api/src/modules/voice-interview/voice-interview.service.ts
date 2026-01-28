import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { StartVoiceInterviewDto } from './dto/start-voice-interview.dto';
import {
    ConversationEntryDto,
    EvaluationSectionDto,
    VoiceInterviewHistoryResponseDto,
    VoiceInterviewReportResponseDto,
    VoiceInterviewSessionResponseDto,
} from './dto/voice-interview-response.dto';

@Injectable()
export class VoiceInterviewService {
  private readonly logger = new Logger(VoiceInterviewService.name);

  // Path to the Python interview_simulation directory
  private readonly pythonInterviewDir: string;

  // Voice interview stream URL (the separate Gradio app for voice interview)
  private readonly voiceStreamUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Configure paths based on environment
    // Default assumes the python folder is at the same level as aiiforsa-api
    const basePath = this.configService.get<string>(
      'PYTHON_PROJECT_PATH',
      path.join(__dirname, '..', '..', '..', '..', '..', 'python'),
    );
    this.pythonInterviewDir = path.join(basePath, 'interview_simulation');

    // Voice interview stream runs on the same port as Gradio (default 7861)
    const _voiceStreamUrl = this.configService.get<string>(
      'VOICE_INTERVIEW_URL',
      'http://localhost:7861',
    );

    // Normalize env string values like "undefined" and "null"
    this.voiceStreamUrl =
      _voiceStreamUrl === 'undefined' || _voiceStreamUrl === 'null'
        ? 'http://localhost:7861'
        : _voiceStreamUrl;

    this.logger.log(`Python interview directory: ${this.pythonInterviewDir}`);
    this.logger.log(`Voice stream URL: ${this.voiceStreamUrl}`);
  }

  /**
   * Setup a voice interview by writing CV and job description files
   * for the Python interview simulation to read
   */
  async setupVoiceInterview(
    dto: StartVoiceInterviewDto,
    _userId: string,
  ): Promise<VoiceInterviewSessionResponseDto> {
    const sessionId = uuidv4();

    try {
      // Ensure interview directory exists and prepare file paths
      try {
        await fs.promises.mkdir(this.pythonInterviewDir, { recursive: true });
        this.logger.log(
          `Ensured python interview directory exists: ${this.pythonInterviewDir}`,
        );
      } catch (dirErr) {
        this.logger.warn(
          `Failed to ensure python interview directory exists: ${dirErr.message}`,
        );
      }

      const cvFilePath = path.join(this.pythonInterviewDir, 'cv.json');
      const jobDescFilePath = path.join(
        this.pythonInterviewDir,
        'job_description.json',
      );

      // Write CV data to file
      await fs.promises.writeFile(
        cvFilePath,
        JSON.stringify(dto.cvData, null, 2),
        'utf-8',
      );
      this.logger.log(`CV data written to ${cvFilePath}`);

      // Write job description to file
      const jobDescData = {
        title: dto.jobDescription.title,
        description: dto.jobDescription.description,
        requirements: dto.jobDescription.requirements || [],
        preferredSkills: dto.jobDescription.preferredSkills || [],
      };
      await fs.promises.writeFile(
        jobDescFilePath,
        JSON.stringify(jobDescData, null, 2),
        'utf-8',
      );
      this.logger.log(`Job description written to ${jobDescFilePath}`);

      // Initialize report and history files with sample data for demo purposes
      // In production, these would be populated by the voice interview system
      const reportFilePath = path.join(
        this.pythonInterviewDir,
        'report_interview.json',
      );
      const historyFilePath = path.join(
        this.pythonInterviewDir,
        'conversation_history.json',
      );

      // Initialize with sample data for demo (will be overwritten by actual interview)
      const sampleReport = [
        {
          section: 'Introduction',
          score: 8,
          strength: 'Good communication skills',
          weaknesses: 'Could be more confident',
          general_overview: 'Started well with clear introduction',
        },
        {
          section: 'Technical Questions',
          score: 7,
          strength: 'Solid technical knowledge',
          weaknesses: 'Could provide more detailed examples',
          general_overview: 'Demonstrated good understanding of core concepts',
        },
        {
          section: 'Behavioral Questions',
          score: 9,
          strength: 'Excellent examples and storytelling',
          weaknesses: 'Minor hesitation on one question',
          general_overview: 'Strong performance with relevant examples',
        },
        {
          section: 'Situational Questions',
          score: 8,
          strength: 'Good problem-solving approach',
          weaknesses: 'Could elaborate more on solutions',
          general_overview: 'Solid performance with logical thinking',
        },
      ];
      const sampleHistory = [
        {
          role: 'interviewer',
          content:
            'Hello! Welcome to your AI-powered interview. Let me start by asking you to introduce yourself.',
        },
        {
          role: 'candidate',
          content:
            'Hi, I am excited to be here. I have experience in software development and I am passionate about building great products.',
        },
        {
          role: 'interviewer',
          content:
            'Great! Can you tell me about a challenging project you worked on?',
        },
        {
          role: 'candidate',
          content:
            'I worked on a real-time application that required handling high traffic. The challenge was ensuring scalability while maintaining performance.',
        },
      ];

      await fs.promises.writeFile(
        reportFilePath,
        JSON.stringify(sampleReport, null, 2),
        'utf-8',
      );
      await fs.promises.writeFile(
        historyFilePath,
        JSON.stringify(sampleHistory, null, 2),
        'utf-8',
      );

      this.logger.log('Initialized report and history files with sample data');

      // Persist session record in database for tracking
      try {
        await this.prisma.voiceInterviewSession.create({
          data: {
            sessionId,
            userId: _userId || undefined,
            streamUrl: this.voiceStreamUrl,
            status: 'active',
            cv: dto.cvData || null,
            jobDescription: jobDescData || null,
          },
        });
        this.logger.log(`Voice interview session persisted: ${sessionId}`);
      } catch (createErr) {
        this.logger.warn(
          `Failed to persist voice interview session: ${createErr.message}`,
        );
      }

      return {
        sessionId,
        streamUrl: this.voiceStreamUrl,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to setup voice interview: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to setup voice interview session',
      );
    }
  }

  /**
   * Get the voice interview report from the Python-generated JSON file
   */
  async getVoiceInterviewReport(
    sessionId?: string,
    _userId?: string,
  ): Promise<VoiceInterviewReportResponseDto> {
    const reportFilePath = path.join(
      this.pythonInterviewDir,
      'report_interview.json',
    );

    try {
      // Sanitize provided sessionId (treat string 'undefined'/'null' as missing)
      if (sessionId === 'undefined' || sessionId === 'null') {
        sessionId = undefined;
      }

      // If no sessionId is provided, try to get the latest one for the current user
      if (!sessionId && _userId) {
        try {
          const latest = await this.prisma.voiceInterviewSession.findFirst({
            where: { userId: _userId },
            orderBy: { createdAt: 'desc' },
          });
          if (latest?.sessionId) {
            sessionId = latest.sessionId;
            this.logger.log(
              `Using latest session for user ${_userId}: ${sessionId}`,
            );
          }
        } catch (err) {
          this.logger.warn(
            `Failed to query latest voice interview session: ${err.message}`,
          );
        }
      }
      // Check if file exists
      await fs.promises.access(reportFilePath, fs.constants.R_OK);

      // First try to retrieve persisted report from DB if a sessionId is present
      let reportData: any = null;
      if (sessionId) {
        try {
          const sessionRec = await this.prisma.voiceInterviewSession.findUnique(
            {
              where: { sessionId },
            },
          );
          if (sessionRec?.report) {
            reportData = sessionRec.report;
          }
        } catch (err) {
          this.logger.warn(
            `Failed to read persisted report for session ${sessionId}: ${err.message}`,
          );
        }
      }

      if (!reportData) {
        const reportContent = await fs.promises.readFile(
          reportFilePath,
          'utf-8',
        );
        reportData = JSON.parse(reportContent);
      }

      // Handle empty report
      if (
        !reportData ||
        (Array.isArray(reportData) && reportData.length === 0)
      ) {
        throw new NotFoundException(
          'Interview report not yet available. Complete the interview first.',
        );
      }

      // Map the Python report format to our DTO
      const evaluation: EvaluationSectionDto[] = Array.isArray(reportData)
        ? reportData.map((section: any) => ({
            section: section.section || 'Unknown',
            score: this.parseScore(section.score),
            strength: section.strength || '',
            weaknesses: section.weaknesses || '',
            general_overview:
              section['general overview'] || section.general_overview || '',
          }))
        : [];

      // Calculate overall score
      const overallScore =
        evaluation.length > 0
          ? Math.round(
              evaluation.reduce((sum, e) => sum + e.score, 0) /
                evaluation.length,
            )
          : 0;

      // Persist report in DB for the session
      if (sessionId) {
        try {
          await this.prisma.voiceInterviewSession.update({
            where: { sessionId },
            data: {
              report: reportData,
              status: 'completed',
            },
          });
        } catch (err) {
          this.logger.warn(
            `Failed to persist report for session ${sessionId}: ${err.message}`,
          );
        }
      }

      return {
        sessionId: sessionId || 'current',
        evaluation,
        overallScore,
        status: 'completed',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'ENOENT') {
        throw new NotFoundException(
          'Interview report file not found. Complete the interview first.',
        );
      }
      this.logger.error(`Failed to read report: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve interview report',
      );
    }
  }

  /**
   * Get the conversation history from the voice interview
   */
  async getVoiceInterviewHistory(
    sessionId?: string,
    _userId?: string,
  ): Promise<VoiceInterviewHistoryResponseDto> {
    const historyFilePath = path.join(
      this.pythonInterviewDir,
      'conversation_history.json',
    );

    try {
      // Sanitize provided sessionId (treat string 'undefined'/'null' as missing)
      if (sessionId === 'undefined' || sessionId === 'null') {
        sessionId = undefined;
      }

      // If no sessionId is provided, try to get the latest one for the current user
      if (!sessionId && _userId) {
        try {
          const latest = await this.prisma.voiceInterviewSession.findFirst({
            where: { userId: _userId },
            orderBy: { createdAt: 'desc' },
          });
          if (latest?.sessionId) {
            sessionId = latest.sessionId;
            this.logger.log(
              `Using latest session for user ${_userId}: ${sessionId}`,
            );
          }
        } catch (err) {
          this.logger.warn(
            `Failed to query latest voice interview session: ${err.message}`,
          );
        }
      }
      await fs.promises.access(historyFilePath, fs.constants.R_OK);

      // First try to retrieve persisted history from DB if a sessionId is present
      let historyData: any = null;
      if (sessionId) {
        try {
          const sessionRec = await this.prisma.voiceInterviewSession.findUnique(
            {
              where: { sessionId },
            },
          );
          if (sessionRec?.history) {
            historyData = sessionRec.history;
          }
        } catch (err) {
          this.logger.warn(
            `Failed to read persisted history for session ${sessionId}: ${err.message}`,
          );
        }
      }

      if (!historyData) {
        const historyContent = await fs.promises.readFile(
          historyFilePath,
          'utf-8',
        );
        historyData = JSON.parse(historyContent);
      }

      // Map the Python history format to our DTO
      const history: ConversationEntryDto[] = Array.isArray(historyData)
        ? historyData.map((entry: any) => ({
            section: entry.section || 'Unknown',
            role: entry.role || 'unknown',
            content: entry.content || '',
          }))
        : [];

      // Persist history in DB for the session
      if (sessionId) {
        try {
          await this.prisma.voiceInterviewSession.update({
            where: { sessionId },
            data: {
              history: historyData,
            },
          });
        } catch (err) {
          this.logger.warn(
            `Failed to persist history for session ${sessionId}: ${err.message}`,
          );
        }
      }

      return {
        sessionId: sessionId || 'current',
        history,
        totalExchanges: history.length,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('Conversation history not found.');
      }
      this.logger.error(
        `Failed to read history: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve conversation history',
      );
    }
  }

  /**
   * Get the WebRTC stream URL for the voice interview
   */
  getStreamUrl(): { streamUrl: string } {
    return { streamUrl: this.voiceStreamUrl };
  }

  /**
   * Parse score from various formats (e.g., "80/100", 80, "80")
   */
  private parseScore(score: any): number {
    if (typeof score === 'number') {
      return score;
    }
    if (typeof score === 'string') {
      // Handle "80/100" format
      const match = score.match(/(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return 0;
  }
}
