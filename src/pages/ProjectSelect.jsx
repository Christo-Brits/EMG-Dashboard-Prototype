import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjectData } from '../context/ProjectContext';

const ProjectSelect = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects, projectsLoading } = useProjectData();
    const [selectedProject, setSelectedProject] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const handleContinue = () => {
        if (!selectedProject) return;

        if (user) {
            // User is logged in — check if they have access
            const hasAccess = user.role === 'admin' || user.allowedProjects?.includes(selectedProject);
            if (hasAccess) {
                navigate(`/project/${selectedProject}`);
            } else {
                setShowPopup(true);
            }
        } else {
            // Not logged in — go to login, then redirect
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

                <div className="mb-8 flex flex-col items-center">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-14 w-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Project Portal</h1>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        {user
                            ? 'Select your project to access site updates and documentation.'
                            : 'Sign in to access your project portal.'}
                    </p>
                </div>

                {user ? (
                    <>
                        {projectsLoading ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm text-gray-400">Loading projects...</p>
                            </div>
                        ) : projects.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Project</label>
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                        >
                                            <option value="" disabled>Select a project...</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
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
                                    Enter Project
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Lock size={20} />
                                </div>
                                <p className="text-sm text-gray-600 font-medium mb-1">No projects assigned</p>
                                <p className="text-xs text-gray-400">Contact your administrator to request project access.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                        >
                            Sign In to Continue
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock size={12} />
                    <span>Secure Connection &bull; EMG Client Services</span>
                </div>
            </div>

            {/* Access Denied Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center relative">
                        <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
                            <X size={20} />
                        </button>
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Restricted Access</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            You do not have access to this project. Contact your administrator to request access.
                        </p>
                        <button onClick={() => setShowPopup(false)} className="btn btn-primary w-full text-sm">
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSelect;
