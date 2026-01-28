import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RelatedListSectionProps<T> {
    title: string;
    icon: React.ReactNode;
    items?: T[];
    renderItem: (item: T) => React.ReactNode;
}

export function RelatedListSection<T>({
    title,
    icon,
    items,
    renderItem,
}: RelatedListSectionProps<T>) {
    if (!items || items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {icon}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        No {title.toLowerCase()} added yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => (
                    <div key={index}>{renderItem(item)}</div>
                ))}
            </CardContent>
        </Card>
    );
}
