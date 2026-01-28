import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * PDF Export API Route
 * Generates PDF from resume HTML using Puppeteer
 * POST /api/resume/export-pdf
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { html, filename = 'resume.pdf' } = body;

        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 },
            );
        }

        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Set viewport to match A4 dimensions
        await page.setViewport({
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123, // A4 height in pixels at 96 DPI
        });

        // Set content with proper encoding
        await page.setContent(html, {
            waitUntil: ['domcontentloaded', 'networkidle0'],
        });

        // Add required fonts and styles
        await page.addStyleTag({
            content: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap');
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `,
        });

        // Generate PDF with A4 configuration
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm',
            },
            preferCSSPageSize: false,
            displayHeaderFooter: false,
        });

        await browser.close();

        // Return PDF as binary response
        return new NextResponse(Buffer.from(pdf), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdf.length.toString(),
            },
        });
    } catch (error) {
        // Log error in development mode
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('PDF generation error:', error);
        }
        return NextResponse.json(
            {
                error: 'Failed to generate PDF',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}
