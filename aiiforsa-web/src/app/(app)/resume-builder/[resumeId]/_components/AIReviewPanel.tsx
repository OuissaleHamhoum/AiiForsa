'use client';

/**
 * AI Review Dialog Component
 * Shows ATS scoring and AI-powered feedback for resume improvement in a modal dialog
 */

import {
    downloadReviewPdf,
    reviewResume,
    reviewResumeMultilingual,
} from '@/actions/resume-actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Resume } from '@/types/resume.types';
import {
    AlertCircle,
    AlertTriangle,
    Brain,
    CheckCircle2,
    Info,
    Loader2,
    RefreshCw,
    Sparkles,
    Star,
    TrendingUp,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface AIReviewDialogProps {
    resume: Resume;
    children: React.ReactNode;
}

interface ReviewData {
    profile?: SectionData;
    workExperience?: SectionData;
    projects?: SectionData;
    skills?: SectionData;
    education?: SectionData;
    certifications?: SectionData;
    languages?: SectionData;
    grammarAndStyle?: SectionData;
    xyzPattern?: SectionData;
    atsCompliance?: SectionData;
    overallScore: number;
    feedback: Record<string, string>;
}

interface SectionData {
    errors: string[];
    warnings: string[];
    infos: string[];
    score: number;
}

export function AIReviewDialog({ resume, children }: AIReviewDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reviewData, setReviewData] = useState<ReviewData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reviewMode, setReviewMode] = useState<'standard' | 'multilingual'>(
        'standard',
    );

    // Parse JSON review response
    const parseReviewJson = (jsonString: string): ReviewData | null => {
        try {
            // Clean up the JSON string by removing markdown formatting
            let cleanJson = jsonString.trim();

            // Remove markdown code blocks if present (handle ```json or ``` at start)
            if (cleanJson.startsWith('```json')) {
                cleanJson = cleanJson.replace(/^```json\s*\n?/, '');
            } else if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/^```\s*\n?/, '');
            }

            // Remove closing ``` if present
            if (cleanJson.includes('```')) {
                cleanJson = cleanJson.substring(0, cleanJson.indexOf('```'));
            }

            // Try to extract JSON object from the response (handle nested structures)
            // Look for the outermost JSON object
            const jsonStart = cleanJson.indexOf('{');
            const jsonEnd = cleanJson.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
            }

            // Parse the JSON
            const parsed = JSON.parse(cleanJson);

            // Handle different response structures
            let reviewData: any = null;

            // Check if response has a "review" wrapper
            if (parsed.review && typeof parsed.review === 'object') {
                reviewData = {
                    overallScore:
                        parsed.overallScore ||
                        parsed.review.atsCompliance?.score ||
                        45,
                    profile: parsed.review.profile,
                    workExperience: parsed.review.workExperience,
                    projects: parsed.review.projects,
                    skills: parsed.review.skills,
                    education: parsed.review.education,
                    certifications: parsed.review.certifications,
                    languages: parsed.review.languages,
                    grammarAndStyle:
                        parsed.review.grammarStyle ||
                        parsed.review.grammarAndStyle,
                    xyzPattern: parsed.review.xyzPattern,
                    atsCompliance: parsed.review.atsCompliance,
                    feedback:
                        parsed.feedbackSummary || parsed.review.feedback || {},
                };
            }
            // Check if response is already in the correct format
            else if (
                typeof parsed.overallScore === 'number' &&
                (parsed.profile || parsed.workExperience || parsed.feedback)
            ) {
                reviewData = parsed;
            }
            // Check if response has direct section data
            else if (parsed.profile || parsed.workExperience) {
                reviewData = {
                    overallScore:
                        parsed.overallScore || parsed.atsCompliance?.score || 0,
                    ...parsed,
                };
            }

            // Ensure all expected sections exist with default values
            if (reviewData) {
                const defaultSection = {
                    score: 0,
                    feedback: { errors: [], warnings: [], infos: [] },
                };

                return {
                    overallScore:
                        reviewData.overallScore ||
                        reviewData.atsCompliance?.score ||
                        0,
                    profile: reviewData.profile || defaultSection,
                    workExperience: reviewData.workExperience || defaultSection,
                    projects: reviewData.projects || defaultSection,
                    skills: reviewData.skills || defaultSection,
                    education: reviewData.education || defaultSection,
                    certifications: reviewData.certifications || defaultSection,
                    languages: reviewData.languages || defaultSection,
                    grammarAndStyle:
                        reviewData.grammarAndStyle ||
                        reviewData.grammarStyle ||
                        defaultSection,
                    xyzPattern: reviewData.xyzPattern || defaultSection,
                    atsCompliance: reviewData.atsCompliance || defaultSection,
                    feedback: reviewData.feedback || {},
                } as ReviewData;
            }

            return null;
        } catch {
            // Failed to parse JSON, will return null
            return null;
        }
    };

    const runReview = useCallback(
        async (mode: 'standard' | 'multilingual') => {
            setIsLoading(true);
            setError(null);
            setReviewData(null);

            try {
                const result =
                    mode === 'multilingual'
                        ? await reviewResumeMultilingual(resume.id)
                        : await reviewResume(resume.id);

                if (!result.success || !result.data) {
                    throw new Error(result.error || 'Review failed');
                }

                const parsed = parseReviewJson(result.data.review);

                if (parsed) {
                    setReviewData(parsed);
                } else {
                    // Fallback: try to extract score from raw text
                    const rawText = result.data.review;
                    const scoreMatch = rawText.match(
                        /Overall ATS Score\s*(\d+)\/100/i,
                    );
                    const extractedScore = scoreMatch
                        ? parseInt(scoreMatch[1], 10)
                        : 0;

                    setReviewData({
                        overallScore: extractedScore,
                        feedback: { raw: rawText },
                    } as any);
                }
            } catch (err: any) {
                setError(
                    err.message ||
                        'Failed to generate review. Please try again.',
                );
            } finally {
                setIsLoading(false);
            }
        },
        [resume.id],
    );

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && !reviewData && !isLoading) {
            runReview(reviewMode);
        }
    };

    const getSectionScore = (section: SectionData | undefined): number => {
        return section?.score ?? 0;
    };

    const getSectionCategory = (
        score: number,
    ): 'excellent' | 'good' | 'needsWork' | 'critical' => {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'needsWork';
        return 'critical';
    };

    const getCategoryColor = (
        category: 'excellent' | 'good' | 'needsWork' | 'critical',
    ) => {
        switch (category) {
            case 'excellent':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'good':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'needsWork':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'critical':
                return 'text-red-600 bg-red-50 border-red-200';
        }
    };

    const getCategoryIcon = (
        category: 'excellent' | 'good' | 'needsWork' | 'critical',
    ) => {
        switch (category) {
            case 'excellent':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'good':
                return <Star className="h-5 w-5" />;
            case 'needsWork':
                return <AlertTriangle className="h-5 w-5" />;
            case 'critical':
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    const renderSectionCard = (
        title: string,
        section: SectionData | undefined,
    ) => {
        if (!section) return null;

        const errors = section.errors || [];
        const warnings = section.warnings || [];
        const infos = section.infos || [];

        const score = getSectionScore(section);
        const category = getSectionCategory(score);

        return (
            <Card
                key={title}
                className={`${getCategoryColor(category)} border-2`}
            >
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        {getCategoryIcon(category)}
                        {title}
                        <Badge variant="outline" className="ml-auto">
                            {score}/100
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {errors.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="font-medium text-red-700">
                                    Errors
                                </span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                                {errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {warnings.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-orange-700">
                                    Warnings
                                </span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
                                {warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {infos.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-blue-700">
                                    Info
                                </span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                                {section.infos.map((info, idx) => (
                                    <li key={idx}>{info}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI Resume Review
                    </DialogTitle>
                    <DialogDescription>
                        Get detailed ATS scoring and actionable feedback to
                        improve your resume
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const newMode =
                                    reviewMode === 'standard'
                                        ? 'multilingual'
                                        : 'standard';
                                setReviewMode(newMode);
                                runReview(newMode);
                            }}
                            disabled={isLoading}
                        >
                            {reviewMode === 'standard'
                                ? 'Multilingual'
                                : 'Standard'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runReview(reviewMode)}
                            disabled={isLoading}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                try {
                                    const blob = await downloadReviewPdf(
                                        resume.id,
                                    );
                                    const url =
                                        window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `ATS_Review_${resume.id}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                } catch (error) {
                                    console.error(
                                        'Failed to download PDF:',
                                        error,
                                    );
                                    // You could show a toast notification here
                                }
                            }}
                            disabled={isLoading || !reviewData}
                        >
                            Download PDF
                        </Button>
                    </div>
                </div>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                <p className="text-sm text-muted-foreground">
                                    Analyzing your resume with AI...
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This may take 30-60 seconds
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Review Results */}
                        {reviewData && !isLoading && (
                            <>
                                {/* Overall Score */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Overall ATS Score
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="text-5xl font-bold text-primary">
                                                {reviewData.overallScore}
                                                <span className="text-2xl text-muted-foreground">
                                                    /100
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-3 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 transition-all"
                                                        style={{
                                                            width: `${reviewData.overallScore}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    {reviewData.overallScore >=
                                                    80
                                                        ? 'Excellent! Your resume is ATS-friendly'
                                                        : reviewData.overallScore >=
                                                            60
                                                          ? 'Good, but there is room for improvement'
                                                          : 'Needs significant improvement'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Section Scores */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    {renderSectionCard(
                                        'Profile',
                                        reviewData.profile,
                                    )}
                                    {renderSectionCard(
                                        'Work Experience',
                                        reviewData.workExperience,
                                    )}
                                    {renderSectionCard(
                                        'Projects',
                                        reviewData.projects,
                                    )}
                                    {renderSectionCard(
                                        'Skills',
                                        reviewData.skills,
                                    )}
                                    {renderSectionCard(
                                        'Education',
                                        reviewData.education,
                                    )}
                                    {renderSectionCard(
                                        'Certifications',
                                        reviewData.certifications,
                                    )}
                                    {renderSectionCard(
                                        'Languages',
                                        reviewData.languages,
                                    )}
                                    {renderSectionCard(
                                        'Grammar & Style',
                                        reviewData.grammarAndStyle,
                                    )}
                                    {renderSectionCard(
                                        'XYZ Pattern',
                                        reviewData.xyzPattern,
                                    )}
                                    {renderSectionCard(
                                        'ATS Compliance',
                                        reviewData.atsCompliance,
                                    )}
                                </div>

                                {/* Detailed Feedback */}
                                {Object.keys(reviewData.feedback).length >
                                    0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5" />
                                                Detailed Feedback
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {Object.entries(
                                                reviewData.feedback,
                                            ).map(([section, feedback]) => (
                                                <div
                                                    key={section}
                                                    className="border-l-4 border-primary/20 pl-4"
                                                >
                                                    <h4 className="font-semibold capitalize mb-2">
                                                        {section
                                                            .replace(
                                                                /([A-Z])/g,
                                                                ' $1',
                                                            )
                                                            .trim()}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {feedback}
                                                    </p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Raw Response Fallback */}
                                {(reviewData as any).feedback?.raw && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5" />
                                                AI Review Results
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap">
                                                {
                                                    (reviewData as any).feedback
                                                        .raw
                                                }
                                            </pre>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}

                        {/* Empty State */}
                        {!reviewData && !isLoading && !error && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="font-semibold mb-2">
                                    Get AI-Powered Review
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                                    Our AI will analyze your resume for ATS
                                    compatibility, keyword optimization, and
                                    provide actionable suggestions.
                                </p>
                                <Button
                                    onClick={() => runReview('standard')}
                                    className="gap-2"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Start Review
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
