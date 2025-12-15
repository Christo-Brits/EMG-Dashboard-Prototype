import React, { createContext, useContext, useState } from 'react';
import { PROJECTS, UPDATES, ACTIONS, QA } from '../data/mockData';

const ProjectContext = createContext();

export const useProjectData = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState(PROJECTS);
    const [updates, setUpdates] = useState(UPDATES);
    const [actions, setActions] = useState(ACTIONS);
    const [qa, setQa] = useState(QA);

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

    return (
        <ProjectContext.Provider value={{
            projects,
            updates,
            actions,
            qa,
            updateProjectDetails,
            addUpdate,
            addAction,
            updateActionStatus,
            deleteAction,
            addQuestion,
            addReply,
            deleteQuestion
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
