'use client';

import {
    createResume,
    parseResumeWithGemini,
    ResumeSection,
} from '@/actions/resume-actions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ParsedResume {
    id: string;
    title: string;
    createdAt: string;
    sections: ResumeSection[];
}

export default function ResumeImportLanding() {
    const router = useRouter();
    const [status, setStatus] = useState<
        'idle' | 'processing' | 'error' | 'preview'
    >('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

    useEffect(() => {
        const imported = sessionStorage.getItem('importedResume');
        if (!imported) {
            router.push('/resume-builder/new-resume');
            return;
        }

        (async () => {
            setStatus('processing');

            try {
                const parsed = JSON.parse(imported) as {
                    name: string;
                    type: string;
                    dataUrl: string;
                };

                // Convert dataUrl back to File object
                const response = await fetch(parsed.dataUrl);
                const blob = await response.blob();
                const file = new File([blob], parsed.name, {
                    type: parsed.type,
                });

                // Parse using server action
                const parseResult = await parseResumeWithGemini(file);

                if (!parseResult.success || !parseResult.data) {
                    throw new Error(
                        parseResult.error || 'Failed to parse resume',
                    );
                }

                // Set parsed resume for preview
                setParsedResume({
                    id: `temp-${Date.now()}`, // Temporary ID for preview
                    title: `Imported Resume - ${parsed.name}`,
                    createdAt: new Date().toISOString(),
                    sections: parseResult.data.json.sections || [],
                });

                setStatus('preview');
            } catch {
                setStatus('error');
                setMessage('Failed to process imported resume.');
            }
        })();
    }, [router]);

    if (status === 'processing' || status === 'idle') {
        return (
            <div className="mx-auto max-w-3xl px-4 py-24 text-center">
                <h2 className="text-2xl font-semibold text-white">
                    Importing resume...
                </h2>
                <p className="mt-4 text-sm text-[#90A1B9]">
                    Please wait while we extract the content.
                </p>
                {message && (
                    <p className="mt-2 text-xs text-red-400">{message}</p>
                )}
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="mx-auto max-w-3xl px-4 py-24 text-center">
                <h2 className="text-2xl font-semibold text-white">
                    Import failed
                </h2>
                <p className="mt-4 text-sm text-[#90A1B9]">
                    {message || 'An error occurred while importing the resume.'}
                </p>
            </div>
        );
    }

    // If we have a parsed resume, show a preview and ask the user to confirm
    if (parsedResume) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-12">
                <h2 className="text-2xl font-semibold text-white mb-4">
                    Preview imported resume
                </h2>
                <p className="text-sm text-[#90A1B9] mb-6">
                    Review the parsed sections below. Click &quot;Use this&quot;
                    to continue to the editor with this content, or
                    &quot;Cancel&quot; to go back.
                </p>

                <div className="space-y-4">
                    <div className="rounded-md bg-slate-800/50 p-4">
                        <h3 className="font-semibold text-slate-100">
                            {parsedResume.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                            Created:{' '}
                            {new Date(parsedResume.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-3 space-y-2">
                            {parsedResume.sections.map(
                                (s: ResumeSection, i: number) => (
                                    <div
                                        key={i}
                                        className="rounded border border-slate-700/40 p-3"
                                    >
                                        <div className="font-medium text-slate-100">
                                            {s.type === 'custom'
                                                ? (s as any).title || 'Custom'
                                                : s.type}
                                        </div>
                                        <div className="mt-1 text-sm text-slate-300">
                                            {/* show brief preview of content where available */}
                                            {(() => {
                                                if ('data' in s) {
                                                    const d: any = s.data;
                                                    if (d.content)
                                                        return (
                                                            d.content.slice(
                                                                0,
                                                                200,
                                                            ) +
                                                            (d.content.length >
                                                            200
                                                                ? '…'
                                                                : '')
                                                        );
                                                    if (
                                                        d.entries &&
                                                        d.entries.length
                                                    )
                                                        return (
                                                            (
                                                                d.entries[0]
                                                                    .description ||
                                                                JSON.stringify(
                                                                    d
                                                                        .entries[0],
                                                                )
                                                            ).slice(0, 200) +
                                                            (JSON.stringify(
                                                                d.entries[0],
                                                            ).length > 200
                                                                ? '…'
                                                                : '')
                                                        );
                                                }
                                                return (
                                                    <span className="text-slate-500">
                                                        No preview available
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            className="rounded bg-green-600 px-4 py-2 text-white"
                            onClick={async () => {
                                if (!parsedResume) return;

                                setStatus('processing');
                                try {
                                    // Get the parsed data from sessionStorage again
                                    const imported =
                                        sessionStorage.getItem(
                                            'importedResume',
                                        );
                                    if (!imported) {
                                        throw new Error(
                                            'Import data not found',
                                        );
                                    }

                                    const parsed = JSON.parse(imported) as {
                                        name: string;
                                        type: string;
                                        dataUrl: string;
                                    };

                                    // Convert dataUrl back to File object
                                    const response = await fetch(
                                        parsed.dataUrl,
                                    );
                                    const blob = await response.blob();
                                    const file = new File([blob], parsed.name, {
                                        type: parsed.type,
                                    });

                                    // Parse again to get the data (or we could store it)
                                    const parseResult =
                                        await parseResumeWithGemini(file);

                                    if (
                                        !parseResult.success ||
                                        !parseResult.data
                                    ) {
                                        throw new Error(
                                            parseResult.error ||
                                                'Failed to parse resume',
                                        );
                                    }

                                    // Create resume with parsed data
                                    const createResult = await createResume({
                                        title: parsedResume.title,
                                        data: parseResult.data.json,
                                    });

                                    if (
                                        !createResult.success ||
                                        !createResult.data
                                    ) {
                                        throw new Error(
                                            createResult.error ||
                                                'Failed to create resume',
                                        );
                                    }

                                    // Clean up sessionStorage
                                    sessionStorage.removeItem('importedResume');

                                    // Navigate to the created resume
                                    router.push(
                                        `/resume-builder/${createResult.data.id}`,
                                    );
                                } catch {
                                    setStatus('preview');
                                    setMessage('Failed to create resume.');
                                }
                            }}
                        >
                            Use this
                        </button>

                        <button
                            className="rounded border border-slate-700 px-4 py-2 text-slate-200"
                            onClick={() => {
                                // discard parsed resume and return to new-resume selector
                                setParsedResume(null);
                                router.push('/resume-builder/new-resume');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
