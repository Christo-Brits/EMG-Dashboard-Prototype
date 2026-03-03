import React from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { PROJECTS } from '../data/mockData';
import { ArrowLeft, Download, LayoutDashboard, RefreshCw, Camera, FolderOpen, ListChecks, HelpCircle } from 'lucide-react';
import { useProjectData } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const ProjectDashboard = () => {
    const { projectId } = useParams();
    const { setActiveProjectId } = useProjectData();
    const { user, isAdmin } = useAuth();
    const project = PROJECTS.find(p => p.id === projectId) || PROJECTS[0];

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

    const handleDownloadPdf = () => {
        window.print();
    };

    const tabs = [
        { name: 'Overview', shortName: 'Overview', path: 'overview', icon: LayoutDashboard },
        { name: 'Progress Updates', shortName: 'Updates', path: 'updates', icon: RefreshCw },
        { name: 'Site Photos', shortName: 'Photos', path: 'photos', icon: Camera },
        { name: 'Documents', shortName: 'Docs', path: 'documents', icon: FolderOpen },
        { name: 'Actions & Follow-Ups', shortName: 'Actions', path: 'actions', icon: ListChecks },
        { name: 'Project Questions', shortName: 'Q&A', path: 'qa', icon: HelpCircle },
    ];

    return (
        <div className="container max-w-6xl">
            {/* Breadcrumb / Back */}
            <div className="mb-4 flex items-center justify-between">
                <NavLink to="/dashboard" className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Back</span>
                </NavLink>
                {user && (
                    <button
                        onClick={handleDownloadPdf}
                        className="btn btn-outline text-xs gap-2 print:hidden"
                        title="Download this page as PDF"
                    >
                        <Download size={14} /> <span className="hidden sm:inline">Download PDF</span>
                    </button>
                )}
            </div>

            {/* Project Header */}
            <div className="bg-white border border-[var(--color-border)] rounded-t-lg p-4 sm:p-6 pb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-brand-primary)]">{project.name}</h1>
                            <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm">
                            Project ID: {projectId?.toUpperCase()} &bull; Last updated {project.lastUpdated}
                            {user && <span> &bull; Role: <strong className="capitalize">{user.role}</strong></span>}
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block uppercase tracking-wide">Client</span>
                            <span className="font-medium">Foodstuffs North Island</span>
                        </div>
                    </div>
                </div>

                {/* Tabs - responsive: icons + short names on mobile, full names on desktop */}
                <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                className={({ isActive }) =>
                                    `px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${isActive
                                        ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`
                                }
                            >
                                <Icon size={14} className="sm:hidden" />
                                <span className="hidden sm:inline">{tab.name}</span>
                                <span className="sm:hidden">{tab.shortName}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-t-0 border-[var(--color-border)] rounded-b-lg p-4 sm:p-6 min-h-[500px]">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectDashboard;
