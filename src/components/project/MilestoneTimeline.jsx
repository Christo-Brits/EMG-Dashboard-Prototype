import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Calendar, Edit2, Trash2, Flag } from 'lucide-react';
import { db } from '../../config/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';

const STATUS_CONFIG = {
    completed: { color: 'bg-green-500', ring: 'ring-green-200', text: 'text-green-700', label: 'Completed' },
    in_progress: { color: 'bg-blue-500', ring: 'ring-blue-200', text: 'text-blue-700', label: 'In Progress' },
    upcoming: { color: 'bg-gray-300', ring: 'ring-gray-100', text: 'text-gray-500', label: 'Upcoming' },
    delayed: { color: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'Delayed' },
};

const MilestoneTimeline = ({ projectId, canEdit }) => {
    const [milestones, setMilestones] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', date: '', status: 'upcoming', notes: '' });

    useEffect(() => {
        if (!projectId) return;
        const unsub = onSnapshot(doc(db, 'projects', projectId), (snap) => {
            if (snap.exists()) {
                const data = snap.data().milestones || [];
                // Sort by date
                data.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
                setMilestones(data);
            }
        });
        return unsub;
    }, [projectId]);

    const saveMilestones = async (updated) => {
        await updateDoc(doc(db, 'projects', projectId), {
            milestones: updated,
            lastUpdated: new Date().toISOString().split('T')[0],
        });
    };

    const handleSave = () => {
        if (!form.title.trim()) return;

        let updated;
        if (editingId !== null) {
            updated = milestones.map(m => m.id === editingId ? { ...m, ...form } : m);
        } else {
            updated = [...milestones, { ...form, id: Date.now() }];
        }

        saveMilestones(updated);
        setForm({ title: '', date: '', status: 'upcoming', notes: '' });
        setShowForm(false);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        saveMilestones(milestones.filter(m => m.id !== id));
    };

    const startEdit = (m) => {
        setForm({ title: m.title, date: m.date, status: m.status, notes: m.notes || '' });
        setEditingId(m.id);
        setShowForm(true);
    };

    const toggleStatus = (id) => {
        const m = milestones.find(ms => ms.id === id);
        if (!m || !canEdit) return;
        const nextStatus = {
            upcoming: 'in_progress',
            in_progress: 'completed',
            completed: 'upcoming',
            delayed: 'in_progress',
        };
        const updated = milestones.map(ms => ms.id === id ? { ...ms, status: nextStatus[ms.status] || 'upcoming' } : ms);
        saveMilestones(updated);
    };

    const today = new Date().toISOString().split('T')[0];
    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-brand-primary)] flex items-center gap-2">
                    <Flag size={18} className="text-[var(--color-accent)]" /> Project Milestones
                </h3>
                {canEdit && !showForm && milestones.length > 0 && (
                    <button onClick={() => { setForm({ title: '', date: '', status: 'upcoming', notes: '' }); setEditingId(null); setShowForm(true); }} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800">
                        <Plus size={14} /> Add Milestone
                    </button>
                )}
            </div>

            {/* Add/Edit form */}
            {showForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">{editingId ? 'Edit Milestone' : 'Add Milestone'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Milestone Title *</label>
                            <input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Foundation Complete" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Target Date</label>
                            <input type="date" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                            <input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="btn btn-primary text-xs gap-1" disabled={!form.title.trim()}><Check size={14} /> {editingId ? 'Update' : 'Add'}</button>
                        <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline text-xs gap-1"><X size={14} /> Cancel</button>
                    </div>
                </div>
            )}

            {milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    <Flag size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm mb-2">No milestones set for this project</p>
                    {canEdit && (
                        <button onClick={() => setShowForm(true)} className="btn btn-primary text-xs gap-1">
                            <Plus size={14} /> Add First Milestone
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Progress bar */}
                    {milestones.length > 1 && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>{completedCount} of {milestones.length} milestones complete</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-200" />

                        <div className="space-y-0">
                            {milestones.map((m, i) => {
                                const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.upcoming;
                                const isOverdue = m.status !== 'completed' && m.date && m.date < today;
                                const effectiveCfg = isOverdue ? STATUS_CONFIG.delayed : cfg;

                                return (
                                    <div key={m.id} className="relative flex gap-4 py-3 group">
                                        {/* Dot */}
                                        <button
                                            onClick={() => toggleStatus(m.id)}
                                            className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full ${effectiveCfg.color} ring-4 ${effectiveCfg.ring} transition-all ${canEdit ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                                            title={canEdit ? 'Click to toggle status' : effectiveCfg.label}
                                        >
                                            {m.status === 'completed' && <Check size={14} className="text-white absolute inset-0 m-auto" />}
                                        </button>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 -mt-0.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`font-medium text-sm ${m.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                    {m.title}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${effectiveCfg.text} bg-opacity-10`} style={{ backgroundColor: `${effectiveCfg.color.replace('bg-', '')}10` }}>
                                                    {isOverdue && m.status !== 'completed' ? 'Overdue' : effectiveCfg.label}
                                                </span>
                                            </div>
                                            {m.date && (
                                                <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                    <Calendar size={10} />
                                                    {new Date(m.date + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            )}
                                            {m.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{m.notes}</p>}
                                        </div>

                                        {/* Edit/Delete (hover) */}
                                        {canEdit && (
                                            <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(m)} className="p-1 text-gray-300 hover:text-gray-500"><Edit2 size={12} /></button>
                                                <button onClick={() => handleDelete(m.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};

export default MilestoneTimeline;
