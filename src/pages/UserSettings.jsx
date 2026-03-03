import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjectData } from '../context/ProjectContext';

const UserSettings = () => {
    const navigate = useNavigate();
    const { user, changePassword, updateProfile } = useAuth();
    const { projects } = useProjectData();

    const [name, setName] = useState(user?.name || '');
    const [nameSaved, setNameSaved] = useState(false);
    const [nameError, setNameError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStatus, setPasswordStatus] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleNameSave = async () => {
        if (!name.trim()) return;
        setNameError('');
        try {
            await updateProfile({ name: name.trim() });
            setNameSaved(true);
            setTimeout(() => setNameSaved(false), 2000);
        } catch (e) {
            setNameError('Failed to update name.');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordStatus('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            return;
        }

        setPasswordStatus('saving');
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordStatus('success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordStatus(''), 3000);
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setPasswordError('Current password is incorrect.');
            } else {
                setPasswordError('Failed to change password. Please try again.');
            }
            setPasswordStatus('');
        }
    };

    const userProjects = projects.filter(p => user?.allowedProjects?.includes(p.id));

    return (
        <div className="container max-w-3xl">
            <div className="mb-6">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>
            </div>

            <h1 className="text-2xl font-bold text-[var(--color-brand-primary)] mb-8">Account Settings</h1>

            {/* Profile Section */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={18} /> Profile
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <button
                                onClick={handleNameSave}
                                disabled={name.trim() === user?.name}
                                className="btn btn-primary text-sm gap-1 disabled:opacity-50"
                            >
                                {nameSaved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
                            </button>
                        </div>
                        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 text-gray-500"
                            value={user?.email || ''}
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 text-gray-500 capitalize"
                            value={(user?.role || 'stakeholder').replace('_', ' ')}
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Projects</label>
                        {userProjects.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {userProjects.map(p => (
                                    <span key={p.id} className="badge badge-neutral text-xs px-3 py-1">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No projects assigned.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock size={18} /> Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {passwordError && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                            {passwordError}
                        </div>
                    )}
                    {passwordStatus === 'success' && (
                        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100">
                            Password changed successfully!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={passwordStatus === 'saving'}
                        className="btn btn-primary text-sm gap-2 disabled:opacity-70"
                    >
                        <Lock size={14} />
                        {passwordStatus === 'saving' ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserSettings;
