import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock, AlertCircle, X, Mail, CheckCircle2 } from 'lucide-react';
import { PROJECTS, ACCESS_REQUEST_EMAIL } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const ProjectSelect = () => {
    const navigate = useNavigate();
    const { user, isAdmin, hasProjectAccess, logout } = useAuth();
    const [selectedProject, setSelectedProject] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const handleContinue = () => {
        if (!selectedProject) return;

        const project = PROJECTS.find(p => p.id === selectedProject);

        if (project?.active) {
            if (user) {
                if (hasProjectAccess(selectedProject)) {
                    navigate(`/project/${selectedProject}`);
                } else {
                    setShowPopup(true);
                }
            } else {
                navigate(`/login/${selectedProject}`);
            }
        } else {
            setShowPopup(true);
        }
    };

    const handleRequestAccess = () => {
        const projectName = PROJECTS.find(p => p.id === selectedProject)?.name || selectedProject;
        const subject = encodeURIComponent(`EMG Portal - Access Request: ${projectName}`);
        const body = encodeURIComponent(
            `Hi Christo,\n\nI would like to request access to the following project on the EMG Portal:\n\n` +
            `Project: ${projectName}\n` +
            `Name: ${user?.name || 'N/A'}\n` +
            `Email: ${user?.email || 'N/A'}\n\n` +
            `Please review and grant me access.\n\nThank you.`
        );
        window.open(`mailto:${ACCESS_REQUEST_EMAIL}?subject=${subject}&body=${body}`, '_blank');
        setRequestSent(true);
    };

    const selectedProjectData = PROJECTS.find(p => p.id === selectedProject);
    const buttonLabel = !selectedProject
        ? 'Select a Project'
        : selectedProjectData?.active
            ? (user ? 'Continue to Project' : 'Continue to Login')
            : 'Request Access';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

                <div className="mb-8 flex flex-col items-center">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-14 w-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Project Portal</h1>
                    <p className="text-gray-500 text-sm mt-2 text-center">Select your project to access site updates and documentation.</p>
                </div>

                {user && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center justify-between">
                        <div className="text-sm">
                            <span className="text-blue-700">Signed in as </span>
                            <strong className="text-blue-800">{user.email}</strong>
                            {isAdmin && <span className="ml-2 bg-slate-800 text-white text-xs font-medium px-2 py-0.5 rounded">Admin</span>}
                        </div>
                        <button
                            onClick={async () => { await logout(); }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Project</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                                value={selectedProject}
                                onChange={(e) => { setSelectedProject(e.target.value); setRequestSent(false); }}
                            >
                                <option value="" disabled>Select a project...</option>
                                {PROJECTS.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}{!p.active ? ' (Restricted)' : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={!selectedProject}
                        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${selectedProject ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        {buttonLabel}
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock size={12} />
                    <span>Secure Connection &bull; EMG Client Services</span>
                </div>
            </div>

            {/* Access Request Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center relative">
                        <button onClick={() => { setShowPopup(false); setRequestSent(false); }} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
                            <X size={20} />
                        </button>
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Access Required</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedProjectData?.active
                                ? <>Your account does not have access to <strong>{selectedProjectData?.name}</strong>.</>
                                : <>The portal for <strong>{selectedProjectData?.name}</strong> is currently restricted to authorized stakeholders only.</>
                            }
                        </p>
                        <p className="text-xs text-gray-400 mb-6">
                            To request access, an email will be sent to the project administrator for approval.
                        </p>

                        {!requestSent ? (
                            <button
                                onClick={handleRequestAccess}
                                className="btn btn-primary w-full text-sm gap-2 mb-3"
                            >
                                <Mail size={14} /> Request Access via Email
                            </button>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                                <p className="text-xs text-green-700 text-left">
                                    Email prepared to <strong>{ACCESS_REQUEST_EMAIL}</strong>. Please send it to complete your request.
                                </p>
                            </div>
                        )}

                        <button onClick={() => { setShowPopup(false); setRequestSent(false); }} className="btn btn-outline w-full text-sm">
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectSelect;
