import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock, MapPin, Search, AlertCircle, X } from 'lucide-react';
import { PROJECTS } from '../data/mockData';

const ProjectSelect = () => {
    const navigate = useNavigate();
    const [selectedProject, setSelectedProject] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const handleContinue = () => {
        if (!selectedProject) return;

        if (selectedProject === 'south-mall') {
            navigate('/login');
        } else {
            setShowPopup(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

                <div className="mb-8 flex flex-col items-center">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-14 w-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Project Portal</h1>
                    <p className="text-gray-500 text-sm mt-2 text-center">Select your project to access site updates and documentation.</p>
                </div>

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
                                {PROJECTS.map(p => (
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
                        {selectedProject === 'south-mall' ? 'Continue to Login' : 'Request Access'}
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock size={12} />
                    <span>Secure Connection • EMG Client Services</span>
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
                            The portal for <strong>{PROJECTS.find(p => p.id === selectedProject)?.name}</strong> is currently restricted to authorized stakeholders only.
                        </p>
                        <button onClick={() => setShowPopup(false)} className="btn btn-primary w-full text-sm">
                            Request Authorization
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectSelect;
