import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PROJECTS } from '../data/mockData';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const AdminPanel = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('requests');

    useEffect(() => {
        if (!isAdmin) return;

        const usersRef = collection(db, 'users');
        const unsubUsers = onSnapshot(usersRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
            setUsers(data);
        }, (err) => console.error("Users sync error:", err));

        const requestsRef = collection(db, 'accessRequests');
        const unsubRequests = onSnapshot(requestsRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setAccessRequests(data);
        }, (err) => console.error("Requests sync error:", err));

        return () => {
            unsubUsers();
            unsubRequests();
        };
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="container max-w-4xl text-center py-16">
                <Shield size={48} className="text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-600">Admin Access Required</h2>
                <p className="text-gray-400 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    const handleApproveUser = async (uid) => {
        try {
            await updateDoc(doc(db, 'users', uid), { approved: true });
        } catch (e) {
            console.error("Error approving user:", e);
        }
    };

    const handleRevokeUser = async (uid) => {
        try {
            await updateDoc(doc(db, 'users', uid), { approved: false, allowedProjects: [] });
        } catch (e) {
            console.error("Error revoking user:", e);
        }
    };

    const handleToggleProject = async (uid, projectId) => {
        const targetUser = users.find(u => u.uid === uid);
        if (!targetUser) return;

        const currentProjects = targetUser.allowedProjects || [];
        const updatedProjects = currentProjects.includes(projectId)
            ? currentProjects.filter(p => p !== projectId)
            : [...currentProjects, projectId];

        try {
            await updateDoc(doc(db, 'users', uid), { allowedProjects: updatedProjects });
        } catch (e) {
            console.error("Error updating projects:", e);
        }
    };

    const handleApproveRequest = async (request) => {
        try {
            // Approve the user and grant requested project
            const userRef = doc(db, 'users', request.userId);
            const targetUser = users.find(u => u.uid === request.userId);
            const currentProjects = targetUser?.allowedProjects || [];
            const updatedProjects = request.projectId && !currentProjects.includes(request.projectId)
                ? [...currentProjects, request.projectId]
                : currentProjects;

            await updateDoc(userRef, {
                approved: true,
                allowedProjects: updatedProjects
            });

            // Remove the request
            await deleteDoc(doc(db, 'accessRequests', request.id));
        } catch (e) {
            console.error("Error approving request:", e);
        }
    };

    const handleDenyRequest = async (requestId) => {
        try {
            await deleteDoc(doc(db, 'accessRequests', requestId));
        } catch (e) {
            console.error("Error denying request:", e);
        }
    };

    const pendingRequests = accessRequests.filter(r => r.status !== 'approved');
    const regularUsers = users.filter(u => u.role !== 'admin');

    return (
        <div className="container max-w-5xl">
            <div className="mb-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1"
                >
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-brand-primary)] flex items-center gap-3">
                    <Shield size={24} /> User Management
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Manage user access, approve requests, and assign projects.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="card flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Users size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{users.length}</div>
                        <div className="text-xs text-gray-500">Total Users</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{regularUsers.filter(u => u.approved).length}</div>
                        <div className="text-xs text-gray-500">Approved Users</div>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <Clock size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--color-brand-primary)]">{pendingRequests.length}</div>
                        <div className="text-xs text-gray-500">Pending Requests</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'requests'
                        ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Access Requests {pendingRequests.length > 0 && (
                        <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users'
                        ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    All Users ({regularUsers.length})
                </button>
            </div>

            {/* Access Requests Tab */}
            {activeTab === 'requests' && (
                <div>
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 border border-gray-200 rounded-lg">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={28} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">No pending access requests</p>
                            <p className="text-xs text-gray-400">New requests will appear here when users request project access</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map((request) => {
                                const projectName = PROJECTS.find(p => p.id === request.projectId)?.name || request.projectId || 'General Access';
                                return (
                                    <div key={request.id} className="card border-l-4 border-l-amber-400">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="badge badge-warning">Pending</span>
                                                    <span className="text-sm font-semibold text-[var(--color-brand-primary)]">{request.userEmail}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Requesting access to <strong>{projectName}</strong>
                                                    {request.userName && <> &bull; Name: {request.userName}</>}
                                                </p>
                                                {request.createdAt && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Submitted {new Date(request.createdAt.seconds * 1000).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveRequest(request)}
                                                    className="btn btn-primary text-xs gap-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle2 size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleDenyRequest(request.id)}
                                                    className="btn btn-outline text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <XCircle size={14} /> Deny
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* All Users Tab */}
            {activeTab === 'users' && (
                <div>
                    {regularUsers.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 border border-gray-200 rounded-lg">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Users size={28} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">No users registered yet</p>
                            <p className="text-xs text-gray-400">Users will appear here after they sign up</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {regularUsers.map((u) => (
                                <div key={u.uid} className="card border-gray-200">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedUser(expandedUser === u.uid ? null : u.uid)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${u.approved ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                {(u.name || u.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--color-brand-primary)]">
                                                    {u.name || u.email}
                                                </div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`badge ${u.approved ? 'badge-success' : 'badge-neutral'}`}>
                                                {u.approved ? 'Approved' : 'Pending'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {(u.allowedProjects || []).length} project{(u.allowedProjects || []).length !== 1 ? 's' : ''}
                                            </span>
                                            {expandedUser === u.uid ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                        </div>
                                    </div>

                                    {expandedUser === u.uid && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            {/* Approval Toggle */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm font-medium text-gray-700">Account Status</span>
                                                <div className="flex gap-2">
                                                    {!u.approved ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleApproveUser(u.uid); }}
                                                            className="btn text-xs gap-1 bg-green-600 text-white hover:bg-green-700"
                                                        >
                                                            <CheckCircle2 size={12} /> Approve
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRevokeUser(u.uid); }}
                                                            className="btn text-xs gap-1 text-red-600 border border-red-200 hover:bg-red-50"
                                                        >
                                                            <XCircle size={12} /> Revoke Access
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Project Access */}
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 block mb-2">Project Access</span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {PROJECTS.map(project => {
                                                        const hasAccess = (u.allowedProjects || []).includes(project.id);
                                                        return (
                                                            <label
                                                                key={project.id}
                                                                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${hasAccess ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hasAccess}
                                                                    onChange={() => handleToggleProject(u.uid, project.id)}
                                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                                                />
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-700">{project.name}</div>
                                                                    <div className="text-xs text-gray-400">{project.status}</div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
