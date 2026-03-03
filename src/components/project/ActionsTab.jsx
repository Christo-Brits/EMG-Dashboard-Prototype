import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Circle, Plus, X, Trash2, Search, Filter } from 'lucide-react';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const ActionsTab = () => {
    const { actions, addAction, updateActionStatus, deleteAction } = useProjectData();
    const { user, isAdmin } = useAuth();

    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ task: '', assignedTo: '', dueDate: '' });

    // Filter/search state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [actionToDelete, setActionToDelete] = useState(null);

    const confirmDelete = (id) => {
        setActionToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (actionToDelete) {
            deleteAction(actionToDelete);
            setActionToDelete(null);
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Closed') return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 size={12} /> Closed</span>;
        return <span className="badge badge-neutral ring-1 ring-gray-200 flex items-center gap-1"><Circle size={12} /> Open</span>;
    };

    const handleCreate = (e) => {
        e.preventDefault();
        addAction(newTask.task, newTask.assignedTo, newTask.dueDate);
        setNewTask({ task: '', assignedTo: '', dueDate: '' });
        setShowForm(false);
    };

    const toggleStatus = (id, currentStatus) => {
        if (!isAdmin) return;
        const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
        updateActionStatus(id, newStatus);
    };

    // Derive unique assignees for filter
    const uniqueAssignees = useMemo(() => {
        const set = new Set(actions.map(a => a.assignedTo).filter(Boolean));
        return [...set].sort();
    }, [actions]);

    // Filtered actions
    const filteredActions = useMemo(() => {
        return actions.filter(action => {
            if (statusFilter !== 'all' && action.status !== statusFilter) return false;
            if (assigneeFilter !== 'all' && action.assignedTo !== assigneeFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (action.task?.toLowerCase().includes(q) || action.assignedTo?.toLowerCase().includes(q));
            }
            return true;
        });
    }, [actions, statusFilter, assigneeFilter, searchQuery]);

    const openCount = actions.filter(a => a.status === 'Open').length;
    const closedCount = actions.filter(a => a.status === 'Closed').length;
    const hasActiveFilters = statusFilter !== 'all' || assigneeFilter !== 'all' || searchQuery.trim();

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Actions & Follow-Ups</h2>
                    {actions.length > 0 && (
                        <div className="flex gap-3 mt-1">
                            <span className="text-xs text-gray-500">{openCount} open</span>
                            <span className="text-xs text-gray-400">&bull;</span>
                            <span className="text-xs text-gray-500">{closedCount} closed</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn btn-primary text-sm gap-1"
                        >
                            <Plus size={16} /> Raise Action
                        </button>
                    )}
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleExecuteDelete}
                title="Delete Action"
                itemType="action"
            />

            {showForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 text-sm">New Action Item</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Task Description</label>
                            <input
                                className="w-full p-2 text-sm border border-gray-300 rounded"
                                required
                                value={newTask.task}
                                onChange={e => setNewTask({ ...newTask, task: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Assigned To</label>
                            <select
                                className="w-full p-2 text-sm border border-gray-300 rounded"
                                value={newTask.assignedTo}
                                onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                            >
                                <option value="">-- Select --</option>
                                <option>EMG</option>
                                <option>Contractor</option>
                                <option>Client</option>
                                <option>Consultant (Arch)</option>
                                <option>Consultant (Elec)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                            <input
                                type="date"
                                className="w-full p-2 text-sm border border-gray-300 rounded"
                                required
                                value={newTask.dueDate}
                                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                            <button type="submit" className="btn btn-primary text-xs">Create Action</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Bar */}
            {actions.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            placeholder="Search actions..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <select
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={assigneeFilter}
                        onChange={e => setAssigneeFilter(e.target.value)}
                    >
                        <option value="all">All Assignees</option>
                        {uniqueAssignees.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                    {hasActiveFilters && (
                        <button
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); setAssigneeFilter('all'); }}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2"
                        >
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            )}

            {actions.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No actions have been raised</p>
                    <p className="text-xs text-gray-400">Action items and follow-ups will appear here</p>
                </div>
            ) : filteredActions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-gray-200 rounded-lg">
                    <Filter size={24} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 mb-1">No matching actions found</p>
                    <p className="text-xs text-gray-400">Try adjusting your filters or search query</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left min-w-[640px]">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 w-16">#</th>
                                <th className="px-4 sm:px-6 py-3">Task Description</th>
                                <th className="px-4 sm:px-6 py-3 w-48">Assigned To</th>
                                <th className="px-4 sm:px-6 py-3 w-32">Due Date</th>
                                <th className="px-4 sm:px-6 py-3 w-32 text-center">Status</th>
                                {isAdmin && <th className="px-4 sm:px-6 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredActions.map((action) => (
                                <tr key={action.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 sm:px-6 py-4 text-gray-400">{action.id}</td>
                                    <td className="px-4 sm:px-6 py-4 font-medium text-[var(--color-brand-primary)]">
                                        {action.task}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                            {action.assignedTo}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-gray-500">{action.dueDate}</td>
                                    <td className="px-4 sm:px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleStatus(action.id, action.status)}
                                            className={`transition-transform active:scale-95 ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                            disabled={!isAdmin}
                                            title={isAdmin ? "Click to toggle status" : "Read-only access"}
                                        >
                                            {getStatusBadge(action.status)}
                                        </button>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-4 sm:px-6 py-4 text-center">
                                            <button
                                                onClick={() => confirmDelete(action.id)}
                                                className="text-red-300 hover:text-red-600 transition-colors"
                                                title="Delete Action"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ActionsTab;
