/**
 * Per-project role definitions and permission helpers.
 *
 * Role hierarchy (higher level = more capabilities):
 *   viewer (0)  →  stakeholder (1)  →  project_manager (2)  →  admin (3)
 */

export const ROLES = {
    ADMIN: 'admin',
    PROJECT_MANAGER: 'project_manager',
    STAKEHOLDER: 'stakeholder',
    VIEWER: 'viewer',
};

const ROLE_LEVELS = {
    viewer: 0,
    stakeholder: 1,
    project_manager: 2,
    admin: 3,
};

/** Returns true when `userRole` meets or exceeds `requiredRole`. */
export function hasMinRole(userRole, requiredRole) {
    return (ROLE_LEVELS[userRole] ?? -1) >= (ROLE_LEVELS[requiredRole] ?? Infinity);
}

// --- Named permission checks (all accept the effective project role) ---

export const canPostUpdates = (role) => hasMinRole(role, 'project_manager');
export const canEditUpdates = (role) => hasMinRole(role, 'project_manager');
export const canDeleteItems = (role) => hasMinRole(role, 'project_manager');
/** Only admins may delete documents or photos (files/media). */
export const canDeleteFiles = (role) => hasMinRole(role, 'admin');
export const canRaiseActions = (role) => hasMinRole(role, 'project_manager');
export const canToggleActionStatus = (role) => hasMinRole(role, 'project_manager');
export const canUploadFiles = (role) => hasMinRole(role, 'stakeholder');
export const canAskQuestions = (role) => hasMinRole(role, 'stakeholder');
export const canReplyToQuestions = (role) => hasMinRole(role, 'stakeholder');
export const canEditProject = (role) => hasMinRole(role, 'project_manager');
export const canManageUsers = (role) => hasMinRole(role, 'admin');

/** Human-readable label for a role string. */
export function roleLabel(role) {
    switch (role) {
        case 'admin': return 'Admin';
        case 'project_manager': return 'Project Manager';
        case 'stakeholder': return 'Stakeholder';
        case 'viewer': return 'Viewer';
        default: return role ?? 'None';
    }
}
