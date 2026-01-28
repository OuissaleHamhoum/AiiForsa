/**
 * PDF Export Hook
 * Client-side hook for exporting resume as PDF
 */

import { useState } from 'react';
import { toast } from 'sonner';

interface UsePdfExportOptions {
    filename?: string;
}

export function usePdfExport(options: UsePdfExportOptions = {}) {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exportToPdf = async (elementId: string) => {
        setIsExporting(true);
        setError(null);

        try {
            // Get the resume element
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error('Resume element not found');
            }

            // Clone the element to avoid modifying the original
            const clonedElement = element.cloneNode(true) as HTMLElement;

            // Add print styles
            const styles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Lato:wght@300;400;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', 'Roboto', 'Lato', 'Source Sans Pro', sans-serif;
          }
          
          .resume-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .resume-entry {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          ul, ol {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          li {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          p {
            orphans: 3;
            widows: 3;
          }
        </style>
      `;

            // Get computed styles from original element
            const computedStyles = window.getComputedStyle(element);
            const inlineStyles = Array.from(computedStyles)
                .map(key => `${key}:${computedStyles.getPropertyValue(key)}`)
                .join(';');

            // Create complete HTML document
            const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume</title>
            ${styles}
          </head>
          <body>
            <div style="${inlineStyles}">
              ${clonedElement.innerHTML}
            </div>
          </body>
        </html>
      `;

            // Send to API
            const response = await fetch('/api/resume/export-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html,
                    filename: options.filename || 'resume.pdf',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF');
            }

            // Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = options.filename || 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF exported successfully');
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to export PDF';
            setError(errorMessage);
            toast.error(errorMessage);
            // Log error for debugging
            if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.error('PDF export error:', err);
            }
        } finally {
            setIsExporting(false);
        }
    };

    return {
        exportToPdf,
        isExporting,
        error,
    };
}
