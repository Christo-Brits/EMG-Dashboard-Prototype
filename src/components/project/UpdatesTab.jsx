import React, { useState } from 'react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { User, Calendar, Plus } from 'lucide-react';

const UpdatesTab = () => {
    const { updates, addUpdate } = useProjectData();
    const { user, isAdmin } = useAuth();

    const [showForm, setShowForm] = useState(false);
    const [newUpdate, setNewUpdate] = useState('');
    const [tag, setTag] = useState('Progress');

    const handleSubmit = (e) => {
        e.preventDefault();
        addUpdate({
            projectId: 'south-mall', // Hardcoded for prototype
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            author: `${user.name} (EMG)`,
            content: newUpdate,
            tag: tag
        });
        setNewUpdate('');
        setShowForm(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Project Feed</h2>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn btn-primary text-xs gap-1"
                        >
                            <Plus size={14} /> Post Update
                        </button>
                    )}
                    <button className="btn btn-outline text-sm" disabled>Filter by Date</button>
                </div>
            </div>

            {/* Admin Post Form */}
            {showForm && (
                <div className="bg-white border border-blue-100 shadow-sm rounded-lg p-4 mb-8 animate-in slide-in-from-top-2">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            className="w-full border border-gray-200 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            placeholder="What's the latest on site?"
                            rows="3"
                            value={newUpdate}
                            onChange={e => setNewUpdate(e.target.value)}
                            required
                        ></textarea>
                        <div className="flex justify-between items-center">
                            <select
                                className="text-sm border border-gray-200 rounded p-1.5"
                                value={tag}
                                onChange={e => setTag(e.target.value)}
                            >
                                <option>Progress</option>
                                <option>Compliance</option>
                                <option>Safety</option>
                                <option>Delay</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline text-xs border-transparent">Cancel</button>
                                <button type="submit" className="btn btn-primary text-xs">Post</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {updates.map((update) => (
                    <div key={update.id} className="relative flex items-start group is-active animate-in fade-in duration-500">
                        {/* Icon/Dot */}
                        <div className="absolute left-0 mt-1 ml-2.5 h-5 w-5 rounded-full border-2 border-[var(--color-bg-surface)] bg-slate-300 group-[.is-active]:bg-[var(--color-accent)] z-10 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                        </div>

                        <div className="ml-12 w-full card p-5 border-gray-200 hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                    <span className="font-semibold text-[var(--color-brand-primary)] flex items-center gap-1">
                                        <User size={14} /> {update.author}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} /> {update.date}
                                    </span>
                                </div>
                                <span className="badge badge-neutral bg-gray-100 text-gray-600">{update.tag}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {update.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button className="text-sm text-gray-400 hover:text-gray-600">Load Older Updates</button>
            </div>
        </div>
    );
};

export default UpdatesTab;
