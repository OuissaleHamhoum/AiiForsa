import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class JobDatabaseService {
  private readonly logger = new Logger(JobDatabaseService.name);
  private readonly pythonPath: string;
  private readonly scriptPath: string;

  constructor() {
    // Assuming Python is in the python folder relative to the API
    this.pythonPath = process.platform === 'win32' ? 'python' : 'python3';
    this.scriptPath = path.join(process.cwd(), '..', 'python', 'job_db_cli.py');
  }

  private async runPythonCommand(args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [this.scriptPath, ...args], {
        cwd: path.dirname(this.scriptPath),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(`Python process failed: ${stderr}`);
          reject(new Error(`Python process failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Unknown error'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });

      pythonProcess.on('error', (error) => {
        this.logger.error(`Failed to start Python process: ${error.message}`);
        reject(error);
      });
    });
  }

  async addJob(jobData: any): Promise<string> {
    const jobJson = JSON.stringify(jobData);
    const result = await this.runPythonCommand(['add-job', jobJson]);
    return result.message;
  }

  async matchCVWithJobs(cvText: string, nResults: number = 5): Promise<any> {
    const result = await this.runPythonCommand(['match-cv', cvText, nResults.toString()]);
    return result.data;
  }

  async getAllJobs(): Promise<any> {
    const result = await this.runPythonCommand(['get-all-jobs']);
    return result.data;
  }

  async deleteJob(jobId: string): Promise<string> {
    const result = await this.runPythonCommand(['delete-job', jobId]);
    return result.message;
  }
}