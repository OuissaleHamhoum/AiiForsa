'use client';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScheduleProps {
    selectedDate: Date | undefined;
    onSelectDate: (date: Date | undefined) => void;
    interviewDates: Date[];
    interviewCount: number;
}

export function Schedule({
    selectedDate,
    onSelectDate,
    interviewDates,
    interviewCount,
}: ScheduleProps) {
    return (
        <Card className="border-white/10 bg-[#1a1a1a]/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white">
                    Interview Schedule
                </CardTitle>
                <p className="text-sm text-[#90A1B9]">
                    {interviewCount} interviews scheduled
                </p>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onSelectDate}
                    className="rounded-md"
                    classNames={{
                        months: 'space-y-4',
                        month: 'space-y-4',
                        caption:
                            'flex justify-center pt-1 relative items-center text-white',
                        caption_label: 'text-sm font-medium text-white',
                        nav: 'space-x-1 flex items-center',
                        button_previous:
                            'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10',
                        button_next:
                            'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10',
                        month_grid: 'w-full border-collapse space-y-1',
                        weekdays: 'flex',
                        weekday:
                            'text-white/50 rounded-md w-9 font-normal text-[0.8rem]',
                        week: 'flex w-full mt-2',
                        day: 'h-9 w-9 text-center text-sm p-0 relative text-white/70 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                        day_button:
                            'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-md transition-colors',
                        range_end: 'day-range-end',
                        selected:
                            'bg-[#cf6318] text-white hover:bg-[#cf6318] hover:text-white focus:bg-[#cf6318] focus:text-white',
                        today: 'bg-white/5 text-white font-semibold',
                        outside:
                            'text-white/20 opacity-50 aria-selected:bg-accent/50 aria-selected:text-white/50 aria-selected:opacity-30',
                        disabled: 'text-white/20 opacity-50',
                        range_middle:
                            'aria-selected:bg-accent aria-selected:text-white/70',
                        hidden: 'invisible',
                    }}
                    modifiers={{
                        hasInterview: interviewDates,
                    }}
                    modifiersClassNames={{
                        hasInterview:
                            'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#cf6318] text-white font-medium',
                    }}
                />
            </CardContent>
        </Card>
    );
}
