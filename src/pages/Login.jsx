import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup, resetPassword } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isResetMode, setIsResetMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const redirectTo = location.state?.from?.pathname || '/projects';

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            if (isResetMode) {
                await resetPassword(email);
                setSuccessMsg('Password reset email sent! Check your inbox.');
                setIsResetMode(false);
                setIsLoginMode(true);
            } else if (isLoginMode) {
                await login(email, password);
                navigate(redirectTo);
            } else {
                await signup(email, password);
                navigate(redirectTo);
            }
        } catch (err) {
            console.error("Auth Error:", err.code, err.message);
            let msg = "Something went wrong. Please try again.";
            switch (err.code) {
                case 'auth/invalid-credential':
                case 'auth/wrong-password':
                    msg = "Invalid email or password."; break;
                case 'auth/email-already-in-use':
                    msg = "Email already in use."; break;
                case 'auth/weak-password':
                    msg = "Password is too weak (min 6 chars)."; break;
                case 'auth/user-not-found':
                    msg = isResetMode
                        ? "No account found with that email."
                        : "Account not found. Please Sign Up first.";
                    break;
                case 'auth/too-many-requests':
                    msg = "Too many attempts. Please wait a few minutes and try again."; break;
                case 'auth/invalid-email':
                    msg = "Please enter a valid email address."; break;
                case 'auth/unauthorized-continue-uri':
                case 'auth/missing-continue-uri':
                    msg = "Reset configuration error. Please contact support."; break;
                case 'auth/network-request-failed':
                    msg = "Network error. Please check your connection."; break;
                default:
                    msg = isResetMode
                        ? "Failed to send reset email. Please try again."
                        : "Failed to authenticate. Please try again.";
            }
            setError(msg);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">

                <div className="mb-6 text-center sm:text-left">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-12 w-auto mb-6 mx-auto sm:mx-0" />
                    <h1 className="text-2xl font-bold text-[var(--color-brand-primary)]">EMG Project Portal</h1>
                    <p className="text-gray-500 mt-1">
                        {isResetMode ? 'Reset your password.' : (isLoginMode ? 'Welcome back. Sign in to continue.' : 'Create your account to access the project portal.')}
                    </p>
                </div>

                {successMsg && (
                    <div className="mb-4 bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100 flex items-center gap-2">
                        <CheckCircle size={16} /> {successMsg}
                    </div>
                )}

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
                                        onClick={() => { setIsResetMode(true); setError(''); setSuccessMsg(''); }}
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

                {isResetMode && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setError(''); setSuccessMsg(''); setIsResetMode(false); }}
                            className="text-sm text-[var(--color-brand-primary)] hover:underline font-medium"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                    By continuing, you agree to the EMG Portal Terms of Service.
                </div>
            </div>
        </div>
    );
};

export default Login;
