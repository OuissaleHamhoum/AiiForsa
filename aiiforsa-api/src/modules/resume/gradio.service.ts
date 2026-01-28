import { Client } from '@gradio/client';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * Service to interact with Gradio Python service for Resume AI operations
 * Handles: CV parsing, review, rewriting, and career advisory
 *
 * BEST PRACTICE: Gradio on backend for security, scalability, and centralized control
 * Uses @gradio/client for type-safe API interactions
 */
@Injectable()
export class GradioService {
  private readonly logger = new Logger(GradioService.name);
  private readonly gradioUrl: string;
  private readonly timeout: number;
  private clientPromise: Promise<any>;
  private rateLimitMap = new Map<
    string,
    { count: number; resetTime: number }
  >();

  constructor() {
    this.gradioUrl = process.env.GRADIO_URL || 'http://localhost:7861';
    this.timeout = parseInt(process.env.GRADIO_TIMEOUT || '300000'); // 5 minutes
    this.logger.log(`Gradio Service initialized: ${this.gradioUrl}`);
    this.clientPromise = this.initClient();
  }

  /**
   * Initialize Gradio client (cached)
   */
  private async initClient() {
    try {
      const client = await Client.connect(this.gradioUrl);
      this.logger.log('Gradio client connected successfully');
      return client;
    } catch (error: any) {
      this.logger.error(`Failed to connect to Gradio: ${error.message}`);
      throw new HttpException('Gradio service unavailable', 503);
    }
  }

  /**
   * Get or reconnect client
   */
  private async getClient() {
    try {
      return await this.clientPromise;
    } catch (error) {
      this.logger.warn('Reconnecting to Gradio...');
      this.clientPromise = this.initClient();
      return await this.clientPromise;
    }
  }

  /**
   * Call Gradio API endpoint using @gradio/client
   * @param endpoint - The API endpoint name (e.g., '/parse_cv_gemini')
   * @param params - The parameters object for the endpoint
   */
  private async callGradioEndpoint<T = any>(
    endpoint: string,
    params: Record<string, any>,
  ): Promise<T> {
    try {
      this.logger.debug(`Calling Gradio endpoint: ${endpoint}`);

      const client = await this.getClient();
      const result = await client.predict(endpoint, params);

      return result.data as T;
    } catch (error: any) {
      this.logger.error(
        `Gradio API call failed (${endpoint}): ${error.message}`,
      );
      throw new HttpException(
        `Gradio API call failed: ${error.message}`,
        error.status || 500,
      );
    }
  }

  // ============================================================================
  // CV/RESUME PARSING - Extract structured data from uploaded files
  // ============================================================================

