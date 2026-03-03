import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldX, ArrowLeft } from 'lucide-react';

const ProjectGuard = ({ children }) => {
    const { projectId } = useParams();
    const { user, isAdmin } = useAuth();

    if (!isAdmin && user?.allowedProjects && !user.allowedProjects.includes(projectId)) {
        return (
            <div className="container max-w-lg">
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <ShieldX size={28} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        You don't have access to this project. Contact your administrator to request access.
                    </p>
                    <Link to="/dashboard" className="btn btn-primary text-sm gap-2">
                        <ArrowLeft size={14} /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return children;
};

export default ProjectGuard;
