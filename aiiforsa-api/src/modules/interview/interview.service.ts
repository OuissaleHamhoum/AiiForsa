import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { PrismaService } from '../../database/prisma.service';
import { XpService } from '../xp/xp.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Injectable()
export class InterviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xpService: XpService,
  ) {}

  async create(data: CreateInterviewDto) {
    // If questions omitted or empty, generate auto questions; if more provided than nbrQuestions, pick randomly; if fewer, fill with auto-generated
    let questions = data.questions ?? [];

    // Normalize questions: ensure at least nbrQuestions entries
    if (questions.length === 0) {
      questions = Array.from({ length: data.nbrQuestions }).map((_, i) => ({
        content: `Auto-generated question ${i + 1}`,
      }));
    } else if (questions.length > data.nbrQuestions) {
      // randomly sample without replacement
      const shuffled = questions.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      questions = shuffled.slice(0, data.nbrQuestions);
    } else if (questions.length < data.nbrQuestions) {
      // fill remaining with auto-generated questions
      const fillCount = data.nbrQuestions - questions.length;
      const generated = Array.from({ length: fillCount }).map((_, i) => ({
        content: `Auto-generated question ${questions.length + i + 1}`,
      }));
      questions = [...questions, ...generated];
    }

    // Build nested create payload for questions and optional answers
    const questionsCreate = questions.map((q) => {
      const qCreate: any = { content: q.content };
      if (q.answer && (q as any).answer?.content) {
        qCreate.answer = { create: { content: (q as any).answer.content } };
      }
      return qCreate;
    });

    const created = await this.prisma.interview.create({
      data: {
        userId: data.userId,
        description: data.description,
        durationMinutes: data.durationMinutes,
        nbrQuestions: data.nbrQuestions,
        difficulty: data.difficulty,
        category: data.category,
        focusArea: data.focusArea,
        questions: { create: questionsCreate },
      },
      include: {
        questions: { include: { answer: true } },
      },
    });

    // Trigger XP milestone check for interview achievements
    await this.xpService.checkMilestoneAchievements(data.userId);

    return created;
  }

  async createAnswer(questionId: string, dto: { content: string }) {
    // Ensure question exists
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    // Ensure an answer does not already exist for this question (Answer.questionId is unique)
    const existing = await this.prisma.answer.findUnique({
      where: { questionId },
    });
    if (existing)
      throw new ConflictException('Answer already exists for this question');

    const created = await this.prisma.answer.create({
      data: {
        questionId,
        content: dto.content,
      },
    });

    return created;
  }

  async createAnswersForInterview(
    interviewId: string,
    answers: Array<{ questionId: string; content: string }>,
  ) {
    // load interview and its questions
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { questions: true },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    // build create operations after validating each question belongs to interview
    const ops: Array<Promise<any>> = [];

    for (const a of answers) {
      const q = interview.questions.find((qq) => qq.id === a.questionId);
      if (!q)
        throw new NotFoundException(
          `Question ${a.questionId} does not belong to interview ${interviewId}`,
        );

      // check existing answer
      const existing = await this.prisma.answer.findUnique({
        where: { questionId: a.questionId },
      });
      if (existing) {
        // skip or throw — choose to throw to inform caller
        throw new ConflictException(
          `Answer already exists for question ${a.questionId}`,
        );
      }

      ops.push(
        this.prisma.answer.create({
          data: { questionId: a.questionId, content: a.content },
        }),
      );
    }

    const created = await Promise.all(ops);
    return created;
  }

  async createRateForAnswer(
    answerId: string,
    dto: { value: number; authorId?: string },
  ) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    });
    if (!answer) throw new NotFoundException('Answer not found');

    const created = await this.prisma.rate.create({
      data: {
        value: dto.value,
        authorId: dto.authorId,
        answerId: answerId,
      },
    });

    return created;
  }

  async createFeedbackForAnswer(
    answerId: string,
    dto: { content: string; authorId?: string },
  ) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    });
    if (!answer) throw new NotFoundException('Answer not found');

    const created = await this.prisma.feedback.create({
      data: {
        content: dto.content,
        authorId: dto.authorId,
        answerId: answerId,
      },
    });

    return created;
  }

  async createRateForInterview(
    interviewId: string,
    dto: { value: number; authorId?: string },
  ) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    const created = await this.prisma.rate.create({
      data: {
        value: dto.value,
        authorId: dto.authorId,
        interviewId: interviewId,
      },
    });

    return created;
  }

  async createFeedbackForInterview(
    interviewId: string,
    dto: { content: string; authorId?: string },
  ) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
    });
    if (!interview) throw new NotFoundException('Interview not found');

    const created = await this.prisma.feedback.create({
      data: {
        content: dto.content,
        authorId: dto.authorId,
        interviewId: interviewId,
      },
    });

    return created;
  }

  async generateInterviewReport(interviewId: string): Promise<Buffer> {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: {
          include: {
            answer: {
              include: { rates: true, feedbacks: true },
            },
          },
        },
        rates: true,
        feedbacks: true,
        user: true,
      },
    });

    if (!interview) throw new NotFoundException('Interview not found');

    // Helper to compute average
    const avg = (arr: Array<{ value: number }>) => {
      if (!arr || arr.length === 0) return null;
      const sum = arr.reduce((s, r) => s + (r.value ?? 0), 0);
      return Math.round((sum / arr.length) * 100) / 100;
    };

    // Create PDF in memory
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    doc.pipe(stream);

    // Title
    doc.fontSize(18).text('Interview Report', { align: 'center' });
    doc.moveDown();

    // Interview meta
    doc.fontSize(12).text(`Interview ID: ${interview.id}`);
    doc.text(`Owner: ${interview.user?.email ?? interview.userId}`);
    doc.text(`Description: ${interview.description}`);
    doc.text(`Duration (min): ${interview.durationMinutes}`);
    doc.text(`Nbr Questions: ${interview.nbrQuestions}`);
    doc.text(`Difficulty: ${interview.difficulty}`);
    doc.text(`Category: ${interview.category}`);
    if (interview.focusArea) doc.text(`Focus area: ${interview.focusArea}`);
    doc.text(`Created at: ${interview.createdAt.toISOString()}`);
    doc.moveDown();

    // Overall ratings
    const overallAvg = avg(interview.rates);
    doc.fontSize(14).text('Overall Ratings', { underline: true });
    doc.fontSize(12).text(`Count: ${interview.rates.length}`);
    doc.text(`Average: ${overallAvg ?? 'N/A'}`);
    doc.moveDown();

    // Overall feedbacks
    doc.fontSize(14).text('Overall Feedbacks', { underline: true });
    if (interview.feedbacks.length === 0) {
      doc.fontSize(12).text('No overall feedbacks');
    } else {
      interview.feedbacks.forEach((f, idx) => {
        doc
          .fontSize(12)
          .text(
            `${idx + 1}. ${f.content} ${f.authorId ? `(by ${f.authorId})` : ''}`,
          );
      });
    }
    doc.moveDown();

    // Questions and answers
    doc.fontSize(16).text('Questions & Answers', { underline: true });
    doc.moveDown(0.5);

    for (const [i, q] of interview.questions.entries()) {
      doc.fontSize(12).text(`${i + 1}. Q: ${q.content}`);
      if (q.answer) {
        doc.fontSize(12).text(`   A: ${q.answer.content}`);
        const qAvg = avg(q.answer.rates);
        doc.text(
          `   Answer ratings count: ${q.answer.rates.length}  average: ${qAvg ?? 'N/A'}`,
        );
        if (q.answer.feedbacks.length > 0) {
          doc.text('   Feedbacks:');
          q.answer.feedbacks.forEach((fb, j) => {
            doc.text(
              `     - ${fb.content} ${fb.authorId ? `(by ${fb.authorId})` : ''}`,
            );
          });
        }
      } else {
        doc.fontSize(12).text('   A: (no answer)');
      }
      doc.moveDown(0.5);
    }

    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }
}
