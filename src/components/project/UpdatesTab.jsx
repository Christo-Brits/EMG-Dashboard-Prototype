import React, { useState } from 'react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { User, Calendar, Plus, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react';

const UpdatesTab = () => {
    const { updates, addUpdate, deleteUpdate, updateUpdate } = useProjectData();
    const { user, isAdmin } = useAuth();

    // Edit/Delete State
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [newUpdate, setNewUpdate] = useState('');
    const [tag, setTag] = useState('Progress');

    if (newUpdate.trim()) {
        addUpdate(newUpdate, user?.name || 'Unknown');
        setNewUpdate('');
        setShowForm(false);
    }

    const startEditing = (update) => {
        setEditingId(update.id);
        setEditContent(update.content);
        setOpenMenuId(null);
    };

    const saveEdit = (id) => {
        updateUpdate(id, { content: editContent });
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this update?")) {
            deleteUpdate(id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Progress Updates</h2>
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

            {updates.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Calendar size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No updates have been posted yet</p>
                    <p className="text-xs text-gray-400">Progress updates will appear here as the project advances</p>
                </div>
            ) : (
                <>
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
                                        {editingId === update.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 mb-2"
                                                    rows="3"
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="btn btn-sm btn-outline text-xs">Cancel</button>
                                                    <button onClick={() => saveEdit(update.id)} className="btn btn-sm btn-primary text-xs">Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            update.content
                                        )}
                                    </p>

                                    {/* Admin Controls */}
                                    {isAdmin && !editingId && (
                                        <div className="absolute top-4 right-4">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === update.id ? null : update.id)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>

                                            {openMenuId === update.id && (
                                                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                                    <button
                                                        onClick={() => startEditing(update)}
                                                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                                                    >
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(update.id)}
                                                        className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-red-50 text-red-600"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <button className="text-sm text-gray-400 hover:text-gray-600">View Earlier Updates</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UpdatesTab;
