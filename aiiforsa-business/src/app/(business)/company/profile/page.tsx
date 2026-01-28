'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin } from 'lucide-react';

type Brand = {
    companyName: string;
    tagline?: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
    about?: string;
    values?: string[];
    logoPreview?: string | null;
    bannerPreview?: string | null;
};

export default function CompanyProfilePage() {
    const [loading, setLoading] = useState(true);
    const [brand, setBrand] = useState<Brand>({
        companyName: 'Acme Inc.',
        tagline: 'Building delightful experiences',
        website: 'https://acme.example',
        industry: 'Technology',
        size: '51-200',
        location: 'San Francisco, CA',
        about: 'We are a product-first team focused on making tools people love.',
        values: ['Transparency', 'Quality'],
        logoPreview: null,
        bannerPreview: null,
    });

    useEffect(() => {
        const t = setTimeout(() => {
            try {
                const raw = localStorage.getItem('companyBrand');
                if (raw)
                    setBrand(prev => ({
                        ...prev,
                        ...(JSON.parse(raw) as Partial<Brand>),
                    }));
            } catch {
                // ignore
            }
            setLoading(false);
        }, 250);
        return () => clearTimeout(t);
    }, []);

    const { bannerPreview, logoPreview } = brand;

    return (
        <div className="py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Company profile
                </h1>
                <p className="text-muted-foreground">
                    How your company will appear to candidates.
                </p>
            </div>

            <div className="space-y-6">
                <Card>
                    <div className="relative">
                        <div className="h-44 w-full overflow-hidden rounded-t-xl bg-muted">
                            {loading ? (
                                <div className="h-full w-full animate-pulse bg-accent" />
                            ) : bannerPreview ? (
                                <Image
                                    src={bannerPreview}
                                    alt="banner"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                                    Banner
                                </div>
                            )}
                        </div>

                        {/* Logo overlapping */}
                        <div className="-mt-8 px-6">
                            <div className="flex items-end gap-4">
                                <div className="relative -mt-8">
                                    <div className="w-28 h-28 rounded-md overflow-hidden border-2 border-card bg-muted">
                                        {logoPreview ? (
                                            <Image
                                                src={logoPreview}
                                                alt="logo"
                                                width={112}
                                                height={112}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                                                Logo
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold">
                                        {brand.companyName}
                                    </h2>
                                    <p className="text-muted-foreground mt-1">
                                        {brand.tagline}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {brand.website && (
                                        <Link
                                            href={brand.website}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <Globe className="size-4" />
                                            Visit site
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium">About</h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                {brand.about}
                            </p>

                            {brand.values && brand.values.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {brand.values.map(v => (
                                        <Badge key={v} variant="secondary">
                                            {v}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Industry
                                </div>
                                <div className="font-medium">
                                    {brand.industry}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Company size
                                </div>
                                <div className="font-medium">{brand.size}</div>
                            </div>

                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Location
                                </div>
                                <div className="font-medium flex items-center gap-2">
                                    <MapPin className="size-4 text-muted-foreground" />
                                    {brand.location}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
