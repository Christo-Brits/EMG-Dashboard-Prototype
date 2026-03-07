import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Info, Target, AlertTriangle, Edit2, X, Check, Printer } from 'lucide-react';
import { useProjectData } from '../../context/ProjectContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import MilestoneTimeline from './MilestoneTimeline';
import { exportProjectSummaryReport } from '../../utils/exportHelpers';

const OverviewTab = () => {
    const { projectId } = useParams();
    const { projects, updates, actions, updateProjectDetails } = useProjectData();
    const { canEditProject } = useProjectPermissions();

    const project = projects.find(p => p.id === projectId);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        summary: project?.summary || '',
        focus: project?.focus || '',
        coordination: project?.coordination || ''
    });

    // Keep form data in sync when project data loads/changes
    React.useEffect(() => {
        if (project) {
            setFormData({
                summary: project.summary || '',
                focus: project.focus || '',
                coordination: project.coordination || ''
            });
        }
    }, [project?.summary, project?.focus, project?.coordination]);

    if (!project) {
        return (
            <div className="text-center py-16 text-gray-400">
                <p className="text-sm">Project details are loading or not available.</p>
            </div>
        );
    }

    const handleSave = () => {
        updateProjectDetails(project.id, formData);
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 relative">

            {!isEditing && (
                <div className="flex justify-end gap-2 mb-4 sm:absolute sm:-top-2 sm:right-0 sm:mb-0">
                    <button
                        onClick={() => exportProjectSummaryReport(project, { updates, actions, milestones: project?.milestones || [] })}
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 bg-gray-50 px-3 py-2 sm:px-2 sm:py-1 rounded border border-gray-200 transition-colors"
                    >
                        <Printer size={12} /> Print Report
                    </button>
                    {canEditProject && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 sm:px-2 sm:py-1 rounded border border-blue-100 transition-colors"
                        >
                            <Edit2 size={12} /> Edit Details
                        </button>
                    )}
                </div>
            )}

            {/* Editing Form */}
            {isEditing && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8 space-y-4 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-blue-800">Edit Project Overview</h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Project Summary</label>
                        <textarea
                            className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            value={formData.summary}
                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Current Focus</label>
                            <input
                                className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.focus}
                                onChange={e => setFormData({ ...formData, focus: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Coordination</label>
                            <input
                                className="w-full p-2 rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.coordination}
                                onChange={e => setFormData({ ...formData, coordination: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setIsEditing(false)} className="btn btn-outline bg-white text-xs">Cancel</button>
                        <button onClick={handleSave} className="btn btn-primary text-xs gap-1">
                            <Check size={14} /> Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Section */}
            <section>
                <h3 className="text-lg font-semibold text-[var(--color-brand-primary)] mb-4 flex items-center gap-2">
                    <Info size={18} className="text-[var(--color-accent)]" /> Project Summary
                </h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-100">
                    {project.summary}
                </p>
            </section>

            {/* Highlight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Current Focus */}
                <div className="card border-l-4 border-l-blue-500">
                    <h3 className="text-base font-semibold text-[var(--color-brand-primary)] mb-3 flex items-center gap-2">
                        <Target size={18} className="text-blue-500" /> Current Focus
                    </h3>
                    <p className="text-gray-600 text-sm">{project.focus}</p>
                </div>

                {/* Coordination */}
                <div className="card border-l-4 border-l-amber-500">
                    <h3 className="text-base font-semibold text-[var(--color-brand-primary)] mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" /> Key Coordination Items
                    </h3>
                    <p className="text-gray-600 text-sm">{project.coordination}</p>
                </div>
            </div>

            {/* Milestone Timeline */}
            <MilestoneTimeline projectId={projectId} canEdit={canEditProject} />

            {/* Site Location */}
            {project.location && (
                <section>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Site Location</h3>
                    <p className="text-gray-600">{project.location}</p>
                </section>
            )}

        </div>
    );
};

export default OverviewTab;
