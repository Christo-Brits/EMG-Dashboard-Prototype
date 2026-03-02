import React, { createContext, useContext, useState, useEffect } from 'react';
import { PROJECTS, UPDATES, ACTIONS, QA, DOCUMENTS } from '../data/mockData';
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
    orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProjectContext = createContext();

export const useProjectData = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [projects, setProjects] = useState(PROJECTS);
    const [updates, setUpdates] = useState([]);
    const [actions, setActions] = useState([]);
    const [qa, setQa] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [photos, setPhotos] = useState([]);

    // --- Firestore Subscriptions ---
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
            setUpdates(data.length > 0 ? data : UPDATES);
        }, (err) => console.error("Updates Sync Error:", err));

        // Actions
        const actionsRef = collection(db, 'projects', PID, 'actions');
        const unsubActions = onSnapshot(actionsRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            setActions(data.length > 0 ? data : ACTIONS);
        });

        // Q&A
        const qaRef = collection(db, 'projects', PID, 'qa');
        const unsubQA = onSnapshot(qaRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setQa(data.length > 0 ? data : QA);
        });

        // Photos
        const photosRef = collection(db, 'projects', PID, 'photos');
        const unsubPhotos = onSnapshot(photosRef, (snapshot) => {
            const data = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
            data.sort((a, b) => b.id - a.id);
            setPhotos(data);
        });

        // Documents
        const docStructRef = doc(db, 'projects', PID, 'data', 'documents');
        const unsubDocs = onSnapshot(docStructRef, (docSnap) => {
            if (docSnap.exists()) {
                setDocuments(docSnap.data().structure);
            } else {
                setDoc(docStructRef, { structure: DOCUMENTS });
                setDocuments(DOCUMENTS);
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

    // --- File Upload Helper ---
    const uploadFile = async (file, path) => {
        if (!file) return null;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    // --- Specific Add Functions ---
    const addUpdate = (text, author) => {
        const timestamp = new Date().toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const date = new Date().toISOString().split('T')[0];

        addToCollection('updates', {
            text,
            author,
            timestamp,
            date,
            type: 'progress'
        });
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
        addToCollection('actions', {
            text,
            assignee,
            dueDate,
            status: 'Open'
        });
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
                author: author,
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
                url,
                caption,
                author,
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
                author: author,
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

    // --- Project Details ---
    const updateProjectDetails = (id, newDetails) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...newDetails } : p));
    };

    return (
        <ProjectContext.Provider value={{
            projects,
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
