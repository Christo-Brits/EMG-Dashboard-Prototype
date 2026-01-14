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

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Check for user doc in Firestore
                const userRef = doc(db, 'users', currentUser.uid);
                let userData = {};

                try {
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        userData = userSnap.data();
                    } else {
                        // Create new user doc if it doesn't exist
                        const isAdmin = currentUser.email.toLowerCase() === 'christo@emgroup.co.nz';
                        userData = {
                            email: currentUser.email,
                            name: isAdmin ? 'Christo (Admin)' : currentUser.email.split('@')[0],
                            role: isAdmin ? 'admin' : 'stakeholder',
                            allowedProjects: isAdmin ? ['south-mall', 'north-end'] : ['south-mall'], // Default access
                            createdAt: new Date()
                        };
                        await setDoc(userRef, userData);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Fallback to basic auth info if firestore fails
                    userData = {
                        email: currentUser.email,
                        role: 'stakeholder'
                    };
                }

                setUser({
                    ...currentUser,
                    ...userData,
                    // Ensure admin override matches email even if DB says otherwise provided it's the master email
                    role: currentUser.email.toLowerCase() === 'christo@emgroup.co.nz' ? 'admin' : userData.role
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

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, resetPassword, isAdmin: user?.role === 'admin' }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
