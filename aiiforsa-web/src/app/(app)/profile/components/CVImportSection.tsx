'use client';

import { uploadAndParseCV } from '@/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, FileText, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface CVImportSectionProps {
    onSuccess?: () => void;
    currentCvData?: any;
}

export function CVImportSection({ onSuccess, currentCvData }: CVImportSectionProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);
        setSuccess(null);
        setParsedData(null);

        if (selectedFile) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Please upload a PDF, DOCX, or TXT file');
                return;
            }

            // Validate file size (10MB max)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            setFile(selectedFile);
        }
    }, []);

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await uploadAndParseCV(file);

            if (result.success) {
                setSuccess('CV parsed and saved successfully!');
                setParsedData(result.parsedCV);
                setFile(null);
                // Reset the file input
                const fileInput = document.getElementById('cv-file-input') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
                toast.success('CV uploaded successfully!', {
                    description: 'Your CV has been parsed and saved to your profile.',
                });
                onSuccess?.();
            } else {
                setError(result.error || 'Failed to parse CV');
                toast.error('CV upload failed', {
                    description: result.error || 'Failed to parse CV',
                });
            }
        } catch (err) {
            console.error('CV upload error:', err);
            setError('An unexpected error occurred');
            toast.error('CV upload failed', {
                description: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setError(null);
        setSuccess(null);
        setParsedData(null);
        const fileInput = document.getElementById('cv-file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Import CV
                </CardTitle>
                <CardDescription>
                    Upload your CV (PDF, DOCX, or TXT) to automatically extract and save your professional information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current CV Status */}
                {currentCvData && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">CV data already imported</span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                            You can upload a new CV to update your profile information
                        </p>
                    </div>
                )}

                {/* File Input */}
                <div className="space-y-2">
                    <Label htmlFor="cv-file-input">Select CV File</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="cv-file-input"
                            type="file"
                            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="flex-1"
                        />
                        {file && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={clearFile}
                                disabled={loading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Selected File Info */}
                {file && (
                    <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    </div>
                )}

                {/* Parsed Data Preview */}
                {parsedData && (
                    <div className="p-3 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Extracted Information:</h4>
                        <div className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                            {parsedData.personalInfo?.fullName && (
                                <p><strong>Name:</strong> {parsedData.personalInfo.fullName}</p>
                            )}
                            {parsedData.personalInfo?.email && (
                                <p><strong>Email:</strong> {parsedData.personalInfo.email}</p>
                            )}
                            {parsedData.personalInfo?.phone && (
                                <p><strong>Phone:</strong> {parsedData.personalInfo.phone}</p>
                            )}
                            {parsedData.skills?.length > 0 && (
                                <p><strong>Skills:</strong> {parsedData.skills.slice(0, 5).join(', ')}{parsedData.skills.length > 5 ? '...' : ''}</p>
                            )}
                            {parsedData.workExperience?.length > 0 && (
                                <p><strong>Experience:</strong> {parsedData.workExperience.length} position(s)</p>
                            )}
                            {parsedData.education?.length > 0 && (
                                <p><strong>Education:</strong> {parsedData.education.length} entry(ies)</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Parsing CV...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload & Parse CV
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    Your CV will be parsed using AI to extract professional information.
                    This data will be saved to your profile.
                </p>
            </CardContent>
        </Card>
    );
}
