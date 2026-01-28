'use client';

import React from 'react';
import type { InterviewStepsProps } from './types';

export default function InterviewSteps(props: InterviewStepsProps) {
    const { active = 1, showTime = false, time = '24:35' } = props;

    const stepClass = (n: number) =>
        active === n
            ? 'w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center'
            : 'w-8 h-8 rounded-full border border-white/10 flex items-center justify-center';

    const labelClass = (n: number) =>
        active === n ? 'text-white font-semibold' : 'text-gray-400';

    return (
        <div className={showTime ? 'mb-6' : 'mb-8'}>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className={stepClass(1)}>1</span>
                    <span className={labelClass(1)}>Setup</span>
                </div>

                <div className="flex-1 h-px bg-white/10" />

                <div className="flex items-center gap-3">
                    <span className={stepClass(2)}>2</span>
                    <span className={labelClass(2)}>Interview</span>
                </div>

                <div className="flex-1 h-px bg-white/10" />

                <div className="flex items-center gap-3">
                    <span className={stepClass(3)}>3</span>
                    <span className={labelClass(3)}>Analysis</span>
                </div>

                <div className="flex-1 h-px bg-white/10" />

                <div className="flex items-center gap-3">
                    <span className={stepClass(4)}>4</span>
                    <span className={labelClass(4)}>Results</span>
                </div>

                {showTime ? (
                    <div className="ml-6 text-sm text-gray-300">
                        Time Remaining{' '}
                        <span className="text-accent font-medium">{time}</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
