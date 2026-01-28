/**
 * CV Review Dialog Component
 * Display AI-powered CV review results
 */

'use client';

import { useState } from 'react';
import { useCvAiActions } from '@/hooks/use-cv';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sparkles, FileText, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface CvReviewDialogProps {
    cvId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CvReviewDialog({
    cvId,
    open,
    onOpenChange,
}: CvReviewDialogProps) {
    const { reviewCv, rewriteCv } = useCvAiActions(cvId);

    const [isReviewing, setIsReviewing] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [reviewResult, setReviewResult] = useState<string | null>(null);
    const [rewriteResult, setRewriteResult] = useState<{
        result: string;
        suggestionsCreated: number;
    } | null>(null);

    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [multilingual, setMultilingual] = useState(false);

    const handleReview = async () => {
        setIsReviewing(true);
        setReviewResult(null);
        try {
            const result = await reviewCv({
                temperature,
                maxTokens,
                multilingual,
            });
            setReviewResult(result);
            toast.success('CV reviewed successfully');
        } catch {
            toast.error('Failed to review CV');
        } finally {
            setIsReviewing(false);
        }
    };

    const handleRewrite = async () => {
        setIsRewriting(true);
        setRewriteResult(null);
        try {
            const result = await rewriteCv({
                temperature,
                maxTokens: 8192,
            });
            setRewriteResult(result);
            toast.success(
                `CV rewritten! ${result.suggestionsCreated} suggestions created.`,
            );
        } catch {
            toast.error('Failed to rewrite CV');
        } finally {
            setIsRewriting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI-Powered CV Review & Enhancement
                    </DialogTitle>
                    <DialogDescription>
                        Get detailed feedback and improvement suggestions for
                        your CV
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Settings */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h3 className="font-medium">AI Settings</h3>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="temperature">
                                    Temperature: {temperature.toFixed(2)}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    Higher = more creative
                                </span>
                            </div>
                            <Slider
                                id="temperature"
                                min={0}
                                max={1}
                                step={0.1}
                                value={[temperature]}
                                onValueChange={(value: number[]) =>
                                    setTemperature(value[0])
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="maxTokens">
                                    Max Tokens: {maxTokens}
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    Response length
                                </span>
                            </div>
                            <Slider
                                id="maxTokens"
                                min={512}
                                max={8192}
                                step={512}
                                value={[maxTokens]}
                                onValueChange={(value: number[]) =>
                                    setMaxTokens(value[0])
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="multilingual">
                                Multilingual Review
                            </Label>
                            <Switch
                                id="multilingual"
                                checked={multilingual}
                                onCheckedChange={setMultilingual}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={handleReview}
                            disabled={isReviewing || isRewriting}
                            size="lg"
                            className="w-full"
                        >
                            <FileText className="w-5 h-5 mr-2" />
                            {isReviewing ? 'Reviewing...' : 'Review CV'}
                        </Button>

                        <Button
                            onClick={handleRewrite}
                            disabled={isReviewing || isRewriting}
                            size="lg"
                            variant="outline"
                            className="w-full"
                        >
                            <Wand2 className="w-5 h-5 mr-2" />
                            {isRewriting ? 'Rewriting...' : 'Rewrite & Suggest'}
                        </Button>
                    </div>

                    {/* Results */}
                    {(reviewResult || rewriteResult) && (
                        <div className="space-y-4">
                            {reviewResult && (
                                <div className="space-y-2">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Review Results
                                    </h3>
                                    <div className="prose prose-sm max-w-none p-4 border rounded-lg bg-background">
                                        <ReactMarkdown>
                                            {reviewResult}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {rewriteResult && (
                                <div className="space-y-2">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <Wand2 className="w-4 h-4" />
                                        Rewrite Results
                                    </h3>
                                    <div className="p-4 border rounded-lg bg-primary/5">
                                        <p className="text-sm mb-2">
                                            <strong>
                                                {
                                                    rewriteResult.suggestionsCreated
                                                }
                                            </strong>{' '}
                                            suggestions created and ready for
                                            review
                                        </p>
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>
                                                {rewriteResult.result}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {(isReviewing || isRewriting) && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">
                                    {isReviewing
                                        ? 'Analyzing your CV...'
                                        : 'Generating improvements...'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
