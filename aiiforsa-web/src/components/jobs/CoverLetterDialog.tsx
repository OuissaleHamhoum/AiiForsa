'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { JobItem } from './types';

export function CoverLetterDialog({
    job,
    open,
    onOpenChange,
}: {
    job: JobItem | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [loading, setLoading] = useState(true);
    const [letter, setLetter] = useState('');

    useEffect(() => {
        if (open && job) {
            setLoading(true);
            setLetter('');
            const t = setTimeout(() => {
                const content = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. With a solid background in modern web development and experience across cloud-native technologies, I am confident I would be a valuable addition to your team.\n\nIn my recent projects, I have delivered scalable solutions using best practices and clean architecture. I collaborate well across teams and prioritize maintainability, performance, and great user experience.\n\nI would welcome the opportunity to discuss how my skills can benefit ${job.company}. Thank you for your time and consideration.\n\nSincerely,\nYour Name`;
                setLetter(content);
                setLoading(false);
            }, 1000);
            return () => clearTimeout(t);
        }
    }, [open, job]);

    const copyToClipboard = async () => {
        if (!letter) return;
        await navigator.clipboard.writeText(letter);
    };

    const download = () => {
        const blob = new Blob([letter], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cover-letter-${job?.title.replace(/\s+/g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>AI-Generated Cover Letter</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                        Generating your personalized cover letter...
                    </div>
                ) : (
                    <div className="space-y-3">
                        <ScrollArea className="h-64 border rounded-md p-3 bg-background/40">
                            <pre className="whitespace-pre-wrap text-sm">
                                {letter}
                            </pre>
                        </ScrollArea>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={copyToClipboard}>
                                Copy to Clipboard
                            </Button>
                            <Button
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={download}
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
