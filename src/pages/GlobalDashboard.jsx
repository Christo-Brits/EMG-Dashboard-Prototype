import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Clock, Lock, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { PROJECTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const GlobalDashboard = () => {
    const navigate = useNavigate();
    const { user, isAdmin, hasProjectAccess } = useAuth();

    const accessibleProjects = PROJECTS.filter(p => hasProjectAccess(p.id));
    const mainProject = accessibleProjects.find(p => p.active) || accessibleProjects[0];
    const otherProjects = PROJECTS.filter(p => p.id !== mainProject?.id);

    const activeProjectCount = PROJECTS.filter(p => p.status === 'In Progress' || p.status === 'Ongoing').length;
    const accessibleCount = accessibleProjects.length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'badge-success';
            case 'Planning': return 'badge-warning';
            case 'On Hold': return 'badge-warning';
            case 'Ongoing': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    const getStatusDot = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-green-500';
            case 'Planning': return 'bg-amber-500';
            case 'On Hold': return 'bg-amber-400';
            case 'Ongoing': return 'bg-blue-500';
            default: return 'bg-gray-400';
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

            {/* Portfolio Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{PROJECTS.length}</div>
                        <div className="text-xs text-gray-500">Total Projects</div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={18} className="text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{activeProjectCount}</div>
                        <div className="text-xs text-gray-500">Active</div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={18} className="text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{accessibleCount}</div>
                        <div className="text-xs text-gray-500">Your Access</div>
                    </div>
                </div>
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
                                    <div className="flex flex-wrap items-center text-sm text-[var(--color-text-secondary)] gap-x-4 gap-y-1">
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

                            {mainProject.focus && (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3 mb-4">
                                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Current Focus</span>
                                    <p className="text-sm text-blue-800 mt-1">{mainProject.focus}</p>
                                </div>
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

                    {/* Additional Accessible Projects */}
                    {accessibleProjects.length > 1 && (
                        <>
                            <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2 mt-8">
                                Your Other Projects
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {accessibleProjects.filter(p => p.id !== mainProject?.id).map(project => (
                                    <div
                                        key={project.id}
                                        className="card hover:shadow-md transition-shadow cursor-pointer group"
                                        onClick={() => navigate(`/project/${project.id}`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                                            <ArrowRight size={14} className="text-gray-300 group-hover:text-[var(--color-accent)] transition-colors" />
                                        </div>
                                        <h4 className="font-semibold text-[var(--color-brand-primary)] group-hover:text-[var(--color-accent)] transition-colors mb-1">{project.name}</h4>
                                        {project.location && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={12} /> {project.location}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar - Other Projects */}
                <div className="space-y-6">
                    <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2">
                        All Projects
                    </h2>

                    <div className="card bg-gray-50 border-gray-100">
                        <div className="space-y-3">
                            {PROJECTS.map((project) => {
                                const hasAccess = hasProjectAccess(project.id);
                                const isMain = project.id === mainProject?.id;
                                return (
                                    <div
                                        key={project.id}
                                        className={`pb-3 border-b border-gray-100 last:border-0 last:pb-0 ${hasAccess && project.active ? 'cursor-pointer hover:bg-gray-100 -mx-2 px-2 py-1.5 rounded transition-colors' : ''}`}
                                        onClick={() => hasAccess && project.active && navigate(`/project/${project.id}`)}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(project.status)}`}></span>
                                            <h4 className={`font-medium text-sm ${isMain ? 'text-[var(--color-accent)]' : 'text-[var(--color-brand-secondary)]'}`}>
                                                {project.name}
                                                {!hasAccess && <Lock size={10} className="inline ml-1.5 text-gray-400" />}
                                            </h4>
                                        </div>
                                        <div className="flex items-center justify-between text-xs pl-4">
                                            <span className={`badge ${getStatusColor(project.status)} scale-90 origin-left`}>{project.status}</span>
                                            <span className="text-gray-400">{project.lastUpdated}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
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
