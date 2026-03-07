import { describe, it, expect } from 'vitest';
import {
    ROLES,
    hasMinRole,
    canPostUpdates,
    canEditUpdates,
    canDeleteItems,
    canDeleteFiles,
    canRaiseActions,
    canToggleActionStatus,
    canUploadFiles,
    canAskQuestions,
    canReplyToQuestions,
    canEditProject,
    canManageUsers,
    roleLabel,
} from './permissions';

describe('ROLES constants', () => {
    it('defines four roles', () => {
        expect(ROLES.ADMIN).toBe('admin');
        expect(ROLES.PROJECT_MANAGER).toBe('project_manager');
        expect(ROLES.STAKEHOLDER).toBe('stakeholder');
        expect(ROLES.VIEWER).toBe('viewer');
    });
});

describe('hasMinRole', () => {
    it('admin meets all roles', () => {
        expect(hasMinRole('admin', 'admin')).toBe(true);
        expect(hasMinRole('admin', 'project_manager')).toBe(true);
        expect(hasMinRole('admin', 'stakeholder')).toBe(true);
        expect(hasMinRole('admin', 'viewer')).toBe(true);
    });

    it('project_manager meets PM, stakeholder, viewer but not admin', () => {
        expect(hasMinRole('project_manager', 'admin')).toBe(false);
        expect(hasMinRole('project_manager', 'project_manager')).toBe(true);
        expect(hasMinRole('project_manager', 'stakeholder')).toBe(true);
        expect(hasMinRole('project_manager', 'viewer')).toBe(true);
    });

    it('stakeholder meets stakeholder and viewer only', () => {
        expect(hasMinRole('stakeholder', 'admin')).toBe(false);
        expect(hasMinRole('stakeholder', 'project_manager')).toBe(false);
        expect(hasMinRole('stakeholder', 'stakeholder')).toBe(true);
        expect(hasMinRole('stakeholder', 'viewer')).toBe(true);
    });

    it('viewer meets only viewer', () => {
        expect(hasMinRole('viewer', 'admin')).toBe(false);
        expect(hasMinRole('viewer', 'project_manager')).toBe(false);
        expect(hasMinRole('viewer', 'stakeholder')).toBe(false);
        expect(hasMinRole('viewer', 'viewer')).toBe(true);
    });

    it('unknown/null role fails all checks', () => {
        expect(hasMinRole(null, 'viewer')).toBe(false);
        expect(hasMinRole(undefined, 'viewer')).toBe(false);
        expect(hasMinRole('unknown', 'viewer')).toBe(false);
    });

    it('unknown required role is never met', () => {
        expect(hasMinRole('admin', 'superadmin')).toBe(false);
    });
});

describe('permission check functions', () => {
    const roles = ['viewer', 'stakeholder', 'project_manager', 'admin'];

    // Helper: which roles can perform each action
    const expectations = [
        { fn: canPostUpdates,         allowed: ['project_manager', 'admin'] },
        { fn: canEditUpdates,         allowed: ['project_manager', 'admin'] },
        { fn: canDeleteItems,         allowed: ['project_manager', 'admin'] },
        { fn: canDeleteFiles,         allowed: ['admin'] },
        { fn: canRaiseActions,        allowed: ['project_manager', 'admin'] },
        { fn: canToggleActionStatus,  allowed: ['project_manager', 'admin'] },
        { fn: canUploadFiles,         allowed: ['stakeholder', 'project_manager', 'admin'] },
        { fn: canAskQuestions,        allowed: ['stakeholder', 'project_manager', 'admin'] },
        { fn: canReplyToQuestions,    allowed: ['stakeholder', 'project_manager', 'admin'] },
        { fn: canEditProject,         allowed: ['project_manager', 'admin'] },
        { fn: canManageUsers,         allowed: ['admin'] },
    ];

    expectations.forEach(({ fn, allowed }) => {
        describe(fn.name, () => {
            roles.forEach(role => {
                const expected = allowed.includes(role);
                it(`${role} → ${expected}`, () => {
                    expect(fn(role)).toBe(expected);
                });
            });

            it('null role → false', () => {
                expect(fn(null)).toBe(false);
            });
        });
    });
});

describe('roleLabel', () => {
    it('returns human-readable labels', () => {
        expect(roleLabel('admin')).toBe('Admin');
        expect(roleLabel('project_manager')).toBe('Project Manager');
        expect(roleLabel('stakeholder')).toBe('Stakeholder');
        expect(roleLabel('viewer')).toBe('Viewer');
    });

    it('returns the raw string for unknown roles', () => {
        expect(roleLabel('custom_role')).toBe('custom_role');
    });

    it('returns "None" for null/undefined', () => {
        expect(roleLabel(null)).toBe('None');
        expect(roleLabel(undefined)).toBe('None');
    });
});
