import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldX } from 'lucide-react';

/**
 * Wraps the /project/:projectId route.
 * Checks that the current user has access to the requested project.
 * Global admins bypass the check entirely.
 */
const ProjectGuard = ({ children }) => {
    const { projectId } = useParams();
    const { user, isAdmin } = useAuth();

    // Admins can access everything
    if (isAdmin) return children;

    // Check allowedProjects or projectRoles
    const hasAccess =
        user?.allowedProjects?.includes(projectId) ||
        user?.projectRoles?.[projectId] != null;

    if (!hasAccess) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                            <ShieldX size={32} className="text-red-400" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Access</h2>
                    <p className="text-gray-500 mb-6">
                        You don't have access to this project. Contact an administrator to request access.
                    </p>
                    <Link
                        to="/projects"
                        className="btn btn-primary px-6 py-2"
                    >
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return children;
};

export default ProjectGuard;
