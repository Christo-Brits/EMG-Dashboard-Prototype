import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { User, Calendar, Plus, MoreHorizontal, Trash2, Edit2, X, Search, Filter, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 5;

const UpdatesTab = () => {
    const { updates, addUpdate, deleteUpdate, updateUpdate } = useProjectData();
    const { user, isAdmin } = useAuth();
    const toast = useToast();

    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [newUpdate, setNewUpdate] = useState('');
    const [tag, setTag] = useState('Progress');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState('All');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const tags = useMemo(() => {
        const allTags = updates.map(u => u.tag).filter(Boolean);
        return ['All', ...new Set(allTags)];
    }, [updates]);

    const filteredUpdates = useMemo(() => {
        let result = [...updates];
        if (filterTag !== 'All') {
            result = result.filter(u => u.tag === filterTag);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.content || '').toLowerCase().includes(q) ||
                (u.author || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [updates, filterTag, searchQuery]);

    const visibleUpdates = filteredUpdates.slice(0, visibleCount);
    const hasMore = visibleCount < filteredUpdates.length;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newUpdate.trim()) {
            toast.warning('Please enter update content.');
            return;
        }
        addUpdate(newUpdate, user?.name || 'Unknown');
        setNewUpdate('');
        setShowForm(false);
        toast.success('Update posted successfully.');
    };

    const startEditing = (update) => {
        setEditingId(update.id);
        setEditContent(update.content);
        setOpenMenuId(null);
    };

    const saveEdit = (id) => {
        if (!editContent.trim()) {
            toast.warning('Update content cannot be empty.');
            return;
        }
        updateUpdate(id, { content: editContent });
        setEditingId(null);
        toast.success('Update edited successfully.');
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this update?")) {
            deleteUpdate(id);
            toast.success('Update deleted.');
        }
    };

    const handleShowMore = () => {
        setVisibleCount(prev => prev + PAGE_SIZE);
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
                </div>
            </div>

            {/* Search & Filter Bar */}
            {updates.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search updates..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterTag}
                            onChange={(e) => { setFilterTag(e.target.value); setVisibleCount(PAGE_SIZE); }}
                            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-white"
                        >
                            {tags.map(t => (
                                <option key={t} value={t}>{t === 'All' ? 'All Tags' : t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

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
            ) : filteredUpdates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Search size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 mb-1">No updates match your search</p>
                    <p className="text-xs text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <>
                    {(searchQuery || filterTag !== 'All') && (
                        <p className="text-xs text-gray-400 mb-4">
                            Showing {filteredUpdates.length} of {updates.length} updates
                        </p>
                    )}

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {visibleUpdates.map((update) => (
                            <div key={update.id} className="relative flex items-start group is-active animate-in fade-in duration-500">
                                <div className="absolute left-0 mt-1 ml-2.5 h-5 w-5 rounded-full border-2 border-[var(--color-bg-surface)] bg-slate-300 group-[.is-active]:bg-[var(--color-accent)] z-10 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                                </div>

                                <div className="ml-12 w-full card p-5 border-gray-200 hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                            <span className="font-semibold text-[var(--color-brand-primary)] flex items-center gap-1">
                                                <User size={14} /> {update.author}
                                            </span>
                                            <span>&bull;</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {update.date}
                                            </span>
                                        </div>
                                        <span className="badge badge-neutral bg-gray-100 text-gray-600">{update.tag}</span>
                                    </div>
                                    <div className="text-gray-700 leading-relaxed text-sm">
                                        {editingId === update.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 mb-2"
                                                    rows="3"
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="btn btn-outline text-xs">Cancel</button>
                                                    <button onClick={() => saveEdit(update.id)} className="btn btn-primary text-xs">Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            update.content
                                        )}
                                    </div>

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

                    {hasMore && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleShowMore}
                                className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 transition-colors inline-flex items-center gap-2"
                            >
                                <ChevronDown size={14} />
                                View Earlier Updates ({filteredUpdates.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UpdatesTab;
