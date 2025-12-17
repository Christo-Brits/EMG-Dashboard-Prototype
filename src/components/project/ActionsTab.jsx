import React, { useState } from 'react';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Circle, Plus, X, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const ActionsTab = () => {
    const { actions, addAction, updateActionStatus, deleteAction } = useProjectData();
    const { user, isAdmin } = useAuth();

    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ task: '', assignedTo: '', dueDate: '' });

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
        addAction(newTask);
        setNewTask({ task: '', assignedTo: '', dueDate: '' });
        setShowForm(false);
    };

    const toggleStatus = (id, currentStatus) => {
        if (!user) return;
        const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
        updateActionStatus(id, newStatus);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Actions & Follow-Ups</h2>
                <div className="flex gap-2">
                    {user && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="btn btn-primary text-sm gap-1"
                        >
                            <Plus size={16} /> Raise Action
                        </button>
                    )}
                    <button className="btn btn-outline text-sm">Export List</button>
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

            {actions.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No actions have been raised</p>
                    <p className="text-xs text-gray-400">Action items and follow-ups will appear here</p>
                </div>
            ) : (
                <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 w-16">#</th>
                                <th className="px-6 py-3">Task Description</th>
                                <th className="px-6 py-3 w-48">Assigned To</th>
                                <th className="px-6 py-3 w-32">Due Date</th>
                                <th className="px-6 py-3 w-32 text-center">Status</th>
                                {isAdmin && <th className="px-6 py-3 w-16 text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {actions.map((action) => (
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
                                            className={`transition-transform active:scale-95 ${user ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                            disabled={!user}
                                            title={user ? "Click to toggle status" : ""}
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
            )}
        </div>
    );
};

export default ActionsTab;
