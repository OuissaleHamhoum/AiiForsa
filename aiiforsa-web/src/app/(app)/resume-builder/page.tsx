'use client';

/**
 * Resume Dashboard Page
 * Shows either the empty state (for new users) or existing resumes (for returning users)
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllResumes, deleteResume } from '@/actions/resume-actions';
import {
    Download,
    FileText,
    MoreVertical,
    Plus,
    Share2,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Import the Resume type from server actions
interface Resume {
    id: string;
    userId: string;
    userName: string;
    title: string;
    status: string;
    data: any;
    filePath?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    aiScore?: number;
    lastReviewedAt?: Date;
    templateId?: string;
    customStyles?: any;
    careerAdvice?: any;
    createdAt: Date;
    updatedAt: Date;
    sections?: any[];
    suggestions?: any[];
}

export default function ResumeBuilderPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [resumeToDelete, setResumeToDelete] = useState<{
        id: string;
        title: string;
    } | null>(null);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const result = await getAllResumes();
                if (result.success && result.data) {
                    setResumes(result.data);
                } else {
                    toast.error(result.error || 'Failed to load resumes');
                }
            } catch {
                toast.error('Failed to load resumes');
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, []);

    const handleDeleteResume = (resumeId: string, resumeTitle: string) => {
        setResumeToDelete({ id: resumeId, title: resumeTitle });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteResume = async () => {
        if (!resumeToDelete) return;

        try {
            const result = await deleteResume(resumeToDelete.id);
            if (result.success) {
                setResumes(resumes.filter(r => r.id !== resumeToDelete.id));
                toast.success('Resume deleted successfully');
            } else {
                toast.error(result.error || 'Failed to delete resume');
            }
        } catch {
            toast.error('Failed to delete resume');
        } finally {
            setDeleteDialogOpen(false);
            setResumeToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                        My Resumes
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-[#90A1B9]">
                        Loading your resumes...
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="h-full animate-pulse">
                            <CardContent className="p-4">
                                <div className="mb-4 aspect-[8.5/11] rounded-lg bg-white/10"></div>
                                <div className="space-y-2">
                                    <div className="h-4 rounded bg-white/10"></div>
                                    <div className="h-3 rounded bg-white/10"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                        My Resumes
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-[#90A1B9]">
                        Manage your resumes and create new ones
                    </p>
                </div>

                {/* New Resume Card + Existing Resumes Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* New Resume Card */}
                    <Link href="/resume-builder/new-resume">
                        <Card className="group h-full cursor-pointer flex items-center justify-center rounded-2xl transition-all hover:scale-105">
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                                <div className="mb-4 rounded-full bg-button-accent p-6">
                                    <Plus className="h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    New resume
                                </h3>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Existing Resume Cards */}
                    {resumes.map(resume => (
                        <Card
                            key={resume.id}
                            className="relative overflow-hidden rounded-2xl transition-all"
                        >
                            <Link href={`/resume-builder/${resume.id}`}>
                                <CardContent className="p-4">
                                    {/* Resume Thumbnail */}
                                    <div className="mb-4 aspect-[8.5/11] overflow-hidden rounded-lg bg-white/10">
                                        <div className="flex h-full items-center justify-center">
                                            <FileText className="h-16 w-16 text-white/50" />
                                        </div>
                                    </div>

                                    {/* Resume Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <h3 className="flex-1 truncate font-semibold text-white">
                                                {resume.title}
                                            </h3>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-48"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={(
                                                            e: React.MouseEvent,
                                                        ) => {
                                                            e.preventDefault();
                                                            // Handle download
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(
                                                            e: React.MouseEvent,
                                                        ) => {
                                                            e.preventDefault();
                                                            // Handle share
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Share2 className="mr-2 h-4 w-4" />
                                                        Share
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(
                                                            e: React.MouseEvent,
                                                        ) => {
                                                            e.preventDefault();
                                                            handleDeleteResume(
                                                                resume.id,
                                                                resume.title,
                                                            );
                                                        }}
                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-[#90A1B9]">
                                            <span>
                                                Updated{' '}
                                                {new Date(
                                                    resume.updatedAt,
                                                ).toLocaleDateString()}
                                            </span>
                                            {resume.aiScore && (
                                                <Badge variant="outline">
                                                    Score: {resume.aiScore}
                                                </Badge>
                                            )}
                                        </div>

                                        {resume.status && (
                                            <Badge className="text-xs">
                                                {resume.status}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Resume</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the resume titled{' '}
                            {resumeToDelete?.title}? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteResume}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
