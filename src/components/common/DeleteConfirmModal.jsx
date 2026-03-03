import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, itemType }) => {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Please enter your password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);
            onConfirm();
            onClose();
            setPassword('');
            setError('');
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Incorrect password. Please try again.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait and try again.');
            } else {
                setError('Authentication failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden transform transition-all scale-100">
                <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-full text-red-600 flex-shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-800">Confirm Deletion</h3>
                        <p className="text-sm text-red-600 mt-1">
                            Are you sure you want to delete this {itemType}? This action cannot be undone.
                        </p>
                    </div>
                    <button onClick={handleClose} className="text-red-400 hover:text-red-700 ml-auto">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleConfirm} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm your password to proceed
                        </label>
                        <input
                            type="password"
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-300 ring-red-200' : 'border-gray-300 focus:ring-red-200 focus:border-red-500'}`}
                            placeholder="Enter your account password..."
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            autoFocus
                            disabled={loading}
                        />
                        {error && <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                            <X size={12} /> {error}
                        </p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={14} className="animate-spin" /> Verifying...</>
                            ) : (
                                'Confirm Delete'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
