import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { CheckCircle2, Circle, Plus, X, Trash2, Search, ArrowUpDown, Filter } from 'lucide-react';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const ActionsTab = () => {
    const { actions, addAction, updateActionStatus, deleteAction } = useProjectData();
    const { user, isAdmin } = useAuth();
    const toast = useToast();

    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ task: '', assignedTo: '', dueDate: '' });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [actionToDelete, setActionToDelete] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const confirmDelete = (id) => {
        setActionToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (actionToDelete) {
            deleteAction(actionToDelete);
            setActionToDelete(null);
            toast.success('Action deleted.');
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Closed') return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 size={12} /> Closed</span>;
        return <span className="badge badge-neutral ring-1 ring-gray-200 flex items-center gap-1"><Circle size={12} /> Open</span>;
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newTask.task.trim()) {
            toast.warning('Please enter a task description.');
            return;
        }
        addAction(newTask.task, newTask.assignedTo, newTask.dueDate);
        setNewTask({ task: '', assignedTo: '', dueDate: '' });
        setShowForm(false);
        toast.success('Action created successfully.');
    };

    const toggleStatus = (id, currentStatus) => {
        if (!isAdmin) return;
        const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
        updateActionStatus(id, newStatus);
        toast.info(`Action marked as ${newStatus}.`);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedActions = useMemo(() => {
        let result = [...actions];

        if (filterStatus !== 'All') {
            result = result.filter(a => a.status === filterStatus);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                (a.task || '').toLowerCase().includes(q) ||
                (a.assignedTo || '').toLowerCase().includes(q)
            );
        }

        if (sortField) {
            result.sort((a, b) => {
                let valA = a[sortField] || '';
                let valB = b[sortField] || '';
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [actions, filterStatus, searchQuery, sortField, sortDirection]);

    const SortHeader = ({ field, children, className = '' }) => (
        <th
            className={`px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
            onClick={() => handleSort(field)}
        >
            <span className="inline-flex items-center gap-1">
                {children}
                <ArrowUpDown size={12} className={`${sortField === field ? 'text-blue-600' : 'text-gray-300'}`} />
            </span>
        </th>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Actions & Follow-Ups</h2>
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

            {/* Search & Filter Bar */}
            {actions.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search actions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-white"
                        >
                            <option value="All">All Status</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
            )}

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
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

            {actions.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No actions have been raised</p>
                    <p className="text-xs text-gray-400">Action items and follow-ups will appear here</p>
                </div>
            ) : filteredAndSortedActions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border border-gray-200 rounded-lg">
                    <Search size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 mb-1">No actions match your search</p>
                    <p className="text-xs text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <>
                    {(searchQuery || filterStatus !== 'All') && (
                        <p className="text-xs text-gray-400 mb-3">
                            Showing {filteredAndSortedActions.length} of {actions.length} actions
                        </p>
                    )}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-sm text-left min-w-[640px]">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 w-16">#</th>
                                    <SortHeader field="task">Task Description</SortHeader>
                                    <SortHeader field="assignedTo" className="w-48">Assigned To</SortHeader>
                                    <SortHeader field="dueDate" className="w-32">Due Date</SortHeader>
                                    <SortHeader field="status" className="w-32 text-center">Status</SortHeader>
                                    {isAdmin && <th className="px-6 py-3 w-16 text-center"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredAndSortedActions.map((action) => (
                                    <tr key={action.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-400">{action.id}</td>
                                        <td className="px-6 py-4 font-medium text-[var(--color-brand-primary)]">
                                            {action.task}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                                {action.assignedTo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{action.dueDate}</td>
                                        <td className="px-6 py-4 text-center">
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
                                            <td className="px-6 py-4 text-center">
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
                </>
            )}
        </div>
    );
};

export default ActionsTab;
