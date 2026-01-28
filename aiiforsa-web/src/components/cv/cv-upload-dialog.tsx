/**
 * CV Upload Component
 * Upload and parse CV files using Gradio
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    parseResumeWithGemini,
    parseResumeWithQwen,
} from '@/actions/resume-actions';

interface CvUploadDialogProps {
    cvId: string;
    onParseComplete?: (data: any) => void;
}

export function CvUploadDialog({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cvId: _cvId,
    onParseComplete,
}: CvUploadDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [useQwen, setUseQwen] = useState(false);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
                // Check file type
                const validTypes = [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ];
                if (!validTypes.includes(selectedFile.type)) {
                    toast.error('Please upload a PDF or DOCX file');
                    return;
                }

                // Check file size (10MB limit)
                const maxSize = 10 * 1024 * 1024;
                if (selectedFile.size > maxSize) {
                    toast.error('File size must be less than 10MB');
                    return;
                }

                setFile(selectedFile);
            }
        },
        [],
    );

    const handleParse = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setParsing(true);
        try {
            // Use server actions to call backend API (which calls Gradio)
            const result = useQwen
                ? await parseResumeWithQwen(file)
                : await parseResumeWithGemini(file);

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to parse CV');
            }

            const parsedData = result.data.json;

            toast.success('CV parsed successfully');

            if (onParseComplete) {
                onParseComplete(parsedData);
            }

            setOpen(false);
            setFile(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to parse CV');
        } finally {
            setParsing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload CV</DialogTitle>
                    <DialogDescription>
                        Upload a PDF or DOCX resume to automatically parse and
                        populate sections
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="cv-file">CV File</Label>
                        <div className="flex items-center gap-2">
                            <input
                                id="cv-file"
                                type="file"
                                accept=".pdf,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    document.getElementById('cv-file')?.click()
                                }
                                disabled={parsing}
                            >
                                {file ? (
                                    <>
                                        <FileText className="h-4 w-4 mr-2" />
                                        {file.name}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose File
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Accepted formats: PDF, DOCX (max 10MB)
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="use-qwen"
                            checked={useQwen}
                            onChange={e => setUseQwen(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                            disabled={parsing}
                        />
                        <Label
                            htmlFor="use-qwen"
                            className="text-sm font-normal"
                        >
                            Use Qwen Vision (alternative parser)
                        </Label>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                            disabled={parsing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleParse}
                            disabled={!file || parsing}
                        >
                            {parsing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Parsing...
                                </>
                            ) : (
                                <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Parse CV
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
