'use client';

/**
 * Tutorial Context and Provider
 * Manages tutorial state and completion tracking
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export type TutorialFeature = 'welcome';

interface TutorialContextType {
    completedTutorials: Set<TutorialFeature>;
    markTutorialComplete: (feature: TutorialFeature) => void;
    isTutorialCompleted: (feature: TutorialFeature) => boolean;
    showTutorial: (feature: TutorialFeature) => void;
    currentTutorial: TutorialFeature | null;
    closeTutorial: () => void;
    triggerTutorial: (feature: TutorialFeature) => void; // New method to trigger tutorial if not completed
}

const TutorialContext = createContext<TutorialContextType | undefined>(
    undefined,
);

const TUTORIAL_STORAGE_KEY = 'aiiforsa-tutorials-completed';

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const userId = session?.user?.id || 'anonymous';
    const storageKey = `${TUTORIAL_STORAGE_KEY}_${userId}`;

    const [completedTutorials, setCompletedTutorials] = useState<
        Set<TutorialFeature>
    >(new Set());
    const [currentTutorial, setCurrentTutorial] =
        useState<TutorialFeature | null>(null);

    // Load completed tutorials from localStorage on mount or when userId changes
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as TutorialFeature[];
                setCompletedTutorials(new Set(parsed));
            } catch (error) {
                console.error('Failed to parse tutorial data:', error);
            }
        } else {
            setCompletedTutorials(new Set());
        }
    }, [storageKey]);

    // Save completed tutorials to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(
            storageKey,
            JSON.stringify(Array.from(completedTutorials)),
        );
    }, [completedTutorials, storageKey]);

    const markTutorialComplete = (feature: TutorialFeature) => {
        setCompletedTutorials(prev => new Set([...prev, feature]));
        setCurrentTutorial(null);
    };

    const isTutorialCompleted = (feature: TutorialFeature) => {
        return completedTutorials.has(feature);
    };

    const showTutorial = (feature: TutorialFeature) => {
        if (!isTutorialCompleted(feature)) {
            setCurrentTutorial(feature);
        }
    };

    const triggerTutorial = (feature: TutorialFeature) => {
        if (!isTutorialCompleted(feature)) {
            setCurrentTutorial(feature);
        }
    };

    const closeTutorial = () => {
        setCurrentTutorial(null);
    };

    return (
        <TutorialContext.Provider
            value={{
                completedTutorials,
                markTutorialComplete,
                isTutorialCompleted,
                showTutorial,
                currentTutorial,
                closeTutorial,
                triggerTutorial,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (context === undefined) {
        throw new Error('useTutorial must be used within a TutorialProvider');
    }
    return context;
}
