import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
} from 'firebase/auth';
import { roleLabel } from '../utils/permissions';
import { User, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';

const UserSettings = () => {
    const { user, isAdmin, refreshUser } = useAuth();

    // Profile state
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);

    // ---------- Profile save ----------
    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) return;
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            await updateDoc(doc(db, 'users', user.uid), { name: displayName.trim() });
            await refreshUser();
            setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err) {
            console.error('Profile save error:', err);
            setProfileMsg({ type: 'error', text: 'Failed to save profile. Please try again.' });
        }
        setProfileSaving(false);
    };

    // ---------- Change password ----------
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwMsg(null);

        if (newPassword.length < 6) {
            setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwMsg({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setPwSaving(true);
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPwMsg({ type: 'success', text: 'Password changed successfully.' });
        } catch (err) {
            console.error('Password change error:', err);
            let msg = 'Failed to change password.';
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                msg = 'Current password is incorrect.';
            }
            setPwMsg({ type: 'error', text: msg });
        }
        setPwSaving(false);
    };

    // Assigned projects list
    const projects = user?.allowedProjects || [];
    const effectiveRole = isAdmin ? 'Admin' : roleLabel(user?.globalRole);

    return (
        <div className="container max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

            {/* ---- Profile Section ---- */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <User size={20} className="text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                            value={user?.email || ''}
                            readOnly
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Global Role</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={effectiveRole}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projects</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={isAdmin ? 'All (Admin)' : (projects.length ? projects.join(', ') : 'None')}
                                readOnly
                            />
                        </div>
                    </div>

                    {profileMsg && (
                        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {profileMsg.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={profileSaving}
                        className="btn btn-primary gap-2 disabled:opacity-70"
                    >
                        <Save size={16} />
                        {profileSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </section>

            {/* ---- Change Password Section ---- */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Lock size={20} className="text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {pwMsg && (
                        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {pwMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {pwMsg.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={pwSaving}
                        className="btn btn-primary gap-2 disabled:opacity-70"
                    >
                        <Lock size={16} />
                        {pwSaving ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default UserSettings;
