import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { db } from '../../config/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_FOLDERS = [
    { id: 'folder-drawings', name: 'Drawings', type: 'folder', items: [] },
    { id: 'folder-rfis', name: 'RFIs & Technical Queries', type: 'folder', items: [] },
    { id: 'folder-reports', name: 'Reports & Inspections', type: 'folder', items: [] },
    { id: 'folder-si', name: 'Site Instructions', type: 'folder', items: [] },
];

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
        image: ''
    });

    const generateSlug = (name) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleNameChange = (name) => {
        setForm(prev => ({
            ...prev,
            name,
            slug: prev.slug === generateSlug(prev.name) || prev.slug === ''
                ? generateSlug(name)
                : prev.slug
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.slug.trim()) return;

        setSaving(true);
        setError('');

        try {
            const projectId = form.slug;
            const projectRef = doc(db, 'projects', projectId);

            await setDoc(projectRef, {
                name: form.name.trim(),
                status: form.status,
                location: form.location.trim(),
                client: form.client.trim(),
                summary: form.summary.trim(),
                focus: form.focus.trim(),
                coordination: form.coordination.trim(),
                image: form.image.trim(),
                teamMembers: [user.uid],
                createdAt: Timestamp.now(),
                createdBy: user.uid,
                lastUpdated: new Date().toISOString().split('T')[0]
            });

            // Initialize default document folders
            await setDoc(doc(db, 'projects', projectId, 'data', 'documents'), {
                structure: DEFAULT_FOLDERS
            });

            navigate(`/project/${projectId}`);
        } catch (err) {
            console.error('Error creating project:', err);
            setError('Failed to create project. The project ID may already exist.');
            setSaving(false);
        }
    };

    return (
        <div className="container max-w-3xl">
            <div className="mb-6">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-lg p-8">
                <h1 className="text-2xl font-bold text-[var(--color-brand-primary)] mb-6">Create New Project</h1>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                                title="Lowercase letters, numbers, and hyphens only"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                                placeholder="south-mall"
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            />
                            <p className="text-xs text-gray-400 mt-1">Used in URLs and as the Firestore document ID</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="e.g. Manurewa, Auckland"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="e.g. Foodstuffs North Island"
                                value={form.client}
                                onChange={e => setForm({ ...form, client: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                rows="3"
                                placeholder="Brief description of the project scope..."
                                value={form.summary}
                                onChange={e => setForm({ ...form, summary: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Focus</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="e.g. Internal fit-out"
                                value={form.focus}
                                onChange={e => setForm({ ...form, focus: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Key Coordination</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="e.g. Public access maintained"
                                value={form.coordination}
                                onChange={e => setForm({ ...form, coordination: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                            <input
                                type="url"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="https://..."
                                value={form.image}
                                onChange={e => setForm({ ...form, image: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn btn-primary text-sm gap-2 disabled:opacity-70">
                            <Save size={16} />
                            {saving ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;
