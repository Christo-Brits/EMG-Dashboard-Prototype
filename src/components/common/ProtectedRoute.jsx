import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireProjectAccess }) => {
    const { user, hasProjectAccess } = useAuth();
    const { projectId } = useParams();

    if (!user) {
        if (projectId) {
            return <Navigate to={`/login/${projectId}`} replace />;
        }
        return <Navigate to="/login" replace />;
    }

    if (requireProjectAccess && projectId && !hasProjectAccess(projectId)) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
};

export default ProtectedRoute;
