import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { ChevronRight, ChevronDown, Trash, FileText } from 'lucide-react';

type Report = {
    id: string;
    title: string;
    date: string;
    questions: number;
    duration: string;
    score: number;
    status?: 'Excellent' | 'Good' | 'Needs Improvement';
};

const sampleReports: Report[] = [
    {
        id: 'r1',
        title: 'Senior Software Engineer Interview',
        date: 'Oct 20, 2025',
        questions: 5,
        duration: '30 min',
        score: 85,
        status: 'Excellent',
    },
    {
        id: 'r2',
        title: 'Full Stack Developer Assessment',
        date: 'Oct 15, 2025',
        questions: 7,
        duration: '45 min',
        score: 78,
        status: 'Good',
    },
    {
        id: 'r3',
        title: 'Technical Lead Interview',
        date: 'Oct 10, 2025',
        questions: 5,
        duration: '30 min',
        score: 92,
        status: 'Excellent',
    },
];

export default function InterviewReports() {
    const [open, setOpen] = useState(false);

    return (
        <Card className="bg-amber-50/10">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <button
                        aria-expanded={open}
                        onClick={() => setOpen(v => !v)}
                        className="p-2 rounded-full hover:bg-white/5 transition"
                        title={open ? 'Collapse' : 'Expand'}
                    >
                        {open ? (
                            <ChevronDown className="w-5 h-5 text-gray-300" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        )}
                    </button>

                    <CardTitle className="text-lg">Interview Reports</CardTitle>
                </div>
            </CardHeader>

            <CardContent>
                {!open ? (
                    <div className="text-sm text-gray-400">
                        Click the arrow to open recent interview reports
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Search / filter row */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <Input placeholder="Search reports..." />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-44">
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="excellent">
                                                Excellent
                                            </SelectItem>
                                            <SelectItem value="good">
                                                Good
                                            </SelectItem>
                                            <SelectItem value="needs-improvement">
                                                Needs Improvement
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <button className="px-3 py-2 rounded-md bg-background/30 text-sm text-gray-300">
                                    Newest First
                                </button>
                            </div>
                        </div>

                        {sampleReports.map(r => (
                            <div
                                key={r.id}
                                className="flex items-center justify-between gap-4 p-4 bg-background/30 rounded-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <div className="text-sm text-gray-200 font-semibold">
                                            {r.title}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {r.date} · {r.questions} questions ·{' '}
                                            {r.duration}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-gray-100 text-right">
                                        <div className="text-xs text-gray-400">
                                            Score
                                        </div>
                                        <div className="font-semibold text-lg">
                                            {r.score}/100
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Check report
                                    </Button>

                                    <button className="p-2 rounded-md hover:bg-red-600/10">
                                        <Trash className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Bottom statistics row */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-background/30 text-center">
                                <div className="text-sm text-gray-400">
                                    Total Interviews
                                </div>
                                <div className="text-2xl font-bold text-white mt-2">
                                    6
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-background/30 text-center">
                                <div className="text-sm text-gray-400">
                                    Average Score
                                </div>
                                <div className="text-2xl font-bold text-amber-400 mt-2">
                                    83
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-background/30 text-center">
                                <div className="text-sm text-gray-400">
                                    Best Score
                                </div>
                                <div className="text-2xl font-bold text-emerald-400 mt-2">
                                    92
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-background/30 text-center">
                                <div className="text-sm text-gray-400">
                                    This Month
                                </div>
                                <div className="text-2xl font-bold text-white mt-2">
                                    4
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
