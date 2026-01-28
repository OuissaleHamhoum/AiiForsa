import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ProfileAvatarProps {
    avatar?: string;
    userName: string;
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    avatar,
    userName,
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
        <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={avatar} alt={userName} />
                <AvatarFallback className="text-2xl">
                    {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                disabled={isUploading}
                asChild
            >
                <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <input
                        id="avatar-upload"
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
