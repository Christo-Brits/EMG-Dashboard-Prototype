import React, { useState } from 'react';
import { Folder, FileText, Upload, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const INITIAL_DOCS = [
    {
        id: 'folder-1',
        name: 'Drawings',
        type: 'folder',
        author: '-',
        date: '-',
        items: [
            { id: 'f1-1', name: 'Drawing_A101_RevC.pdf', type: 'PDF', author: 'Consultant (Arch)', date: '10 Dec 2025' },
            { id: 'f1-2', name: 'Drawing_S204_RevB.pdf', type: 'PDF', author: 'Consultant (Struct)', date: '08 Dec 2025' },
            { id: 'f1-3', name: 'Layout_Plan_Ground.dwg', type: 'DWG', author: 'Consultant (Arch)', date: '01 Dec 2025' },
        ]
    },
    {
        id: 'folder-2',
        name: 'RFIs & Technical Queries',
        type: 'folder',
        author: '-',
        date: '-',
        items: [
            { id: 'f2-1', name: 'RFI_012_BakeryFloorLevels.pdf', type: 'PDF', author: 'EMG (Christo)', date: '12 Dec 2025' },
            { id: 'f2-2', name: 'TQ_004_SteelConnection.pdf', type: 'PDF', author: 'Contractor', date: '05 Dec 2025' },
        ]
    },
    {
        id: 'folder-3',
        name: 'Reports & Inspections',
        type: 'folder',
        author: '-',
        date: '-',
        items: [
            { id: 'f3-1', name: 'Weekly_Site_Report_2025-12-08.pdf', type: 'PDF', author: 'EMG', date: '08 Dec 2025' },
            { id: 'f3-2', name: 'Safety_Audit_Nov25.pdf', type: 'PDF', author: 'Safety Officer', date: '30 Nov 2025' },
        ]
    },
    {
        id: 'folder-4',
        name: 'Site Instructions',
        type: 'folder',
        author: '-',
        date: '-',
        items: [
            { id: 'f4-1', name: 'SI_003_PaintSpecChange.pdf', type: 'PDF', author: 'Client', date: '03 Dec 2025' }
        ]
    }
];

const DocumentsTab = () => {
    const { isAdmin } = useAuth();
    const [docs, setDocs] = useState(INITIAL_DOCS);
    const [expandedFolders, setExpandedFolders] = useState(['folder-1', 'folder-2', 'folder-3', 'folder-4']);

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

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
            setDocs(prev => prev.map(folder => ({
                ...folder,
                items: folder.items.filter(item => item.id !== fileToDelete)
            })));
            setFileToDelete(null);
        }
    };

    const handleUpload = () => {
        alert("Upload logic would go here. (Prototype only)");
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

            {/* Calm Header Line */}
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg mb-6 flex items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-blue-800">
                    All project documentation is stored and accessed centrally to ensure clarity and version control.
                </p>
                <button
                    onClick={handleUpload}
                    className="btn btn-outline bg-white text-xs whitespace-nowrap gap-2 hover:bg-blue-50 border-blue-200 text-blue-700"
                >
                    <Upload size={14} /> Upload Document
                </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                    <div className="col-span-6">File Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Uploaded By</div>
                    <div className="col-span-2 text-right">Date</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {docs.map(folder => {
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
                                            <span className="text-sm text-gray-600 hover:text-gray-900 hover:underline cursor-pointer truncate mr-2">
                                                {file.name}
                                            </span>

                                            {isAdmin && (
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
        </div>
    );
};

export default DocumentsTab;
