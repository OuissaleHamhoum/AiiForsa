'use client';

import { UserAward } from '@/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Edit, Plus, Trophy } from 'lucide-react';
import { useState } from 'react';
import { AwardDialog } from './dialogs';

interface AwardsSectionProps {
    awards?: UserAward[];
    onRefresh: () => void;
}

export function AwardsSection({ awards = [], onRefresh }: AwardsSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAward, setSelectedAward] = useState<UserAward | null>(null);

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    const handleEdit = (award: UserAward) => {
        setSelectedAward(award);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedAward(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        onRefresh();
    };

    return (
        <>
            <Card>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl" />

                <div className="relative p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg blur-md opacity-50" />
                                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    Awards & Honors
                                </h2>
                                <p className="text-xs text-white/50">
                                    {awards.length} awards
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAdd}
                            className="h-9 px-3 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    {/* Awards List */}
                    {awards.length === 0 ? (
                        <div className="text-center py-8">
                            <Trophy className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/60 text-sm">
                                No awards added yet.
                            </p>
                            <p className="text-white/40 text-xs">
                                Add your achievements and honors.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {awards.map(award => (
                                <div
                                    key={award.id}
                                    className="group relative rounded-lg bg-white/5 border border-white/10 p-4 hover:border-yellow-500/50 hover:bg-white/[0.07] transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />

                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-yellow-400" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                                                        {award.title}
                                                    </h3>
                                                    <p className="text-sm text-white/70">
                                                        {award.issuer}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEdit(award)
                                                    }
                                                    className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-1.5 mt-2 text-xs text-white/60">
                                                <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                                                <span>
                                                    {formatDate(award.date)}
                                                </span>
                                            </div>

                                            {award.description && (
                                                <p className="mt-2 text-sm text-white/60 line-clamp-2">
                                                    {award.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <AwardDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                award={selectedAward}
                onSuccess={handleSuccess}
            />
        </>
    );
}
