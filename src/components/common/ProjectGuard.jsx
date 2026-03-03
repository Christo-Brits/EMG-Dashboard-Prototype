import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProjectGuard = ({ children }) => {
    const { projectId } = useParams();
    const { user, isAdmin } = useAuth();

    if (!isAdmin && user?.allowedProjects && !user.allowedProjects.includes(projectId)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProjectGuard;
