'use client';

import { UserCertification } from '@/actions/user-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Award,
    Calendar,
    Edit,
    ExternalLink,
    Plus,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { CertificationDialog } from './dialogs';

interface CertificationsSectionProps {
    certifications?: UserCertification[];
    onRefresh: () => void;
}

export function CertificationsSection({
    certifications = [],
    onRefresh,
}: CertificationsSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCertification, setSelectedCertification] =
        useState<UserCertification | null>(null);

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    const isExpired = (expiryDate: string | undefined): boolean => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const handleEdit = (certification: UserCertification) => {
        setSelectedCertification(certification);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedCertification(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        onRefresh();
    };

    return (
        <>
            <Card>
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl" />

                <div className="relative p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg blur-md opacity-50" />
                                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    Certifications
                                </h2>
                                <p className="text-xs text-white/50">
                                    {certifications.length} certificates
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAdd}
                            className="h-9 px-3 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    {/* Certifications List */}
                    {certifications.length === 0 ? (
                        <div className="text-center py-12">
                            <ShieldCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">
                                No certifications added yet.
                            </p>
                            <p className="text-white/40 text-sm">
                                Add your professional certifications.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {certifications.map(cert => (
                                <div
                                    key={cert.id}
                                    className="group relative rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-4 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

                                    <div className="relative flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                                                <Award className="w-6 h-6 text-yellow-400" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">
                                                        {cert.name}
                                                    </h3>
                                                    <p className="text-sm text-white/70">
                                                        {cert.issuer}
                                                    </p>
                                                </div>
                                                {cert.expiryDate && (
                                                    <Badge
                                                        className={`${isExpired(cert.expiryDate) ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-green-500/20 border-green-500/30 text-green-400'} text-[10px] px-2 py-0.5`}
                                                    >
                                                        {isExpired(
                                                            cert.expiryDate,
                                                        )
                                                            ? 'Expired'
                                                            : 'Valid'}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-white/60">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                                                    <span>
                                                        Issued{' '}
                                                        {formatDate(
                                                            cert.issueDate,
                                                        )}
                                                    </span>
                                                </div>
                                                {cert.expiryDate && (
                                                    <>
                                                        <span className="text-white/30">
                                                            •
                                                        </span>
                                                        <span>
                                                            Expires{' '}
                                                            {formatDate(
                                                                cert.expiryDate,
                                                            )}
                                                        </span>
                                                    </>
                                                )}
                                                {cert.credentialId && (
                                                    <>
                                                        <span className="text-white/30">
                                                            •
                                                        </span>
                                                        <span>
                                                            ID:{' '}
                                                            {cert.credentialId}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEdit(cert)
                                                    }
                                                    className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs"
                                                >
                                                    <Edit className="w-3.5 h-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                {cert.credentialUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs"
                                                    >
                                                        <a
                                                            href={
                                                                cert.credentialUrl
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                                            View
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <CertificationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                certification={selectedCertification}
                onSuccess={handleSuccess}
            />
        </>
    );
}
