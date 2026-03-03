import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Info, Target, AlertTriangle, Edit2, X, Check, CheckCircle2, Circle, HelpCircle, Camera, FileText } from 'lucide-react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

const OverviewTab = () => {
    const { projectId } = useParams();
    const { projects, updateProjectDetails, updates, actions, qa, photos, documents } = useProjectData();
    const { isAdmin } = useAuth();

    const project = projects.find(p => p.id === projectId) || projects[0];

    const openActions = actions.filter(a => a.status === 'Open').length;
    const closedActions = actions.filter(a => a.status === 'Closed').length;
    const openQuestions = qa.filter(q => q.status === 'Open').length;
    const answeredQuestions = qa.filter(q => q.status === 'Answered').length;
    const totalDocuments = documents.reduce((sum, folder) => sum + (folder.items?.length || 0), 0);

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

            {/* Project Health KPIs */}
            <section>
                <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Project Snapshot</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Circle size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[var(--color-brand-primary)]">{openActions}</div>
                            <div className="text-xs text-gray-500">Open Actions</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[var(--color-brand-primary)]">{closedActions}</div>
                            <div className="text-xs text-gray-500">Closed</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <HelpCircle size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[var(--color-brand-primary)]">{openQuestions}</div>
                            <div className="text-xs text-gray-500">Open Q&A</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-slate-600" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[var(--color-brand-primary)]">{totalDocuments}</div>
                            <div className="text-xs text-gray-500">Documents</div>
                        </div>
                    </div>
                </div>

                {/* Action completion bar */}
                {(openActions + closedActions) > 0 && (
                    <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Action Completion</span>
                            <span className="text-xs font-bold text-gray-700">
                                {closedActions} / {openActions + closedActions} completed
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${((closedActions / (openActions + closedActions)) * 100).toFixed(0)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </section>

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

            {/* Recent Activity */}
            {updates.length > 0 && (
                <section>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Latest Updates</h3>
                    <div className="space-y-2">
                        {updates.slice(0, 3).map((update) => (
                            <div key={update.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 line-clamp-1">{update.content}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{update.author} &bull; {update.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

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
