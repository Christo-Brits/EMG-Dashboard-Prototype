import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { db } from '../../config/firebase';
import { doc, setDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_FOLDERS = [
    { id: 'folder-drawings', name: 'Drawings', type: 'folder', items: [] },
    { id: 'folder-rfis', name: 'RFIs & Technical Queries', type: 'folder', items: [] },
    { id: 'folder-reports', name: 'Reports & Inspections', type: 'folder', items: [] },
    { id: 'folder-si', name: 'Site Instructions', type: 'folder', items: [] },
];

const slugify = (text) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const CreateProject = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        slug: '',
        status: 'Planning',
        location: '',
        client: '',
        summary: '',
        focus: '',
        coordination: '',
        image: '',
    });

    const handleNameChange = (name) => {
        setForm(prev => ({
            ...prev,
            name,
            slug: prev.slug === slugify(prev.name) || prev.slug === '' ? slugify(name) : prev.slug,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.slug.trim()) return;

        setSaving(true);
        setError('');

        const projectId = form.slug;

        try {
            // Create project document
            await setDoc(doc(db, 'projects', projectId), {
                name: form.name.trim(),
                status: form.status,
                location: form.location.trim(),
                client: form.client.trim(),
                summary: form.summary.trim(),
                focus: form.focus.trim(),
                coordination: form.coordination.trim(),
                image: form.image.trim(),
                teamMembers: [user.uid],
                createdAt: new Date(),
                createdBy: user.uid,
                lastUpdated: new Date().toISOString().split('T')[0],
            });

            // Initialize document folder structure
            await setDoc(doc(db, 'projects', projectId, 'data', 'documents'), {
                structure: DEFAULT_FOLDERS,
            });

            // Add project to admin's allowedProjects
            await updateDoc(doc(db, 'users', user.uid), {
                allowedProjects: arrayUnion(projectId),
            });

            navigate(`/project/${projectId}`);
        } catch (err) {
            console.error('Error creating project:', err);
            setError(err.code === 'permission-denied'
                ? 'Permission denied. Only admins can create projects.'
                : 'Failed to create project. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="container max-w-2xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
                >
                    <ArrowLeft size={14} /> Back
                </button>
                <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">Create New Project</h1>
                <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                    Set up a new project on the EMG dashboard.
                </p>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                    <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="e.g. South Mall New World"
                        value={form.name}
                        onChange={e => handleNameChange(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project ID / Slug *</label>
                    <input
                        type="text"
                        required
                        pattern="[a-z0-9-]+"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                        placeholder="south-mall"
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                    />
                    <p className="text-xs text-gray-400 mt-1">Used in the URL. Lowercase letters, numbers, and hyphens only.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                            <option>Planning</option>
                            <option>In Progress</option>
                            <option>Ongoing</option>
                            <option>On Hold</option>
                            <option>Complete</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g. Manurewa, Auckland"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="e.g. Foodstuffs North Island"
                        value={form.client}
                        onChange={e => setForm({ ...form, client: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Summary</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        rows="3"
                        placeholder="Brief description of the project scope"
                        value={form.summary}
                        onChange={e => setForm({ ...form, summary: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Focus</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g. Internal fit-out"
                            value={form.focus}
                            onChange={e => setForm({ ...form, focus: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Coordination</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g. Public access maintained"
                            value={form.coordination}
                            onChange={e => setForm({ ...form, coordination: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL (optional)</label>
                    <input
                        type="url"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="https://..."
                        value={form.image}
                        onChange={e => setForm({ ...form, image: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !form.name.trim() || !form.slug.trim()}
                        className="btn btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {saving ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
