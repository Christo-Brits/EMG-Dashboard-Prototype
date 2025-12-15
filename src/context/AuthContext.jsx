import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (email) => {
        const isAdmin = email.toLowerCase() === 'christo@emgroup.co.nz';
        setUser({
            email,
            name: isAdmin ? 'Christo (Admin)' : email.split('@')[0],
            role: isAdmin ? 'admin' : 'stakeholder'
        });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};
