import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Info, Target, AlertTriangle, Edit2, X, Check } from 'lucide-react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

const OverviewTab = () => {
    const { id } = useParams();
    const { projects, updateProjectDetails } = useProjectData();
    const { isAdmin } = useAuth();

    const project = projects.find(p => p.id === id) || projects[0];

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        summary: project.summary,
        focus: project.focus,
        coordination: project.coordination
    });

    const handleSave = () => {
        updateProjectDetails(project.id, formData);
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 relative">

            {isAdmin && !isEditing && (
                <div className="absolute -top-2 right-0">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors"
                    >
                        <Edit2 size={12} /> Edit Details
                    </button>
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

                    <div className="grid grid-cols-2 gap-4">
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

            {/* Map / Location Placeholder */}
            <section>
                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Site Location</h3>
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex flex-col items-center justify-center border border-gray-200 text-gray-400 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Map integration available on request</p>
                    <p className="text-xs text-gray-400 mt-1">Contact your EMG project lead for details</p>
                </div>
            </section>

        </div>
    );
};

export default OverviewTab;
