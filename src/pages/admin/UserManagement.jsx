import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import {
    collection, onSnapshot, doc, updateDoc, setDoc, getDoc, query,
    where, getDocs, serverTimestamp, orderBy, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { roleLabel } from '../../utils/permissions';
import {
    Users, Search, Plus, X, CheckCircle, AlertCircle,
    ChevronDown, Mail, Shield, FolderOpen, Clock
} from 'lucide-react';

const GLOBAL_ROLES = ['admin', 'user'];
const PROJECT_ROLES = ['admin', 'project_manager', 'stakeholder', 'viewer'];

const UserManagement = () => {
    const { user: currentUser } = useAuth();

    // ---------- State ----------
    const [allProjects, setAllProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Invite form
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('user');
    const [inviteProjects, setInviteProjects] = useState([]);
    const [inviteProjectRoles, setInviteProjectRoles] = useState({});
    const [inviting, setInviting] = useState(false);

    // ---------- Real-time subscriptions ----------
    useEffect(() => {
        const unsub1 = onSnapshot(
            collection(db, 'users'),
            (snap) => {
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || a.createdAt?.getTime?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || b.createdAt?.getTime?.() || 0;
                    return bTime - aTime;
                });
                setUsers(data);
            },
            (err) => console.error('Users subscription error:', err),
        );

        const unsub2 = onSnapshot(
            query(collection(db, 'pending_invites'), where('status', '==', 'pending')),
            (snap) => setPendingInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error('Invites subscription error:', err),
        );

        const unsub3 = onSnapshot(
            collection(db, 'projects'),
            (snap) => setAllProjects(snap.docs.map((d) => ({ id: d.id, name: d.data().name || d.id }))),
            (err) => console.error('Projects subscription error:', err),
        );

        const unsub4 = onSnapshot(
            query(collection(db, 'access_requests'), where('status', '==', 'pending')),
            (snap) => setAccessRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            (err) => console.error('Access requests subscription error:', err),
        );

        return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
    }, []);

    // ---------- Filtered users ----------
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const lower = searchTerm.toLowerCase();
        return users.filter(
            (u) =>
                (u.name || '').toLowerCase().includes(lower) ||
                (u.email || '').toLowerCase().includes(lower),
        );
    }, [users, searchTerm]);

    // ---------- Helpers ----------
    const flash = (type, text) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 4000);
    };

    // ---------- Access requests ----------
    const handleAccessRequest = async (req, action) => {
        try {
            await updateDoc(doc(db, 'access_requests', req.id), { status: action, reviewedAt: serverTimestamp() });
            if (action === 'approved' && req.userId) {
                // Try to find the user in local state first
                let existingUser = users.find((u) => u.id === req.userId);

                if (!existingUser) {
                    // User doc may not exist yet — fetch or create it
                    const userRef = doc(db, 'users', req.userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        existingUser = { id: userSnap.id, ...userSnap.data() };
                    } else {
                        // Create a basic user doc so we can assign projects
                        const newUserData = {
                            email: req.email,
                            name: req.name || req.email.split('@')[0],
                            globalRole: 'user',
                            projectRoles: {},
                            allowedProjects: [],
                            createdAt: serverTimestamp(),
                        };
                        await setDoc(userRef, newUserData);
                        existingUser = { id: req.userId, ...newUserData };
                    }
                }

                if (existingUser) openEdit(existingUser);
            }
            flash('success', action === 'approved'
                ? `Request from ${req.email} approved. Assign projects below.`
                : `Request from ${req.email} denied.`);
        } catch (err) {
            console.error('Access request error:', err);
            flash('error', 'Failed to process request.');
        }
    };

    // ---------- Edit user ----------
    const openEdit = (u) => {
        setEditingUser({
            ...u,
            _globalRole: u.globalRole || 'user',
            _allowedProjects: [...(u.allowedProjects || [])],
            _projectRoles: { ...(u.projectRoles || {}) },
        });
    };

    const saveEdit = async () => {
        if (!editingUser) return;
        try {
            const oldProjects = editingUser.allowedProjects || [];
            const newProjects = editingUser._allowedProjects;

            await updateDoc(doc(db, 'users', editingUser.id), {
                globalRole: editingUser._globalRole,
                allowedProjects: newProjects,
                projectRoles: editingUser._projectRoles,
            });

            // Dual sync: update teamMembers on project docs
            const added = newProjects.filter((p) => !oldProjects.includes(p));
            const removed = oldProjects.filter((p) => !newProjects.includes(p));
            await Promise.all([
                ...added.map((pid) => updateDoc(doc(db, 'projects', pid), { teamMembers: arrayUnion(editingUser.id) })),
                ...removed.map((pid) => updateDoc(doc(db, 'projects', pid), { teamMembers: arrayRemove(editingUser.id) })),
            ]);

            flash('success', `Updated ${editingUser.email}.`);
            setEditingUser(null);
        } catch (err) {
            console.error('Save user error:', err);
            flash('error', 'Failed to save changes.');
        }
    };

    const toggleProject = (pid) => {
        setEditingUser((prev) => {
            const has = prev._allowedProjects.includes(pid);
            const projects = has
                ? prev._allowedProjects.filter((p) => p !== pid)
                : [...prev._allowedProjects, pid];
            const roles = { ...prev._projectRoles };
            if (has) delete roles[pid];
            else roles[pid] = roles[pid] || 'stakeholder';
            return { ...prev, _allowedProjects: projects, _projectRoles: roles };
        });
    };

    // ---------- Invite user ----------
    const handleInvite = async (e) => {
        e.preventDefault();
        const email = inviteEmail.trim().toLowerCase();
        if (!email) return;
        setInviting(true);
        try {
            // Check if user already exists
            const existingUser = users.find((u) => u.email?.toLowerCase() === email);

            if (existingUser) {
                // Update existing user doc directly
                const merged = [...new Set([...(existingUser.allowedProjects || []), ...inviteProjects])];
                const mergedRoles = { ...(existingUser.projectRoles || {}), ...inviteProjectRoles };
                await updateDoc(doc(db, 'users', existingUser.id), {
                    allowedProjects: merged,
                    projectRoles: mergedRoles,
                    ...(inviteRole === 'admin' ? { globalRole: 'admin' } : {}),
                });
                // Dual sync: add user to project teamMembers
                const newlyAdded = inviteProjects.filter((p) => !(existingUser.allowedProjects || []).includes(p));
                await Promise.all(newlyAdded.map((pid) =>
                    updateDoc(doc(db, 'projects', pid), { teamMembers: arrayUnion(existingUser.id) })
                ));
                flash('success', `Updated existing user ${email}.`);
            } else {
                // Create pending invite
                const invRef = doc(collection(db, 'pending_invites'));
                await setDoc(invRef, {
                    email,
                    globalRole: inviteRole,
                    projects: inviteProjects,
                    projectRoles: inviteProjectRoles,
                    invitedBy: currentUser.email,
                    invitedAt: serverTimestamp(),
                    status: 'pending',
                });
                flash('success', `Invite created for ${email}. They will receive access on sign-up.`);
            }

            // Reset invite form
            setInviteEmail('');
            setInviteRole('user');
            setInviteProjects([]);
            setInviteProjectRoles({});
            setShowInvite(false);
        } catch (err) {
            console.error('Invite error:', err);
            flash('error', 'Failed to send invite.');
        }
        setInviting(false);
    };

    const toggleInviteProject = (pid) => {
        setInviteProjects((prev) => {
            const has = prev.includes(pid);
            if (has) {
                setInviteProjectRoles((r) => { const n = { ...r }; delete n[pid]; return n; });
                return prev.filter((p) => p !== pid);
            }
            setInviteProjectRoles((r) => ({ ...r, [pid]: 'stakeholder' }));
            return [...prev, pid];
        });
    };

    return (
        <div className="container max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Users size={24} className="text-gray-500" />
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{users.length}</span>
                </div>
                <button onClick={() => setShowInvite(!showInvite)} className="btn btn-primary gap-2">
                    <Plus size={16} /> Invite User
                </button>
            </div>

            {/* Feedback banner */}
            {feedback && (
                <div className={`mb-4 flex items-center gap-2 text-sm p-3 rounded-lg border ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {feedback.text}
                </div>
            )}

            {/* Invite form */}
            {showInvite && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Invite New User</h2>
                        <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="user@company.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Global Role</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    {GLOBAL_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Projects</label>
                            <div className="space-y-2">
                                {allProjects.map((proj) => (
                                    <div key={proj.id} className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={inviteProjects.includes(proj.id)}
                                                onChange={() => toggleInviteProject(proj.id)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">{proj.name}</span>
                                        </label>
                                        {inviteProjects.includes(proj.id) && (
                                            <select
                                                className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                                value={inviteProjectRoles[proj.id] || 'stakeholder'}
                                                onChange={(e) => setInviteProjectRoles((r) => ({ ...r, [proj.id]: e.target.value }))}
                                            >
                                                {PROJECT_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={inviting} className="btn btn-primary gap-2 disabled:opacity-70">
                            <Mail size={16} />
                            {inviting ? 'Sending...' : 'Send Invite'}
                        </button>
                    </form>
                </div>
            )}

            {/* Pending invites */}
            {pendingInvites.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-amber-600" />
                        <h3 className="text-sm font-semibold text-amber-800">Pending Invites ({pendingInvites.length})</h3>
                    </div>
                    <div className="space-y-2">
                        {pendingInvites.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between text-sm bg-white rounded-lg p-3 border border-amber-100">
                                <div className="flex items-center gap-3">
                                    <Mail size={14} className="text-amber-500" />
                                    <span className="font-medium text-gray-800">{inv.email}</span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-gray-500">{(inv.projects || []).join(', ') || 'No projects'}</span>
                                </div>
                                <span className="text-xs text-gray-400">Invited by {inv.invitedBy}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Access requests */}
            {accessRequests.length > 0 && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Users size={16} className="text-blue-600" />
                        <h3 className="text-sm font-semibold text-blue-800">Access Requests ({accessRequests.length})</h3>
                    </div>
                    <div className="space-y-2">
                        {accessRequests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between text-sm bg-white rounded-lg p-3 border border-blue-100">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-800">{req.name || req.email}</span>
                                        <span className="text-gray-400 text-xs">{req.email}</span>
                                    </div>
                                    {req.message && <p className="text-xs text-gray-500 mt-1">{req.message}</p>}
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleAccessRequest(req, 'approved')}
                                        className="text-xs font-medium text-green-600 hover:text-green-800 bg-green-50 px-2.5 py-1 rounded border border-green-200"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAccessRequest(req, 'denied')}
                                        className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded border border-red-200"
                                    >
                                        Deny
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Projects</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{u.name || u.email?.split('@')[0] || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${u.globalRole === 'admin' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {u.globalRole === 'admin' && <Shield size={12} />}
                                            {roleLabel(u.globalRole)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {u.globalRole === 'admin'
                                            ? <span className="text-xs text-gray-400">All (Admin)</span>
                                            : (u.allowedProjects?.length
                                                ? u.allowedProjects.map((pid) => (
                                                    <span key={pid} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mr-1 mb-1">
                                                        <FolderOpen size={12} />
                                                        {pid}
                                                        <span className="text-blue-400">({roleLabel(u.projectRoles?.[pid])})</span>
                                                    </span>
                                                ))
                                                : <span className="text-xs text-gray-400">None</span>
                                            )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => openEdit(u)}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm font-medium text-gray-900">{editingUser.name || editingUser.email?.split('@')[0]}</div>
                            <div className="text-xs text-gray-400">{editingUser.email}</div>
                        </div>

                        {/* Global role */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Global Role</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2.5"
                                value={editingUser._globalRole}
                                onChange={(e) => setEditingUser((prev) => ({ ...prev, _globalRole: e.target.value }))}
                            >
                                {GLOBAL_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                            </select>
                        </div>

                        {/* Project assignments */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Access</label>
                            <div className="space-y-2">
                                {allProjects.map((proj) => (
                                    <div key={proj.id} className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editingUser._allowedProjects.includes(proj.id)}
                                                onChange={() => toggleProject(proj.id)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">{proj.name}</span>
                                        </label>
                                        {editingUser._allowedProjects.includes(proj.id) && (
                                            <select
                                                className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                                value={editingUser._projectRoles[proj.id] || 'stakeholder'}
                                                onChange={(e) =>
                                                    setEditingUser((prev) => ({
                                                        ...prev,
                                                        _projectRoles: { ...prev._projectRoles, [proj.id]: e.target.value },
                                                    }))
                                                }
                                            >
                                                {PROJECT_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditingUser(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
                            <button onClick={saveEdit} className="btn btn-primary">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
