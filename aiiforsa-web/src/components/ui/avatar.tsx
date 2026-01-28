import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as React from 'react';

export type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

export function Avatar({ className, ...props }: AvatarProps) {
    return (
        <div
            className={cn(
                'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted',
                className,
            )}
            {...props}
        />
    );
}

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function AvatarImage({
    className,
    alt,
    src,
    ...props
}: AvatarImageProps) {
    if (!src) {
        return null;
    }
    return (
        <Image
            src={src}
            alt={alt || 'avatar'}
            fill
            sizes="40px"
            className={cn('object-cover', className)}
            {...(props as any)}
        />
    );
}

export type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
    return (
        <span
            className={cn(
                'flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium',
                className,
            )}
            {...props}
        />
    );
}

export default Avatar;
