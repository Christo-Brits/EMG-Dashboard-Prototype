import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EditProject = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        status: 'Planning',
        location: '',
        client: '',
        summary: '',
        focus: '',
        coordination: '',
        image: ''
    });

    useEffect(() => {
        const loadProject = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'projects', projectId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setForm({
                        name: data.name || '',
                        status: data.status || 'Planning',
                        location: data.location || '',
                        client: data.client || '',
                        summary: data.summary || '',
                        focus: data.focus || '',
                        coordination: data.coordination || '',
                        image: data.image || ''
                    });
                } else {
                    setError('Project not found.');
                }
            } catch (err) {
                console.error('Error loading project:', err);
                setError('Failed to load project.');
            }
            setLoading(false);
        };
        loadProject();
    }, [projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        setSaving(true);
        setError('');

        try {
            await updateDoc(doc(db, 'projects', projectId), {
                name: form.name.trim(),
                status: form.status,
                location: form.location.trim(),
                client: form.client.trim(),
                summary: form.summary.trim(),
                focus: form.focus.trim(),
                coordination: form.coordination.trim(),
                image: form.image.trim(),
                lastUpdated: new Date().toISOString().split('T')[0]
            });

            navigate(`/project/${projectId}`);
        } catch (err) {
            console.error('Error updating project:', err);
            setError('Failed to update project.');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container max-w-3xl">
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-3xl">
            <div className="mb-6">
                <button onClick={() => navigate(`/project/${projectId}`)} className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Project
                </button>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-lg p-8">
                <h1 className="text-2xl font-bold text-[var(--color-brand-primary)] mb-2">Edit Project</h1>
                <p className="text-sm text-gray-500 mb-6">Project ID: <span className="font-mono">{projectId}</span></p>

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
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
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
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={form.client}
                                onChange={e => setForm({ ...form, client: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                rows="3"
                                value={form.summary}
                                onChange={e => setForm({ ...form, summary: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Focus</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={form.focus}
                                onChange={e => setForm({ ...form, focus: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Key Coordination</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={form.coordination}
                                onChange={e => setForm({ ...form, coordination: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                            <input
                                type="url"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={form.image}
                                onChange={e => setForm({ ...form, image: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => navigate(`/project/${projectId}`)} className="btn btn-outline text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn btn-primary text-sm gap-2 disabled:opacity-70">
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProject;
