import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { ACCESS_REQUEST_EMAIL } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const ADMIN_EMAIL = 'christo@emgroup.co.nz';

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
                        userData = userSnap.data();
                    } else {
                        const isAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL;
                        userData = {
                            email: currentUser.email,
                            name: isAdmin ? 'Christo (Admin)' : currentUser.email.split('@')[0],
                            role: isAdmin ? 'admin' : 'user',
                            allowedProjects: isAdmin ? ['south-mall', 'retail-facilities', 'civil-drainage', 'planned-maintenance', 'emergency-works'] : [],
                            approved: isAdmin,
                            createdAt: new Date()
                        };
                        await setDoc(userRef, userData);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    userData = {
                        email: currentUser.email,
                        role: 'user',
                        allowedProjects: [],
                        approved: false
                    };
                }

                const isAdminEmail = currentUser.email.toLowerCase() === ADMIN_EMAIL;
                setUser({
                    ...currentUser,
                    ...userData,
                    role: isAdminEmail ? 'admin' : (userData.role || 'user'),
                    approved: isAdminEmail ? true : (userData.approved || false),
                    allowedProjects: isAdminEmail
                        ? ['south-mall', 'retail-facilities', 'civil-drainage', 'planned-maintenance', 'emergency-works']
                        : (userData.allowedProjects || [])
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

    const hasProjectAccess = (projectId) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return user.allowedProjects?.includes(projectId) && user.approved;
    };

    const canWrite = () => {
        return user?.role === 'admin';
    };

    const canDownloadPdf = () => {
        return !!user;
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            resetPassword,
            isAdmin: user?.role === 'admin',
            hasProjectAccess,
            canWrite,
            canDownloadPdf,
            accessRequestEmail: ACCESS_REQUEST_EMAIL
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
