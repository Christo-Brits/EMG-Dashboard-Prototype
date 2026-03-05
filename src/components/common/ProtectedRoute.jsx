import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps routes that require authentication.
 * - Unauthenticated users are redirected to /login with state.from for redirect-back.
 * - If `adminOnly` is true, non-admin users are redirected to /dashboard.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/projects" replace />;
    }

    return children;
};

export default ProtectedRoute;
