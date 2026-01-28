'use server';

import { auth } from '@/auth';

/**
 * Voice Interview Actions
 * These actions call the NestJS API and Gradio API for FastRTC voice interview integration
 */

// NestJS API base URL - for voice interview endpoints
const NESTJS_API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4050/api/v1';

// Gradio API base URL - for direct FastRTC voice interview access
const GRADIO_API_BASE =
    process.env.NEXT_PUBLIC_GRADIO_URL || 'http://localhost:7861';
const GRADIO_API_CALL = `${GRADIO_API_BASE}/gradio_api/call`;

// ============================================================================
// Voice Interview Types
// ============================================================================

/**
 * Voice Interview Session Response from NestJS API
 */
export interface VoiceInterviewSessionResponse {
    sessionId: string;
    streamUrl: string;
    status: 'active' | 'completed' | 'pending';
    createdAt: string;
}

/**
 * Voice Interview Report Response from NestJS API
 */
export interface VoiceInterviewReportResponse {
    sessionId: string;
    evaluation: Array<{
        section: string;
        score: number;
        strength: string;
        weaknesses: string;
        general_overview: string;
    }>;
    overallScore: number;
    status: string;
    generatedAt: string;
}

/**
 * Voice Interview History Response from NestJS API
 */
export interface VoiceInterviewHistoryResponse {
    sessionId: string;
    history: Array<{
        section: string;
        role: string;
        content: string;
    }>;
    totalExchanges: number;
}

// ============================================================================
// Voice Interview Actions (FastRTC via NestJS API)
// ============================================================================

/**
 * Setup voice interview session
 * Calls NestJS API to write CV and job description files for Python voice interview
 * @param cvData - Parsed CV data object
 * @param jobDescription - Job description object
 */
