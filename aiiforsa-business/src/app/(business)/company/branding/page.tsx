'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { Upload, X, ExternalLink, Info, Loader2 } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getMyCompany, updateCompanyBranding } from '@/actions';

export default function CompanyBrandingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [companyName, setCompanyName] = useState('Acme Inc.');
    const [tagline, setTagline] = useState('Building delightful experiences');
    const [website, setWebsite] = useState('https://acme.example');
    const [industry, setIndustry] = useState('technology');
    const [size, setSize] = useState('51-200');
    const [location, setLocation] = useState('San Francisco, CA');
    const [about, setAbout] = useState(
        'We are a product-first team focused on making tools people love. Our mission is to create software that feels natural and empowers users to do their best work.',
    );

    const [values, setValues] = useState<string[]>([
        'Transparency',
        'Quality',
        'Innovation',
    ]);
    const [benefits, setBenefits] = useState<string[]>([
        'Remote-first',
        'Health insurance',
    ]);
    const [valueInput, setValueInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');

    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');

    const logoRef = useRef<HTMLInputElement | null>(null);
    const bannerRef = useRef<HTMLInputElement | null>(null);

    // Fetch company data on mount
    useEffect(() => {
        async function loadCompany() {
            setIsLoading(true);
            const result = await getMyCompany();

            if (result.success && result.data) {
                setCompanyName(result.data.name || '');
                setTagline(result.data.tagline || '');
                setWebsite(result.data.website || '');
                setIndustry(result.data.industry || 'technology');
                setSize(result.data.companySize || '');
                setLocation(result.data.locations?.[0] || '');
                setAbout(result.data.about || '');
                setValues(result.data.values || []);
                setBenefits(result.data.benefits || []);
                setLogoPreview(result.data.logoUrl || null);
                setBannerPreview(result.data.bannerUrl || null);
                setSeoTitle(result.data.seoTitle || '');
                setSeoDescription(result.data.seoDescription || '');
            } else {
                toast.error(result.error || 'Failed to load company data');
            }
            setIsLoading(false);
        }

        loadCompany();
    }, []);

    const markDirty = () => setIsDirty(true);

    function onFileChange(
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (v: string | null) => void,
    ) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setter(url);
        markDirty();
    }

    function removeImage(setter: (v: string | null) => void) {
        setter(null);
        markDirty();
    }

    function addValue() {
        const t = valueInput.trim();
        if (!t || values.length >= 8) return;
        if (!values.includes(t)) {
            setValues(prev => [...prev, t]);
            markDirty();
        }
        setValueInput('');
    }

    function removeValue(tag: string) {
        setValues(prev => prev.filter(t => t !== tag));
        markDirty();
    }

    function addBenefit() {
        const t = benefitInput.trim();
        if (!t || benefits.length >= 10) return;
        if (!benefits.includes(t)) {
            setBenefits(prev => [...prev, t]);
            markDirty();
        }
        setBenefitInput('');
    }

    function removeBenefit(tag: string) {
        setBenefits(prev => prev.filter(t => t !== tag));
        markDirty();
    }

    function addSuggestion(type: 'value' | 'benefit', item: string) {
        if (type === 'value' && !values.includes(item) && values.length < 8) {
            setValues(prev => [...prev, item]);
            markDirty();
        } else if (
            type === 'benefit' &&
            !benefits.includes(item) &&
            benefits.length < 10
        ) {
            setBenefits(prev => [...prev, item]);
            markDirty();
        }
    }

    async function handleSave(e?: React.FormEvent) {
        e?.preventDefault();
        setSaving(true);

        try {
            const result = await updateCompanyBranding({
                tagline,
                logoUrl: logoPreview || undefined,
                bannerUrl: bannerPreview || undefined,
                industry,
                companySize: size,
                locations: location ? [location] : undefined,
                values,
                benefits,
            });

            if (result.success) {
                setIsDirty(false);
                setLastSaved(new Date());
                toast.success('Changes saved successfully');
            } else {
                toast.error(result.error || 'Failed to save changes');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    }

    function handleDiscard() {
        setIsDirty(false);
        toast.info('Changes discarded');
    }

    const aboutWordCount = about.trim().split(/\s+/).length;
    const topValues = values.slice(0, 3);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                        Loading company profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6 pb-24">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        Company Branding
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        Control how your company appears to candidates and the
                        public.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-7 xl:col-span-8">
                        <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Logo and Banner</CardTitle>
                                <CardDescription>
                                    Upload your company visuals
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="logo-upload">
                                        Logo (square)
                                    </Label>
                                    <div className="flex items-start gap-4">
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group">
                                            {logoPreview ? (
                                                <>
                                                    <Image
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        width={96}
                                                        height={96}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeImage(
                                                                setLogoPreview,
                                                            )
                                                        }
                                                        className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label="Remove logo"
                                                    >
                                                        <X className="w-3 h-3 text-white" />
                                                    </button>
                                                </>
                                            ) : (
                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                ref={logoRef}
                                                id="logo-upload"
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                onChange={e =>
                                                    onFileChange(
                                                        e,
                                                        setLogoPreview,
                                                    )
                                                }
                                                className="sr-only"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    logoRef.current?.click()
                                                }
                                            >
                                                {logoPreview
                                                    ? 'Replace'
                                                    : 'Upload'}
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG, or WebP. Recommended:
                                                400x400px or larger.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                <div className="space-y-2">
                                    <Label htmlFor="banner-upload">
                                        Banner (wide)
                                    </Label>
                                    <div className="space-y-2">
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group">
                                            {bannerPreview ? (
                                                <>
                                                    <Image
                                                        src={bannerPreview}
                                                        alt="Banner preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeImage(
                                                                setBannerPreview,
                                                            )
                                                        }
                                                        className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label="Remove banner"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </>
                                            ) : (
                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={bannerRef}
                                                id="banner-upload"
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                onChange={e =>
                                                    onFileChange(
                                                        e,
                                                        setBannerPreview,
                                                    )
                                                }
                                                className="sr-only"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    bannerRef.current?.click()
                                                }
                                            >
                                                {bannerPreview
                                                    ? 'Replace'
                                                    : 'Upload'}
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG, or WebP. Recommended:
                                                1600x400px.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Basics</CardTitle>
                                <CardDescription>
                                    Essential information about your company
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="company-name">
                                            Company name
                                        </Label>
                                        <Input
                                            id="company-name"
                                            value={companyName}
                                            onChange={e => {
                                                setCompanyName(e.target.value);
                                                markDirty();
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Your official company name
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tagline">Tagline</Label>
                                        <Input
                                            id="tagline"
                                            value={tagline}
                                            onChange={e => {
                                                setTagline(e.target.value);
                                                markDirty();
                                            }}
                                            placeholder="What you do in one line"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            A brief mission statement
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website URL</Label>
                                    <Input
                                        id="website"
                                        type="url"
                                        value={website}
                                        onChange={e => {
                                            setWebsite(e.target.value);
                                            markDirty();
                                        }}
                                        placeholder="https://example.com"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Your primary website or homepage
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">
                                            Industry
                                        </Label>
                                        <Select
                                            value={industry}
                                            onValueChange={v => {
                                                setIndustry(v);
                                                markDirty();
                                            }}
                                        >
                                            <SelectTrigger id="industry">
                                                <SelectValue placeholder="Select industry" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="technology">
                                                    Technology
                                                </SelectItem>
                                                <SelectItem value="finance">
                                                    Finance
                                                </SelectItem>
                                                <SelectItem value="healthcare">
                                                    Healthcare
                                                </SelectItem>
                                                <SelectItem value="education">
                                                    Education
                                                </SelectItem>
                                                <SelectItem value="retail">
                                                    Retail
                                                </SelectItem>
                                                <SelectItem value="manufacturing">
                                                    Manufacturing
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Primary sector
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="size">
                                            Company size
                                        </Label>
                                        <Select
                                            value={size}
                                            onValueChange={v => {
                                                setSize(v);
                                                markDirty();
                                            }}
                                        >
                                            <SelectTrigger id="size">
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-10">
                                                    1-10 employees
                                                </SelectItem>
                                                <SelectItem value="11-50">
                                                    11-50 employees
                                                </SelectItem>
                                                <SelectItem value="51-200">
                                                    51-200 employees
                                                </SelectItem>
                                                <SelectItem value="201-500">
                                                    201-500 employees
                                                </SelectItem>
                                                <SelectItem value="501-1000">
                                                    501-1,000 employees
                                                </SelectItem>
                                                <SelectItem value="1000+">
                                                    1,000+ employees
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Total headcount
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">
                                        Primary location
                                    </Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={e => {
                                            setLocation(e.target.value);
                                            markDirty();
                                        }}
                                        placeholder="City, State/Country"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Main office or HQ location
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                                <CardDescription>
                                    Tell candidates who you are and what you do
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Label htmlFor="about">
                                    Company description
                                </Label>
                                <Textarea
                                    id="about"
                                    value={about}
                                    onChange={e => {
                                        setAbout(e.target.value);
                                        markDirty();
                                    }}
                                    rows={10}
                                    className="resize-none"
                                    placeholder="Describe your company, mission, culture, and what makes you unique..."
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <p>Best: 120-250 words</p>
                                    <p
                                        className={cn(
                                            aboutWordCount < 120 ||
                                                aboutWordCount > 250
                                                ? 'text-orange-400'
                                                : '',
                                        )}
                                    >
                                        {aboutWordCount} words
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Values and Benefits</CardTitle>
                                <CardDescription>
                                    Highlight what matters to your team
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="value-input">
                                            Company values
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            {values.length}/8
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="value-input"
                                            value={valueInput}
                                            onChange={e =>
                                                setValueInput(e.target.value)
                                            }
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addValue();
                                                }
                                            }}
                                            placeholder="Add a value and press Enter"
                                            disabled={values.length >= 8}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addValue}
                                            variant="outline"
                                            disabled={values.length >= 8}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {values.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {values.map(v => (
                                                <Badge
                                                    key={v}
                                                    variant="secondary"
                                                    className="flex items-center gap-1.5 pl-3 pr-2"
                                                >
                                                    {v}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeValue(v)
                                                        }
                                                        className="opacity-60 hover:opacity-100"
                                                        aria-label={`Remove ${v}`}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No values added yet
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <span className="text-xs text-muted-foreground">
                                            Suggestions:
                                        </span>
                                        {[
                                            'Integrity',
                                            'Collaboration',
                                            'Impact',
                                        ].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() =>
                                                    addSuggestion('value', s)
                                                }
                                                className="text-xs px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                                disabled={
                                                    values.includes(s) ||
                                                    values.length >= 8
                                                }
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="benefit-input">
                                            Benefits and perks
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            {benefits.length}/10
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="benefit-input"
                                            value={benefitInput}
                                            onChange={e =>
                                                setBenefitInput(e.target.value)
                                            }
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addBenefit();
                                                }
                                            }}
                                            placeholder="Add a benefit and press Enter"
                                            disabled={benefits.length >= 10}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addBenefit}
                                            variant="outline"
                                            disabled={benefits.length >= 10}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {benefits.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {benefits.map(b => (
                                                <Badge
                                                    key={b}
                                                    variant="secondary"
                                                    className="flex items-center gap-1.5 pl-3 pr-2"
                                                >
                                                    {b}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeBenefit(b)
                                                        }
                                                        className="opacity-60 hover:opacity-100"
                                                        aria-label={`Remove ${b}`}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No benefits added yet
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <span className="text-xs text-muted-foreground">
                                            Suggestions:
                                        </span>
                                        {[
                                            'Equity',
                                            'Flexible hours',
                                            'Learning budget',
                                        ].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() =>
                                                    addSuggestion('benefit', s)
                                                }
                                                className="text-xs px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                                                disabled={
                                                    benefits.includes(s) ||
                                                    benefits.length >= 10
                                                }
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                                value="seo"
                                className="border border-white/10 rounded-lg bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm px-6"
                            >
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-2 text-left">
                                        <span className="font-semibold">
                                            SEO
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            (Optional)
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-6 space-y-4">
                                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        Improves how your company appears in
                                        search results and social shares.
                                    </p>
                                    <div className="space-y-2">
                                        <Label htmlFor="seo-title">
                                            SEO Title
                                        </Label>
                                        <Input
                                            id="seo-title"
                                            value={seoTitle}
                                            onChange={e => {
                                                setSeoTitle(e.target.value);
                                                markDirty();
                                            }}
                                            placeholder={`${companyName} - ${tagline}`}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Leave blank to use company name +
                                            tagline
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seo-description">
                                            SEO Description
                                        </Label>
                                        <Textarea
                                            id="seo-description"
                                            value={seoDescription}
                                            onChange={e => {
                                                setSeoDescription(
                                                    e.target.value,
                                                );
                                                markDirty();
                                            }}
                                            rows={3}
                                            maxLength={160}
                                            placeholder="A short summary for search engines..."
                                        />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <p>Best under 160 characters</p>
                                            <p
                                                className={cn(
                                                    seoDescription.length > 160
                                                        ? 'text-orange-400'
                                                        : '',
                                                )}
                                            >
                                                {seoDescription.length}/160
                                            </p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-6 space-y-4">
                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Brand Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-gradient-to-br from-[#cf6318]/20 to-[#e67320]/10">
                                        {bannerPreview ? (
                                            <Image
                                                src={bannerPreview}
                                                alt="Banner"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                                Banner preview
                                            </div>
                                        )}
                                    </div>

                                    <div className="-mt-10 px-4">
                                        <Avatar className="w-16 h-16 border-4 border-[#0a0a0a]">
                                            <AvatarImage
                                                src={logoPreview || undefined}
                                                alt={companyName}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-[#cf6318] to-[#e67320] text-white font-semibold">
                                                {companyName
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="space-y-1 px-4">
                                        <h3 className="font-semibold text-white text-lg">
                                            {companyName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {tagline}
                                        </p>
                                    </div>

                                    {topValues.length > 0 && (
                                        <div className="flex flex-wrap gap-2 px-4">
                                            {topValues.map(v => (
                                                <Badge
                                                    key={v}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {v}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <Separator className="bg-white/5" />

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-muted-foreground hover:text-white"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View public profile
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">
                                        Quick Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {lastSaved && (
                                        <div className="text-xs text-muted-foreground">
                                            Last saved{' '}
                                            {lastSaved.toLocaleTimeString()}
                                        </div>
                                    )}
                                    <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
                                        <li>
                                            Use high-quality images for better
                                            first impressions
                                        </li>
                                        <li>
                                            Keep your tagline under 60
                                            characters
                                        </li>
                                        <li>
                                            Add 3-5 core values that define your
                                            culture
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            You have unsaved changes
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDiscard}
                            >
                                Discard
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
