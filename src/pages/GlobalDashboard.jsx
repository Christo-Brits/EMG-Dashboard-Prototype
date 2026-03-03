import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Clock, Lock, FolderOpen, CheckCircle2, Circle, AlertTriangle, TrendingUp } from 'lucide-react';
import { PROJECTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const GlobalDashboard = () => {
    const navigate = useNavigate();
    const { user, isAdmin, hasProjectAccess } = useAuth();

    const accessibleProjects = PROJECTS.filter(p => hasProjectAccess(p.id));
    const mainProject = accessibleProjects.find(p => p.active) || accessibleProjects[0];
    const otherProjects = PROJECTS.filter(p => p.id !== mainProject?.id);

    const stats = useMemo(() => {
        const total = accessibleProjects.length;
        const inProgress = accessibleProjects.filter(p => p.status === 'In Progress').length;
        const planning = accessibleProjects.filter(p => p.status === 'Planning').length;
        const onHold = accessibleProjects.filter(p => p.status === 'On Hold').length;
        return { total, inProgress, planning, onHold };
    }, [accessibleProjects]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'badge-success';
            case 'Planning': return 'badge-warning';
            case 'On Hold': return 'badge-warning';
            case 'Ongoing': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-green-500';
            case 'Planning': return 'bg-amber-500';
            case 'On Hold': return 'bg-amber-500';
            case 'Ongoing': return 'bg-blue-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="container max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">Project Dashboard</h1>
                <p className="text-[var(--color-text-secondary)]">
                    {isAdmin ? 'Administrator view — all engagements' : `Welcome back, ${user?.name || 'User'}`}
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="card flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FolderOpen size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total Projects</div>
                    </div>
                </div>
                <div className="card flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={20} className="text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{stats.inProgress}</div>
                        <div className="text-xs text-gray-500">In Progress</div>
                    </div>
                </div>
                <div className="card flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Circle size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{stats.planning}</div>
                        <div className="text-xs text-gray-500">Planning</div>
                    </div>
                </div>
                <div className="card flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{stats.onHold}</div>
                        <div className="text-xs text-gray-500">On Hold</div>
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
                                    <div className="flex flex-wrap items-center text-sm text-[var(--color-text-secondary)] gap-4">
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

                    {/* Quick Access: Other Accessible Projects */}
                    {accessibleProjects.length > 1 && (
                        <div>
                            <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2 mb-4">
                                Your Other Projects
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {accessibleProjects.filter(p => p.id !== mainProject?.id).map(project => (
                                    <div
                                        key={project.id}
                                        onClick={() => navigate(`/project/${project.id}`)}
                                        className="card p-4 hover:shadow-md transition-all cursor-pointer hover:border-[var(--color-accent)] group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${getStatusDotColor(project.status)}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-[var(--color-brand-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">{project.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`badge ${getStatusColor(project.status)} scale-90 origin-left`}>{project.status}</span>
                                                </div>
                                                {project.location && (
                                                    <p className="text-xs text-gray-400 mt-1 truncate">{project.location}</p>
                                                )}
                                            </div>
                                            <ArrowRight size={16} className="text-gray-300 group-hover:text-[var(--color-accent)] transition-colors flex-shrink-0 mt-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - All Projects Overview */}
                <div className="space-y-6">
                    <h2 className="text-lg text-[var(--color-text-primary)] font-semibold border-b border-gray-200 pb-2">
                        All Projects
                    </h2>

                    <div className="card bg-gray-50 border-gray-100">
                        {/* Status Distribution Bar */}
                        {accessibleProjects.length > 0 && (
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Status Distribution</p>
                                <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                                    {stats.inProgress > 0 && (
                                        <div className="bg-green-500 transition-all" style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}></div>
                                    )}
                                    {stats.planning > 0 && (
                                        <div className="bg-amber-400 transition-all" style={{ width: `${(stats.planning / stats.total) * 100}%` }}></div>
                                    )}
                                    {stats.onHold > 0 && (
                                        <div className="bg-red-400 transition-all" style={{ width: `${(stats.onHold / stats.total) * 100}%` }}></div>
                                    )}
                                    {(stats.total - stats.inProgress - stats.planning - stats.onHold) > 0 && (
                                        <div className="bg-blue-400 transition-all" style={{ width: `${((stats.total - stats.inProgress - stats.planning - stats.onHold) / stats.total) * 100}%` }}></div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                    <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Planning</span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Ongoing</span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-red-400"></span> On Hold</span>
                                </div>
                            </div>
                        )}

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
                                                {!hasAccess && <Lock size={12} className="inline ml-2 text-gray-400" />}
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