export async function setupVoiceInterview(
    cvData?: Record<string, unknown>,
    jobDescription?: {
        title: string;
        description: string;
        requirements?: string[];
        preferredSkills?: string[];
    },
): Promise<{
    success: boolean;
    data?: VoiceInterviewSessionResponse;
    error?: string;
}> {
    const session = await auth();
    if (!session?.user?.accessToken) {
        return {
            success: false,
            error: 'No authentication token found. Please log in first.',
        };
    }

    try {
        const response = await fetch(
            `${NESTJS_API_BASE}/voice-interviews/setup`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                    cvData: cvData || {},
                    jobDescription: jobDescription || {
                        title: 'General Position',
                        description: 'General interview',
                    },
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Failed to setup voice interview: ${response.status} - ${errorText}`,
            };
        }

        // Backend wraps responses in { statusCode, message, data } format
        const apiResponse = await response.json();
        const data: VoiceInterviewSessionResponse = apiResponse.data;

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Get voice interview evaluation report from NestJS API
 * @param sessionId - Optional session ID (uses latest if not provided)
 */
export async function getVoiceInterviewReport(sessionId?: string): Promise<{
    success: boolean;
    data?: VoiceInterviewReportResponse;
    error?: string;
}> {
    const session = await auth();
    if (!session?.user?.accessToken) {
        return {
            success: false,
            error: 'No authentication token found. Please log in first.',
        };
    }

    try {
        // Guard against literal 'undefined' or 'null' values from storage
        if (sessionId === 'undefined' || sessionId === 'null') {
            sessionId = undefined;
        }
        const url = sessionId
            ? `${NESTJS_API_BASE}/voice-interviews/report?sessionId=${encodeURIComponent(sessionId)}`
            : `${NESTJS_API_BASE}/voice-interviews/report`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    success: false,
                    error: 'Interview report not yet available. Complete the interview first.',
                };
            }
            const errorText = await response.text();
            return {
                success: false,
                error: `Failed to get voice interview report: ${response.status} - ${errorText}`,
            };
        }

        // Backend wraps responses in { statusCode, message, data } format
        const apiResponse = await response.json();
        const data: VoiceInterviewReportResponse = apiResponse.data;

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Get voice interview conversation history from NestJS API
 * @param sessionId - Optional session ID (uses latest if not provided)
 */
export async function getVoiceInterviewHistory(sessionId?: string): Promise<{
    success: boolean;
    data?: VoiceInterviewHistoryResponse;
    error?: string;
}> {
    const session = await auth();
    if (!session?.user?.accessToken) {
        return {
            success: false,
            error: 'No authentication token found. Please log in first.',
        };
    }

    try {
        // Guard against literal 'undefined' or 'null' values from storage
        if (sessionId === 'undefined' || sessionId === 'null') {
            sessionId = undefined;
        }
        const url = sessionId
            ? `${NESTJS_API_BASE}/voice-interviews/history?sessionId=${encodeURIComponent(sessionId)}`
            : `${NESTJS_API_BASE}/voice-interviews/history`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    success: false,
                    error: 'Conversation history not found.',
                };
            }
            const errorText = await response.text();
            return {
                success: false,
                error: `Failed to get voice interview history: ${response.status} - ${errorText}`,
            };
        }

        // Backend wraps responses in { statusCode, message, data } format
        const apiResponse = await response.json();
        const data: VoiceInterviewHistoryResponse = apiResponse.data;

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Get the WebRTC stream URL for voice interview
 */
export async function getVoiceInterviewStreamUrl(): Promise<{
    success: boolean;
    data?: { streamUrl: string };
    error?: string;
}> {
    const session = await auth();
    if (!session?.user?.accessToken) {
        return {
            success: false,
            error: 'No authentication token found. Please log in first.',
        };
    }

    try {
        const response = await fetch(
            `${NESTJS_API_BASE}/voice-interviews/stream-url`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Failed to get stream URL: ${response.status} - ${errorText}`,
            };
        }

        // Backend wraps responses in { statusCode, message, data } format
        const apiResponse = await response.json();
        const data = apiResponse.data;

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Check if NestJS backend is available
 */
export async function pingBackend(): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const response = await fetch(`${NESTJS_API_BASE}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });

        return {
            success: response.ok,
            error: response.ok ? undefined : 'Backend not available',
        };
    } catch {
        return {
            success: false,
            error: 'Cannot connect to backend',
        };
    }
}

/**
 * Voice Interview Session type for sessions list
 */
export interface VoiceInterviewSession {
    sessionId: string;
    status: string;
    createdAt: string;
    jobDescription?: {
        title?: string;
        description?: string;
    };
}

/**
 * Get all voice interview sessions for the current user
 */
export async function getVoiceInterviewSessions(): Promise<{
    success: boolean;
    data?: { sessions: VoiceInterviewSession[] };
    error?: string;
}> {
    const session = await auth();
    if (!session?.user?.accessToken) {
        return {
            success: false,
            error: 'No authentication token found. Please log in first.',
        };
    }

    try {
        const response = await fetch(
            `${NESTJS_API_BASE}/voice-interviews/sessions`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Failed to get sessions: ${response.status} - ${errorText}`,
            };
        }

        const apiResponse = await response.json();
        const data = apiResponse.data;

        return {
            success: true,
            data,
        };
    } catch (error) {
        return {
            success: false,
            error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Get the PDF download URL for a voice interview report
 * Note: This is async to comply with 'use server' requirements
 * @param sessionId - Optional session ID (uses latest if not provided)
 */
export async function getVoiceInterviewPdfUrl(
    sessionId?: string,
): Promise<string> {
    const baseUrl = `${NESTJS_API_BASE}/voice-interviews/report/pdf`;
    if (sessionId && sessionId !== 'undefined' && sessionId !== 'null') {
        return `${baseUrl}?sessionId=${encodeURIComponent(sessionId)}`;
    }
    return baseUrl;
}

// ============================================================================
// Gradio API Functions (Direct FastRTC Voice Interview Access)
// ============================================================================

/**
 * Helper function to call Gradio API endpoints
 * Handles the two-step process: POST to initiate, GET to retrieve results
 */
async function callGradioAPI(
    endpoint: string,
    data: unknown[] = [],
): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
}> {
    try {
        // Step 1: POST to initiate the call
        const postResponse = await fetch(`${GRADIO_API_CALL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
        });

        if (!postResponse.ok) {
            return {
                success: false,
                error: `Gradio API POST failed: ${postResponse.status}`,
            };
        }

        const postResult = await postResponse.json();
        const eventId = postResult.event_id;

        if (!eventId) {
            return {
                success: false,
                error: 'No event_id returned from Gradio API',
            };
        }

        // Step 2: GET results using event_id (SSE stream)
        const getResponse = await fetch(
            `${GRADIO_API_CALL}/${endpoint}/${eventId}`,
        );

        if (!getResponse.ok) {
            return {
                success: false,
                error: `Gradio API GET failed: ${getResponse.status}`,
            };
        }

        // Parse SSE response
        const text = await getResponse.text();
        const lines = text.split('\n');

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const jsonStr = line.substring(5).trim();
                if (jsonStr) {
                    const parsed = JSON.parse(jsonStr);
                    return {
                        success: true,
                        data: parsed,
                    };
                }
            }
        }

        return {
            success: false,
            error: 'No data received from Gradio API',
        };
    } catch (error) {
        return {
            success: false,
            error: `Gradio API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Setup voice interview via Gradio API (direct FastRTC access)
 * @param cvJson - CV data as JSON string
 * @param jobDescJson - Job description as JSON string
 */
export async function setupVoiceInterviewGradio(
    cvJson: string = '{}',
    jobDescJson: string = '{}',
): Promise<{
    success: boolean;
    data?: { status: string; streamUrl: string };
    error?: string;
}> {
    const result = await callGradioAPI('setup_voice_interview', [
        cvJson,
        jobDescJson,
    ]);

    if (!result.success) {
        return {
            success: false,
            error: result.error,
        };
    }

    const responseData = result.data as string[];
    const status = responseData?.[0] || 'Unknown status';

    // Check if FastRTC is available
    if (status.includes('not available') || status.includes('Error')) {
        return {
            success: false,
            error: status,
        };
    }

    return {
        success: true,
        data: {
            status,
            streamUrl: `${GRADIO_API_BASE}/?__theme=dark`,
        },
    };
}

/**
 * Get voice interview report via Gradio API
 */
export async function getVoiceInterviewReportGradio(): Promise<{
    success: boolean;
    data?: {
        markdown: string;
        evaluation: Array<{
            section: string;
            score: string;
            strength: string;
            weaknesses: string;
            general_overview: string;
        }>;
    };
    error?: string;
}> {
    const result = await callGradioAPI('get_voice_interview_report', []);

    if (!result.success) {
        return {
            success: false,
            error: result.error,
        };
    }

    const responseData = result.data as string[];
    const markdown = responseData?.[0] || '';

    // Check for error messages
    if (
        markdown.includes('No evaluation available') ||
        markdown.includes('Error')
    ) {
        return {
            success: false,
            error: markdown,
        };
    }

    // Parse markdown to extract evaluation sections
    const evaluation: Array<{
        section: string;
        score: string;
        strength: string;
        weaknesses: string;
        general_overview: string;
    }> = [];

    // Simple markdown parsing for sections
    const sections = markdown.split('## ').filter(s => s.trim());
    for (const section of sections) {
        const lines = section.split('\n');
        const sectionName = lines[0]?.trim() || '';

        if (sectionName && !sectionName.startsWith('#')) {
            const scoreMatch = section.match(/\*\*Score:\*\*\s*([\d/]+)/i);
            // Use 'gi' flags (compatible with older ES targets) instead of 'is'
            const strengthMatch = section.match(
                /\*\*Strengths?:\*\*\s*([^*]+)/gi,
            );
            const weaknessMatch = section.match(
                /\*\*Weaknesses?:\*\*\s*([^*]+)/gi,
            );
            const overviewMatch = section.match(
                /\*\*Overview:\*\*\s*([^-]+)/gi,
            );

            evaluation.push({
                section: sectionName,
                score: scoreMatch?.[1] || 'N/A',
                strength:
                    strengthMatch?.[0]
                        ?.replace(/\*\*Strengths?:\*\*\s*/i, '')
                        .trim() || '',
                weaknesses:
                    weaknessMatch?.[0]
                        ?.replace(/\*\*Weaknesses?:\*\*\s*/i, '')
                        .trim() || '',
                general_overview:
                    overviewMatch?.[0]
                        ?.replace(/\*\*Overview:\*\*\s*/i, '')
                        .trim() || '',
            });
        }
    }

    return {
        success: true,
        data: {
            markdown,
            evaluation,
        },
    };
}

/**
 * Get voice interview history via Gradio API
 */
export async function getVoiceInterviewHistoryGradio(): Promise<{
    success: boolean;
    data?: Array<{
        section: string;
        role: string;
        content: string;
    }>;
    error?: string;
}> {
    const result = await callGradioAPI('get_voice_interview_history', []);

    if (!result.success) {
        return {
            success: false,
            error: result.error,
        };
    }

    const responseData = result.data as string[];
    const historyJson = responseData?.[0] || '[]';

    // Check for error messages
    if (
        historyJson.includes('No conversation history') ||
        historyJson.includes('Error')
    ) {
        return {
            success: false,
            error: historyJson,
        };
    }

    try {
        const history = JSON.parse(historyJson);
        return {
            success: true,
            data: history,
        };
    } catch {
        return {
            success: false,
            error: 'Failed to parse history JSON',
        };
    }
}

/**
 * Check if Gradio server is available
 */
export async function pingGradioServer(): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const response = await fetch(GRADIO_API_BASE, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });

        return {
            success: response.ok,
            error: response.ok ? undefined : 'Gradio server not available',
        };
    } catch {
        return {
            success: false,
            error: 'Cannot connect to Gradio server',
        };
    }
}

/**
 * Get the Gradio stream URL for embedding
 * Server Actions must be async, so return a Promise<string>
 */
export async function getGradioStreamUrl(): Promise<string> {
    // This is trivial now, but keeping async lets Next.js treat it as a server action
    return `${GRADIO_API_BASE}/?__theme=dark`;
}
