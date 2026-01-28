/**
 * Suggestions Panel Component
 * Display and manage AI-generated suggestions
 */

'use client';

import { useCvSuggestions, useSuggestionActions } from '@/hooks/use-cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface SuggestionsPanelProps {
    cvId: string;
}

export function SuggestionsPanel({ cvId }: SuggestionsPanelProps) {
    const {
        pendingSuggestions,
        acceptedSuggestions,
        rejectedSuggestions,
        isLoading,
    } = useCvSuggestions(cvId);

    const { acceptSuggestion, rejectSuggestion, deleteSuggestion } =
        useSuggestionActions(cvId);

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAccept = async (suggestionId: string) => {
        setProcessingId(suggestionId);
        try {
            await acceptSuggestion(suggestionId);
            toast.success('Suggestion accepted and applied');
        } catch {
            toast.error('Failed to accept suggestion');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (suggestionId: string) => {
        setProcessingId(suggestionId);
        try {
            await rejectSuggestion(suggestionId);
            toast.success('Suggestion rejected');
        } catch {
            toast.error('Failed to reject suggestion');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (suggestionId: string) => {
        if (!confirm('Are you sure you want to delete this suggestion?'))
            return;

        setProcessingId(suggestionId);
        try {
            await deleteSuggestion(suggestionId);
            toast.success('Suggestion deleted');
        } catch {
            toast.error('Failed to delete suggestion');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                        Loading suggestions...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Suggestions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">
                            Pending
                            {pendingSuggestions.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {pendingSuggestions.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="accepted">Accepted</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4 mt-4">
                        {pendingSuggestions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No pending suggestions</p>
                                <p className="text-sm mt-1">
                                    Click &quot;Review CV&quot; to get
                                    AI-powered improvements
                                </p>
                            </div>
                        ) : (
                            pendingSuggestions.map((suggestion: any) => (
                                <Card
                                    key={suggestion.id}
                                    className="border-primary/20"
                                >
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge variant="outline">
                                                {suggestion.type}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    handleDelete(suggestion.id)
                                                }
                                                disabled={
                                                    processingId ===
                                                    suggestion.id
                                                }
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        {suggestion.reason && (
                                            <div className="text-sm text-muted-foreground">
                                                {suggestion.reason}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Original:
                                                </p>
                                                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                                    {JSON.stringify(
                                                        suggestion.original,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Suggested:
                                                </p>
                                                <pre className="text-xs bg-primary/5 p-2 rounded overflow-auto border border-primary/20">
                                                    {JSON.stringify(
                                                        suggestion.suggested,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleAccept(suggestion.id)
                                                }
                                                disabled={
                                                    processingId ===
                                                    suggestion.id
                                                }
                                                className="flex-1"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleReject(suggestion.id)
                                                }
                                                disabled={
                                                    processingId ===
                                                    suggestion.id
                                                }
                                                className="flex-1"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="accepted" className="space-y-4 mt-4">
                        {acceptedSuggestions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Check className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No accepted suggestions yet</p>
                            </div>
                        ) : (
                            acceptedSuggestions.map((suggestion: any) => (
                                <Card
                                    key={suggestion.id}
                                    className="border-green-500/20"
                                >
                                    <CardContent className="pt-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className="border-green-500"
                                            >
                                                {suggestion.type}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    suggestion.appliedAt!,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {suggestion.reason && (
                                            <p className="text-sm text-muted-foreground">
                                                {suggestion.reason}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-4 mt-4">
                        {rejectedSuggestions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <X className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No rejected suggestions</p>
                            </div>
                        ) : (
                            rejectedSuggestions.map((suggestion: any) => (
                                <Card
                                    key={suggestion.id}
                                    className="border-red-500/20 opacity-60"
                                >
                                    <CardContent className="pt-4 space-y-2">
                                        <Badge
                                            variant="outline"
                                            className="border-red-500"
                                        >
                                            {suggestion.type}
                                        </Badge>
                                        {suggestion.reason && (
                                            <p className="text-sm text-muted-foreground">
                                                {suggestion.reason}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
