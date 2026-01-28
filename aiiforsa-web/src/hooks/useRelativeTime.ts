import * as React from 'react';

// Simple relative time hook (nice-to-have)
export function useRelativeTime(date: Date | string | number): string {
    const [now, setNow] = React.useState(() => Date.now());

    React.useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000); // update every minute
        return () => clearInterval(id);
    }, []);

    const target = typeof date === 'number' ? date : new Date(date).getTime();
    const diffMs = now - target;
    const diffSec = Math.max(1, Math.floor(diffMs / 1000));

    const MIN = 60;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;

    if (diffSec < MIN) return `${diffSec}s`;
    if (diffSec < HOUR) return `${Math.floor(diffSec / MIN)}m`;
    if (diffSec < DAY) return `${Math.floor(diffSec / HOUR)}h`;
    if (diffSec < WEEK) return `${Math.floor(diffSec / DAY)}d`;
    return new Date(target).toLocaleDateString();
}

export default useRelativeTime;