  /**
   * Parse resume using Google Gemini
   * Uses @gradio/client to call /parse_cv_gemini endpoint
   */
  async parseResumeGemini(fileBuffer: Buffer, fileName: string) {
    // Convert buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8Array], {
      type: this.getMimeType(fileName),
    });

    // Create a proper File object
    const file = new File([blob], fileName, {
      type: this.getMimeType(fileName),
      lastModified: Date.now(),
    });

    const result = await this.callGradioEndpoint<[string, string]>(
      '/parse_cv_gemini',
      {
        cv_file: file,
      },
    );

    return {
      display: result[0],
      json: JSON.parse(result[1]),
    };
  }

  /**
   * Parse resume using Qwen Vision
   * Uses @gradio/client to call /parse_cv_qwen endpoint
   */
  async parseResumeQwen(fileBuffer: Buffer, fileName: string) {
    // Ensure filename has proper extension
    if (!fileName.includes('.')) {
      fileName += '.pdf'; // Default to PDF if no extension
    }

    // Convert buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    const mimeType = this.getMimeType(fileName);

    // Create blob with correct MIME type
    const blob = new Blob([uint8Array], { type: mimeType });

    // Create a proper File object with explicit properties
    const file = new File([blob], fileName, {
      type: mimeType,
      lastModified: Date.now(),
    });

    console.log('File details:', {
      originalname: fileName,
      mimetype: mimeType,
      size: fileBuffer.length,
    });

    console.log('Sending file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const result = await this.callGradioEndpoint<[string, string]>(
      '/parse_cv_qwen',
      {
        cv_file: file,
      },
    );

    console.log(result);

    const parsedJson = JSON.parse(result[1]);

    // Remove mock response field if present (from LLM fallback)
    if (parsedJson.response === 'LLM response generated successfully.') {
      delete parsedJson.response;
    }

    return {
      display: result[0],
      json: parsedJson,
    };
  }

  /**
   * Get MIME type from filename
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      txt: 'text/plain',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  // ============================================================================
  // CV/RESUME REVIEW - ATS scoring and feedback
  // ============================================================================

  /**
   * Review resume with ATS scoring
   * Uses @gradio/client to call /review_cv endpoint
   */
  async reviewResume(
    resumeData: any,
    options?: { temperature?: number; maxTokens?: number },
  ) {
    const resumeJsonStr =
      typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData);

    const result = await this.callGradioEndpoint<[string]>('/review_cv', {
      cv_json: resumeJsonStr,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      review: result[0],
    };
  }

  /**
   * Review resume in multiple languages (ATS multilingual)
   * Uses @gradio/client to call /review_cv_multilingual endpoint
   */
  async reviewResumeMultilingual(
    resumeData: any,
    options?: { temperature?: number; maxTokens?: number },
  ) {
    const resumeJsonStr =
      typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData);

    const result = await this.callGradioEndpoint<[string]>(
      '/review_cv_multilingual',
      {
        cv_json: resumeJsonStr,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4000,
      },
    );

    return {
      review: result[0],
    };
  }

  // ============================================================================
  // CV/RESUME REWRITING - AI-powered improvements
  // ============================================================================

  /**
   * Rewrite/enhance resume with AI suggestions
   * Uses @gradio/client to call /rewrite_cv endpoint
   */
  async rewriteResume(
    resumeData: any,
    options?: { temperature?: number; maxTokens?: number },
  ) {
    const resumeJsonStr =
      typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData);

    const result = await this.callGradioEndpoint<[string]>('/rewrite_cv', {
      cv_json: resumeJsonStr,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 4096,
    });

    const rewrittenStr = result[0];

    let rewrittenResume;
    try {
      rewrittenResume = JSON.parse(rewrittenStr);
    } catch {
      rewrittenResume = rewrittenStr;
    }

    return {
      rewritten: rewrittenResume,
    };
  }

  // ============================================================================
  // JOB MATCHING - Match CV with job requirements
  // ============================================================================

  /**
   * Match CV with job requirements
   * Uses @gradio/client to call /match_job endpoint
   */
  async matchJobWithCV(
    resumeData: any,
    options: {
      jobTitle: string;
      jobRequirements: string;
      jobDescription?: string;
      githubUrl?: string;
      linkedinUrl?: string;
    },
    userId?: string, // Add userId for rate limiting
  ) {
    // Basic rate limiting (10 requests per hour per user)
    if (userId) {
      this.checkRateLimit(userId);
    }

    // Input validation and sanitization
    if (!resumeData) {
      throw new HttpException('Resume data is required', 400);
    }
    if (!options.jobTitle?.trim()) {
      throw new HttpException('Job title is required', 400);
    }
    if (!options.jobRequirements?.trim()) {
      throw new HttpException('Job requirements are required', 400);
    }

    const resumeJsonStr =
      typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData);

    const result = await this.callGradioEndpoint<[string]>('/match_job', {
      cv_json: resumeJsonStr,
      job_title: options.jobTitle,
      job_requirements: options.jobRequirements,
      job_description: options.jobDescription || '',
      github_url: options.githubUrl || '',
      linkedin_url: options.linkedinUrl || '',
    });

    return {
      match: result[0],
    };
  }

  // ============================================================================
  // CAREER ADVISOR - Personalized guidance and learning paths
  // ============================================================================

  /**
   * Get career advice based on resume
   * Uses @gradio/client to call /career_advisor_fn endpoint
   */
  async getCareerAdvice(
    resumeData: any,
    desiredPaths: string[],
    intentions: string,
    options?: { temperature?: number; maxTokens?: number },
  ) {
    const resumeJsonStr =
      typeof resumeData === 'string' ? resumeData : JSON.stringify(resumeData);

    const result = await this.callGradioEndpoint<[any]>('/career_advisor_fn', {
      cv_json_str: resumeJsonStr,
      desired_paths: desiredPaths,
      intentions: intentions,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 4096,
    });

    return {
      advice: result[0],
    };
  }

  /**
   * Apply feedback to career advisor output
   * Uses @gradio/client to call /apply_feedback_fn endpoint
   */
  async applyCareerFeedback(
    originalOutput: string,
    stepIdentifier: string,
    feedbackData: any,
    options?: { temperature?: number; maxTokens?: number },
  ) {
    const feedbackJsonStr =
      typeof feedbackData === 'string'
        ? feedbackData
        : JSON.stringify(feedbackData);

    const result = await this.callGradioEndpoint<[any]>('/apply_feedback_fn', {
      original_output: originalOutput,
      step_identifier: stepIdentifier,
      feedback_json_str: feedbackJsonStr,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 4096,
    });

    return {
      updated: result[0],
    };
  }

  // ============================================================================
  // HEALTH & DIAGNOSTICS
  // ============================================================================

  /**
   * Check if Gradio service is healthy
   */
  async healthCheck() {
    try {
      await this.getClient();
      await axios.get(`${this.gradioUrl}/`, {
        timeout: 5000,
      });
      return {
        status: 'healthy',
        gradio_url: this.gradioUrl,
        available: true,
      };
    } catch (error: any) {
      this.logger.warn(`Gradio health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        gradio_url: this.gradioUrl,
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Gradio API configuration
   */
  async getConfig() {
    try {
      const response = await axios.get(`${this.gradioUrl}/config`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        `Failed to get Gradio config: ${error.message}`,
        error.response?.status || 500,
      );
    }
  }

  /**
   * Sanitize URL input to prevent malicious URLs
   */
  private sanitizeUrl(url?: string): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      return urlObj.href;
    } catch {
      return '';
    }
  }

  /**
   * Basic rate limiting (10 requests per hour per user)
   */
  private checkRateLimit(userId: string) {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = 10;

    const userLimit = this.rateLimitMap.get(userId);
    if (!userLimit) {
      this.rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (now > userLimit.resetTime) {
      // Reset the window
      this.rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
      return;
    }

    if (userLimit.count >= maxRequests) {
      throw new HttpException(
        'Rate limit exceeded. Please try again later.',
        429,
      );
    }

    userLimit.count++;
  }
}
