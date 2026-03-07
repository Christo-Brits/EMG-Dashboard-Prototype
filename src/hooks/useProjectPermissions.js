import { useAuth } from '../context/AuthContext';
import { useProjectData } from '../context/ProjectContext';
import * as perms from '../utils/permissions';

/**
 * Hook that resolves the current user's effective role for the active project
 * and returns boolean permission flags for use in tab components.
 *
 * Usage:
 *   const { canPostUpdates, canDeleteItems, ... } = useProjectPermissions();
 */
export function useProjectPermissions() {
    const { user, getProjectRole, isAdmin } = useAuth();
    const { activeProjectId } = useProjectData();

    const role = getProjectRole?.(activeProjectId) ?? null;

    return {
        role,
        isGlobalAdmin: isAdmin,
        canPostUpdates: perms.canPostUpdates(role),
        canEditUpdates: perms.canEditUpdates(role),
        canDeleteItems: perms.canDeleteItems(role),
        canDeleteFiles: perms.canDeleteFiles(role),
        canRaiseActions: perms.canRaiseActions(role),
        canToggleActionStatus: perms.canToggleActionStatus(role),
        canUploadFiles: perms.canUploadFiles(role),
        canAskQuestions: perms.canAskQuestions(role),
        canReplyToQuestions: perms.canReplyToQuestions(role),
        canEditProject: perms.canEditProject(role),
        canManageUsers: perms.canManageUsers(role),
    };
}
