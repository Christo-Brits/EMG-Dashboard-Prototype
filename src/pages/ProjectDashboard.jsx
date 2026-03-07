import React from 'react';
import { useParams, NavLink, Outlet, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useProjectData } from '../context/ProjectContext';

const ProjectDashboard = () => {
    const { projectId } = useParams();
    const { projects, projectsLoading, dataLoading, setActiveProjectId } = useProjectData();
    const project = projects.find(p => p.id === projectId);

    React.useEffect(() => {
        if (projectId) {
            setActiveProjectId(projectId);
        }
    }, [projectId, setActiveProjectId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'badge-success';
            case 'Planning': return 'badge-warning';
            case 'On Hold': return 'badge-warning';
            case 'Ongoing': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    const tabs = [
        { name: 'Overview', shortName: 'Overview', path: 'overview' },
        { name: 'Progress Updates', shortName: 'Updates', path: 'updates' },
        { name: 'Site Photos', shortName: 'Photos', path: 'photos' },
        { name: 'Documents', shortName: 'Docs', path: 'documents' },
        { name: 'Financials', shortName: 'Finance', path: 'financials' },
        { name: 'Actions & Follow-Ups', shortName: 'Actions', path: 'actions' },
        { name: 'Project Questions', shortName: 'Q&A', path: 'qa' },
    ];

    if (projectsLoading) {
        return (
            <div className="container max-w-6xl flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
        );
    }

    // Project may not be in user's list if they haven't loaded yet (handled by ProjectGuard)
    const projectName = project?.name || projectId;
    const projectStatus = project?.status || '';
    const projectLocation = project?.location || '';
    const projectClient = project?.client || '';
    const projectLastUpdated = project?.lastUpdated || '';

    return (
        <div className="container max-w-6xl">
            {/* Breadcrumb / Back */}
            <div className="mb-4">
                <NavLink to="/projects" className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Projects
                </NavLink>
            </div>

            {/* Project Header */}
            <div className="bg-white border border-[var(--color-border)] rounded-t-lg p-4 sm:p-6 pb-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-brand-primary)]">{projectName}</h1>
                            {projectStatus && <span className={`badge ${getStatusColor(projectStatus)}`}>{projectStatus}</span>}
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm">
                            Project ID: {projectId?.toUpperCase()}
                            {projectLastUpdated && ` • Updated ${projectLastUpdated}`}
                        </p>
                    </div>
                    {projectClient && (
                        <div className="mt-3 sm:mt-0 text-left sm:text-right">
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Client</span>
                            <span className="font-medium text-sm block">{projectClient}</span>
                        </div>
                    )}
                </div>

                {/* Tabs — horizontal scroll on mobile */}
                <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                                    ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }
                        >
                            <span className="hidden sm:inline">{tab.name}</span>
                            <span className="sm:hidden">{tab.shortName}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-t-0 border-[var(--color-border)] rounded-b-lg p-4 sm:p-6 min-h-[500px]">
                {dataLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </div>
    );
};

export default ProjectDashboard;
