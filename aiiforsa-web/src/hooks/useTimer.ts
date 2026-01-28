import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseTimerOptions {
    initialSeconds: number;
    onComplete?: () => void;
    onTick?: (secondsLeft: number) => void;
}

export interface UseTimerReturn {
    timeLeft: number;
    isRunning: boolean;
    isPaused: boolean;
    start: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    stop: () => void;
}

/**
 * useTimer Hook
 * Countdown timer with start, pause, resume, reset functionality
 * @param options - Timer configuration
 * @returns Timer state and controls
 */
export function useTimer({
    initialSeconds,
    onComplete,
    onTick,
}: UseTimerOptions): UseTimerReturn {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        setIsRunning(true);
        setIsPaused(false);
        setTimeLeft(initialSeconds);
    }, [initialSeconds]);

    const pause = useCallback(() => {
        setIsPaused(true);
        clearTimer();
    }, [clearTimer]);

    const resume = useCallback(() => {
        setIsPaused(false);
        setIsRunning(true);
    }, []);

    const reset = useCallback(() => {
        clearTimer();
        setTimeLeft(initialSeconds);
        setIsRunning(false);
        setIsPaused(false);
    }, [initialSeconds, clearTimer]);

    const stop = useCallback(() => {
        clearTimer();
        setIsRunning(false);
        setIsPaused(false);
    }, [clearTimer]);

    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;

                    if (newTime <= 0) {
                        clearInterval(intervalRef.current!);
                        setIsRunning(false);
                        onComplete?.();
                        return 0;
                    }

                    onTick?.(newTime);
                    return newTime;
                });
            }, 1000);
        }

        return () => clearTimer();
    }, [isRunning, isPaused, onComplete, onTick, clearTimer]);

    return {
        timeLeft,
        isRunning,
        isPaused,
        start,
        pause,
        resume,
        reset,
        stop,
    };
}

export default useTimer;
