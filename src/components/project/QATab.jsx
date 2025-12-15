import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectData } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ChevronRight, HelpCircle, X, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const QATab = () => {
    const { qa, addQuestion, deleteQuestion } = useProjectData();
    const { user, isAdmin } = useAuth();

    const [showForm, setShowForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: '', context: '', category: 'RFI' });

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

    const confirmDelete = (e, id) => {
        e.preventDefault(); // Stop Link navigation
        e.stopPropagation();
        setQuestionToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (questionToDelete) {
            deleteQuestion(questionToDelete);
            setQuestionToDelete(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addQuestion(newQuestion);
        setNewQuestion({ title: '', context: '', category: 'RFI' });
        setShowForm(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Project Q&A</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">Visible to all project stakeholders</p>
                </div>
                {user && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary text-sm gap-2"
                    >
                        <HelpCircle size={16} />
                        Ask Question
                    </button>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleExecuteDelete}
                title="Delete Question"
                itemType="question thread"
            />

            {showForm && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-amber-800 text-sm">Post New Question</h3>
                        <button onClick={() => setShowForm(false)} className="text-amber-400 hover:text-amber-600"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Subject / Question</label>
                                <input
                                    className="w-full p-2 text-sm border border-amber-200 rounded"
                                    required
                                    placeholder="e.g. Clarification on perimeter fence"
                                    value={newQuestion.title}
                                    onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Category</label>
                                <select
                                    className="w-full p-2 text-sm border border-amber-200 rounded"
                                    value={newQuestion.category}
                                    onChange={e => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                >
                                    <option>RFI</option>
                                    <option>Access</option>
                                    <option>Safety</option>
                                    <option>Design</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Detailed Context</label>
                            <textarea
                                className="w-full p-2 text-sm border border-amber-200 rounded"
                                rows="3"
                                required
                                placeholder="Provide enough detail for the team to answer..."
                                value={newQuestion.context}
                                onChange={e => setNewQuestion({ ...newQuestion, context: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="btn btn-primary bg-amber-600 hover:bg-amber-700 border-transparent text-xs text-white">Post Question</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {qa.map((item) => (
                    <Link key={item.id} to={`/question/${item.id}`} className="block relative group">
                        <div className="card p-5 border-gray-200 hover:border-[var(--color-accent)] hover:shadow-md transition-all cursor-pointer animate-in fade-in">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'Answered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.status}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium border border-gray-100 px-2 py-0.5 rounded-full bg-white">{item.category}</span>
                                </div>
                                <span className="text-xs text-gray-400">{item.date}</span>
                            </div>

                            <h3 className="text-lg font-semibold text-[var(--color-brand-primary)] group-hover:text-[var(--color-accent)] mb-2 flex items-center justify-between">
                                {item.title}
                                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-accent)]" size={20} />
                            </h3>

                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                {item.context}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                <MessageSquare size={14} />
                                {item.replies.length} replies
                                {item.replies.length > 0 && (
                                    <span>• Last reply by {item.replies[item.replies.length - 1].author}</span>
                                )}
                            </div>
                        </div>

                        {/* Admin Delete Button - Absolute Positioned */}
                        {isAdmin && (
                            <button
                                onClick={(e) => confirmDelete(e, item.id)}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                                title="Delete Thread"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QATab;
