import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    doc,
    updateDoc,
    writeBatch,
    addDoc,
    getDocs,
    where,
    serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Subscribe to the current user's notifications (most recent 50)
    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const q = query(
            collection(db, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));
            setNotifications(items);
            setUnreadCount(items.filter((n) => !n.read).length);
        }, (err) => {
            console.error('Notification subscription error:', err);
        });

        return unsub;
    }, [user?.uid]);

    // Mark a single notification as read
    const markAsRead = useCallback(async (notificationId) => {
        if (!user?.uid) return;
        try {
            await updateDoc(
                doc(db, 'users', user.uid, 'notifications', notificationId),
                { read: true }
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, [user?.uid]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return;
        const unread = notifications.filter((n) => !n.read);
        if (unread.length === 0) return;

        try {
            const batch = writeBatch(db);
            for (const n of unread) {
                batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
            }
            await batch.commit();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, [user?.uid, notifications]);

    // Create notifications for all team members of a project (except the author)
    const notifyProjectTeam = useCallback(async (projectId, projectName, { type, message, link }) => {
        if (!user?.uid) return;

        try {
            // Read the project's teamMembers
            const projectRef = doc(db, 'projects', projectId);
            const { getDoc } = await import('firebase/firestore');
            const projectSnap = await getDoc(projectRef);
            if (!projectSnap.exists()) return;

            const teamMembers = projectSnap.data().teamMembers || [];
            const batch = writeBatch(db);

            for (const uid of teamMembers) {
                if (uid === user.uid) continue; // Don't notify yourself
                const notifRef = doc(collection(db, 'users', uid, 'notifications'));
                batch.set(notifRef, {
                    type,
                    projectId,
                    projectName,
                    message,
                    link,
                    read: false,
                    createdAt: serverTimestamp(),
                });
            }

            await batch.commit();
        } catch (err) {
            console.error('Failed to send team notifications:', err);
        }
    }, [user?.uid]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            notifyProjectTeam,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
