'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Users, TrendingUp, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataSharingSectionProps {
    onRefresh?: () => void;
}

export function DataSharingSection({ onRefresh }: DataSharingSectionProps) {
    const [dataSharingEnabled, setDataSharingEnabled] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load current preference from localStorage or user settings
    useEffect(() => {
        const saved = localStorage.getItem('data-sharing-enabled');
        if (saved !== null) {
            setDataSharingEnabled(JSON.parse(saved));
        }
    }, []);

    const handleToggleDataSharing = async (enabled: boolean) => {
        setIsLoading(true);
        try {
            // Here you would typically make an API call to update user preferences
            // For now, we'll just save to localStorage
            localStorage.setItem('data-sharing-enabled', JSON.stringify(enabled));
            setDataSharingEnabled(enabled);
            setShowDetails(true);

            // Auto-hide details after 5 seconds
            setTimeout(() => setShowDetails(false), 5000);

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Failed to update data sharing preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                    <Shield className="h-5 w-5 text-[#cf6318]" />
                    Data Sharing Preferences
                </CardTitle>
                <CardDescription className="text-white/60">
                    Control how your profile data is shared with potential employers and recruiters
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Main Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                        {dataSharingEnabled ? (
                            <Eye className="h-5 w-5 text-green-400" />
                        ) : (
                            <EyeOff className="h-5 w-5 text-white/40" />
                        )}
                        <div>
                            <Label className="text-white font-medium cursor-pointer">
                                Enable Data Sharing
                            </Label>
                            <p className="text-sm text-white/60">
                                Allow verified companies to access your profile data
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={dataSharingEnabled}
                        onCheckedChange={handleToggleDataSharing}
                        disabled={isLoading}
                        className="data-[state=checked]:bg-[#cf6318]"
                    />
                </div>

                {/* Detailed Explanation */}
                <AnimatePresence>
                    {(showDetails || dataSharingEnabled) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <Alert className={`border-l-4 ${
                                dataSharingEnabled
                                    ? 'border-l-green-400 bg-green-400/10'
                                    : 'border-l-orange-400 bg-orange-400/10'
                            }`}>
                                <Info className={`h-4 w-4 ${
                                    dataSharingEnabled ? 'text-green-400' : 'text-orange-400'
                                }`} />
                                <AlertDescription className="text-white/90">
                                    {dataSharingEnabled ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-green-400" />
                                                <span className="font-medium">Data Sharing Enabled</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p>
                                                    ✅ <strong>Verified companies</strong> can now access your complete profile,
                                                    including your CV, skills, experience, and achievements.
                                                </p>
                                                <p>
                                                    📈 <strong>Increased visibility</strong> means you're more likely to be
                                                    discovered by recruiters actively searching for candidates with your qualifications.
                                                </p>
                                                <p>
                                                    🎯 <strong>Personalized opportunities</strong> - Companies may reach out
                                                    with job offers that match your profile and career goals.
                                                </p>
                                                <p>
                                                    🔒 Your data is shared securely with <strong>pre-screened, verified employers only</strong>.
                                                    We never share your personal contact information without your explicit consent.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-orange-400" />
                                                <span className="font-medium">Data Sharing Disabled</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p>
                                                    🔒 Your profile remains <strong>private and secure</strong>.
                                                    Companies cannot access your data or contact you directly.
                                                </p>
                                                <p>
                                                    📝 You can still <strong>apply to jobs manually</strong> and share your
                                                    profile when you choose to.
                                                </p>
                                                <p>
                                                    ⚙️ You can <strong>enable sharing anytime</strong> to increase your
                                                    chances of being discovered by recruiters.
                                                </p>
                                                <p className="text-orange-300">
                                                    💡 <strong>Tip:</strong> Enabling data sharing can significantly improve
                                                    your job search success rate as recruiters actively look for qualified candidates.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Additional Information */}
                <div className="text-xs text-white/50 space-y-2">
                    <p>
                        • Your privacy settings can be changed at any time
                    </p>
                    <p>
                        • We only share data with verified, reputable companies
                    </p>
                    <p>
                        • Personal contact information is never shared without consent
                    </p>
                    <p>
                        • You can opt-out of specific company communications
                    </p>
                </div>

                {/* Manual Details Toggle */}
                {!showDetails && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(true)}
                        className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                        <Info className="h-4 w-4 mr-2" />
                        Show Details
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}