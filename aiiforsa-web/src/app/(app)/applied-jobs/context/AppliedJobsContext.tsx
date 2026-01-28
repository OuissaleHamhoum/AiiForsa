'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface AppliedJobsContextType {
    onAddClick?: () => void;
    setOnAddClick: (callback: (() => void) | undefined) => void;
}

const AppliedJobsContext = createContext<AppliedJobsContextType>({
    onAddClick: undefined,
    setOnAddClick: () => {},
});

export function AppliedJobsProvider({ children }: { children: ReactNode }) {
    const [onAddClick, setOnAddClick] = useState<(() => void) | undefined>(
        undefined,
    );

    return (
        <AppliedJobsContext.Provider value={{ onAddClick, setOnAddClick }}>
            {children}
        </AppliedJobsContext.Provider>
    );
}

export function useAppliedJobs() {
    return useContext(AppliedJobsContext);
}
