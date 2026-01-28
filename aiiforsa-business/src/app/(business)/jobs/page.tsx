'use client';

import { useState } from 'react';
import {
    X,
    Eye,
    Info,
    Briefcase,
    MapPin,
    DollarSign,
    Sparkles,
} from 'lucide-react';

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
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PostJobPage() {
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    // Job Overview
    const [jobTitle, setJobTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [workMode, setWorkMode] = useState('');
    const [location, setLocation] = useState('');

    // Job Details
    const [description, setDescription] = useState('');
    const [responsibilities, setResponsibilities] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    // Requirements
    const [experienceLevel, setExperienceLevel] = useState('');
    const [minYears, setMinYears] = useState(0);
    const [educationLevel, setEducationLevel] = useState('');
    const [languages, setLanguages] = useState<string[]>([]);
    const [languageInput, setLanguageInput] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');

    // Benefits
    const [benefits, setBenefits] = useState<string[]>([]);
    const [benefitInput, setBenefitInput] = useState('');
    const [additionalBenefits, setAdditionalBenefits] = useState('');

    // SEO
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [showCompanyName, setShowCompanyName] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);

    const markDirty = () => setIsDirty(true);

    // Skill management
    function addSkill() {
        const t = skillInput.trim();
        if (!t || skills.length >= 10) return;
        if (!skills.includes(t)) {
            setSkills(prev => [...prev, t]);
            markDirty();
        }
        setSkillInput('');
    }

    function removeSkill(skill: string) {
        setSkills(prev => prev.filter(s => s !== skill));
        markDirty();
    }

    // Language management
    function addLanguage() {
        const t = languageInput.trim();
        if (!t || languages.length >= 5) return;
        if (!languages.includes(t)) {
            setLanguages(prev => [...prev, t]);
            markDirty();
        }
        setLanguageInput('');
    }

    function removeLanguage(lang: string) {
        setLanguages(prev => prev.filter(l => l !== lang));
        markDirty();
    }

    // Benefit management
    function addBenefit() {
        const t = benefitInput.trim();
        if (!t || benefits.length >= 10) return;
        if (!benefits.includes(t)) {
            setBenefits(prev => [...prev, t]);
            markDirty();
        }
        setBenefitInput('');
    }

    function removeBenefit(benefit: string) {
        setBenefits(prev => prev.filter(b => b !== benefit));
        markDirty();
    }

    function addSuggestion(type: 'benefit', item: string) {
        if (
            type === 'benefit' &&
            !benefits.includes(item) &&
            benefits.length < 10
        ) {
            setBenefits(prev => [...prev, item]);
            markDirty();
        }
    }

    async function handleSaveDraft() {
        setSaving(true);
        await new Promise(r => setTimeout(r, 900));
        try {
            const payload = {
                jobTitle,
                department,
                employmentType,
                workMode,
                location,
                description,
                responsibilities,
                skills,
                experienceLevel,
                minYears,
                educationLevel,
                languages,
                salaryMin,
                salaryMax,
                benefits,
                additionalBenefits,
                seoTitle,
                seoDescription,
                showCompanyName,
                isFeatured,
                status: 'draft',
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem('jobDraft', JSON.stringify(payload));
        } catch {
            // ignore
        }
        setSaving(false);
        setIsDirty(false);
        toast.success('Draft saved successfully');
    }

    async function handlePublish() {
        if (!jobTitle.trim() || !description.trim()) {
            toast.error('Job title and description are required');
            return;
        }
        setSaving(true);
        await new Promise(r => setTimeout(r, 900));
        try {
            const payload = {
                jobTitle,
                department,
                employmentType,
                workMode,
                location,
                description,
                responsibilities,
                skills,
                experienceLevel,
                minYears,
                educationLevel,
                languages,
                salaryMin,
                salaryMax,
                benefits,
                additionalBenefits,
                seoTitle,
                seoDescription,
                showCompanyName,
                isFeatured,
                status: 'published',
                publishedAt: new Date().toISOString(),
            };
            localStorage.setItem('jobPublished', JSON.stringify(payload));
        } catch {
            // ignore
        }
        setSaving(false);
        setIsDirty(false);
        toast.success('Job published successfully!');
    }

    const isFormValid =
        jobTitle.trim().length > 0 && description.trim().length > 0;
    const shortDescription =
        description.trim().substring(0, 150) +
        (description.trim().length > 150 ? '...' : '');

    return (
        <>
            <div className="space-y-8 pb-32">
                {/* Page Header */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                        Post a Job
                    </h1>
                    <p className="text-base text-muted-foreground md:text-lg max-w-2xl">
                        Create a new job posting to attract top talent to your
                        company.
                    </p>
                </div>

                {/* Two-column layout */}
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                    {/* Left column: form sections */}
                    <div className="space-y-8 lg:col-span-7 xl:col-span-8 lg:pr-8 lg:border-r lg:border-white/5">
                        {/* SECTION: Job Overview */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-[#cf6318]" />
                                    Job Overview
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Basic information about the position
                                </p>
                            </div>

                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
                                <CardContent className="space-y-6 p-7">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <Label
                                                htmlFor="job-title"
                                                className="text-sm font-medium"
                                            >
                                                Job Title{' '}
                                                <span className="text-red-400">
                                                    *
                                                </span>
                                            </Label>
                                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <Input
                                            id="job-title"
                                            value={jobTitle}
                                            onChange={e => {
                                                setJobTitle(e.target.value);
                                                markDirty();
                                            }}
                                            placeholder="e.g., Senior Frontend Developer"
                                            className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Use a clear, specific title that
                                            candidates will search for
                                        </p>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="department"
                                                className="text-sm font-medium"
                                            >
                                                Department
                                            </Label>
                                            <Select
                                                value={department}
                                                onValueChange={v => {
                                                    setDepartment(v);
                                                    markDirty();
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="department"
                                                    className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                                >
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="engineering">
                                                        Engineering
                                                    </SelectItem>
                                                    <SelectItem value="product">
                                                        Product
                                                    </SelectItem>
                                                    <SelectItem value="design">
                                                        Design
                                                    </SelectItem>
                                                    <SelectItem value="marketing">
                                                        Marketing
                                                    </SelectItem>
                                                    <SelectItem value="sales">
                                                        Sales
                                                    </SelectItem>
                                                    <SelectItem value="hr">
                                                        Human Resources
                                                    </SelectItem>
                                                    <SelectItem value="finance">
                                                        Finance
                                                    </SelectItem>
                                                    <SelectItem value="operations">
                                                        Operations
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Which team will this role join?
                                            </p>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="employment-type"
                                                className="text-sm font-medium"
                                            >
                                                Employment Type
                                            </Label>
                                            <Select
                                                value={employmentType}
                                                onValueChange={v => {
                                                    setEmploymentType(v);
                                                    markDirty();
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="employment-type"
                                                    className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                                >
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full-time">
                                                        Full-time
                                                    </SelectItem>
                                                    <SelectItem value="part-time">
                                                        Part-time
                                                    </SelectItem>
                                                    <SelectItem value="contract">
                                                        Contract
                                                    </SelectItem>
                                                    <SelectItem value="internship">
                                                        Internship
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Type of employment
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="work-mode"
                                                className="text-sm font-medium"
                                            >
                                                Work Mode
                                            </Label>
                                            <Select
                                                value={workMode}
                                                onValueChange={v => {
                                                    setWorkMode(v);
                                                    markDirty();
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="work-mode"
                                                    className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                                >
                                                    <SelectValue placeholder="Select mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="remote">
                                                        Remote
                                                    </SelectItem>
                                                    <SelectItem value="onsite">
                                                        On-site
                                                    </SelectItem>
                                                    <SelectItem value="hybrid">
                                                        Hybrid
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Where will they work?
                                            </p>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="location"
                                                className="text-sm font-medium"
                                            >
                                                Location
                                            </Label>
                                            <Input
                                                id="location"
                                                value={location}
                                                onChange={e => {
                                                    setLocation(e.target.value);
                                                    markDirty();
                                                }}
                                                placeholder="e.g., San Francisco, CA or Remote"
                                                className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                City, state, or region
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECTION: Job Details */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                                    Job Details
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Describe the role clearly - candidates will
                                    see this first
                                </p>
                            </div>

                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
                                <CardContent className="space-y-6 p-7">
                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="description"
                                            className="text-sm font-medium"
                                        >
                                            Job Description{' '}
                                            <span className="text-red-400">
                                                *
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={e => {
                                                setDescription(e.target.value);
                                                markDirty();
                                            }}
                                            rows={10}
                                            className="resize-none bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300 leading-relaxed"
                                            placeholder="Provide a compelling overview of the role, the team, and what makes this opportunity exciting..."
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {description.length} characters - Be
                                            specific and engaging
                                        </p>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="responsibilities"
                                            className="text-sm font-medium"
                                        >
                                            Key Responsibilities
                                        </Label>
                                        <Textarea
                                            id="responsibilities"
                                            value={responsibilities}
                                            onChange={e => {
                                                setResponsibilities(
                                                    e.target.value,
                                                );
                                                markDirty();
                                            }}
                                            rows={8}
                                            className="resize-none bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300 leading-relaxed font-mono text-sm"
                                            placeholder="- Lead frontend architecture decisions&#10;- Mentor junior developers&#10;- Collaborate with design and product teams&#10;- Write clean, maintainable code"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            One responsibility per line (use
                                            bullet points)
                                        </p>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="skill-input"
                                                className="text-sm font-medium"
                                            >
                                                Required Skills
                                            </Label>
                                            <span
                                                className={cn(
                                                    'text-xs font-medium transition-colors duration-300',
                                                    skills.length >= 10
                                                        ? 'text-[#cf6318]'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {skills.length}/10
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="skill-input"
                                                value={skillInput}
                                                onChange={e =>
                                                    setSkillInput(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addSkill();
                                                    }
                                                }}
                                                placeholder="e.g., React, TypeScript"
                                                disabled={skills.length >= 10}
                                                className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={addSkill}
                                                variant="outline"
                                                disabled={skills.length >= 10}
                                                className="h-11 px-5 border-white/10 hover:border-[#cf6318] hover:bg-[#cf6318]/10 hover:text-[#cf6318] transition-all duration-300"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {skills.length > 0 ? (
                                            <div className="flex flex-wrap gap-2.5">
                                                {skills.map(skill => (
                                                    <Badge
                                                        key={skill}
                                                        variant="secondary"
                                                        className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#cf6318]/50 hover:bg-[#cf6318]/10 transition-all duration-300"
                                                    >
                                                        <span className="text-sm">
                                                            {skill}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSkill(
                                                                    skill,
                                                                )
                                                            }
                                                            className="opacity-60 hover:opacity-100 hover:text-red-400 transition-all duration-300"
                                                            aria-label={`Remove ${skill}`}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-white/10 rounded-lg">
                                                No skills added yet
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECTION: Requirements */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                                    Requirements
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Set expectations for candidate
                                    qualifications
                                </p>
                            </div>

                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
                                <CardContent className="space-y-6 p-7">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="experience-level"
                                                className="text-sm font-medium"
                                            >
                                                Experience Level
                                            </Label>
                                            <Select
                                                value={experienceLevel}
                                                onValueChange={v => {
                                                    setExperienceLevel(v);
                                                    markDirty();
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="experience-level"
                                                    className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                                >
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="entry">
                                                        Entry Level
                                                    </SelectItem>
                                                    <SelectItem value="mid">
                                                        Mid Level
                                                    </SelectItem>
                                                    <SelectItem value="senior">
                                                        Senior Level
                                                    </SelectItem>
                                                    <SelectItem value="lead">
                                                        Lead / Principal
                                                    </SelectItem>
                                                    <SelectItem value="executive">
                                                        Executive
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Career stage required
                                            </p>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="min-years"
                                                className="text-sm font-medium"
                                            >
                                                Minimum Years of Experience
                                            </Label>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (minYears > 0) {
                                                            setMinYears(
                                                                minYears - 1,
                                                            );
                                                            markDirty();
                                                        }
                                                    }}
                                                    className="h-11 w-11 border-white/10 hover:border-[#cf6318] hover:bg-[#cf6318]/10 transition-all duration-300"
                                                >
                                                    -
                                                </Button>
                                                <Input
                                                    id="min-years"
                                                    type="number"
                                                    value={minYears}
                                                    onChange={e => {
                                                        setMinYears(
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        );
                                                        markDirty();
                                                    }}
                                                    className="h-11 text-center bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                                    min="0"
                                                    max="20"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (minYears < 20) {
                                                            setMinYears(
                                                                minYears + 1,
                                                            );
                                                            markDirty();
                                                        }
                                                    }}
                                                    className="h-11 w-11 border-white/10 hover:border-[#cf6318] hover:bg-[#cf6318]/10 transition-all duration-300"
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Years in similar roles
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="education-level"
                                            className="text-sm font-medium"
                                        >
                                            Education Level
                                        </Label>
                                        <Select
                                            value={educationLevel}
                                            onValueChange={v => {
                                                setEducationLevel(v);
                                                markDirty();
                                            }}
                                        >
                                            <SelectTrigger
                                                id="education-level"
                                                className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                            >
                                                <SelectValue placeholder="Select education" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high-school">
                                                    High School
                                                </SelectItem>
                                                <SelectItem value="associate">
                                                    Associate Degree
                                                </SelectItem>
                                                <SelectItem value="bachelor">
                                                    Bachelor&apos;s Degree
                                                </SelectItem>
                                                <SelectItem value="master">
                                                    Master&apos;s Degree
                                                </SelectItem>
                                                <SelectItem value="phd">
                                                    PhD
                                                </SelectItem>
                                                <SelectItem value="none">
                                                    Not Required
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Minimum education requirement
                                        </p>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="language-input"
                                                className="text-sm font-medium"
                                            >
                                                Preferred Languages
                                            </Label>
                                            <span
                                                className={cn(
                                                    'text-xs font-medium transition-colors duration-300',
                                                    languages.length >= 5
                                                        ? 'text-[#cf6318]'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {languages.length}/5
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="language-input"
                                                value={languageInput}
                                                onChange={e =>
                                                    setLanguageInput(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addLanguage();
                                                    }
                                                }}
                                                placeholder="e.g., English, Spanish"
                                                disabled={languages.length >= 5}
                                                className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={addLanguage}
                                                variant="outline"
                                                disabled={languages.length >= 5}
                                                className="h-11 px-5 border-white/10 hover:border-[#cf6318] hover:bg-[#cf6318]/10 hover:text-[#cf6318] transition-all duration-300"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {languages.length > 0 && (
                                            <div className="flex flex-wrap gap-2.5">
                                                {languages.map(lang => (
                                                    <Badge
                                                        key={lang}
                                                        variant="secondary"
                                                        className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#cf6318]/50 hover:bg-[#cf6318]/10 transition-all duration-300"
                                                    >
                                                        <span className="text-sm">
                                                            {lang}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeLanguage(
                                                                    lang,
                                                                )
                                                            }
                                                            className="opacity-60 hover:opacity-100 hover:text-red-400 transition-all duration-300"
                                                            aria-label={`Remove ${lang}`}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="bg-white/5" />

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm font-medium">
                                                Salary Range (Optional)
                                            </Label>
                                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="salary-min"
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    Minimum ($)
                                                </Label>
                                                <Input
                                                    id="salary-min"
                                                    type="number"
                                                    value={salaryMin}
                                                    onChange={e => {
                                                        setSalaryMin(
                                                            e.target.value,
                                                        );
                                                        markDirty();
                                                    }}
                                                    placeholder="80000"
                                                    className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="salary-max"
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    Maximum ($)
                                                </Label>
                                                <Input
                                                    id="salary-max"
                                                    type="number"
                                                    value={salaryMax}
                                                    onChange={e => {
                                                        setSalaryMax(
                                                            e.target.value,
                                                        );
                                                        markDirty();
                                                    }}
                                                    placeholder="120000"
                                                    className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Annual salary in USD (helps attract
                                            qualified candidates)
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECTION: Benefits & Perks */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                                    Benefits & Perks
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Highlight what makes your company great to
                                    work for
                                </p>
                            </div>

                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
                                <CardContent className="space-y-6 p-7">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="benefit-input"
                                                className="text-sm font-medium"
                                            >
                                                Benefits
                                            </Label>
                                            <span
                                                className={cn(
                                                    'text-xs font-medium transition-colors duration-300',
                                                    benefits.length >= 10
                                                        ? 'text-[#cf6318]'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                {benefits.length}/10
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="benefit-input"
                                                value={benefitInput}
                                                onChange={e =>
                                                    setBenefitInput(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addBenefit();
                                                    }
                                                }}
                                                placeholder="Add a benefit"
                                                disabled={benefits.length >= 10}
                                                className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={addBenefit}
                                                variant="outline"
                                                disabled={benefits.length >= 10}
                                                className="h-11 px-5 border-white/10 hover:border-[#cf6318] hover:bg-[#cf6318]/10 hover:text-[#cf6318] transition-all duration-300"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        {benefits.length > 0 ? (
                                            <div className="flex flex-wrap gap-2.5">
                                                {benefits.map(benefit => (
                                                    <Badge
                                                        key={benefit}
                                                        variant="secondary"
                                                        className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#cf6318]/50 hover:bg-[#cf6318]/10 transition-all duration-300"
                                                    >
                                                        <span className="text-sm">
                                                            {benefit}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeBenefit(
                                                                    benefit,
                                                                )
                                                            }
                                                            className="opacity-60 hover:opacity-100 hover:text-red-400 transition-all duration-300"
                                                            aria-label={`Remove ${benefit}`}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-white/10 rounded-lg">
                                                No benefits added yet
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="text-xs text-muted-foreground">
                                                Quick add:
                                            </span>
                                            {[
                                                'Flexible hours',
                                                'Health insurance',
                                                'Remote work',
                                                'Learning budget',
                                                'Equity',
                                            ].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() =>
                                                        addSuggestion(
                                                            'benefit',
                                                            s,
                                                        )
                                                    }
                                                    className="text-xs px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:border-[#cf6318] hover:bg-[#cf6318]/10 text-muted-foreground hover:text-[#cf6318] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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

                                    <Separator className="bg-white/5" />

                                    <div className="space-y-2.5">
                                        <Label
                                            htmlFor="additional-benefits"
                                            className="text-sm font-medium"
                                        >
                                            Additional Notes or Benefits
                                        </Label>
                                        <Textarea
                                            id="additional-benefits"
                                            value={additionalBenefits}
                                            onChange={e => {
                                                setAdditionalBenefits(
                                                    e.target.value,
                                                );
                                                markDirty();
                                            }}
                                            rows={4}
                                            className="resize-none bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300 leading-relaxed"
                                            placeholder="Any other perks or benefits worth mentioning..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECTION: SEO / Visibility (Accordion) */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                                    Visibility & SEO{' '}
                                    <span className="text-muted-foreground font-normal text-xs">
                                        (Optional)
                                    </span>
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Advanced settings to optimize job visibility
                                </p>
                            </div>

                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                <AccordionItem
                                    value="seo"
                                    className="border border-white/10 rounded-xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm px-7 transition-all duration-300 hover:border-white/20"
                                >
                                    <AccordionTrigger className="hover:no-underline py-5">
                                        <div className="flex items-center gap-3 text-left">
                                            <Eye className="w-4 h-4 text-[#cf6318]" />
                                            <span className="font-medium text-white/90">
                                                SEO & Visibility Settings
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-7 space-y-5">
                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="seo-title"
                                                className="text-sm font-medium"
                                            >
                                                SEO Title
                                            </Label>
                                            <Input
                                                id="seo-title"
                                                value={seoTitle}
                                                onChange={e => {
                                                    setSeoTitle(e.target.value);
                                                    markDirty();
                                                }}
                                                placeholder={
                                                    jobTitle ||
                                                    'Senior Frontend Developer'
                                                }
                                                className="h-11 bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Leave blank to use job title
                                            </p>
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label
                                                htmlFor="seo-description"
                                                className="text-sm font-medium"
                                            >
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
                                                placeholder="Brief summary for search engines..."
                                                className="resize-none bg-white/5 border-white/10 focus:border-[#cf6318] focus:ring-[#cf6318]/20 transition-all duration-300"
                                            />
                                            <div className="flex items-center justify-between text-xs">
                                                <p className="text-muted-foreground">
                                                    Keep under 160 characters
                                                </p>
                                                <p
                                                    className={cn(
                                                        'font-medium transition-colors duration-300',
                                                        seoDescription.length >
                                                            160
                                                            ? 'text-[#cf6318]'
                                                            : 'text-emerald-400',
                                                    )}
                                                >
                                                    {seoDescription.length}/160
                                                </p>
                                            </div>
                                        </div>

                                        <Separator className="bg-white/5" />

                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="show-company-name"
                                                    checked={showCompanyName}
                                                    onCheckedChange={checked => {
                                                        setShowCompanyName(
                                                            checked === true,
                                                        );
                                                        markDirty();
                                                    }}
                                                    className="border-white/20 data-[state=checked]:bg-[#cf6318] data-[state=checked]:border-[#cf6318]"
                                                />
                                                <label
                                                    htmlFor="show-company-name"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Show company name publicly
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="is-featured"
                                                    checked={isFeatured}
                                                    onCheckedChange={checked => {
                                                        setIsFeatured(
                                                            checked === true,
                                                        );
                                                        markDirty();
                                                    }}
                                                    className="border-white/20 data-[state=checked]:bg-[#cf6318] data-[state=checked]:border-[#cf6318]"
                                                />
                                                <label
                                                    htmlFor="is-featured"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                                >
                                                    Promote as featured job
                                                    <Sparkles className="w-3.5 h-3.5 text-[#cf6318]" />
                                                </label>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>

                    {/* Right column: preview & tips */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-6 space-y-6">
                            {/* Job Preview */}
                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-[#cf6318]/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base text-white/90">
                                        Job Preview
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        How candidates will see this posting
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 px-6 pb-6">
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-white text-xl tracking-tight">
                                            {jobTitle || 'Job Title'}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {employmentType && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs bg-[#cf6318]/10 border border-[#cf6318]/20 text-[#cf6318]"
                                                >
                                                    {employmentType
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        employmentType
                                                            .slice(1)
                                                            .replace('-', ' ')}
                                                </Badge>
                                            )}
                                            {workMode && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs bg-white/5 border border-white/10"
                                                >
                                                    {workMode
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        workMode.slice(1)}
                                                </Badge>
                                            )}
                                            {location && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs bg-white/5 border border-white/10"
                                                >
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {location}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {shortDescription && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-4">
                                                {shortDescription}
                                            </p>
                                        </div>
                                    )}

                                    {skills.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Required Skills
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {skills
                                                    .slice(0, 5)
                                                    .map(skill => (
                                                        <Badge
                                                            key={skill}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                {skills.length > 5 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        +{skills.length - 5}{' '}
                                                        more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(salaryMin || salaryMax) && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                            <span className="font-medium text-emerald-400">
                                                {salaryMin && salaryMax
                                                    ? `$${parseInt(salaryMin).toLocaleString()} - $${parseInt(salaryMax).toLocaleString()}`
                                                    : salaryMin
                                                      ? `From $${parseInt(salaryMin).toLocaleString()}`
                                                      : `Up to $${parseInt(salaryMax).toLocaleString()}`}
                                            </span>
                                        </div>
                                    )}

                                    <Separator className="bg-white/5" />

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-center text-muted-foreground hover:text-[#cf6318] hover:bg-[#cf6318]/10 transition-all duration-300 group"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        <span>View full posting</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Quick Tips */}
                            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base text-white/90">
                                        Quick Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6">
                                    <ul className="space-y-3 text-xs text-muted-foreground">
                                        <li className="flex items-start gap-3 group hover:text-white/80 transition-colors duration-300">
                                            <span className="text-[#cf6318] mt-0.5 group-hover:scale-110 transition-transform duration-300">
                                                -
                                            </span>
                                            <span>
                                                Use clear, specific job titles
                                                that candidates search for
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 group hover:text-white/80 transition-colors duration-300">
                                            <span className="text-[#cf6318] mt-0.5 group-hover:scale-110 transition-transform duration-300">
                                                -
                                            </span>
                                            <span>
                                                Include at least 5-7 key
                                                responsibilities
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 group hover:text-white/80 transition-colors duration-300">
                                            <span className="text-[#cf6318] mt-0.5 group-hover:scale-110 transition-transform duration-300">
                                                -
                                            </span>
                                            <span>
                                                Shorter posts (300-600 words)
                                                attract more applicants
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 group hover:text-white/80 transition-colors duration-300">
                                            <span className="text-[#cf6318] mt-0.5 group-hover:scale-110 transition-transform duration-300">
                                                -
                                            </span>
                                            <span>
                                                Highlight unique benefits and
                                                company culture
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3 group hover:text-white/80 transition-colors duration-300">
                                            <span className="text-[#cf6318] mt-0.5 group-hover:scale-110 transition-transform duration-300">
                                                -
                                            </span>
                                            <span>
                                                Including salary ranges
                                                increases application rates by
                                                30%
                                            </span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky footer action bar */}
            {isDirty && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/50">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#cf6318] rounded-full animate-pulse"></span>
                            Unsaved changes
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
                            >
                                Save Draft
                            </Button>
                            <Button
                                size="sm"
                                onClick={handlePublish}
                                disabled={saving || !isFormValid}
                                className="bg-gradient-to-r from-[#cf6318] to-[#e67320] hover:from-[#e67320] hover:to-[#cf6318] text-white border-0 shadow-lg shadow-[#cf6318]/20 hover:shadow-[#cf6318]/40 transition-all duration-300 disabled:opacity-50"
                            >
                                {saving ? 'Publishing...' : 'Publish Job'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
