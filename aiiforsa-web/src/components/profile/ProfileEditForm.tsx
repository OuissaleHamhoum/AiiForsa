'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
    updateUserProfileComprehensive,
    uploadAndParseCV,
} from '@/actions/user-actions';
import { Loader2, Upload, FileText } from 'lucide-react';

const profileFormSchema = z.object({
    // Personal Information
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
    birthDate: z.string().optional(),
    timezone: z.string().optional(),
    preferredLanguage: z.string().optional(),

    // Location
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),

    // Profile & Presentation
    profileImage: z.string().url().optional().or(z.literal('')),
    bannerImage: z.string().url().optional().or(z.literal('')),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    headline: z
        .string()
        .max(120, 'Headline must be less than 120 characters')
        .optional(),

    // Professional Information
    currentPosition: z.string().optional(),
    currentCompany: z.string().optional(),
    industry: z.string().optional(),
    experienceLevel: z
        .enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'])
        .optional(),
    yearsExperience: z.number().min(0).max(70).optional(),
    professionalSummary: z
        .string()
        .max(1000, 'Summary must be less than 1000 characters')
        .optional(),

    // Career Preferences
    desiredSalaryMin: z.number().min(0).optional(),
    desiredSalaryMax: z.number().min(0).optional(),
    salaryCurrency: z.string().optional(),

    // Settings & Preferences
    theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
    profileVisibility: z
        .enum(['PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY'])
        .optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    allowMessages: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
    initialData?: Partial<ProfileFormValues>;
    onSuccess?: () => void;
}

