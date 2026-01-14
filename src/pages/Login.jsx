import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, signup, resetPassword } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isResetMode, setIsResetMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isResetMode) {
                await resetPassword(email);
                setError('');
                alert('Password reset email sent! Check your inbox.');
                setIsResetMode(false);
                setIsLoginMode(true);
            } else if (isLoginMode) {
                await login(email, password);
                navigate('/project/south-mall');
            } else {
                await signup(email, password);
                navigate('/project/south-mall');
            }
        } catch (err) {
            console.error("Auth Error:", err);
            let msg = "Failed to authenticate.";
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = "Invalid email or password.";
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
            if (err.code === 'auth/weak-password') msg = "Password is too weak (min 6 chars).";
            setError(msg);
        }
        setLoading(false);
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

                <div className="mb-6 text-center sm:text-left">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-12 w-auto mb-6 mx-auto sm:mx-0" />
                    <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">South Mall New World</h1>
                    <p className="text-gray-500 mt-1">
                        {isResetMode ? 'Reset your password.' : (isLoginMode ? 'Welcome back. Sign in to continue.' : 'Create your account to access the project portal.')}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center justify-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
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

                    {!isResetMode && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    {isLoginMode ? 'Password' : 'Create Password'}
                                </label>
                                {isLoginMode && (
                                    <button
                                        type="button"
                                        onClick={() => setIsResetMode(true)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <input
                                type="password"
                                required={!isResetMode}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="••••••••"
                                minLength={isLoginMode ? 0 : 6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            {!isLoginMode && <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-3 mt-2 gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isResetMode ? 'Send Reset Link' : (isLoginMode ? 'Log In' : 'Create Account & Enter'))}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            if (isResetMode) setIsResetMode(false);
                            else setIsLoginMode(!isLoginMode);
                        }}
                        className="text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                    >
                        {isResetMode
                            ? "Back to Login"
                            : (isLoginMode ? "Need an account? Sign up" : "Already have an account? Log in")
                        }
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
