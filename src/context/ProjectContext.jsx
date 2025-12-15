import React, { createContext, useContext, useState, useEffect } from 'react';
import { PROJECTS, UPDATES, ACTIONS, QA, DOCUMENTS } from '../data/mockData';

const ProjectContext = createContext();

export const useProjectData = () => useContext(ProjectContext);

// Encryption key for local storage (simple prefix)
const STORAGE_PREFIX = 'emg_portal_v1_';

const usePersistentState = (key, initialValue) => {
    // Lazy initialization to read from storage once on mount
    const [state, setState] = useState(() => {
        try {
            const storedValue = localStorage.getItem(STORAGE_PREFIX + key);
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Sync to storage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
};

export const ProjectProvider = ({ children }) => {
    // Use persistent state for all data types
    const [projects, setProjects] = usePersistentState('projects', PROJECTS);
    const [updates, setUpdates] = usePersistentState('updates', UPDATES);
    const [actions, setActions] = usePersistentState('actions', ACTIONS);
    const [qa, setQa] = usePersistentState('qa', QA);
    const [documents, setDocuments] = usePersistentState('documents', DOCUMENTS);

    // Also store photos separately if needed, but typically they are part of project/updates context. 
    // For this prototype, photos in 'PhotosTab' are local. We should persist them if we want full persistence.
    // NOTE: PhotosTab logic was fully local in previous steps. To persist photos, we need to lift that state here.
    // For now, let's persist the requested items: Updates, Docs, Q&A, Actions.
    // If the user uploads photos in PhotosTab, we need to handle that via a new context state or just let it reset.
    // Given the prompt "updating photos... when we login again", I'll add a 'photos' state here too.

    // If photos are empty (first load), might want to seed them.
    // For now we start empty or with storage value.
    const [photos, setPhotos] = usePersistentState('photos', [
        { id: 1, src: PROJECTS[0].image, date: '14 Dec 2025', tag: 'Exterior', desc: 'North Elevation completion' },
        { id: 2, src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070', date: '12 Dec 2025', tag: 'Site Works', desc: 'Excavation for Zone C' },
        { id: 3, src: 'https://images.unsplash.com/photo-1590644365607-1c5a38fc43e0?auto=format&fit=crop&q=80&w=2043', date: '10 Dec 2025', tag: 'Interior', desc: 'Cold store panel installation' },
        { id: 4, src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2070', date: '08 Dec 2025', tag: 'Safety', desc: 'Site safety briefing area' },
        { id: 5, src: 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&q=80&w=1997', date: '05 Dec 2025', tag: 'Structure', desc: 'Steel beams arrival' },
        { id: 6, src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2000', date: '01 Dec 2025', tag: 'Progress', desc: 'Foundation pouring' },
    ]);
    // Note: The previous PhotosTab implementation used internal File objects which can't be stringified. 
    // We will need to store base64 strings or URLs. 
    // The current PhotosTab relies on URL.createObjectURL or FileReader which produces big strings.
    // LocalStorage has a 5MB limit. Storing many base64 images WILL break it.
    // Strategy: We will persist metadata, but warn about storage limits or only store small thumbnails.
    // For a prototype, we'll try storing the base64, but if it fails, we handle error.

    // --- Project Details ---
    const updateProjectDetails = (id, newDetails) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...newDetails } : p));
    };

    // --- Updates ---
    const addUpdate = (update) => {
        const newUpdate = { ...update, id: Date.now() };
        setUpdates(prev => [newUpdate, ...prev]);
    };

    // --- Actions ---
    const addAction = (action) => {
        const newAction = { ...action, id: Date.now(), status: 'Open' };
        setActions(prev => [...prev, newAction]);
    };

    const updateActionStatus = (id, status) => {
        setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const deleteAction = (id) => {
        setActions(prev => prev.filter(a => a.id !== id));
    };

    // --- Q&A ---
    const addQuestion = (question) => {
        const newQuestion = {
            ...question,
            id: Date.now(),
            status: 'Open',
            replies: [],
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        setQa(prev => [newQuestion, ...prev]);
    };

    const addReply = (questionId, replyContent, author) => {
        setQa(prev => prev.map(q => {
            if (q.id.toString() === questionId.toString()) {
                const newReply = {
                    author: author,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    content: replyContent
                };
                return { ...q, replies: [...q.replies, newReply], status: 'Answered' };
            }
            return q;
        }));
    };

    const deleteQuestion = (id) => {
        setQa(prev => prev.filter(q => q.id !== id));
    };

    // --- Documents ---
    const addDocument = (file, folderId, author) => {
        const newFile = {
            id: `new-${Date.now()}`,
            name: file.name,
            type: file.name.split('.').pop().toUpperCase(),
            author: author,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        };

        setDocuments(prev => prev.map(folder => {
            if (folder.id === folderId) {
                return { ...folder, items: [newFile, ...folder.items] };
            }
            return folder;
        }));
    };

    const deleteDocument = (fileId) => {
        setDocuments(prev => prev.map(folder => ({
            ...folder,
            items: folder.items.filter(item => item.id !== fileId)
        })));
    };

    // --- Photos (Simple Metadata Persistence) ---
    // This allows other components to register photos. 
    // We will modify PhotosTab to use this instead of local state.
    const addPhoto = (photo) => {
        setPhotos(prev => [photo, ...prev]);
    };

    const deletePhoto = (id) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
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
