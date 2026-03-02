import React from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { PROJECTS } from '../data/mockData';
import { ArrowLeft, Download } from 'lucide-react';
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
        { name: 'Overview', path: 'overview' },
        { name: 'Progress Updates', path: 'updates' },
        { name: 'Site Photos', path: 'photos' },
        { name: 'Documents', path: 'documents' },
        { name: 'Actions & Follow-Ups', path: 'actions' },
        { name: 'Project Questions', path: 'qa' },
    ];

    return (
        <div className="container max-w-6xl">
            {/* Breadcrumb / Back */}
            <div className="mb-4 flex items-center justify-between">
                <NavLink to="/dashboard" className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Dashboard
                </NavLink>
                {user && (
                    <button
                        onClick={handleDownloadPdf}
                        className="btn btn-outline text-xs gap-2 print:hidden"
                        title="Download this page as PDF"
                    >
                        <Download size={14} /> Download PDF
                    </button>
                )}
            </div>

            {/* Project Header */}
            <div className="bg-white border border-[var(--color-border)] rounded-t-lg p-6 pb-0">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">{project.name}</h1>
                            <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-sm">
                            Project ID: {projectId?.toUpperCase()} &bull; Last updated {project.lastUpdated}
                            {user && <span> &bull; Role: <strong className="capitalize">{user.role}</strong></span>}
                        </p>
                    </div>
                    <div>
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block uppercase tracking-wide">Client</span>
                            <span className="font-medium">Foodstuffs North Island</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                                    ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }
                        >
                            {tab.name}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-t-0 border-[var(--color-border)] rounded-b-lg p-6 min-h-[500px]">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectDashboard;
