import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    collection,
    doc,
    documentId,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProjectData = () => useContext(ProjectContext);

const DEFAULT_FOLDERS = [
    { id: 'folder-drawings', name: 'Drawings', type: 'folder', items: [] },
    { id: 'folder-rfis', name: 'RFIs & Technical Queries', type: 'folder', items: [] },
    { id: 'folder-reports', name: 'Reports & Inspections', type: 'folder', items: [] },
    { id: 'folder-si', name: 'Site Instructions', type: 'folder', items: [] },
];

export const ProjectProvider = ({ children }) => {
    const { user, isAdmin } = useAuth();

    const [activeProjectId, setActiveProjectId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [updates, setUpdates] = useState([]);
    const [actions, setActions] = useState([]);
    const [qa, setQa] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [photos, setPhotos] = useState([]);

    // --- Firestore Projects Subscription (Phase 3.2 + 5.6) ---
    useEffect(() => {
        if (!user) {
            setProjects([]);
            setProjectsLoading(false);
            return;
        }

        let q;
        if (isAdmin) {
            q = collection(db, 'projects');
        } else if (user.allowedProjects?.length > 0) {
            // Firestore 'in' query supports up to 30 values
            q = query(
                collection(db, 'projects'),
                where(documentId(), 'in', user.allowedProjects.slice(0, 30))
            );
        } else {
            setProjects([]);
            setProjectsLoading(false);
            return;
        }

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setProjects(data);
            setProjectsLoading(false);
        }, (err) => {
            console.error("Projects Sync Error:", err);
            setProjectsLoading(false);
        });

        return unsub;
    }, [user, isAdmin]);

    // --- Per-Project Subcollection Subscriptions ---
    useEffect(() => {
        if (!db || !activeProjectId) {
            setUpdates([]);
            setActions([]);
            setQa([]);
            setPhotos([]);
            setDocuments([]);
            return;
        }

        const PID = activeProjectId;

        // Updates
        const updatesRef = collection(db, 'projects', PID, 'updates');
        const unsubUpdates = onSnapshot(updatesRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setUpdates(data);
        }, (err) => console.error("Updates Sync Error:", err));

        // Actions
        const actionsRef = collection(db, 'projects', PID, 'actions');
        const unsubActions = onSnapshot(actionsRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            setActions(data);
        });

        // Q&A
        const qaRef = collection(db, 'projects', PID, 'qa');
        const unsubQA = onSnapshot(qaRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setQa(data);
        });

        // Photos
        const photosRef = collection(db, 'projects', PID, 'photos');
        const unsubPhotos = onSnapshot(photosRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setPhotos(data);
        });

        // Documents (single JSON blob for hierarchy)
        const docStructRef = doc(db, 'projects', PID, 'data', 'documents');
        const unsubDocs = onSnapshot(docStructRef, (docSnap) => {
            if (docSnap.exists()) {
                setDocuments(docSnap.data().structure);
            } else {
                setDoc(docStructRef, { structure: DEFAULT_FOLDERS });
                setDocuments(DEFAULT_FOLDERS);
            }
        });

        return () => {
            unsubUpdates();
            unsubActions();
            unsubQA();
            unsubPhotos();
            unsubDocs();
        };
    }, [activeProjectId]);

    // --- Write Functions ---

    const addToCollection = async (collectionName, item) => {
        const newItem = { ...item, id: Date.now() };
        if (!activeProjectId) return;
        try {
            await addDoc(collection(db, 'projects', activeProjectId, collectionName), newItem);
        } catch (e) {
            console.error(`Error adding to ${collectionName}:`, e);
            alert("Sync Error: Check your Firebase Config.");
        }
    };

    const deleteFromCollection = async (collectionName, firestoreId) => {
        if (!firestoreId || !activeProjectId) return;
        try {
            await deleteDoc(doc(db, 'projects', activeProjectId, collectionName, firestoreId));
        } catch (e) {
            console.error(`Error deleting from ${collectionName}:`, e);
        }
    };

    const updateInCollection = async (collectionName, firestoreId, updates) => {
        if (!firestoreId || !activeProjectId) return;
        try {
            await updateDoc(doc(db, 'projects', activeProjectId, collectionName, firestoreId), updates);
        } catch (e) {
            console.error(`Error updating ${collectionName}:`, e);
        }
    };

    // --- File Upload ---
    const uploadFile = async (file, path) => {
        if (!file) return null;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    // --- Updates ---
    const addUpdate = (text, author) => {
        const timestamp = new Date().toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const date = new Date().toISOString().split('T')[0];
        addToCollection('updates', { text, author, timestamp, date, type: 'progress' });
    };
    const deleteUpdate = (id) => {
        const item = updates.find(u => u.id === id);
        if (item) deleteFromCollection('updates', item.firestoreId);
    };
    const updateUpdate = (id, newContent) => {
        const item = updates.find(u => u.id === id);
        if (item) updateInCollection('updates', item.firestoreId, newContent);
    };

    // --- Actions ---
    const addAction = (text, assignee, dueDate) => {
        addToCollection('actions', { text, assignee, dueDate, status: 'Open' });
    };
    const updateActionStatus = (id, status) => {
        const item = actions.find(a => a.id === id);
        if (item) updateInCollection('actions', item.firestoreId, { status });
    };
    const deleteAction = (id) => {
        const item = actions.find(a => a.id === id);
        if (item) deleteFromCollection('actions', item.firestoreId);
    };

    // --- Q&A ---
    const addQuestion = (question, author) => {
        addToCollection('qa', {
            question,
            author,
            status: 'Open',
            replies: [],
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
    };

    const addReply = (questionId, replyContent, author) => {
        const thread = qa.find(q => q.id.toString() === questionId.toString());
        if (thread) {
            const newReply = {
                author,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                content: replyContent
            };
            const updatedReplies = [...thread.replies, newReply];
            updateInCollection('qa', thread.firestoreId, { replies: updatedReplies, status: 'Answered' });
        }
    };

    const deleteQuestion = (id) => {
        const item = qa.find(q => q.id === id);
        if (item) deleteFromCollection('qa', item.firestoreId);
    };

    // --- Photos ---
    const addPhoto = async (file, caption, author) => {
        if (!activeProjectId) return;
        const fileName = `${Date.now()}_${file.name}`;
        const path = `projects/${activeProjectId}/photos/${fileName}`;
        try {
            const url = await uploadFile(file, path);
            addToCollection('photos', {
                url, caption, author,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Failed to upload photo.");
        }
    };
    const deletePhoto = (id) => {
        const item = photos.find(p => p.id === id);
        if (item) deleteFromCollection('photos', item.firestoreId);
    };

    // --- Documents ---
    const saveDocumentsStructure = async (newDocs) => {
        if (!activeProjectId) return;
        try {
            await setDoc(doc(db, 'projects', activeProjectId, 'data', 'documents'), { structure: newDocs });
        } catch (e) {
            console.error("Error saving docs:", e);
        }
    };

    const addDocument = async (fileObj, folderId, author) => {
        if (!activeProjectId) return;
        try {
            const fileName = `${Date.now()}_${fileObj.name}`;
            const path = `projects/${activeProjectId}/documents/${fileName}`;
            const fileUrl = await uploadFile(fileObj, path);
            const newFile = {
                id: Date.now(),
                name: fileObj.name,
                type: fileObj.name.split('.').pop().toUpperCase(),
                author,
                date: new Date().toLocaleDateString(),
                url: fileUrl,
                size: (fileObj.size / 1024).toFixed(1) + ' KB'
            };
            const updatedDocs = documents.map(folder => {
                if (folder.id === folderId) {
                    return { ...folder, items: [newFile, ...folder.items] };
                }
                return folder;
            });
            setDocuments(updatedDocs);
            saveDocumentsStructure(updatedDocs);
        } catch (error) {
            console.error("Error uploading document:", error);
            alert("Failed to upload document.");
        }
    };

    const deleteDocument = (fileId) => {
        const newDocs = documents.map(folder => ({
            ...folder,
            items: folder.items.filter(item => item.id !== fileId)
        }));
        setDocuments(newDocs);
        saveDocumentsStructure(newDocs);
    };

    // --- Project CRUD (Phase 5.1) ---
    const updateProjectDetails = async (id, newDetails) => {
        try {
            await updateDoc(doc(db, 'projects', id), {
                ...newDetails,
                lastUpdated: new Date().toISOString().split('T')[0]
            });
        } catch (e) {
            console.error("Error updating project:", e);
        }
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            projectsLoading,
            updates,
            actions,
            qa,
            documents,
            photos,
            updateProjectDetails,
            addUpdate,
            deleteUpdate,
            updateUpdate,
            addAction,
            updateActionStatus,
            deleteAction,
            addQuestion,
            addReply,
            deleteQuestion,
            addDocument,
            deleteDocument,
            addPhoto,
            deletePhoto,
            activeProjectId,
            setActiveProjectId
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
