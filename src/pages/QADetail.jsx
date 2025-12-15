import React, { useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useProjectData } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const QADetail = () => {
    const { id } = useParams();
    const { qa, addReply } = useProjectData();
    const { user } = useAuth();

    const thread = qa.find(q => q.id.toString() === id);
    const [replyText, setReplyText] = useState('');

    const handleReply = () => {
        if (!replyText.trim()) return;

        const authorName = user.name + (user.role === 'admin' ? ' (Admin)' : '');
        addReply(id, replyText, authorName);
        setReplyText('');
    };

    if (!thread) return <div className="p-8 text-center">Thread not found</div>;

    return (
        <div className="container max-w-4xl pt-6">
            <div className="mb-6">
                <NavLink to="/project/south-mall/qa" className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Project Q&A
                </NavLink>
            </div>

            <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden shadow-sm animate-in fade-in">
                {/* Simple Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex gap-3 mb-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${thread.status === 'Answered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {thread.status}
                        </span>
                        <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full bg-white">{thread.category}</span>
                    </div>

                    <h1 className="text-2xl font-bold text-[var(--color-brand-primary)] mb-2">{thread.title}</h1>

                    <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span>Raised {thread.date}</span>
                        <span>•</span>
                        <span>ID: #{thread.id.toString().padStart(4, '0')}</span>
                    </div>
                </div>

                {/* Context Body */}
                <div className="p-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Context & Question</h3>
                    <div className="prose prose-slate max-w-none text-gray-700 bg-gray-50 p-6 rounded-md border border-gray-100 italic">
                        "{thread.context}"
                    </div>
                </div>

                {/* Replies */}
                <div className="p-8 pt-0">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <MessageSquare size={14} /> Discussion History ({thread.replies.length})
                    </h3>

                    <div className="space-y-6">
                        {thread.replies.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No replies yet.
                            </div>
                        ) : (
                            thread.replies.map((reply, idx) => (
                                <div key={idx} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                            <User size={20} />
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-[var(--color-brand-primary)]">{reply.author}</span>
                                            <span className="text-xs text-gray-400">{reply.date}</span>
                                        </div>
                                        <div className="text-gray-700 leading-relaxed bg-white border border-gray-100 p-4 rounded-lg rounded-tl-none shadow-sm">
                                            {reply.content}
                                        </div>
                                        {/* Mock logic: if it's the last reply, assume it resolved it for now if status is Answered */}
                                        {idx === thread.replies.length - 1 && thread.status === 'Answered' && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                                                <CheckCircle2 size={12} /> Marked as Answer
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Reply Box */}
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                    {user ? (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center text-white flex-shrink-0">
                                <span className="font-bold text-sm">
                                    {user.name.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-grow">
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                    rows="3"
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleReply}
                                        disabled={!replyText.trim()}
                                        className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Post Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-400">
                            Log in to participate in the discussion.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QADetail;
