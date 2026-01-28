'use client';

import { getUserCV } from '@/actions/job-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Brain,
    CheckCircle2,
    Loader2,
    Target,
    TrendingUp,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

// Career path options matching Python backend
const CAREER_PATHS = [
    { id: 'data-science', label: 'Data Science', icon: '📊' },
    { id: 'software-engineer', label: 'Software Engineer', icon: '💻' },
    { id: 'product-manager', label: 'Product Manager', icon: '📋' },
    { id: 'devops', label: 'DevOps', icon: '⚙️' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'ai-ml-engineer', label: 'AI/ML Engineer', icon: '🤖' },
];

export default function CareerAdvisorPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // State management
    const [cvJson, setCvJson] = React.useState<string>('');
    const [selectedPaths, setSelectedPaths] = React.useState<string[]>([]);
    const [intentions, setIntentions] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>('');
    const [cvLoading, setCvLoading] = React.useState<boolean>(false);
    const [cvError, setCvError] = React.useState<string>('');

    // Fetch user's CV on mount
    React.useEffect(() => {
        async function loadCV() {
            if (status === 'loading') return;
            if (!session?.user?.id) {
                setCvError('Please log in to use the career advisor');
                return;
            }

            setCvLoading(true);
            setCvError('');

            try {
                const result = await getUserCV(session.user.id);

                if (!result.success || !result.data) {
                    setCvError(
                        result.error ||
                            'Failed to load CV. Please upload and parse your CV first.',
                    );
                    return;
                }

                // The API returns cvParsed directly (already a JSON object)
                // Check if CV data exists and has required fields
                if (
                    !result.data ||
                    typeof result.data !== 'object' ||
                    Object.keys(result.data).length === 0
                ) {
                    setCvError(
                        'Your CV has not been parsed yet. Please parse your CV first in the Resume Builder.',
                    );
                    return;
                }

                // Validate CV has basic required structure
                if (
                    !result.data.personalInformation &&
                    !result.data.personal_information
                ) {
                    setCvError(
                        'CV data is incomplete. Please re-parse your CV.',
                    );
                    return;
                }

                // Set CV JSON - result.data is already the parsed CV object
                setCvJson(JSON.stringify(result.data));
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'An error occurred while loading your CV';
                setCvError(errorMessage);
            } finally {
                setCvLoading(false);
            }
        }

        loadCV();
    }, [session, status]);

    // Handle career path selection
    const togglePath = (path: string) => {
        setSelectedPaths(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path],
        );
    };

    // Validate form
    const isFormValid = () => {
        return (
            cvJson && selectedPaths.length > 0 && intentions.trim().length > 0
        );
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            setError(
                'Please select at least one career path and describe your intentions',
            );
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Call Gradio API with exact parameter order from Python
            const response = await fetch(
                'http://127.0.0.1:7861/gradio_api/call/career_advisor_fn',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: [
                            cvJson, // cv_json_str
                            selectedPaths, // desired_paths
                            intentions, // intentions
                            0.7, // temperature (fixed)
                            8192, // max_tokens (fixed)
                        ],
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`Gradio API error: ${response.status}`);
            }

            // Parse response to get event_id
            const responseText = await response.text();
            console.log('Gradio initial response:', responseText);

            const eventIdMatch = responseText.match(/event_id["\s:]+([^"\s]+)/);
            if (!eventIdMatch) {
                throw new Error('Failed to get event_id from Gradio response');
            }

            const eventId = eventIdMatch[1];
            console.log('Extracted event ID:', eventId);

            // Poll for the result
            const maxAttempts = 120; // 10 minutes max
            let attempts = 0;

            while (attempts < maxAttempts) {
                attempts++;
                console.log(
                    `Polling attempt ${attempts}/${maxAttempts} for event ${eventId}`,
                );

                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay

                const pollResponse = await fetch(
                    `http://127.0.0.1:7861/gradio_api/call/career_advisor_fn/${eventId}`,
                );

                if (pollResponse.ok) {
                    const pollText = await pollResponse.text();
                    console.log('Poll response:', pollText);
                    const lines = pollText.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            console.log('SSE data line:', data);

                            if (data.trim() === '[DONE]') {
                                continue;
                            }

                            try {
                                const parsedData = JSON.parse(data);
                                console.log('Parsed SSE data:', parsedData);

                                // Check if this is the complete event with result
                                if (
                                    Array.isArray(parsedData) &&
                                    parsedData.length > 0
                                ) {
                                    const resultData = parsedData[0];

                                    // Navigate to results page with data
                                    router.push(
                                        `/advisor/results?data=${encodeURIComponent(
                                            JSON.stringify(resultData),
                                        )}`,
                                    );
                                    return;
                                }
                            } catch (parseError) {
                                console.error(
                                    'Error parsing SSE data:',
                                    parseError,
                                );
                            }
                        }
                    }
                }
            }

            throw new Error('Timeout waiting for career advisor response');
        } catch (err) {
            console.error('Error calling career advisor:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'An error occurred while generating your career roadmap',
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while checking auth
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show error if not authenticated
    if (!session) {
        return (
            <div className="container max-w-2xl mx-auto py-12 px-4">
                <Card className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                    <h2 className="text-2xl font-bold mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Please log in to use the career advisor feature
                    </p>
                    <Button onClick={() => router.push('/auth/login')}>
                        Go to Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Career Advisor</h1>
                        <p className="text-muted-foreground">
                            Get AI-powered personalized career guidance
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* CV Loading State */}
            {cvLoading && (
                <Card className="p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                            Loading your CV from profile...
                        </span>
                    </div>
                </Card>
            )}

            {/* CV Success State */}
            {!cvLoading && !cvError && cvJson && (
                <Card className="p-6 mb-6 border-green-500/50 bg-green-500/5">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                            CV loaded successfully
                        </span>
                    </div>
                </Card>
            )}

            {/* CV Error */}
            {cvError && (
                <Card className="p-6 mb-6 border-destructive/50 bg-destructive/5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                        <div>
                            <p className="font-semibold text-destructive">
                                CV Error
                            </p>
                            <p className="text-sm text-destructive/80">
                                {cvError}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Career Paths Selection */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary" />
                        <Label className="text-lg font-semibold">
                            Desired Career Paths
                        </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Select one or more career paths you're interested in
                        pursuing
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CAREER_PATHS.map(path => (
                            <motion.div
                                key={path.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <label
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                        selectedPaths.includes(path.label)
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <Checkbox
                                        checked={selectedPaths.includes(
                                            path.label,
                                        )}
                                        onCheckedChange={() =>
                                            togglePath(path.label)
                                        }
                                    />
                                    <span className="text-2xl">
                                        {path.icon}
                                    </span>
                                    <span className="font-medium">
                                        {path.label}
                                    </span>
                                    {selectedPaths.includes(path.label) && (
                                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                                    )}
                                </label>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Career Intentions */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <Label
                            htmlFor="intentions"
                            className="text-lg font-semibold"
                        >
                            Career Intentions & Goals
                        </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Describe your career goals, aspirations, and what you
                        want to achieve
                    </p>
                    <Textarea
                        id="intentions"
                        value={intentions}
                        onChange={e => setIntentions(e.target.value)}
                        placeholder="E.g., I want to transition from frontend development to full-stack engineering within the next 2 years. I'm particularly interested in cloud technologies and microservices architecture..."
                        className="min-h-32"
                        disabled={isLoading || cvLoading || !!cvError}
                    />
                </Card>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Card className="p-4 border-destructive/50 bg-destructive/5">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-destructive">
                                            Error
                                        </p>
                                        <p className="text-sm text-destructive/80">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            !isFormValid() ||
                            isLoading ||
                            cvLoading ||
                            !!cvError
                        }
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Generating Your Career Roadmap...
                            </>
                        ) : (
                            <>
                                <Brain className="w-4 h-4 mr-2" />
                                Generate Career Roadmap
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
