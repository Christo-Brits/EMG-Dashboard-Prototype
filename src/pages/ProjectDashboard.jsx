import React from 'react';
import { useParams, NavLink, Outlet, Navigate } from 'react-router-dom';
import { PROJECTS } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';

const ProjectDashboard = () => {
    const { id } = useParams();
    const project = PROJECTS.find(p => p.id === id) || PROJECTS[0]; // Fallback to first for safety

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
            <div className="mb-4">
                <NavLink to="/dashboard" className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Dashboard
                </NavLink>
            </div>

            {/* Project Header */}
            <div className="bg-white border border-[var(--color-border)] rounded-t-lg p-6 pb-0">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">{project.name}</h1>
                            <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-sm">Project ID: {id?.toUpperCase()} • Last updated {project.lastUpdated}</p>
                    </div>
                    <div>
                        {/* Client logo placeholder or similar if needed */}
                        <div className="text-right">
                            <span className="text-xs text-gray-400 block uppercase tracking-wide">Client</span>
                            <span className="font-medium">Foodstuffs North Island</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `px-6 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
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
