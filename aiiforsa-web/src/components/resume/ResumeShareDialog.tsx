'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Check,
    Copy,
    Eye,
    ExternalLink,
    Lock,
    QrCode,
    Share2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    generateResumeShareLink,
    revokeResumeShareLink,
    getResumeShareStats,
} from '@/actions/resume-actions';

interface ResumeShareDialogProps {
    resumeId: string;
    isOpen: boolean;
    onClose: () => void;
    initialShareUrl?: string;
    initialIsPublic?: boolean;
}

/**
 * Resume Share Dialog Component
 * Allows users to generate, copy, and manage resume share links
 * Features: QR code, expiry options, view statistics
 */
export function ResumeShareDialog({
    resumeId,
    isOpen,
    onClose,
    initialShareUrl,
    initialIsPublic = false,
}: ResumeShareDialogProps) {
    const [shareUrl, setShareUrl] = useState(initialShareUrl || '');
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [expiryDays, setExpiryDays] = useState<string>('30');
    const [stats, setStats] = useState<{
        shareViews: number;
        lastViewedAt?: Date;
    } | null>(null);

    const loadStats = useCallback(async () => {
        try {
            const result = await getResumeShareStats(resumeId);
            if (result.success && result.data) {
                setStats({
                    shareViews: result.data.shareViews,
                    lastViewedAt: result.data.lastViewedAt
                        ? new Date(result.data.lastViewedAt)
                        : undefined,
                });
            }
        } catch {
            // Silently fail - stats are non-critical
        }
    }, [resumeId]);

    // Load share stats if already shared
    useEffect(() => {
        if (isOpen && shareUrl) {
            loadStats();
        }
    }, [isOpen, shareUrl, loadStats]);

    const handleGenerateLink = async () => {
        setIsGenerating(true);
        try {
            const expiryDate =
                expiryDays !== 'never'
                    ? new Date(
                          Date.now() +
                              parseInt(expiryDays) * 24 * 60 * 60 * 1000,
                      )
                    : undefined;

            const result = await generateResumeShareLink(
                resumeId,
                expiryDate ? { expiry: expiryDate } : undefined,
            );

            if (!result.success || !result.data) {
                throw new Error(
                    result.error || 'Failed to generate share link',
                );
            }

            const fullUrl = `${window.location.origin}/resume/${result.data.shareSlug}`;
            setShareUrl(fullUrl);
            setIsPublic(result.data.isPublic);

            toast.success('Share link generated', {
                description: 'Your resume is now shareable via link',
            });

            await loadStats();
        } catch (error) {
            toast.error('Error', {
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to generate share link',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRevokeLink = async () => {
        setIsRevoking(true);
        try {
            const result = await revokeResumeShareLink(resumeId);

            if (!result.success) {
                throw new Error(result.error || 'Failed to revoke share link');
            }

            setShareUrl('');
            setIsPublic(false);
            setStats(null);

            toast.success('Share link revoked', {
                description: 'The link is no longer accessible',
            });
        } catch (error) {
            toast.error('Error', {
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to revoke share link',
            });
        } finally {
            setIsRevoking(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            toast.success('Copied!', {
                description: 'Share link copied to clipboard',
            });
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            toast.error('Error', {
                description: 'Failed to copy link',
            });
        }
    };

    const handleOpenLink = () => {
        window.open(shareUrl, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Resume
                    </DialogTitle>
                    <DialogDescription>
                        Generate a shareable link for your resume. Anyone with
                        the link can view your resume.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Share Link Input */}
                    {shareUrl ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <Input
                                        value={shareUrl}
                                        readOnly
                                        className="pr-10"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        {isPublic ? (
                                            <Eye className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className="flex-1 gap-2"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy Link
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleOpenLink}
                                    variant="outline"
                                    size="icon"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => setShowQRCode(!showQRCode)}
                                    variant="outline"
                                    size="icon"
                                >
                                    <QrCode className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* QR Code */}
                            {showQRCode && (
                                <div className="border rounded-lg p-4 bg-muted/50 flex flex-col items-center gap-2">
                                    <div className="w-48 h-48 bg-white border-2 rounded-lg flex items-center justify-center p-4">
                                        <QRCodeSVG
                                            value={shareUrl}
                                            size={176}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Scan to view resume
                                    </p>
                                </div>
                            )}

                            {/* Statistics */}
                            {stats && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">
                                            Share Statistics
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Total Views
                                                </p>
                                                <p className="font-semibold">
                                                    {stats.shareViews}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Last Viewed
                                                </p>
                                                <p className="font-semibold">
                                                    {stats.lastViewedAt
                                                        ? new Intl.DateTimeFormat(
                                                              'en-US',
                                                              {
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                              },
                                                          ).format(
                                                              stats.lastViewedAt,
                                                          )
                                                        : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />

                            {/* Revoke Button */}
                            <Button
                                onClick={handleRevokeLink}
                                variant="destructive"
                                className="w-full"
                                disabled={isRevoking}
                            >
                                {isRevoking
                                    ? 'Revoking...'
                                    : 'Revoke Share Link'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Expiry Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Link Expiry</Label>
                                <Select
                                    value={expiryDays}
                                    onValueChange={setExpiryDays}
                                >
                                    <SelectTrigger id="expiry">
                                        <SelectValue placeholder="Select expiry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">
                                            7 days
                                        </SelectItem>
                                        <SelectItem value="30">
                                            30 days
                                        </SelectItem>
                                        <SelectItem value="90">
                                            90 days
                                        </SelectItem>
                                        <SelectItem value="never">
                                            Never expires
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    The link will expire after the selected
                                    period
                                </p>
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={handleGenerateLink}
                                className="w-full gap-2"
                                disabled={isGenerating}
                            >
                                <Share2 className="h-4 w-4" />
                                {isGenerating
                                    ? 'Generating...'
                                    : 'Generate Share Link'}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
