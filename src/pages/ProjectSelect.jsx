import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Building2, MapPin, ArrowRight, Clock, FolderOpen, Loader2, PlusCircle, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjectData } from '../context/ProjectContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ProjectSelect = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { projects, projectsLoading } = useProjectData();
    const [requestSent, setRequestSent] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleRequestAccess = async () => {
        setSending(true);
        try {
            await addDoc(collection(db, 'access_requests'), {
                userId: user.uid,
                email: user.email,
                name: user.name || user.email?.split('@')[0],
                message: requestMessage.trim(),
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            setRequestSent(true);
        } catch (err) {
            console.error('Error sending access request:', err);
        }
        setSending(false);
    };

    // Auto-redirect if user has exactly 1 project
    if (!projectsLoading && projects.length === 1 && !isAdmin) {
        return <Navigate to={`/project/${projects[0].id}`} replace />;
    }

    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'badge-success';
            case 'Planning': return 'badge-warning';
            case 'On Hold': return 'badge-warning';
            case 'Ongoing': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="container max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">
                    Welcome, {displayName}
                </h1>
                <p className="text-[var(--color-text-secondary)]">Select a project to view updates and documentation.</p>
            </div>

            {isAdmin && (
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/admin/projects/new')}
                        className="btn btn-primary gap-2 text-sm"
                    >
                        <PlusCircle size={16} /> Create New Project
                    </button>
                </div>
            )}

            {projectsLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <FolderOpen size={28} className="text-gray-300" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">No Projects Assigned</h2>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                        You don't have access to any projects yet. Send a request to your administrator.
                    </p>
                    {requestSent ? (
                        <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                            <CheckCircle size={16} /> Access request sent. An admin will review it shortly.
                        </div>
                    ) : (
                        <div className="max-w-sm mx-auto space-y-3">
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                rows="2"
                                placeholder="Optional message (e.g. which project you need access to)"
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                            />
                            <button
                                onClick={handleRequestAccess}
                                disabled={sending}
                                className="btn btn-primary gap-2 text-sm disabled:opacity-70"
                            >
                                <Send size={14} /> {sending ? 'Sending...' : 'Request Access'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="card hover:shadow-md transition-all cursor-pointer border-l-4 border-l-[var(--color-accent)] group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-semibold text-[var(--color-brand-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                                            {project.name}
                                        </h3>
                                        <span className={`badge ${getStatusColor(project.status)}`}>{project.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                                        {project.location && (
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {project.location}</span>
                                        )}
                                        {project.lastUpdated && (
                                            <span className="flex items-center gap-1"><Clock size={14} /> Updated {project.lastUpdated}</span>
                                        )}
                                    </div>
                                    {project.summary && (
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{project.summary}</p>
                                    )}
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-[var(--color-accent)] transition-colors mt-1 flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectSelect;
