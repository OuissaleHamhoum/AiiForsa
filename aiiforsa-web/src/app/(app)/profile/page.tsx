'use client';

import { useCallback, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { CertificationsSection } from './components/CertificationsSection';
import { CVImportSection } from './components/CVImportSection';
import { DataSharingSection } from './components/DataSharingSection';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { LanguagesSection } from './components/LanguagesSection';
import { ProfileHeader } from './components/ProfileHeader';
import { ProjectsSection } from './components/ProjectsSection';
// import { AwardsSection } from './components/AwardsSection'; // TODO: Enable when backend awards API is ready
import {
    getCurrentUser,
    getUserCompleteProfile,
    type CompleteUserProfile,
} from '@/actions/user-actions';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { Button } from '@/components/ui/button';
import { Edit, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [completeProfile, setCompleteProfile] =
        useState<CompleteUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserData = useCallback(async () => {
        try {
            const result = await getCurrentUser();
            if (result.success && result.data) {
                setUserData(result.data);
                // Fetch complete profile with CV data
                const profileResult = await getUserCompleteProfile(
                    result.data.id,
                );
                if (profileResult.success && profileResult.data) {
                    setCompleteProfile(profileResult.data);
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const refreshProfile = useCallback(async () => {
        if (userData?.id) {
            const profileResult = await getUserCompleteProfile(userData.id);
            if (profileResult.success && profileResult.data) {
                setCompleteProfile(profileResult.data);
            }
        }
    }, [userData?.id]);

    const handleEditSuccess = () => {
        setIsEditing(false);
        refreshProfile();
    };

    if (loading) {
        return (
            <div className="py-8 space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                            Loading profile...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 space-y-8 max-w-7xl mx-auto">
            {/* Profile Header with integrated stats */}
            <ProfileHeader profile={completeProfile} />

            {/* Edit Mode Toggle */}
            <div className="flex justify-end">
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? 'outline' : 'default'}
                    className="flex items-center gap-2"
                >
                    {isEditing ? (
                        <>
                            <X className="w-4 h-4" />
                            Cancel Edit
                        </>
                    ) : (
                        <>
                            <Edit className="w-4 h-4" />
                            Edit Profile
                        </>
                    )}
                </Button>
            </div>

            {isEditing ? (
                /* Edit Mode */
                <div className="max-w-4xl mx-auto">
                    <ProfileEditForm
                        initialData={userData}
                        onSuccess={handleEditSuccess}
                    />
                </div>
            ) : (
                /* View Mode */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - About & Skills */}
                    <div className="lg:col-span-1 space-y-6">
                        <CVImportSection
                            onSuccess={refreshProfile}
                            currentCvData={completeProfile?.cvParsed}
                        />
                        <AboutSection
                            profile={completeProfile}
                            onRefresh={refreshProfile}
                        />
                        <LanguagesSection
                            languages={completeProfile?.languages || []}
                            onRefresh={refreshProfile}
                        />
                        <DataSharingSection
                            onRefresh={refreshProfile}
                        />
                    </div>

                    {/* Right Column - Experience, Education & Projects */}
                    <div className="lg:col-span-2 space-y-6">
                        <ExperienceSection
                            workExperiences={
                                completeProfile?.workExperiences || []
                            }
                            onRefresh={refreshProfile}
                        />
                        <EducationSection
                            educations={completeProfile?.educations || []}
                            onRefresh={refreshProfile}
                        />
                        <ProjectsSection
                            projects={completeProfile?.projects || []}
                            onRefresh={refreshProfile}
                        />
                        <CertificationsSection
                            certifications={
                                completeProfile?.certifications || []
                            }
                            onRefresh={refreshProfile}
                        />
                        {/* TODO: Enable AwardsSection when backend awards API is ready */}
                        {/* <AwardsSection awards={completeProfile?.awards || []} onRefresh={refreshProfile} /> */}
                    </div>
                </div>
            )}
        </div>
    );
}
