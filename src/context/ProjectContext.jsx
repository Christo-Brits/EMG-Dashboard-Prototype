import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../config/firebase';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    documentId
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

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
    const { notifyProjectTeam } = useNotifications() || {};

    const [activeProjectId, setActiveProjectId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [updates, setUpdates] = useState([]);
    const [actions, setActions] = useState([]);
    const [qa, setQa] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    // --- Firestore Projects Subscription (filtered by user access) ---
    useEffect(() => {
        if (!user) {
            setProjects([]);
            setProjectsLoading(false);
            return;
        }

        setProjectsLoading(true);

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
            console.error('Projects sync error:', err);
            setProjectsLoading(false);
        });

        return unsub;
    }, [user, isAdmin]);

    // --- Per-project data subscriptions ---
    useEffect(() => {
        if (!db || !activeProjectId) {
            setUpdates([]);
            setActions([]);
            setQa([]);
            setPhotos([]);
            setDocuments([]);
            return;
        }

        setDataLoading(true);
        const PID = activeProjectId;
        let loadedCount = 0;
        const checkLoaded = () => { loadedCount++; if (loadedCount >= 5) setDataLoading(false); };

        // Updates
        const unsubUpdates = onSnapshot(collection(db, 'projects', PID, 'updates'), (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setUpdates(data);
            checkLoaded();
        }, (err) => { console.error("Updates Sync Error:", err); checkLoaded(); });

        // Actions
        const unsubActions = onSnapshot(collection(db, 'projects', PID, 'actions'), (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            setActions(data);
            checkLoaded();
        });

        // Q&A
        const unsubQA = onSnapshot(collection(db, 'projects', PID, 'qa'), (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setQa(data);
            checkLoaded();
        });

        // Photos
        const unsubPhotos = onSnapshot(collection(db, 'projects', PID, 'photos'), (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setPhotos(data);
            checkLoaded();
        });

        // Documents
        const docStructRef = doc(db, 'projects', PID, 'data', 'documents');
        const unsubDocs = onSnapshot(docStructRef, (docSnap) => {
            if (docSnap.exists()) {
                setDocuments(docSnap.data().structure);
            } else {
                setDoc(docStructRef, { structure: DEFAULT_FOLDERS });
                setDocuments(DEFAULT_FOLDERS);
            }
            checkLoaded();
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

    // Generic helper to add to a subcollection
    const addToCollection = async (collectionName, item) => {
        const newItem = { ...item, id: Date.now() }; // Ensure numeric ID for sort
        if (!activeProjectId) return;
        try {
            await addDoc(collection(db, 'projects', activeProjectId, collectionName), newItem);
        } catch (e) {
            console.error(`Error adding to ${collectionName}:`, e);
            alert("Sync Error: Check your Firebase Config.");
        }
    };

    // Generic helper to delete
    const deleteFromCollection = async (collectionName, firestoreId) => {
        if (!firestoreId || !activeProjectId) return;
        try {
            await deleteDoc(doc(db, 'projects', activeProjectId, collectionName, firestoreId));
        } catch (e) {
            console.error(`Error deleting from ${collectionName}:`, e);
        }
    };

    // Generic helper to update
    const updateInCollection = async (collectionName, firestoreId, updates) => {
        if (!firestoreId || !activeProjectId) return;
        try {
            await updateDoc(doc(db, 'projects', activeProjectId, collectionName, firestoreId), updates);
        } catch (e) {
            console.error(`Error updating ${collectionName}:`, e);
        }
    };

    // --- File Input Helper ---
    const uploadFile = async (file, path) => {
        if (!file) return null;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    // --- Notification helper ---
    const getProjectName = () => projects.find(p => p.id === activeProjectId)?.name || activeProjectId;

    const notify = (type, message, link) => {
        if (notifyProjectTeam && activeProjectId) {
            notifyProjectTeam(activeProjectId, getProjectName(), { type, message, link }).catch(() => {});
        }
    };

    // --- Specific Add Functions ---

    const addUpdate = (content, author, tag = 'Progress') => {
        const timestamp = new Date().toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const date = new Date().toISOString().split('T')[0];

        addToCollection('updates', {
            content,
            author,
            timestamp,
            date,
            tag,
            type: 'progress'
        });
        notify('update', `${author} posted an update on ${getProjectName()}`, `/project/${activeProjectId}/updates`);
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
    const addAction = (task, assignedTo, dueDate) => {
        addToCollection('actions', {
            task,
            assignedTo,
            dueDate,
            status: 'Open'
        });
        notify('action_assigned', `New action: ${task}`, `/project/${activeProjectId}/actions`);
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
    const addQuestion = (questionData, author) => {
        // questionData can be a string (legacy) or an object { title, context, category }
        const fields = typeof questionData === 'string'
            ? { question: questionData }
            : { title: questionData.title, context: questionData.context, category: questionData.category };

        addToCollection('qa', {
            ...fields,
            author,
            status: 'Open',
            replies: [],
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
        const title = typeof questionData === 'string' ? questionData : questionData.title;
        notify('qa_question', `New question: ${title}`, `/project/${activeProjectId}/qa`);
    };

    const addReply = (questionId, replyContent, author) => {
        // We need to find the doc, get its current replies, and update array
        // Firestore 'arrayUnion' is better but we have object array. 
        // Simplest: Read client state, update, write back.
        const thread = qa.find(q => q.id.toString() === questionId.toString());
        if (thread) {
            const newReply = {
                author: author,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                content: replyContent
            };
            const updatedReplies = [...thread.replies, newReply];
            updateInCollection('qa', thread.firestoreId, { replies: updatedReplies, status: 'Answered' });
            notify('qa_answer', `${author} answered: ${thread.title || 'a question'}`, `/project/${activeProjectId}/qa`);
        }
    };

    const deleteQuestion = (id) => {
        const item = qa.find(q => q.id === id);
        if (item) deleteFromCollection('qa', item.firestoreId);
    };

    // --- Photos ---
    const addPhoto = async (file, caption, author) => {
        if (!activeProjectId) return;

        // 1. Upload to Storage
        const fileName = `${Date.now()}_${file.name}`;
        const path = `projects/${activeProjectId}/photos/${fileName}`;

        try {
            const url = await uploadFile(file, path);

            // 2. Save metadata to Firestore
            addToCollection('photos', {
                url, // Now a remote URL
                caption,
                author,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now()
            });
            notify('photo_upload', `${author} uploaded a photo to ${getProjectName()}`, `/project/${activeProjectId}/photos`);
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Failed to upload photo.");
        }
    };
    const deletePhoto = (id) => {
        const item = photos.find(p => p.id === id);
        if (item) deleteFromCollection('photos', item.firestoreId);
    };

    // --- Documents (Full Structure Update) ---
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
            // Upload if it's a real file
            const fileName = `${Date.now()}_${fileObj.name}`;
            const path = `projects/${activeProjectId}/documents/${fileName}`;
            const fileUrl = await uploadFile(fileObj, path);

            const newFile = {
                id: Date.now(),
                name: fileObj.name,
                type: fileObj.name.split('.').pop().toUpperCase(),
                author: author,
                date: new Date().toLocaleDateString(),
                url: fileUrl, // Remote URL
                size: (fileObj.size / 1024).toFixed(1) + ' KB'
            };

            const updatedDocs = documents.map(folder => {
                if (folder.id === folderId) {
                    return { ...folder, items: [newFile, ...folder.items] };
                }
                return folder;
            });
            // Optimistic update
            setDocuments(updatedDocs);
            saveDocumentsStructure(updatedDocs);
            notify('document_upload', `${author} uploaded: ${fileObj.name}`, `/project/${activeProjectId}/documents`);

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

    // --- Project Details ---
    const updateProjectDetails = async (id, newDetails) => {
        // Optimistic local update
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...newDetails } : p));
        // Sync to Firestore
        try {
            await updateDoc(doc(db, 'projects', id), { ...newDetails, lastUpdated: new Date().toISOString().split('T')[0] });
        } catch (e) {
            console.error('Error updating project details:', e);
        }
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            projectsLoading,
            dataLoading,
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
