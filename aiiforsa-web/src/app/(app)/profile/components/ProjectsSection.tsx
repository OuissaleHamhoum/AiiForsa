'use client';

import { UserProject } from '@/actions/user-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Briefcase,
    Edit,
    ExternalLink,
    Github,
    Plus,
    Star,
} from 'lucide-react';
import { useState } from 'react';
import { ProjectDialog } from './dialogs';

interface ProjectsSectionProps {
    projects?: UserProject[];
    onRefresh: () => void;
}

export function ProjectsSection({
    projects = [],
    onRefresh,
}: ProjectsSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<UserProject | null>(
        null,
    );

    const handleEdit = (project: UserProject) => {
        setSelectedProject(project);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedProject(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        onRefresh();
    };

    // Transform backend data to display format
    const displayProjects = projects.map((project, index) => ({
        original: project,
        id: project.id,
        title: project.name,
        description: project.description || 'No description available.',
        image: '/placeholder-project.jpg',
        tags: project.technologies
            ? project.technologies.split(',').map(t => t.trim())
            : [],
        stats: {
            stars: 0,
            users: 'N/A',
        },
        links: {
            live: project.url || '',
            github: '',
        },
        status: project.isCurrent ? 'In Progress' : 'Completed',
        featured: index === 0,
    }));

    return (
        <>
            <Card>
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#cf6318]/20 to-transparent rounded-full blur-3xl" />

                <div className="relative p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-[#cf6318] to-[#e67320] rounded-full" />
                            Projects
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onClick={handleAdd}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    </div>

                    {/* Projects Grid */}
                    {displayProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">No projects yet.</p>
                            <p className="text-white/40 text-sm">
                                Add your first project to showcase your work.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {displayProjects.map(project => (
                                <div
                                    key={project.id}
                                    className={`group relative overflow-hidden rounded-xl bg-white/5 border transition-all duration-300 ${
                                        project.featured
                                            ? 'border-[#cf6318]/50 hover:border-[#cf6318]'
                                            : 'border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {/* Featured Badge */}
                                    {project.featured && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <Badge className="bg-gradient-to-r from-[#cf6318] to-[#e67320] text-white border-0 shadow-lg">
                                                <Star className="w-3 h-3 mr-1 fill-white" />
                                                Featured
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-6 p-6">
                                        {/* Project Image */}
                                        <div className="flex-shrink-0">
                                            <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-[#cf6318]/20 to-[#e67320]/20 border border-white/10 group-hover:border-[#cf6318]/50 transition-colors">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Briefcase className="w-16 h-16 text-white/20" />
                                                </div>
                                                {/* Placeholder for actual image */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            </div>
                                        </div>

                                        {/* Project Info */}
                                        <div className="flex-1 space-y-4">
                                            {/* Title and Status */}
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-[#cf6318] transition-colors">
                                                        {project.title}
                                                    </h3>
                                                    <Badge
                                                        className={`${
                                                            project.status ===
                                                            'Live'
                                                                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                                                : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                                        } border`}
                                                    >
                                                        {project.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-white/70 leading-relaxed">
                                                    {project.description}
                                                </p>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {project.tags.map(
                                                    (tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            className="bg-white/5 border border-white/10 text-white hover:bg-[#cf6318]/20 hover:border-[#cf6318]/50 transition-all"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>

                                            {/* Stats and Links */}
                                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                                <div className="flex items-center gap-4 text-sm text-white/60">
                                                    <div className="flex items-center gap-1.5">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-semibold">
                                                            {
                                                                project.stats
                                                                    .stars
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold">
                                                            {
                                                                project.stats
                                                                    .users
                                                            }
                                                        </span>
                                                        <span>users</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-white/60 hover:text-white hover:bg-white/10"
                                                        onClick={() =>
                                                            handleEdit(
                                                                project.original,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {project.links.github && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-white/60 hover:text-white hover:bg-white/10"
                                                        >
                                                            <Github className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {project.links.live && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-white/60 hover:text-white hover:bg-white/10"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View All Button */}
                    {displayProjects.length > 0 && (
                        <div className="pt-2">
                            <Button className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[#cf6318]/50">
                                View All Projects
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <ProjectDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                project={selectedProject}
                onSuccess={handleSuccess}
            />
        </>
    );
}
