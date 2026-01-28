'use client';

import { createJob, createJobApplication } from '@/actions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useApplicationStatus } from '@/hooks/useApplicationStatus';
import { cn } from '@/lib/utils';
import { ApplicationStatus, JobType } from '@/types/job.types';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddForm({ open, onOpenChange, onSuccess }: AddFormProps) {
    const { data: session } = useSession();
    const { updateStatus: updateLocalStatus } = useApplicationStatus();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [formData, setFormData] = useState({
        company: '',
        position: '',
        location: '',
        appliedDate: '',
        jobType: '',
        salaryRange: '',
        status: 'applied' as ApplicationStatus,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            toast.error('Authentication required', {
                description: 'You must be logged in to add a job application',
            });
            return;
        }

        // Validate required fields
        if (
            !formData.company ||
            !formData.position ||
            !formData.location ||
            !date ||
            !formData.jobType
        ) {
            toast.error('Missing required fields', {
                description: 'Please fill in all required fields',
            });
            return;
        }

        setLoading(true);

        try {
            // Step 1: Create the Job first
            const salaryParts = formData.salaryRange.match(
                /\$?(\d+)k?\s*-\s*\$?(\d+)k?/i,
            );
            const salaryMin = salaryParts
                ? parseInt(salaryParts[1]) * 1000
                : 50000; // Default to 50k
            const salaryMax = salaryParts
                ? parseInt(salaryParts[2]) * 1000
                : 100000; // Default to 100k

            const now = new Date();
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months from now

            const jobResult = await createJob({
                title: formData.position,
                companyName: formData.company,
                location: formData.location,
                type: formData.jobType as JobType,
                description: `Applied for ${formData.position} position at ${formData.company}`,
                requirements: 'No specific requirements listed',
                salaryMin,
                salaryMax,
                currency: 'USD',
                experienceLevel: 'MID',
                remote: formData.location.toLowerCase().includes('remote'),
                postedAt: now.toISOString(),
                updatedAt: now.toISOString(),
                expiresAt: expiryDate.toISOString(),
                status: 'OPEN',
            });

            if (!jobResult.success || !jobResult.data) {
                throw new Error(jobResult.error || 'Failed to create job');
            }

            // Step 2: Create the Job Application
            const applicationResult = await createJobApplication({
                userId: session.user.id,
                jobId: jobResult.data.id.toString(),
                // cvId: 'default-cv', // TODO: Allow user to select CV
                // coverLetterId: 'default-cl', // TODO: Allow user to select cover letter
                appliedAt: date.toISOString(),
                isExternal: true, // Mark as external since user is adding manually
            });

            if (applicationResult.success && applicationResult.data) {
                // Store the initial status in localStorage
                updateLocalStatus(
                    applicationResult.data.applicationId,
                    formData.status,
                );

                toast.success('Job application added successfully!', {
                    description: `${formData.position} at ${formData.company}`,
                });

                // Reset form
                setFormData({
                    company: '',
                    position: '',
                    location: '',
                    appliedDate: '',
                    jobType: '',
                    salaryRange: '',
                    status: 'applied',
                });
                setDate(undefined);

                onOpenChange(false);
                onSuccess?.();
            } else {
                throw new Error(
                    applicationResult.error || 'Failed to add job application',
                );
            }
        } catch (error) {
            toast.error('Failed to add job application', {
                description:
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white sm:max-w-[440px] p-0 shadow-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/5 flex-shrink-0">
                    <DialogTitle className="text-xl font-semibold text-white">
                        Add New Job
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col overflow-hidden"
                >
                    <div className="px-6 py-6 overflow-y-auto flex-1">
                        <div className="space-y-5">
                            {/* Company */}
                            <div className="space-y-2.5">
                                <Label
                                    htmlFor="company"
                                    className="text-sm font-medium text-white/90"
                                >
                                    Company{' '}
                                    <span className="text-[#cf6318]">*</span>
                                </Label>
                                <Input
                                    id="company"
                                    placeholder="Enter company name"
                                    value={formData.company}
                                    onChange={e =>
                                        handleChange('company', e.target.value)
                                    }
                                    className="h-10 bg-[#2a2a2a] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#cf6318] focus-visible:border-[#cf6318] transition-all"
                                    required
                                />
                            </div>

                            {/* Position */}
                            <div className="space-y-2.5">
                                <Label
                                    htmlFor="position"
                                    className="text-sm font-medium text-white/90"
                                >
                                    Position{' '}
                                    <span className="text-[#cf6318]">*</span>
                                </Label>
                                <Input
                                    id="position"
                                    placeholder="Enter position title"
                                    value={formData.position}
                                    onChange={e =>
                                        handleChange('position', e.target.value)
                                    }
                                    className="h-10 bg-[#2a2a2a] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#cf6318] focus-visible:border-[#cf6318] transition-all"
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2.5">
                                <Label
                                    htmlFor="location"
                                    className="text-sm font-medium text-white/90"
                                >
                                    Location{' '}
                                    <span className="text-[#cf6318]">*</span>
                                </Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Remote, San Francisco, CA"
                                    value={formData.location}
                                    onChange={e =>
                                        handleChange('location', e.target.value)
                                    }
                                    className="h-10 bg-[#2a2a2a] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#cf6318] focus-visible:border-[#cf6318] transition-all"
                                    required
                                />
                            </div>

                            {/* Applied Date and Job Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor="appliedDate"
                                        className="text-sm font-medium text-white/90"
                                    >
                                        Applied Date{' '}
                                        <span className="text-[#cf6318]">
                                            *
                                        </span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full h-10 justify-start text-left font-normal bg-[#2a2a2a] border-white/10 text-white hover:bg-[#2a2a2a] hover:text-white hover:border-white/20 transition-all',
                                                    !date && 'text-white/30',
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? (
                                                    format(date, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0 bg-[#1a1a1a] border-white/10"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                                className="rounded-md border-0"
                                                classNames={{
                                                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                                                    month: 'space-y-4',
                                                    caption:
                                                        'flex justify-center pt-1 relative items-center text-white',
                                                    caption_label:
                                                        'text-sm font-medium text-white',
                                                    nav: 'space-x-1 flex items-center',
                                                    button_previous: cn(
                                                        'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10',
                                                    ),
                                                    button_next: cn(
                                                        'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10',
                                                    ),
                                                    month_grid:
                                                        'w-full border-collapse space-y-1',
                                                    weekdays: 'flex',
                                                    weekday:
                                                        'text-white/50 rounded-md w-9 font-normal text-[0.8rem]',
                                                    week: 'flex w-full mt-2',
                                                    day: cn(
                                                        'h-9 w-9 text-center text-sm p-0 relative text-white/70',
                                                        '[&:has([aria-selected].day-range-end)]:rounded-r-md',
                                                        '[&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                                                    ),
                                                    day_button: cn(
                                                        'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-md transition-colors',
                                                    ),
                                                    range_end: 'day-range-end',
                                                    selected:
                                                        'bg-[#cf6318] text-white hover:bg-[#cf6318] hover:text-white focus:bg-[#cf6318] focus:text-white',
                                                    today: 'bg-white/5 text-white',
                                                    outside:
                                                        'text-white/20 opacity-50 aria-selected:bg-accent/50 aria-selected:text-white/50 aria-selected:opacity-30',
                                                    disabled:
                                                        'text-white/20 opacity-50',
                                                    range_middle:
                                                        'aria-selected:bg-accent aria-selected:text-white/70',
                                                    hidden: 'invisible',
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2.5">
                                    <Label
                                        htmlFor="jobType"
                                        className="text-sm font-medium text-white/90"
                                    >
                                        Job Type{' '}
                                        <span className="text-[#cf6318]">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={formData.jobType}
                                        onValueChange={value =>
                                            handleChange('jobType', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger className="h-10 bg-[#2a2a2a] border-white/10 text-white focus:ring-2 focus:ring-[#cf6318] focus:border-[#cf6318] transition-all">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                                            <SelectItem
                                                value="FULL_TIME"
                                                className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                            >
                                                Full Time
                                            </SelectItem>
                                            <SelectItem
                                                value="PART_TIME"
                                                className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                            >
                                                Part Time
                                            </SelectItem>
                                            <SelectItem
                                                value="CONTRACT"
                                                className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                            >
                                                Contract
                                            </SelectItem>
                                            <SelectItem
                                                value="INTERNSHIP"
                                                className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                            >
                                                Internship
                                            </SelectItem>
                                            <SelectItem
                                                value="FREELANCE"
                                                className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                            >
                                                Freelance
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Salary Range */}
                            <div className="space-y-2.5">
                                <Label
                                    htmlFor="salaryRange"
                                    className="text-sm font-medium text-white/90"
                                >
                                    Salary Range
                                </Label>
                                <Input
                                    id="salaryRange"
                                    placeholder="e.g., $100k - $130k"
                                    value={formData.salaryRange}
                                    onChange={e =>
                                        handleChange(
                                            'salaryRange',
                                            e.target.value,
                                        )
                                    }
                                    className="h-10 bg-[#2a2a2a] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#cf6318] focus-visible:border-[#cf6318] transition-all"
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2.5">
                                <Label
                                    htmlFor="status"
                                    className="text-sm font-medium text-white/90"
                                >
                                    Status{' '}
                                    <span className="text-[#cf6318]">*</span>
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={value =>
                                        handleChange(
                                            'status',
                                            value as ApplicationStatus,
                                        )
                                    }
                                    required
                                >
                                    <SelectTrigger className="h-10 bg-[#2a2a2a] border-white/10 text-white focus:ring-2 focus:ring-[#cf6318] focus:border-[#cf6318] transition-all">
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                                        <SelectItem
                                            value="applied"
                                            className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                        >
                                            Applied
                                        </SelectItem>
                                        <SelectItem
                                            value="interview"
                                            className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                        >
                                            Interview
                                        </SelectItem>
                                        <SelectItem
                                            value="on-hold"
                                            className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                        >
                                            On Hold
                                        </SelectItem>
                                        <SelectItem
                                            value="rejected"
                                            className="text-white focus:bg-[#cf6318]/20 focus:text-white cursor-pointer"
                                        >
                                            Rejected
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="h-10 bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all font-medium"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-10 bg-[#cf6318] hover:bg-[#b55516] text-white font-semibold shadow-lg shadow-[#cf6318]/20 hover:shadow-[#cf6318]/30 transition-all"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Job'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
