import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, UserPlus, Shield, ChevronDown, X, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    query,
    where,
    getDocs,
    addDoc,
    Timestamp,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useProjectData } from '../../context/ProjectContext';

const ROLES = ['admin', 'project_manager', 'stakeholder'];

const UserManagement = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { projects } = useProjectData();

    const [users, setUsers] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'stakeholder', projects: [] });
    const [inviteStatus, setInviteStatus] = useState('');

    // Subscribe to users collection
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            const data = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
            setUsers(data);
        });
        return unsub;
    }, []);

    // Subscribe to access requests
    useEffect(() => {
        const q = query(collection(db, 'access_requests'), where('status', '==', 'pending'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setAccessRequests(data);
        });
        return unsub;
    }, []);

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (uid, newRole) => {
        try {
            await updateDoc(doc(db, 'users', uid), { role: newRole });
        } catch (e) {
            console.error('Error updating role:', e);
        }
    };

    const handleProjectToggle = async (uid, projectId, currentProjects) => {
        const hasProject = currentProjects?.includes(projectId);
        try {
            if (hasProject) {
                await updateDoc(doc(db, 'users', uid), {
                    allowedProjects: arrayRemove(projectId)
                });
                await updateDoc(doc(db, 'projects', projectId), {
                    teamMembers: arrayRemove(uid)
                });
            } else {
                await updateDoc(doc(db, 'users', uid), {
                    allowedProjects: arrayUnion(projectId)
                });
                await updateDoc(doc(db, 'projects', projectId), {
                    teamMembers: arrayUnion(uid)
                });
            }
        } catch (e) {
            console.error('Error toggling project:', e);
        }
    };

    // --- Invite User (Phase 5.3) ---
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteForm.email.trim()) return;

        setInviteStatus('sending');

        try {
            // Check if user already exists
            const existingUsers = users.filter(u =>
                u.email?.toLowerCase() === inviteForm.email.toLowerCase()
            );

            if (existingUsers.length > 0) {
                // User exists — assign projects directly
                const existingUser = existingUsers[0];
                for (const pid of inviteForm.projects) {
                    await updateDoc(doc(db, 'users', existingUser.uid), {
                        allowedProjects: arrayUnion(pid)
                    });
                    await updateDoc(doc(db, 'projects', pid), {
                        teamMembers: arrayUnion(existingUser.uid)
                    });
                }
                if (inviteForm.role !== existingUser.role) {
                    await updateDoc(doc(db, 'users', existingUser.uid), {
                        role: inviteForm.role
                    });
                }
                setInviteStatus('success-existing');
            } else {
                // User doesn't exist — create pending invite
                await addDoc(collection(db, 'pending_invites'), {
                    email: inviteForm.email.toLowerCase().trim(),
                    projects: inviteForm.projects,
                    role: inviteForm.role,
                    invitedBy: currentUser.uid,
                    invitedAt: Timestamp.now(),
                    status: 'pending'
                });
                setInviteStatus('success-pending');
            }

            setTimeout(() => {
                setShowInvite(false);
                setInviteForm({ email: '', role: 'stakeholder', projects: [] });
                setInviteStatus('');
            }, 2000);
        } catch (err) {
            console.error('Error inviting user:', err);
            setInviteStatus('error');
        }
    };

    const toggleInviteProject = (pid) => {
        setInviteForm(prev => ({
            ...prev,
            projects: prev.projects.includes(pid)
                ? prev.projects.filter(p => p !== pid)
                : [...prev.projects, pid]
        }));
    };

    // --- Access Requests (Phase 5.4) ---
    const handleApproveRequest = async (request) => {
        try {
            await updateDoc(doc(db, 'users', request.userId), {
                allowedProjects: arrayUnion(request.projectId)
            });
            await updateDoc(doc(db, 'projects', request.projectId), {
                teamMembers: arrayUnion(request.userId)
            });
            await updateDoc(doc(db, 'access_requests', request.id), {
                status: 'approved',
                reviewedBy: currentUser.uid,
                reviewedAt: Timestamp.now()
            });
        } catch (e) {
            console.error('Error approving request:', e);
        }
    };

    const handleDenyRequest = async (request) => {
        try {
            await updateDoc(doc(db, 'access_requests', request.id), {
                status: 'denied',
                reviewedBy: currentUser.uid,
                reviewedAt: Timestamp.now()
            });
        } catch (e) {
            console.error('Error denying request:', e);
        }
    };

    return (
        <div className="container max-w-6xl">
            <div className="mb-6">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">User Management</h1>
                    <p className="text-[var(--color-text-secondary)]">{users.length} registered users</p>
                </div>
                <button onClick={() => setShowInvite(true)} className="btn btn-primary text-sm gap-2">
                    <UserPlus size={16} /> Invite User
                </button>
            </div>

            {/* Access Requests Section */}
            {accessRequests.length > 0 && (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} />
                        Pending Access Requests ({accessRequests.length})
                    </h2>
                    <div className="space-y-3">
                        {accessRequests.map(req => (
                            <div key={req.id} className="bg-white border border-amber-100 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">{req.userEmail}</p>
                                    <p className="text-sm text-gray-500">
                                        Requesting access to <span className="font-medium">{req.projectName}</span>
                                        {req.reason && <span className="italic"> &mdash; "{req.reason}"</span>}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApproveRequest(req)}
                                        className="btn btn-primary text-xs gap-1"
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleDenyRequest(req)}
                                        className="btn btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        Deny
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInvite && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800">Invite User</h3>
                            <button onClick={() => { setShowInvite(false); setInviteStatus(''); }} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="user@company.com"
                                    value={inviteForm.email}
                                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={inviteForm.role}
                                    onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Projects</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                    {projects.map(p => (
                                        <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inviteForm.projects.includes(p.id)}
                                                onChange={() => toggleInviteProject(p.id)}
                                                className="rounded"
                                            />
                                            {p.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {inviteStatus === 'success-existing' && (
                                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100">
                                    User found and projects assigned!
                                </div>
                            )}
                            {inviteStatus === 'success-pending' && (
                                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg border border-blue-100">
                                    Invite created! The user will be assigned when they sign up.
                                </div>
                            )}
                            {inviteStatus === 'error' && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                    Failed to send invite. Please try again.
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => { setShowInvite(false); setInviteStatus(''); }} className="btn btn-outline text-sm">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteStatus === 'sending' || inviteForm.projects.length === 0}
                                    className="btn btn-primary text-sm gap-2 disabled:opacity-70"
                                >
                                    <UserPlus size={16} />
                                    {inviteStatus === 'sending' ? 'Sending...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3 w-40">Role</th>
                            <th className="px-6 py-3">Projects</th>
                            <th className="px-6 py-3 w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{u.name || 'Unnamed'}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={u.role || 'stakeholder'}
                                        onChange={e => handleRoleChange(u.uid, e.target.value)}
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    {editingUser === u.uid ? (
                                        <div className="space-y-1">
                                            {projects.map(p => (
                                                <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={u.allowedProjects?.includes(p.id) || false}
                                                        onChange={() => handleProjectToggle(u.uid, p.id, u.allowedProjects)}
                                                        className="rounded"
                                                    />
                                                    {p.name}
                                                </label>
                                            ))}
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {u.allowedProjects?.length > 0 ? (
                                                u.allowedProjects.map(pid => {
                                                    const proj = projects.find(p => p.id === pid);
                                                    return (
                                                        <span key={pid} className="badge badge-neutral text-xs">
                                                            {proj?.name || pid}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs text-gray-400">No projects</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => setEditingUser(editingUser === u.uid ? null : u.uid)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        {editingUser === u.uid ? 'Close' : 'Edit Projects'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        {searchTerm ? 'No users match your search.' : 'No users registered yet.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
