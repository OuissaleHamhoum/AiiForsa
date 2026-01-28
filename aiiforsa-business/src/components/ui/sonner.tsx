'use client';

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            toastOptions={{
                classNames: {
                    toast: 'bg-[#1a1a1a] border-white/10 text-white backdrop-blur-sm shadow-xl',
                    title: 'text-white font-medium',
                    description: 'text-white/60',
                    success: 'border-[#10b981]/30 bg-[#1a1a1a]',
                    error: 'border-[#ef4444]/30 bg-[#1a1a1a]',
                    warning: 'border-[#f59e0b]/30 bg-[#1a1a1a]',
                    info: 'border-[#3b82f6]/30 bg-[#1a1a1a]',
                    actionButton: 'bg-[#cf6318] text-white hover:bg-[#b55416]',
                    cancelButton: 'bg-white/5 text-white/80 hover:bg-white/10',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
