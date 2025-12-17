import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        login(email);
        navigate('/project/south-mall');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Project Selection
                </button>

                <div className="mb-8 text-center sm:text-left">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-12 w-auto mb-6 mx-auto sm:mx-0" />
                    <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">South Mall New World</h1>
                    <p className="text-gray-500 mt-1">
                        {isLoginMode ? 'Welcome back. Sign in to continue.' : 'Create your account to access the project portal.'}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="name@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isLoginMode ? 'Password' : 'Create Password'}
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="••••••••"
                            minLength={isLoginMode ? 0 : 6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {!isLoginMode && <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full py-3 mt-2 gap-2"
                    >
                        {isLoginMode ? 'Log In' : 'Create Account & Enter'}
                        <ArrowRight size={16} />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                    >
                        {isLoginMode
                            ? "Need an account? Sign up"
                            : "Already have an account? Log in"}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                    By continuing, you agree to the EMG Portal Terms of Service.
                </div>
            </div>
        </div>
    );
};

export default Login;
