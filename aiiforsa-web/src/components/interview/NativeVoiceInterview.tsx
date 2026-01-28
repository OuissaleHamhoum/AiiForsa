'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Bot,
    CheckCircle,
    Loader2,
    MessageSquare,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    User,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Types
interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    section?: string;
}

interface InterviewSection {
    name: string;
    status: 'pending' | 'active' | 'completed';
    score?: number;
}

interface NativeVoiceInterviewProps {
    cvData: string;
    jobDescription: string;
    onInterviewComplete?: (report: unknown) => void;
    onError?: (error: string) => void;
}

const INTERVIEW_SECTIONS: InterviewSection[] = [
    { name: 'Pre-Introduction', status: 'pending' },
    { name: 'Introduction', status: 'pending' },
    { name: 'HR Questions', status: 'pending' },
    { name: 'Behavioral', status: 'pending' },
    { name: 'Technical', status: 'pending' },
    { name: 'Situational', status: 'pending' },
];

const PYTHON_API_URL =
    process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:7861';

export default function NativeVoiceInterview({
    cvData,
    jobDescription,
    onInterviewComplete,
    onError,
}: NativeVoiceInterviewProps) {
    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentSection, setCurrentSection] =
        useState<string>('Pre-Introduction');
    const [sections, setSections] =
        useState<InterviewSection[]>(INTERVIEW_SECTIONS);
    const [conversation, setConversation] = useState<ConversationMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState(
        'Ready to start interview',
    );
    const [audioLevel, setAudioLevel] = useState(0);
    const [interviewComplete, setInterviewComplete] = useState(false);

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioQueueRef = useRef<ArrayBuffer[]>([]);
    const isPlayingRef = useRef(false);
    const conversationEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll conversation
    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    // Initialize interview session
    const initializeInterview = async () => {
        try {
            setStatusMessage('Initializing interview session...');
            setError(null);

            const response = await fetch(
                `${PYTHON_API_URL}/api/voice-interview/setup`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cv_json: cvData,
                        job_description: jobDescription,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || 'Failed to initialize interview',
                );
            }

            const data = await response.json();
            setSessionId(data.session_id);
            setStatusMessage('Session created. Connecting to voice stream...');

            // Connect WebSocket
            await connectWebSocket(data.session_id);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to initialize interview';
            setError(message);
            onError?.(message);
        }
    };

    // Connect to WebSocket
    const connectWebSocket = async (sid: string) => {
        try {
            const wsUrl = PYTHON_API_URL.replace('http', 'ws');
            const ws = new WebSocket(
                `${wsUrl}/api/voice-interview/stream/${sid}`,
            );

            ws.binaryType = 'arraybuffer';

            ws.onopen = () => {
                setIsConnected(true);
                setStatusMessage(
                    "Connected! Click 'Start Interview' to begin.",
                );
                wsRef.current = ws;
            };

            ws.onmessage = async event => {
                if (event.data instanceof ArrayBuffer) {
                    // Audio data from AI
                    handleAudioData(event.data);
                } else {
                    // JSON message
                    try {
                        const message = JSON.parse(event.data);
                        handleWebSocketMessage(message);
                    } catch {
                        console.error('Failed to parse WebSocket message');
                    }
                }
            };

            ws.onerror = event => {
                console.error('WebSocket error:', event);
                setError('Connection error. Please try again.');
                setIsConnected(false);
            };

            ws.onclose = () => {
                setIsConnected(false);
                if (!interviewComplete) {
                    setStatusMessage('Disconnected from server');
                }
            };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to connect';
            setError(message);
            onError?.(message);
        }
    };

    // Handle WebSocket messages
    const handleWebSocketMessage = (message: Record<string, unknown>) => {
        switch (message.type) {
            case 'transcript':
                // User's speech transcription
                if (message.text) {
                    addConversationMessage('user', message.text as string);
                }
                break;

            case 'response':
                // AI's response text
                if (message.text) {
                    addConversationMessage(
                        'assistant',
                        message.text as string,
                        message.section as string,
                    );
                }
                break;

            case 'section_change':
                // Interview section changed
                if (message.section) {
                    updateSection(message.section as string);
                }
                break;

            case 'speaking_start':
                setIsAISpeaking(true);
                break;

            case 'speaking_end':
                setIsAISpeaking(false);
                break;

            case 'interview_complete':
                setInterviewComplete(true);
                setStatusMessage('Interview completed! Generating report...');
                fetchReport();
                break;

            case 'error':
                setError(message.message as string);
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    };

    // Add message to conversation
    const addConversationMessage = (
        role: 'user' | 'assistant',
        content: string,
        section?: string,
    ) => {
        setConversation(prev => [
            ...prev,
            {
                role,
                content,
                timestamp: new Date(),
                section: section || currentSection,
            },
        ]);
    };

    // Update interview section
    const updateSection = (sectionName: string) => {
        setCurrentSection(sectionName);
        setSections(prev =>
            prev.map(s => ({
                ...s,
                status:
                    s.name === sectionName
                        ? 'active'
                        : INTERVIEW_SECTIONS.findIndex(
                                is => is.name === s.name,
                            ) <
                            INTERVIEW_SECTIONS.findIndex(
                                is => is.name === sectionName,
                            )
                          ? 'completed'
                          : 'pending',
            })),
        );
    };

    // Handle incoming audio data
    const handleAudioData = async (data: ArrayBuffer) => {
        audioQueueRef.current.push(data);
        if (!isPlayingRef.current) {
            playNextAudio();
        }
    };

    // Play audio from queue
    const playNextAudio = async () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            return;
        }

        isPlayingRef.current = true;
        const audioData = audioQueueRef.current.shift()!;

        try {
            if (
                !audioContextRef.current ||
                audioContextRef.current.state === 'closed'
            ) {
                audioContextRef.current = new AudioContext({
                    sampleRate: 24000,
                });
            }

            // Decode audio data (assuming PCM 16-bit)
            const int16Array = new Int16Array(audioData);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768;
            }

            const audioBuffer = audioContextRef.current.createBuffer(
                1,
                float32Array.length,
                24000,
            );
            audioBuffer.getChannelData(0).set(float32Array);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);

            source.onended = () => {
                playNextAudio();
            };

            source.start();
        } catch (err) {
            console.error('Error playing audio:', err);
            playNextAudio();
        }
    };

    // Start microphone and audio capture
    const startAudioCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                },
            });

            mediaStreamRef.current = stream;

            // Create audio context for processing
            audioContextRef.current = new AudioContext({ sampleRate: 16000 });
            sourceRef.current =
                audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();

            // Create processor for sending audio
            processorRef.current =
                audioContextRef.current.createScriptProcessor(4096, 1, 1);

            processorRef.current.onaudioprocess = e => {
                if (!isRecording || isMuted) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Update audio level visualization
                const sum = inputData.reduce((a, b) => a + Math.abs(b), 0);
                const avg = sum / inputData.length;
                setAudioLevel(Math.min(100, avg * 500));

                // Convert to 16-bit PCM and send
                const int16Array = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    int16Array[i] = Math.max(
                        -32768,
                        Math.min(32767, inputData[i] * 32768),
                    );
                }

                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(int16Array.buffer);
                }
            };

            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current.destination);

            setIsRecording(true);
            return true;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Microphone access denied';
            setError(`Microphone error: ${message}`);
            return false;
        }
    };

    // Start the interview
    const startInterview = async () => {
        if (!isConnected || !wsRef.current) {
            await initializeInterview();
            return;
        }

        const audioStarted = await startAudioCapture();
        if (!audioStarted) return;

        // Send start signal
        wsRef.current.send(JSON.stringify({ type: 'start_interview' }));
        setIsInterviewStarted(true);
        setStatusMessage('Interview in progress...');
        updateSection('Pre-Introduction');
    };

    // End the interview
    const endInterview = async () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'end_interview' }));
        }

        setIsRecording(false);
        setIsInterviewStarted(false);
        cleanup();
    };

    // Toggle mute
    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    // Fetch interview report
    const fetchReport = async () => {
        if (!sessionId) return;

        try {
            const response = await fetch(
                `${PYTHON_API_URL}/api/voice-interview/report/${sessionId}`,
            );
            if (response.ok) {
                const report = await response.json();
                onInterviewComplete?.(report);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
        }
    };

    // Calculate progress
    const completedSections = sections.filter(
        s => s.status === 'completed',
    ).length;
    const progress = (completedSections / sections.length) * 100;

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header with status */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Mic className="h-5 w-5" />
                            Voice Interview
                        </CardTitle>
                        <Badge
                            variant={isConnected ? 'default' : 'secondary'}
                            className={cn(
                                isConnected &&
                                    'bg-green-500 hover:bg-green-600',
                            )}
                        >
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {error ? (
                            <>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <span className="text-destructive">
                                    {error}
                                </span>
                            </>
                        ) : (
                            <>
                                {isInterviewStarted ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                <span>{statusMessage}</span>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Progress */}
            <Card>
                <CardContent className="pt-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Interview Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex flex-wrap gap-2 mt-3">
                            {sections.map(section => (
                                <Badge
                                    key={section.name}
                                    variant={
                                        section.status === 'completed'
                                            ? 'default'
                                            : section.status === 'active'
                                              ? 'secondary'
                                              : 'outline'
                                    }
                                    className={cn(
                                        section.status === 'active' &&
                                            'bg-blue-500 hover:bg-blue-600 text-white',
                                        section.status === 'completed' &&
                                            'bg-green-500 hover:bg-green-600',
                                    )}
                                >
                                    {section.status === 'completed' && (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {section.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conversation */}
            <Card className="flex-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Conversation
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[300px] px-4">
                        {conversation.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>
                                    Conversation will appear here once the
                                    interview starts
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                {conversation.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            'flex gap-3',
                                            msg.role === 'user'
                                                ? 'justify-end'
                                                : 'justify-start',
                                        )}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                'max-w-[80%] rounded-lg px-4 py-2',
                                                msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted',
                                            )}
                                        >
                                            <p className="text-sm">
                                                {msg.content}
                                            </p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {msg.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={conversationEndRef} />
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Audio visualization */}
            {isRecording && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {isMuted ? (
                                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Volume2 className="h-4 w-4 text-green-500" />
                                )}
                                <span className="text-sm">Your voice</span>
                            </div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full transition-all duration-75',
                                        isMuted
                                            ? 'bg-muted-foreground'
                                            : 'bg-green-500',
                                    )}
                                    style={{
                                        width: `${isMuted ? 0 : audioLevel}%`,
                                    }}
                                />
                            </div>
                            {isAISpeaking && (
                                <Badge
                                    variant="secondary"
                                    className="animate-pulse"
                                >
                                    <Volume2 className="h-3 w-3 mr-1" />
                                    AI Speaking
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4 py-4">
                {!isInterviewStarted ? (
                    <Button
                        size="lg"
                        onClick={startInterview}
                        disabled={interviewComplete}
                        className="gap-2"
                    >
                        <Phone className="h-5 w-5" />
                        {isConnected ? 'Start Interview' : 'Connect & Start'}
                    </Button>
                ) : (
                    <>
                        <Button
                            size="lg"
                            variant={isMuted ? 'destructive' : 'secondary'}
                            onClick={toggleMute}
                            className="gap-2"
                        >
                            {isMuted ? (
                                <>
                                    <MicOff className="h-5 w-5" />
                                    Unmute
                                </>
                            ) : (
                                <>
                                    <Mic className="h-5 w-5" />
                                    Mute
                                </>
                            )}
                        </Button>
                        <Button
                            size="lg"
                            variant="destructive"
                            onClick={endInterview}
                            className="gap-2"
                        >
                            <PhoneOff className="h-5 w-5" />
                            End Interview
                        </Button>
                    </>
                )}
            </div>

            {/* Interview complete message */}
            {interviewComplete && (
                <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <div>
                                <h3 className="font-semibold">
                                    Interview Complete!
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Your interview has been recorded and is
                                    being analyzed.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
