import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ProfileBannerProps {
    coverImage?: string;
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({
    coverImage,
    onUpload,
    isUploading,
}) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
            {coverImage && (
                <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
            )}
            <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 rounded-full w-8 h-8 p-0"
                disabled={isUploading}
                asChild
            >
                <label htmlFor="cover-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
            </Button>
        </div>
    );
};
