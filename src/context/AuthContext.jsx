import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * Normalise a Firestore user doc into the shape the app expects.
 * Handles backward-compat for docs that still use the legacy `role` field
 * instead of `globalRole` + `projectRoles`.
 */
function normaliseUserData(data) {
    // Determine globalRole -------------------------------------------------
    let globalRole = data.globalRole;

    if (!globalRole && data.role) {
        // Legacy doc: map old `role` values to the new `globalRole`
        globalRole = data.role === 'admin' ? 'admin' : 'user';
    }

    if (!globalRole) {
        globalRole = 'user';
    }

    // Determine projectRoles -----------------------------------------------
    let projectRoles = data.projectRoles ?? {};

    // If we have allowedProjects but no projectRoles, backfill each project
    // with the legacy role (or default to 'stakeholder').
    if (
        Object.keys(projectRoles).length === 0 &&
        Array.isArray(data.allowedProjects) &&
        data.allowedProjects.length > 0
    ) {
        const fallbackRole =
            globalRole === 'admin' ? 'admin'
                : data.role === 'project_manager' ? 'project_manager'
                    : 'stakeholder';

        projectRoles = {};
        data.allowedProjects.forEach((pid) => {
            projectRoles[pid] = fallbackRole;
        });
    }

    return {
        ...data,
        globalRole,
        projectRoles,
    };
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                let userData = {};

                try {
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        userData = normaliseUserData(userSnap.data());
                    } else {
                        // Create new user doc for first-time sign-in
                        const isMasterAdmin =
                            currentUser.email.toLowerCase() === 'christo@emgroup.co.nz';

                        userData = {
                            email: currentUser.email,
                            name: isMasterAdmin
                                ? 'Christo (Admin)'
                                : currentUser.email.split('@')[0],
                            globalRole: isMasterAdmin ? 'admin' : 'user',
                            projectRoles: isMasterAdmin
                                ? { 'south-mall': 'admin', 'north-end': 'admin' }
                                : {},
                            allowedProjects: isMasterAdmin
                                ? ['south-mall', 'north-end']
                                : [],
                            createdAt: new Date(),
                        };
                        await setDoc(userRef, userData);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    userData = {
                        email: currentUser.email,
                        globalRole: 'user',
                        projectRoles: {},
                    };
                }

                // Master-email override — ensures platform admin even if
                // Firestore doc was somehow changed
                if (currentUser.email.toLowerCase() === 'christo@emgroup.co.nz') {
                    userData.globalRole = 'admin';
                }

                setUser({
                    ...currentUser,
                    ...userData,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // --- Auth helpers (unchanged) ---

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const signup = (email, password) =>
        createUserWithEmailAndPassword(auth, email, password);

    const logout = () => signOut(auth);

    const resetPassword = (email) => sendPasswordResetEmail(auth, email);

    // --- Per-project role resolver ---

    /**
     * Returns the user's effective role for `projectId`.
     * Global admins always resolve to 'admin'.
     * Non-admins get their per-project role, or null if unassigned.
     */
    const getProjectRole = useCallback(
        (projectId) => {
            if (!user || !projectId) return null;
            if (user.globalRole === 'admin') return 'admin';
            return user.projectRoles?.[projectId] ?? null;
        },
        [user],
    );

    const isAdmin = user?.globalRole === 'admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                signup,
                logout,
                resetPassword,
                isAdmin,
                getProjectRole,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
