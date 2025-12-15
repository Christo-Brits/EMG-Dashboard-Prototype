import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 relative overflow-hidden">
            {/* Background Decor - Subtle Enterprise Feel */}
            <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]"></div>

            <div className="z-10 max-w-lg w-full text-center space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-brand-primary)] text-white rounded-md text-3xl font-bold mb-4">
                        E
                    </div>
                    <h1 className="text-4xl font-bold text-[var(--color-brand-primary)] tracking-tight">EMG Project Portal</h1>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                        Early Access Preview
                    </div>
                </div>

                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                    We’re currently giving a small number of EMG clients early access to our new Project Portal to gather feedback on layout, clarity, and features before wider rollout.
                </p>

                <div className="pt-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-primary w-full sm:w-auto text-lg py-3 px-8 gap-2 shadow-lg shadow-blue-900/10"
                    >
                        Enter Portal
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
                    Internal Build v0.1.0 • Not for public distribution
                </div>
            </div>
        </div>
    );
};

export default Welcome;
