import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    arrayUnion
} from 'firebase/firestore';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check and process pending invites for a new user
    const processPendingInvites = async (uid, email) => {
        try {
            const invitesQuery = query(
                collection(db, 'pending_invites'),
                where('email', '==', email.toLowerCase()),
                where('status', '==', 'pending')
            );
            const invitesSnap = await getDocs(invitesQuery);

            if (invitesSnap.empty) return null;

            let assignedProjects = [];
            let inviteRole = null;

            for (const inviteDoc of invitesSnap.docs) {
                const invite = inviteDoc.data();
                assignedProjects = [...assignedProjects, ...invite.projects];
                if (!inviteRole) inviteRole = invite.role;

                // Add user to each project's teamMembers
                for (const pid of invite.projects) {
                    try {
                        await updateDoc(doc(db, 'projects', pid), {
                            teamMembers: arrayUnion(uid)
                        });
                    } catch (e) {
                        console.error(`Error adding user to project ${pid}:`, e);
                    }
                }

                // Mark invite as accepted
                await updateDoc(doc(db, 'pending_invites', inviteDoc.id), {
                    status: 'accepted'
                });
            }

            return { projects: [...new Set(assignedProjects)], role: inviteRole };
        } catch (e) {
            console.error('Error processing pending invites:', e);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                let userData = {};

                try {
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        userData = userSnap.data();
                    } else {
                        // New user — check for pending invites
                        const inviteData = await processPendingInvites(currentUser.uid, currentUser.email);

                        userData = {
                            email: currentUser.email,
                            name: currentUser.email.split('@')[0],
                            role: inviteData?.role || 'stakeholder',
                            allowedProjects: inviteData?.projects || [],
                            createdAt: new Date()
                        };
                        await setDoc(userRef, userData);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    userData = {
                        email: currentUser.email,
                        role: 'stakeholder'
                    };
                }

                setUser({
                    ...currentUser,
                    ...userData
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const changePassword = async (currentPassword, newPassword) => {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
    };

    const updateProfile = async (updates) => {
        if (!auth.currentUser) return;
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, updates);
        setUser(prev => ({ ...prev, ...updates }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            resetPassword,
            changePassword,
            updateProfile,
            isAdmin: user?.role === 'admin'
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
