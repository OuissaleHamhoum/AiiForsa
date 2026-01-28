'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    MessageCircle,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Volume2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    section: string;
    timestamp: Date;
}

interface VoiceInterviewClientProps {
    sessionId: string;
    cvData: Record<string, unknown>;
    jobDescription: Record<string, unknown>;
    onComplete?: (report: unknown) => void;
    onError?: (error: string) => void;
}

interface InterviewState {
    status:
        | 'idle'
        | 'connecting'
        | 'ready'
        | 'listening'
        | 'processing'
        | 'speaking'
        | 'complete'
        | 'error';
    currentSection: string;
    isComplete: boolean;
    errorMessage?: string;
}

// ============================================================================
// Audio Processing Utilities
// ============================================================================

class AudioProcessor {
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private isRecording = false;

    async initialize(): Promise<boolean> {
        try {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                    channelCount: 1,
                },
            });
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }

    startRecording(onDataAvailable: (data: Blob) => void): void {
        if (!this.mediaStream) return;

        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(this.mediaStream, {
            mimeType: 'audio/webm;codecs=opus',
        });

        this.mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, {
                type: 'audio/webm',
            });
            onDataAvailable(audioBlob);
        };

        this.mediaRecorder.start();
        this.isRecording = true;
    }

    stopRecording(): void {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    async playAudio(base64Audio: string): Promise<void> {
        if (!this.audioContext || !base64Audio) return;

        try {
            const audioData = Uint8Array.from(atob(base64Audio), c =>
                c.charCodeAt(0),
            );
            const audioBuffer = await this.audioContext.decodeAudioData(
                audioData.buffer,
            );
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            return new Promise(resolve => {
                source.onended = () => resolve();
                source.start();
            });
        } catch (error) {
            console.error('Failed to play audio:', error);
        }
    }

    cleanup(): void {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// ============================================================================
// Speech Synthesis Utility (Browser TTS fallback)
// ============================================================================

function speakText(text: string): Promise<void> {
    return new Promise(resolve => {
        if (!('speechSynthesis' in window)) {
            resolve();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        speechSynthesis.speak(utterance);
    });
}

// ============================================================================
// Section Display Component
// ============================================================================

const SECTIONS = [
    { id: 'pre_intro', label: 'Welcome', icon: '👋' },
    { id: 'intro', label: 'Introduction', icon: '🤝' },
    { id: 'hr', label: 'HR Questions', icon: '💼' },
    { id: 'behavioral', label: 'Behavioral', icon: '🎯' },
    { id: 'technical', label: 'Technical', icon: '💻' },
    { id: 'situational', label: 'Situational', icon: '🧩' },
];

function SectionProgress({
    currentSection,
    isComplete,
}: {
    currentSection: string;
    isComplete: boolean;
}) {
    const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);

    return (
        <div className="flex items-center justify-between mb-6 px-2">
            {SECTIONS.map((section, index) => {
                const isActive = section.id === currentSection;
                const isCompleted = index < currentIndex || isComplete;

                return (
                    <div
                        key={section.id}
                        className="flex flex-col items-center gap-1"
                    >
                        <div
                            className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
                                isActive &&
                                    'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                                isCompleted &&
                                    !isActive &&
                                    'bg-green-500 text-white',
                                !isActive &&
                                    !isCompleted &&
                                    'bg-muted text-muted-foreground',
                            )}
                        >
                            {isCompleted && !isActive ? '✓' : section.icon}
                        </div>
                        <span
                            className={cn(
                                'text-xs font-medium',
                                isActive && 'text-primary',
                                isCompleted && !isActive && 'text-green-600',
                                !isActive &&
                                    !isCompleted &&
                                    'text-muted-foreground',
                            )}
                        >
                            {section.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function VoiceInterviewClient({
    sessionId,
    cvData,
    jobDescription,
    onComplete,
    onError,
}: VoiceInterviewClientProps) {
    // State
    const [state, setState] = useState<InterviewState>({
        status: 'idle',
        currentSection: 'pre_intro',
        isComplete: false,
    });
    const [messages, setMessages] = useState<Message[]>([]);
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const [useTextMode, setUseTextMode] = useState(false);
    const [textInput, setTextInput] = useState('');

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const audioProcessorRef = useRef<AudioProcessor | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            wsRef.current?.close();
            audioProcessorRef.current?.cleanup();
        };
    }, []);

    // ============================================================================
    // API Calls
    // ============================================================================

    const setupInterview = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'connecting' }));

        try {
            // Call setup endpoint
            const response = await fetch(
                'http://localhost:7862/api/voice-interview/setup',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cvData,
                        jobDescription,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to setup interview');
            }

            const data = await response.json();

            if (data.success) {
                setWelcomeMessage(data.message);

                // Add welcome message to chat
                addMessage('assistant', data.message, 'pre_intro');

                // Initialize audio
                if (!useTextMode) {
                    const processor = new AudioProcessor();
                    const initialized = await processor.initialize();

                    if (!initialized) {
                        setUseTextMode(true);
                    } else {
                        audioProcessorRef.current = processor;
                    }
                }

                // Connect WebSocket
                connectWebSocket(data.sessionId);

                // Speak welcome message
                if (!useTextMode) {
                    setState(prev => ({ ...prev, status: 'speaking' }));
                    await speakText(data.message);
                }

                setState(prev => ({
                    ...prev,
                    status: 'ready',
                    currentSection: 'pre_intro',
                }));
            } else {
                throw new Error(data.message || 'Setup failed');
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to start interview';
            setState(prev => ({
                ...prev,
                status: 'error',
                errorMessage: message,
            }));
            onError?.(message);
        }
    }, [cvData, jobDescription, useTextMode, onError]);

    const connectWebSocket = useCallback(
        (sid: string) => {
            const ws = new WebSocket(
                `ws://localhost:7862/api/voice-interview/stream/${sid}`,
            );

            ws.onopen = () => {
                console.log('WebSocket connected');
            };

            ws.onmessage = async event => {
                try {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case 'response':
                            // Add messages
                            if (data.userText) {
                                addMessage('user', data.userText, data.section);
                            }
                            addMessage('assistant', data.text, data.section);

                            // Update state
                            setState(prev => ({
                                ...prev,
                                currentSection: data.section,
                                isComplete: data.complete,
                                status: data.complete ? 'complete' : 'speaking',
                            }));

                            // Speak response
                            if (data.audio && !useTextMode) {
                                await audioProcessorRef.current?.playAudio(
                                    data.audio,
                                );
                            } else {
                                await speakText(data.text);
                            }

                            if (data.complete) {
                                onComplete?.(null);
                            } else {
                                setState(prev => ({
                                    ...prev,
                                    status: 'ready',
                                }));
                            }
                            break;

                        case 'status':
                            setState(prev => ({
                                ...prev,
                                currentSection: data.section,
                                isComplete: data.complete,
                            }));
                            break;

                        case 'error':
                            console.error('WebSocket error:', data.message);
                            break;

                        case 'complete':
                            setState(prev => ({
                                ...prev,
                                status: 'complete',
                                isComplete: true,
                            }));
                            onComplete?.(null);
                            break;
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
            };

            ws.onerror = error => {
                console.error('WebSocket error:', error);
            };

            wsRef.current = ws;
        },
        [useTextMode, onComplete],
    );

    // ============================================================================
    // Message Handling
    // ============================================================================

    const addMessage = (
        role: 'user' | 'assistant',
        content: string,
        section: string,
    ) => {
        setMessages(prev => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`,
                role,
                content,
                section,
                timestamp: new Date(),
            },
        ]);
    };

    const sendAudio = useCallback(async (audioBlob: Blob) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
            return;

        setState(prev => ({ ...prev, status: 'processing' }));

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            wsRef.current?.send(
                JSON.stringify({
                    type: 'audio',
                    data: base64,
                }),
            );
        };
        reader.readAsDataURL(audioBlob);
    }, []);

    const sendTextMessage = useCallback(async () => {
        if (
            !textInput.trim() ||
            !wsRef.current ||
            wsRef.current.readyState !== WebSocket.OPEN
        )
            return;

        const message = textInput.trim();
        setTextInput('');

        // Add user message immediately
        addMessage('user', message, state.currentSection);

        setState(prev => ({ ...prev, status: 'processing' }));

        wsRef.current.send(
            JSON.stringify({
                type: 'text',
                data: message,
            }),
        );
    }, [textInput, state.currentSection]);

    // ============================================================================
    // Recording Controls
    // ============================================================================

    const startListening = useCallback(() => {
        if (!audioProcessorRef.current) return;

        setState(prev => ({ ...prev, status: 'listening' }));
        audioProcessorRef.current.startRecording(sendAudio);
    }, [sendAudio]);

    const stopListening = useCallback(() => {
        audioProcessorRef.current?.stopRecording();
    }, []);

    const endInterview = useCallback(() => {
        wsRef.current?.send(JSON.stringify({ type: 'end' }));
    }, []);

    // ============================================================================
    // Render
    // ============================================================================

    // Idle state - show start button
    if (state.status === 'idle') {
        return (
            <Card className="max-w-3xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        🎙️ Voice Interview
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">
                        You&apos;re about to start an AI-powered voice
                        interview. Make sure you have a working microphone and
                        are in a quiet environment.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                        <h4 className="font-medium">Interview Sections:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {SECTIONS.map(s => (
                                <li key={s.id}>
                                    {s.icon} {s.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="text-mode"
                            checked={useTextMode}
                            onChange={e => setUseTextMode(e.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor="text-mode" className="text-sm">
                            Use text mode (type instead of speak)
                        </label>
                    </div>

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={setupInterview}
                    >
                        <Phone className="mr-2 h-5 w-5" />
                        Start Interview
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (state.status === 'error') {
        return (
            <Card className="max-w-3xl mx-auto border-destructive">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                        <div>
                            <h3 className="font-semibold text-lg">
                                Interview Error
                            </h3>
                            <p className="text-muted-foreground">
                                {state.errorMessage}
                            </p>
                        </div>
                        <Button
                            onClick={() =>
                                setState({
                                    status: 'idle',
                                    currentSection: 'pre_intro',
                                    isComplete: false,
                                })
                            }
                        >
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Connecting state
    if (state.status === 'connecting') {
        return (
            <Card className="max-w-3xl mx-auto">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">
                            Setting up your interview...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Complete state
    if (state.status === 'complete' || state.isComplete) {
        return (
            <Card className="max-w-3xl mx-auto border-green-500">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <div>
                            <h3 className="font-semibold text-lg">
                                Interview Complete!
                            </h3>
                            <p className="text-muted-foreground">
                                Thank you for completing the interview. Your
                                responses have been recorded.
                            </p>
                        </div>
                        <Button onClick={() => onComplete?.(null)}>
                            View Results
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Active interview state
    return (
        <Card className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Voice Interview</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={
                                state.status === 'listening'
                                    ? 'destructive'
                                    : 'secondary'
                            }
                        >
                            {state.status === 'listening' && (
                                <span className="animate-pulse mr-1">●</span>
                            )}
                            {state.status.charAt(0).toUpperCase() +
                                state.status.slice(1)}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUseTextMode(!useTextMode)}
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <SectionProgress
                    currentSection={state.currentSection}
                    isComplete={state.isComplete}
                />
            </CardHeader>

            <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4 py-4">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex',
                                    msg.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start',
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[80%] rounded-lg px-4 py-2',
                                        msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted',
                                    )}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {SECTIONS.find(
                                            s => s.id === msg.section,
                                        )?.label || msg.section}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Controls */}
                <div className="border-t pt-4 mt-4">
                    {useTextMode ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                onKeyDown={e =>
                                    e.key === 'Enter' && sendTextMessage()
                                }
                                placeholder="Type your response..."
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={
                                    state.status === 'processing' ||
                                    state.status === 'speaking'
                                }
                            />
                            <Button
                                onClick={sendTextMessage}
                                disabled={
                                    !textInput.trim() ||
                                    state.status === 'processing' ||
                                    state.status === 'speaking'
                                }
                            >
                                Send
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center gap-4">
                            <Button
                                size="lg"
                                variant={
                                    state.status === 'listening'
                                        ? 'destructive'
                                        : 'default'
                                }
                                className="h-16 w-16 rounded-full"
                                onMouseDown={startListening}
                                onMouseUp={stopListening}
                                onMouseLeave={stopListening}
                                onTouchStart={startListening}
                                onTouchEnd={stopListening}
                                disabled={
                                    state.status === 'processing' ||
                                    state.status === 'speaking'
                                }
                            >
                                {state.status === 'listening' ? (
                                    <MicOff className="h-8 w-8" />
                                ) : state.status === 'processing' ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                ) : state.status === 'speaking' ? (
                                    <Volume2 className="h-8 w-8 animate-pulse" />
                                ) : (
                                    <Mic className="h-8 w-8" />
                                )}
                            </Button>
                        </div>
                    )}

                    <div className="flex justify-center mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={endInterview}
                        >
                            <PhoneOff className="mr-2 h-4 w-4" />
                            End Interview
                        </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-2">
                        {useTextMode
                            ? 'Type your response and press Enter or click Send'
                            : 'Hold the microphone button to speak, release to send'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default VoiceInterviewClient;
