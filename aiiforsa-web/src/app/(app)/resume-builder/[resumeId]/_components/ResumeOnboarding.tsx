'use client';

/**
 * Resume Onboarding Component
 * Shows welcome screen for new blank resumes
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ResumeOnboardingProps {
    onSkip: () => void;
    onSaveFullName: (name: string) => void;
}

export function ResumeOnboarding({
    onSkip,
    onSaveFullName,
}: ResumeOnboardingProps) {
    const [name, setFullName] = useState('');
    const [step, setStep] = useState<'name' | 'details'>('name');

    const handleSaveName = () => {
        if (name.trim()) {
            onSaveFullName(name);
        }
    };

    const handleSkip = () => {
        setStep('details');
        onSkip();
    };

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                {step === 'name' ? (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white">
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={e => setFullName(e.target.value)}
                                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                                    onKeyPress={e => {
                                        if (e.key === 'Enter') {
                                            handleSaveName();
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSkip}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Skip
                                </Button>
                                <Button
                                    onClick={handleSaveName}
                                    disabled={!name.trim()}
                                    className="flex-1"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold text-white">
                                Personal Details
                            </h1>
                            <p className="text-[#90A1B9]">
                                Add your contact information and professional
                                details to make your resume stand out.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={() => setStep('name')}
                                className="bg-button-accent text-white hover:opacity-90"
                            >
                                Continue to Profile
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
