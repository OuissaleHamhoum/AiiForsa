import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface Quest {
    id: string;
    title: string;
    xp: number;
    icon: LucideIcon;
    progress: number;
    target: number;
    link: string;
    completed: boolean;
}

interface DailyQuestsProps {
    quests: Quest[];
}

export function DailyQuests({ quests }: DailyQuestsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <span className="text-[#cf6318]">⚡</span>
                    Daily Quests
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {quests.map(quest => {
                    const progressPercent =
                        (quest.progress / quest.target) * 100;
                    const Icon = quest.icon;

                    return (
                        <div
                            key={quest.id}
                            className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-[#cf6318]/20 flex items-center justify-center">
                                    <Icon className="h-5 w-5 text-[#cf6318]" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-white">
                                        {quest.title}
                                    </h4>
                                    <Badge
                                        variant="secondary"
                                        className="bg-[#cf6318]/20 text-[#cf6318] border-[#cf6318]/30"
                                    >
                                        +{quest.xp} XP
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm text-white/60">
                                        <span>
                                            {quest.progress}/{quest.target}{' '}
                                            completed
                                        </span>
                                        <span>
                                            {Math.round(progressPercent)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={progressPercent}
                                        className="h-2"
                                    />
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                {quest.completed ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                                ) : (
                                    <Button
                                        asChild
                                        size="sm"
                                        className="bg-[#cf6318] hover:bg-[#e67320]"
                                    >
                                        <Link href={quest.link}>Continue</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
