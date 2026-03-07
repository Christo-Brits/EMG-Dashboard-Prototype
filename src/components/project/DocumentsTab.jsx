import React, { useState } from 'react';
import { Folder, FileText, Upload, ChevronRight, ChevronDown, Trash2, X, ExternalLink, Edit2, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjectData } from '../../context/ProjectContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const UploadModal = ({ isOpen, onClose, folders, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFolderId, setSelectedFolderId] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFile && selectedFolderId) {
            onUpload(selectedFile, selectedFolderId);
            onClose();
            setSelectedFile(null);
            setSelectedFolderId('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Upload Document</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                        <input
                            type="file"
                            required
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                            "
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Folder</label>
                        <select
                            required
                            value={selectedFolderId}
                            onChange={(e) => setSelectedFolderId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="" disabled>Select a folder...</option>
                            {folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn btn-ghost text-sm">Cancel</button>
                        <button type="submit" className="btn btn-primary text-sm flex items-center gap-2">
                            <Upload size={16} /> Upload Now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DocumentsTab = () => {
    const { user } = useAuth();
    const { canUploadFiles, canDeleteFiles, canEditProject } = useProjectPermissions();
    const { projectId } = useParams();

    // Use Context Data
    const { documents, addDocument, deleteDocument, projects, updateProjectDetails } = useProjectData();
    const project = projects.find(p => p.id === projectId);

    const [expandedFolders, setExpandedFolders] = useState(['folder-1', 'folder-2', 'folder-3', 'folder-4']);
    const [editingDriveUrl, setEditingDriveUrl] = useState(false);
    const [driveUrlInput, setDriveUrlInput] = useState('');

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev =>
            prev.includes(folderId)
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        );
    };

    const confirmDelete = (e, fileId) => {
        e.stopPropagation();
        setFileToDelete(fileId);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (fileToDelete) {
            deleteDocument(fileToDelete);
            setFileToDelete(null);
        }
    };

    const handleExecuteUpload = async (file, folderId) => {
        setIsUploading(true);
        try {
            await addDocument(file, folderId, user ? user.name : 'Unknown');

            // Auto-expand the target folder
            if (!expandedFolders.includes(folderId)) {
                setExpandedFolders(prev => [...prev, folderId]);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleExecuteDelete}
                title="Delete Document"
                itemType="document"
            />

            <UploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                folders={documents}
                onUpload={handleExecuteUpload}
            />

            {/* Calm Header Line */}
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg mb-6 flex items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-blue-800">
                    Project documentation is stored centrally for version control and transparency.
                </p>
                {canUploadFiles && (
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        disabled={isUploading}
                        className="btn btn-outline bg-white text-xs whitespace-nowrap gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 disabled:opacity-50"
                    >
                        {isUploading ? <span className="animate-pulse">Uploading...</span> : <><Upload size={14} /> Upload Document</>}
                    </button>
                )}
            </div>

            {/* Google Drive Link */}
            {(project?.driveUrl || canEditProject) && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center flex-shrink-0">
                            <svg width="18" height="18" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.6 66.85L3.3 61.5 29.7 16.5l3.4 5.5z" fill="#0066DA"/>
                                <path d="M57.6 66.85H24.4l13.1-22.5h33.2z" fill="#00AC47"/>
                                <path d="M43.65 0L57.6 23.5 31.2 68.5l-13.9-23.5z" fill="#EA4335"/>
                                <path d="M43.65 0L57.6 23.5H84l-13.9-23.5z" fill="#00832D"/>
                                <path d="M70.7 44.35L84 67.85H57.6l13.1-23.5z" fill="#2684FC"/>
                                <path d="M29.7 16.5l13.95 23.85L30.55 66.85 3.3 61.5z" fill="#FFBA00"/>
                            </svg>
                        </div>
                        {editingDriveUrl ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    value={driveUrlInput}
                                    onChange={(e) => setDriveUrlInput(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={() => { updateProjectDetails(projectId, { driveUrl: driveUrlInput }); setEditingDriveUrl(false); }} className="btn btn-primary text-xs gap-1"><Check size={12} /> Save</button>
                                <button onClick={() => setEditingDriveUrl(false)} className="btn btn-outline text-xs"><X size={12} /></button>
                            </div>
                        ) : project?.driveUrl ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Shared Google Drive folder</span>
                                {canEditProject && (
                                    <button onClick={() => { setDriveUrlInput(project.driveUrl || ''); setEditingDriveUrl(true); }} className="text-gray-300 hover:text-gray-500"><Edit2 size={12} /></button>
                                )}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">No Google Drive folder linked</span>
                        )}
                    </div>
                    {!editingDriveUrl && project?.driveUrl && (
                        <a href={project.driveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline text-xs gap-1.5 whitespace-nowrap">
                            <ExternalLink size={12} /> Open in Google Drive
                        </a>
                    )}
                    {!editingDriveUrl && !project?.driveUrl && canEditProject && (
                        <button onClick={() => { setDriveUrlInput(''); setEditingDriveUrl(true); }} className="btn btn-outline text-xs gap-1">
                            <Edit2 size={12} /> Link Drive Folder
                        </button>
                    )}
                </div>
            )}

            {documents.length === 0 || documents.every(f => f.items.length === 0) ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <FileText size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No documents uploaded yet</p>
                    <p className="text-xs text-gray-400">Documents will appear here as they are added to the project</p>
                </div>
            ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                    <div className="col-span-6">File Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Uploaded By</div>
                    <div className="col-span-2 text-right">Date</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {documents.map(folder => {
                        const isExpanded = expandedFolders.includes(folder.id);
                        return (
                            <React.Fragment key={folder.id}>
                                {/* Folder Row */}
                                <div
                                    onClick={() => toggleFolder(folder.id)}
                                    className="grid grid-cols-12 items-center py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                                >
                                    <div className="col-span-6 flex items-center gap-3">
                                        <span className="text-gray-400 group-hover:text-gray-600">
                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </span>
                                        <Folder size={18} className="text-amber-400 fill-amber-100" />
                                        <span className="font-semibold text-gray-700 text-sm group-hover:text-blue-700">{folder.name}</span>
                                        <span className="text-xs text-gray-400 font-normal">({folder.items.length})</span>
                                    </div>
                                    <div className="col-span-2 text-xs text-gray-400 font-medium">Folder</div>
                                    <div className="col-span-2 text-xs text-gray-400">-</div>
                                    <div className="col-span-2 text-xs text-gray-400 text-right">-</div>
                                </div>

                                {/* File Rows (if expanded) */}
                                {isExpanded && folder.items.map(file => (
                                    <div key={file.id} className="grid grid-cols-12 items-center py-2.5 px-4 bg-slate-50/30 hover:bg-blue-50/30 border-l-4 border-l-transparent hover:border-l-blue-400 transition-all pl-12 group/file">
                                        <div className="col-span-6 flex items-center gap-3">
                                            <FileText size={16} className="text-gray-400" />
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-gray-600 hover:text-blue-600 hover:underline cursor-pointer truncate mr-2"
                                            >
                                                {file.name}
                                            </a>

                                            {canDeleteFiles && (
                                                <button
                                                    onClick={(e) => confirmDelete(e, file.id)}
                                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover/file:opacity-100 transition-all p-1"
                                                    title="Delete Document"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="col-span-2 text-xs text-gray-500 font-mono bg-gray-100 inline-block px-1.5 py-0.5 rounded w-fit">{file.type}</div>
                                        <div className="col-span-2 text-xs text-gray-500">{file.author}</div>
                                        <div className="col-span-2 text-xs text-gray-500 text-right font-medium">{file.date}</div>
                                    </div>
                                ))}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            )}
        </div>
    );
};

export default DocumentsTab;
