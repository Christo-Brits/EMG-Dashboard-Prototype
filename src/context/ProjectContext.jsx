import React, { createContext, useContext, useState, useEffect } from 'react';
import { PROJECTS, UPDATES, ACTIONS, QA, DOCUMENTS } from '../data/mockData';
import { db } from '../config/firebase';
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

const ProjectContext = createContext();

export const useProjectData = () => useContext(ProjectContext);

// Hardcoded project ID for the prototype
const PROJECT_ID = 'south-mall';

export const ProjectProvider = ({ children }) => {
    // Initial states (will be populated by Firestore)
    const [projects, setProjects] = useState(PROJECTS);
    const [updates, setUpdates] = useState([]);
    const [actions, setActions] = useState([]);
    const [qa, setQa] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [photos, setPhotos] = useState([]);

    // --- Firestore Subscriptions ---
    useEffect(() => {
        if (!db) return;

        // 1. Projects (Just syncing the main project doc details if we were fully cloud, 
        // but for now we keep PROJECTS mock for the list and just update the specific project from DB if needed.
        // Keeping projects local/mock for the "Select" screen simplicity unless expanded.)

        // 2. Updates
        const updatesRef = collection(db, 'projects', PROJECT_ID, 'updates');
        const qUpdates = query(updatesRef, orderBy('id', 'desc'));
        // Note: 'id' in mock data was timestamp-ish number. 
        // We'll trust the creation time or just sort client side if needed.

        const unsubUpdates = onSnapshot(updatesRef, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
            // Sort by date/id desc
            data.sort((a, b) => b.id - a.id);
            setUpdates(data.length > 0 ? data : UPDATES); // Fallback to mock if empty (optional, maybe better to start empty)
        }, (err) => console.error("Updates Sync Error:", err));

        // 3. Actions
        const actionsRef = collection(db, 'projects', PROJECT_ID, 'actions');
        const unsubActions = onSnapshot(actionsRef, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
            setActions(data.length > 0 ? data : ACTIONS);
        });

        // 4. Q&A
        const qaRef = collection(db, 'projects', PROJECT_ID, 'qa');
        const unsubOA = onSnapshot(qaRef, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
            data.sort((a, b) => b.id - a.id);
            setQa(data.length > 0 ? data : QA);
        });

        // 5. Photos
        const photosRef = collection(db, 'projects', PROJECT_ID, 'photos');
        const unsubPhotos = onSnapshot(photosRef, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id }));
            data.sort((a, b) => b.id - a.id);
            setPhotos(data); // If empty, we might want to seed?
        });

        // 6. Documents (Stored as a single JSON blob for hierarchy structure)
        const docStructRef = doc(db, 'projects', PROJECT_ID, 'data', 'documents');
        const unsubDocs = onSnapshot(docStructRef, (docSnap) => {
            if (docSnap.exists()) {
                setDocuments(docSnap.data().structure);
            } else {
                // If it doesn't exist yet, initialize it
                setDoc(docStructRef, { structure: DOCUMENTS });
                setDocuments(DOCUMENTS);
            }
        });

        return () => {
            unsubUpdates();
            unsubActions();
            unsubOA();
            unsubPhotos();
            unsubDocs();
        };
    }, []);

    // --- Write Functions ---

    // Generic helper to add to a subcollection
    const addToCollection = async (collectionName, item) => {
        const newItem = { ...item, id: Date.now() }; // Ensure numeric ID for sort
        try {
            await addDoc(collection(db, 'projects', PROJECT_ID, collectionName), newItem);
        } catch (e) {
            console.error(`Error adding to ${collectionName}:`, e);
            alert("Sync Error: Check your Firebase Config.");
        }
    };

    // Generic helper to delete
    const deleteFromCollection = async (collectionName, firestoreId) => {
        if (!firestoreId) return;
        try {
            await deleteDoc(doc(db, 'projects', PROJECT_ID, collectionName, firestoreId));
        } catch (e) {
            console.error(`Error deleting from ${collectionName}:`, e);
        }
    };

    // Generic helper to update
    const updateInCollection = async (collectionName, firestoreId, updates) => {
        if (!firestoreId) return;
        try {
            await updateDoc(doc(db, 'projects', PROJECT_ID, collectionName, firestoreId), updates);
        } catch (e) {
            console.error(`Error updating ${collectionName}:`, e);
        }
    };

    // --- Updates ---
    const addUpdate = (update) => addToCollection('updates', update);

    // --- Actions ---
    const addAction = (action) => addToCollection('actions', { ...action, status: 'Open' });
    const updateActionStatus = (id, status) => {
        const item = actions.find(a => a.id === id);
        if (item) updateInCollection('actions', item.firestoreId, { status });
    };
    const deleteAction = (id) => {
        const item = actions.find(a => a.id === id);
        if (item) deleteFromCollection('actions', item.firestoreId);
    };

    // --- Q&A ---
    const addQuestion = (question) => {
        addToCollection('qa', {
            ...question,
            status: 'Open',
            replies: [],
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
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
        }
    };

    const deleteQuestion = (id) => {
        const item = qa.find(q => q.id === id);
        if (item) deleteFromCollection('qa', item.firestoreId);
    };

    // --- Photos ---
    const addPhoto = (photo) => addToCollection('photos', photo);
    const deletePhoto = (id) => {
        const item = photos.find(p => p.id === id);
        if (item) deleteFromCollection('photos', item.firestoreId);
    };

    // --- Documents (Full Structure Update) ---
    const saveDocumentsStruture = async (newDocs) => {
        try {
            await setDoc(doc(db, 'projects', PROJECT_ID, 'data', 'documents'), { structure: newDocs });
        } catch (e) {
            console.error("Error saving docs:", e);
        }
    };

    const addDocument = (file, folderId, author) => {
        const newFile = {
            id: `new-${Date.now()}`,
            name: file.name,
            type: file.name.split('.').pop().toUpperCase(),
            author: author,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        const newDocs = documents.map(folder => {
            if (folder.id === folderId) {
                return { ...folder, items: [newFile, ...folder.items] };
            }
            return folder;
        });
        // Optimistic update
        setDocuments(newDocs);
        saveDocumentsStruture(newDocs);
    };

    const deleteDocument = (fileId) => {
        const newDocs = documents.map(folder => ({
            ...folder,
            items: folder.items.filter(item => item.id !== fileId)
        }));
        setDocuments(newDocs);
        saveDocumentsStruture(newDocs);
    };

    // --- Project Details ---
    const updateProjectDetails = (id, newDetails) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...newDetails } : p));
        // Note: Not syncing this to firestore in this phase as it's less critical/mocked
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
            addAction,
            updateActionStatus,
            deleteAction,
            addQuestion,
            addReply,
            deleteQuestion,
            addDocument,
            deleteDocument,
            addPhoto,
            deletePhoto
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
