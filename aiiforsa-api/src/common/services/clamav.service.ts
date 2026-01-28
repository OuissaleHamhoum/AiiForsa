import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as net from 'net';

export interface ScanResult {
  isClean: boolean;
  viruses: string[];
  error?: string;
}

@Injectable()
export class ClamAVService {
  private readonly logger = new Logger(ClamAVService.name);
  private readonly clamavHost: string;
  private readonly clamavPort: number;
  private readonly enabled: boolean;

  constructor() {
    this.clamavHost = process.env.CLAMAV_HOST || 'localhost';
    this.clamavPort = parseInt(process.env.CLAMAV_PORT || '3310', 10);
    this.enabled = process.env.CLAMAV_ENABLED !== 'false';
  }

  /**
   * Scan a file buffer for viruses using ClamAV daemon
   * @param fileBuffer - The file content as a Buffer
   * @param filename - Original filename for logging
   * @returns ScanResult with isClean status and any detected viruses
   */
  async scanBuffer(fileBuffer: Buffer, filename: string): Promise<ScanResult> {
    if (!this.enabled) {
      this.logger.warn('ClamAV scanning is disabled, skipping virus scan');
      return { isClean: true, viruses: [] };
    }

    return new Promise((resolve) => {
      const client = new net.Socket();
      let response = '';

      // No timeout - let the scan take as long as needed
      client.setTimeout(0);

      client.on('connect', () => {
        this.logger.log(`Scanning file: ${filename} (${fileBuffer.length} bytes)`);
        
        // Send INSTREAM command
        client.write('zINSTREAM\0');
        
        // Send file in chunks (ClamAV protocol: 4-byte big-endian length + data)
        const chunkSize = 1024 * 1024; // 1MB chunks
        let offset = 0;
        
        while (offset < fileBuffer.length) {
          const chunk = fileBuffer.slice(offset, offset + chunkSize);
          const lengthBuffer = Buffer.alloc(4);
          lengthBuffer.writeUInt32BE(chunk.length, 0);
          client.write(lengthBuffer);
          client.write(chunk);
          offset += chunkSize;
        }
        
        // Send zero-length chunk to indicate end of stream
        const endBuffer = Buffer.alloc(4);
        endBuffer.writeUInt32BE(0, 0);
        client.write(endBuffer);
      });

      client.on('data', (data) => {
        response += data.toString();
      });

      client.on('end', () => {
        client.destroy();
        const result = this.parseResponse(response, filename);
        resolve(result);
      });

      client.on('timeout', () => {
        client.destroy();
        this.logger.error(`ClamAV scan timeout for file: ${filename}`);
        resolve({ isClean: true, viruses: [], error: 'Scan timeout' });
      });

      client.on('error', (err) => {
        client.destroy();
        this.logger.error(`ClamAV connection error: ${err.message}`);
        // If ClamAV is not available, allow the file (fail-open for availability)
        // Change to fail-close by returning isClean: false if security is critical
        resolve({ isClean: true, viruses: [], error: `Connection error: ${err.message}` });
      });

      client.connect(this.clamavPort, this.clamavHost);
    });
  }

  /**
   * Parse ClamAV daemon response
   */
  private parseResponse(response: string, filename: string): ScanResult {
    const trimmedResponse = response.trim().replace(/\0/g, '');
    
    this.logger.debug(`ClamAV response for ${filename}: ${trimmedResponse}`);

    if (trimmedResponse.includes('OK')) {
      this.logger.log(`✅ File clean: ${filename}`);
      return { isClean: true, viruses: [] };
    }

    if (trimmedResponse.includes('FOUND')) {
      // Extract virus name from response like "stream: Eicar-Test-Signature FOUND"
      const match = trimmedResponse.match(/stream:\s*(.+)\s*FOUND/);
      const virusName = match ? match[1].trim() : 'Unknown malware';
      
      this.logger.warn(`🦠 Virus detected in ${filename}: ${virusName}`);
      return { isClean: false, viruses: [virusName] };
    }

    if (trimmedResponse.includes('ERROR')) {
      this.logger.error(`ClamAV error scanning ${filename}: ${trimmedResponse}`);
      return { isClean: true, viruses: [], error: trimmedResponse };
    }

    // Unknown response, log and allow (fail-open)
    this.logger.warn(`Unknown ClamAV response for ${filename}: ${trimmedResponse}`);
    return { isClean: true, viruses: [], error: 'Unknown response' };
  }

  /**
   * Validate file and throw if virus detected
   * @throws BadRequestException if virus is detected
   */
  async validateFile(fileBuffer: Buffer, filename: string): Promise<void> {
    const result = await this.scanBuffer(fileBuffer, filename);
    
    if (!result.isClean) {
      throw new BadRequestException(
        `File rejected: Malware detected (${result.viruses.join(', ')}). ` +
        'Please ensure your file is safe and try again.'
      );
    }
  }

  /**
   * Check if ClamAV daemon is available
   */
  async ping(): Promise<boolean> {
    if (!this.enabled) return false;

    return new Promise((resolve) => {
      const client = new net.Socket();
      client.setTimeout(5000);

      client.on('connect', () => {
        client.write('zPING\0');
      });

      client.on('data', (data) => {
        const response = data.toString().trim();
        client.destroy();
        resolve(response.includes('PONG'));
      });

      client.on('error', () => {
        client.destroy();
        resolve(false);
      });

      client.on('timeout', () => {
        client.destroy();
        resolve(false);
      });

      client.connect(this.clamavPort, this.clamavHost);
    });
  }
}
