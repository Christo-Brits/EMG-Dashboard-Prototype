import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Clock, Lock } from 'lucide-react';
import { PROJECTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const GlobalDashboard = () => {
    const navigate = useNavigate();
    const { user, isAdmin, hasProjectAccess } = useAuth();

    const accessibleProjects = PROJECTS.filter(p => hasProjectAccess(p.id));
    const mainProject = accessibleProjects.find(p => p.active) || accessibleProjects[0];
    const otherProjects = PROJECTS.filter(p => p.id !== mainProject?.id);

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'badge-success';
            case 'Planning': return 'badge-warning';
            case 'On Hold': return 'badge-warning';
            case 'Ongoing': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="container max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">Project Dashboard</h1>
                <p className="text-[var(--color-text-secondary)]">
                    {isAdmin ? 'Administrator view — all engagements' : 'Your assigned project engagements'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Column - Your Project */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2">
                        Your Primary Project
                    </h2>

                    {mainProject ? (
                        <div className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-[var(--color-accent)]" onClick={() => navigate(`/project/${mainProject.id}`)}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`badge ${getStatusColor(mainProject.status)} mb-2`}>{mainProject.status}</span>
                                    <h3 className="text-xl font-bold text-[var(--color-brand-primary)] mb-1">{mainProject.name}</h3>
                                    <div className="flex items-center text-sm text-[var(--color-text-secondary)] gap-4">
                                        {mainProject.location && <span className="flex items-center gap-1"><Building2 size={14} /> {mainProject.location}</span>}
                                        <span className="flex items-center gap-1"><Clock size={14} /> Last updated {mainProject.lastUpdated}</span>
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
                    ) : (
                        <div className="card text-center py-12">
                            <Lock size={32} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No projects assigned</p>
                            <p className="text-sm text-gray-400 mt-1">Contact your administrator to request project access.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Other Projects */}
                <div className="space-y-6">
                    <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2">
                        Other Projects
                    </h2>

                    <div className="card bg-gray-50 border-gray-100">
                        <div className="space-y-4">
                            {otherProjects.map((project) => {
                                const hasAccess = hasProjectAccess(project.id);
                                return (
                                    <div
                                        key={project.id}
                                        className={`pb-4 border-b border-gray-100 last:border-0 last:pb-0 ${hasAccess && project.active ? 'cursor-pointer hover:bg-gray-100 -mx-2 px-2 py-1 rounded transition-colors' : ''}`}
                                        onClick={() => hasAccess && project.active && navigate(`/project/${project.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-[var(--color-brand-secondary)]">
                                                {project.name}
                                                {!project.active && <Lock size={12} className="inline ml-2 text-gray-400" />}
                                            </h4>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`badge ${getStatusColor(project.status)} scale-90 origin-left`}>{project.status}</span>
                                            <span className="text-gray-400">Upd: {project.lastUpdated}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                            {isAdmin
                                ? 'Restricted projects require activation before access.'
                                : 'Contact your administrator for access to additional projects.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalDashboard;