export function ProfileEditForm({
    initialData,
    onSuccess,
}: ProfileEditFormProps) {
    const [isPending, startTransition] = useTransition();
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isUploadingCV, setIsUploadingCV] = useState(false);
    const [parsedCVData, setParsedCVData] = useState<any>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            phone: initialData?.phone || '',
            gender: initialData?.gender,
            timezone: initialData?.timezone || 'UTC',
            preferredLanguage: initialData?.preferredLanguage || 'en',
            address: initialData?.address || '',
            city: initialData?.city || '',
            state: initialData?.state || '',
            country: initialData?.country || '',
            postalCode: initialData?.postalCode || '',
            profileImage: initialData?.profileImage || '',
            bannerImage: initialData?.bannerImage || '',
            bio: initialData?.bio || '',
            headline: initialData?.headline || '',
            currentPosition: initialData?.currentPosition || '',
            currentCompany: initialData?.currentCompany || '',
            industry: initialData?.industry || '',
            experienceLevel: initialData?.experienceLevel,
            yearsExperience: initialData?.yearsExperience || 0,
            professionalSummary: initialData?.professionalSummary || '',
            desiredSalaryMin: initialData?.desiredSalaryMin,
            desiredSalaryMax: initialData?.desiredSalaryMax,
            salaryCurrency: initialData?.salaryCurrency || 'USD',
            theme: initialData?.theme || 'LIGHT',
            profileVisibility: initialData?.profileVisibility || 'PRIVATE',
            showEmail: initialData?.showEmail ?? false,
            showPhone: initialData?.showPhone ?? false,
            allowMessages: initialData?.allowMessages ?? true,
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        startTransition(async () => {
            try {
                const result = await updateUserProfileComprehensive(data);

                if (result.success) {
                    toast.success('Profile updated successfully!');
                    onSuccess?.();
                } else {
                    toast.error(result.error || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Profile update error:', error);
                toast.error('An unexpected error occurred');
            }
        });
    };

    const populateFormWithParsedCV = (parsedData: any) => {
        const updates: any = {};

        // Personal Information
        if (parsedData.personalInformation) {
            const personal = parsedData.personalInformation;
            if (personal.fullName) updates.name = personal.fullName;
            if (personal.email) updates.email = personal.email;
            if (personal.phone) updates.phone = personal.phone;
            if (personal.location) updates.location = personal.location;
            if (personal.summary) updates.bio = personal.summary;
        }

        // Professional Information
        if (parsedData.workExperience && parsedData.workExperience.length > 0) {
            const latestJob = parsedData.workExperience[0];
            if (latestJob.jobTitle) updates.jobTitle = latestJob.jobTitle;
            if (latestJob.company) updates.company = latestJob.company;
        }

        // Education
        if (parsedData.education && parsedData.education.length > 0) {
            const latestEducation = parsedData.education[0];
            if (latestEducation.degree) updates.degree = latestEducation.degree;
            if (latestEducation.major)
                updates.fieldOfStudy = latestEducation.major;
            if (latestEducation.institution)
                updates.university = latestEducation.institution;
            if (latestEducation.gpa) updates.gpa = latestEducation.gpa;
        }

        // Skills
        if (parsedData.skills && parsedData.skills.length > 0) {
            updates.skills = parsedData.skills.join(', ');
        }

        // Languages
        if (parsedData.languages && parsedData.languages.length > 0) {
            updates.languages = parsedData.languages
                .map((lang: any) => `${lang.language} (${lang.proficiency})`)
                .join(', ');
        }

        // Update form with parsed data
        form.reset({
            ...form.getValues(),
            ...updates,
        });

        toast.success('Profile populated with CV data!');
    };

    const handleCVUpload = async () => {
        if (!cvFile) {
            toast.error('Please select a CV file');
            return;
        }

        setIsUploadingCV(true);
        try {
            const result = await uploadAndParseCV(cvFile);

            if (result.success) {
                toast.success(
                    result.message || 'CV uploaded and parsed successfully!',
                );

                // Store parsed CV data and offer to populate form
                if (result.parsedCV) {
                    setParsedCVData(result.parsedCV);
                    console.log('Parsed CV data:', result.parsedCV);
                }
            } else {
                toast.error(result.error || 'Failed to upload CV');
            }
        } catch (error) {
            console.error('CV upload error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsUploadingCV(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="professional">
                            Professional
                        </TabsTrigger>
                        <TabsTrigger value="career">Career</TabsTrigger>
                        <TabsTrigger value="preferences">
                            Preferences
                        </TabsTrigger>
                        <TabsTrigger value="cv">CV Upload</TabsTrigger>
                    </TabsList>

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your basic personal details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John Doe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="+1234567890"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MALE">
                                                        Male
                                                    </SelectItem>
                                                    <SelectItem value="FEMALE">
                                                        Female
                                                    </SelectItem>
                                                    <SelectItem value="OTHER">
                                                        Other
                                                    </SelectItem>
                                                    <SelectItem value="PREFER_NOT_TO_SAY">
                                                        Prefer not to say
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Birth Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="timezone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Timezone</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="UTC"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="preferredLanguage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Language</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="en"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="123 Main St"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="New York"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    State/Province
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="NY"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="United States"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="postalCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Postal Code
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="10001"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="bio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bio</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell us about yourself..."
                                                    className="resize-none"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Brief description for your
                                                profile (max 500 characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="headline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Headline</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Software Engineer | Full Stack Developer"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Professional headline (max 120
                                                characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Professional Information Tab */}
                    <TabsContent value="professional" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Professional Information</CardTitle>
                                <CardDescription>
                                    Update your work and professional details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="currentPosition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Current Position
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Senior Software Engineer"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currentCompany"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Current Company
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Tech Corp"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Industry</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Technology"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="experienceLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Experience Level
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ENTRY">
                                                            Entry
                                                        </SelectItem>
                                                        <SelectItem value="JUNIOR">
                                                            Junior
                                                        </SelectItem>
                                                        <SelectItem value="MID">
                                                            Mid-Level
                                                        </SelectItem>
                                                        <SelectItem value="SENIOR">
                                                            Senior
                                                        </SelectItem>
                                                        <SelectItem value="LEAD">
                                                            Lead
                                                        </SelectItem>
                                                        <SelectItem value="EXECUTIVE">
                                                            Executive
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="yearsExperience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Years of Experience
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="5"
                                                        {...field}
                                                        onChange={e =>
                                                            field.onChange(
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="professionalSummary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Professional Summary
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your professional experience and achievements..."
                                                    className="resize-none"
                                                    rows={6}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Comprehensive summary of your
                                                career (max 1000 characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Career Preferences Tab */}
                    <TabsContent value="career" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Career Preferences</CardTitle>
                                <CardDescription>
                                    Set your salary expectations and career
                                    goals
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="desiredSalaryMin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Minimum Salary
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="50000"
                                                        {...field}
                                                        onChange={e =>
                                                            field.onChange(
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="desiredSalaryMax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Maximum Salary
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="100000"
                                                        {...field}
                                                        onChange={e =>
                                                            field.onChange(
                                                                parseFloat(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="salaryCurrency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="USD"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings & Preferences</CardTitle>
                                <CardDescription>
                                    Manage your account preferences and privacy
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="theme"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Theme</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select theme" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LIGHT">
                                                        Light
                                                    </SelectItem>
                                                    <SelectItem value="DARK">
                                                        Dark
                                                    </SelectItem>
                                                    <SelectItem value="SYSTEM">
                                                        System
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="profileVisibility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Profile Visibility
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select visibility" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PUBLIC">
                                                        Public
                                                    </SelectItem>
                                                    <SelectItem value="PRIVATE">
                                                        Private
                                                    </SelectItem>
                                                    <SelectItem value="CONNECTIONS_ONLY">
                                                        Connections Only
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="showEmail"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Show email publicly
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Display your email on
                                                        your public profile
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="showPhone"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Show phone publicly
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Display your phone
                                                        number on your public
                                                        profile
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="allowMessages"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Allow messages
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Allow other users to
                                                        send you messages
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CV Upload Tab */}
                    <TabsContent value="cv" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>CV Upload & Parsing</CardTitle>
                                <CardDescription>
                                    Upload your CV to automatically populate
                                    your profile
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label
                                        htmlFor="cv-upload"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {cvFile ? (
                                                <>
                                                    <FileText className="w-12 h-12 mb-3 text-primary" />
                                                    <p className="mb-2 text-sm text-foreground">
                                                        <span className="font-semibold">
                                                            {cvFile.name}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(
                                                            cvFile.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{' '}
                                                        MB
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                        <span className="font-semibold">
                                                            Click to upload
                                                        </span>{' '}
                                                        or drag and drop
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        PDF, DOCX, or TXT (MAX.
                                                        10MB)
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="cv-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt"
                                            onChange={e => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) setCvFile(file);
                                            }}
                                        />
                                    </label>
                                </div>

                                {cvFile && (
                                    <Button
                                        type="button"
                                        onClick={handleCVUpload}
                                        disabled={isUploadingCV}
                                        className="w-full"
                                    >
                                        {isUploadingCV && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {isUploadingCV
                                            ? 'Parsing CV...'
                                            : 'Upload & Parse CV'}
                                    </Button>
                                )}

                                {parsedCVData && (
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            populateFormWithParsedCV(
                                                parsedCVData,
                                            )
                                        }
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Auto-populate Profile with CV Data
                                    </Button>
                                )}

                                <div className="text-sm text-muted-foreground space-y-2">
                                    <p className="font-semibold">
                                        What happens when you upload your CV?
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>
                                            Your CV will be analyzed using AI
                                        </li>
                                        <li>
                                            Relevant information will be
                                            extracted automatically
                                        </li>
                                        <li>
                                            The parsed data will be saved to
                                            your profile
                                        </li>
                                        <li>
                                            You can review and edit the
                                            information in other tabs
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
