import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Building2, Clock, Plus } from 'lucide-react';
import { useProjectData } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const GlobalDashboard = () => {
    const navigate = useNavigate();
    const { projects, projectsLoading } = useProjectData();
    const { isAdmin } = useAuth();

    const mainProject = projects[0];
    const otherProjects = projects.slice(1);

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'badge-success';
            case 'Planning': return 'badge-warning';
            case 'On Hold': return 'badge-warning';
            case 'Ongoing': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    if (projectsLoading) {
        return (
            <div className="container max-w-5xl">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm text-gray-500">Loading projects...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="container max-w-5xl">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">Project Dashboard</h1>
                        <p className="text-[var(--color-text-secondary)]">Overview of all active engagements</p>
                    </div>
                    {isAdmin && (
                        <Link to="/admin/projects/new" className="btn btn-primary text-sm gap-2">
                            <Plus size={16} /> Create Project
                        </Link>
                    )}
                </div>
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Building2 size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No projects available</p>
                    <p className="text-xs text-gray-400">
                        {isAdmin ? 'Create your first project to get started.' : 'You have not been assigned to any projects yet. Contact your administrator.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">Project Dashboard</h1>
                    <p className="text-[var(--color-text-secondary)]">Overview of all active engagements</p>
                </div>
                {isAdmin && (
                    <Link to="/admin/projects/new" className="btn btn-primary text-sm gap-2">
                        <Plus size={16} /> Create Project
                    </Link>
                )}
            </div>

            <div className={`grid grid-cols-1 ${otherProjects.length > 0 ? 'md:grid-cols-3' : ''} gap-8`}>
                {/* Main Column - Your Project */}
                <div className={`${otherProjects.length > 0 ? 'md:col-span-2' : ''} space-y-6`}>
                    <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2">
                        Your Primary Project
                    </h2>

                    <div className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-[var(--color-accent)]" onClick={() => navigate(`/project/${mainProject.id}`)}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`badge ${getStatusColor(mainProject.status)} mb-2`}>{mainProject.status}</span>
                                <h3 className="text-xl font-bold text-[var(--color-brand-primary)] mb-1">{mainProject.name}</h3>
                                <div className="flex items-center text-sm text-[var(--color-text-secondary)] gap-4">
                                    {mainProject.location && <span className="flex items-center gap-1"><Building2 size={14} /> {mainProject.location}</span>}
                                    {mainProject.lastUpdated && <span className="flex items-center gap-1"><Clock size={14} /> Last updated {mainProject.lastUpdated}</span>}
                                </div>
                            </div>
                        </div>

                        {mainProject.summary && (
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {mainProject.summary}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <button className="btn btn-outline text-sm gap-2">
                                View Project Details
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Other Projects */}
                {otherProjects.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2">
                            Other Active Projects
                        </h2>

                        <div className="card bg-gray-50 border-gray-100">
                            <div className="space-y-4">
                                {otherProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="pb-4 border-b border-gray-100 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-100 -mx-2 px-2 py-1 rounded transition-colors"
                                        onClick={() => navigate(`/project/${project.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-[var(--color-brand-secondary)]">{project.name}</h4>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`badge ${getStatusColor(project.status)} scale-90 origin-left`}>{project.status}</span>
                                            {project.lastUpdated && <span className="text-gray-400">Upd: {project.lastUpdated}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalDashboard;
