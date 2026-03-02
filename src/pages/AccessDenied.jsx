import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Mail, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACCESS_REQUEST_EMAIL } from '../data/mockData';

const AccessDenied = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [requestSent, setRequestSent] = useState(false);

    const handleRequestAccess = () => {
        const subject = encodeURIComponent('EMG Portal - Access Request');
        const body = encodeURIComponent(
            `Hi Christo,\n\nI would like to request access to the EMG Project Portal.\n\n` +
            `Name: ${user?.name || 'N/A'}\n` +
            `Email: ${user?.email || 'N/A'}\n\n` +
            `Please grant me access to the relevant project(s).\n\nThank you.`
        );
        window.open(`mailto:${ACCESS_REQUEST_EMAIL}?subject=${subject}&body=${body}`, '_blank');
        setRequestSent(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">

                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldX size={32} />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h1>
                <p className="text-gray-500 mb-6">
                    Your account does not have permission to access this project. Access must be granted by an administrator.
                </p>

                {user && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
                        <p>Signed in as: <strong>{user.email}</strong></p>
                        <p>Role: <strong className="capitalize">{user.role}</strong></p>
                    </div>
                )}

                {!requestSent ? (
                    <button
                        onClick={handleRequestAccess}
                        className="btn btn-primary w-full py-3 gap-2 mb-3"
                    >
                        <Mail size={16} /> Request Access
                    </button>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3 flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-green-800">Request initiated</p>
                            <p className="text-xs text-green-600">An email has been prepared to {ACCESS_REQUEST_EMAIL}. Please send it to complete your request.</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-outline flex-1 py-3 gap-1"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                    <button
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="btn btn-outline flex-1 py-3 text-red-600 border-red-200 hover:bg-red-50"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
