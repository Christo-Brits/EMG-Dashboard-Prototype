import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
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

                        // Bootstrap: promote initial admin if not yet set
                        // Remove this block once admin is confirmed in Firestore
                        const BOOTSTRAP_ADMINS = ['christo@emgroup.co.nz'];
                        if (
                            BOOTSTRAP_ADMINS.includes(currentUser.email.toLowerCase()) &&
                            userData.globalRole !== 'admin'
                        ) {
                            userData.globalRole = 'admin';
                            await updateDoc(userRef, { globalRole: 'admin' });
                            console.log(`[Bootstrap] Promoted ${currentUser.email} to admin`);
                        }
                    } else {
                        // Create new user doc for first-time sign-in
                        userData = {
                            email: currentUser.email,
                            name: currentUser.email.split('@')[0],
                            globalRole: 'user',
                            projectRoles: {},
                            allowedProjects: [],
                            createdAt: new Date(),
                        };

                        // Check for pending invites for this email
                        try {
                            const invQ = query(
                                collection(db, 'pending_invites'),
                                where('email', '==', currentUser.email.toLowerCase()),
                                where('status', '==', 'pending'),
                            );
                            const invSnap = await getDocs(invQ);
                            for (const invDoc of invSnap.docs) {
                                const inv = invDoc.data();
                                // Merge invited projects into the new user doc
                                if (Array.isArray(inv.projects)) {
                                    inv.projects.forEach((pid) => {
                                        if (!userData.allowedProjects.includes(pid)) {
                                            userData.allowedProjects.push(pid);
                                        }
                                    });
                                }
                                if (inv.projectRoles) {
                                    userData.projectRoles = { ...userData.projectRoles, ...inv.projectRoles };
                                }
                                // Mark invite as accepted
                                await updateDoc(doc(db, 'pending_invites', invDoc.id), { status: 'accepted' });
                            }
                        } catch (invErr) {
                            console.error('Error checking pending invites:', invErr);
                        }

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

    const resetPassword = (email) =>
        sendPasswordResetEmail(auth, email);

    /** Re-fetch the user doc from Firestore and update context state. */
    const refreshUser = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        try {
            const snap = await getDoc(doc(db, 'users', currentUser.uid));
            if (snap.exists()) {
                const userData = normaliseUserData(snap.data());
                setUser({ ...currentUser, ...userData });
            }
        } catch (err) {
            console.error('Error refreshing user data:', err);
        }
    }, []);

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
                refreshUser,
                isAdmin,
                getProjectRole,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
