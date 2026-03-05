import React, { useState, useRef, useCallback } from 'react';
import { Calendar, Tag, Trash2, Upload, Plus, Camera, X, Loader2, CheckCircle, AlertCircle, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjectData } from '../../context/ProjectContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

/**
 * Convert HEIC/HEIF files to JPEG using heic2any (lazy-loaded).
 * Returns the original file if not HEIC or if conversion fails.
 */
const convertHeicIfNeeded = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'heic' && ext !== 'heif') return file;

    try {
        const heic2any = (await import('heic2any')).default;
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        const converted = Array.isArray(blob) ? blob[0] : blob;
        return new File([converted], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
    } catch (err) {
        console.error('HEIC conversion failed:', err);
        return file;
    }
};

const PhotosTab = () => {
    const { user } = useAuth();
    const { photos, addPhoto, deletePhoto } = useProjectData();
    const { canUploadFiles, canDeleteFiles } = useProjectPermissions();

    const [showUpload, setShowUpload] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]); // { id, file, preview, desc, tag, status: 'pending'|'uploading'|'done'|'error' }
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);

    const confirmDelete = (id) => {
        setPhotoToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (photoToDelete) {
            deletePhoto(photoToDelete);
            setPhotoToDelete(null);
        }
    };

    // --- File handling ---
    const processFiles = useCallback(async (files) => {
        const imageFiles = Array.from(files).filter(f =>
            f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)
        );

        if (imageFiles.length === 0) return;

        const newItems = await Promise.all(
            imageFiles.map(async (file) => {
                const converted = await convertHeicIfNeeded(file);
                return {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    file: converted,
                    preview: URL.createObjectURL(converted),
                    desc: converted.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
                    tag: 'Progress',
                    status: 'pending',
                };
            })
        );

        setUploadQueue(prev => [...prev, ...newItems]);
        if (!showUpload) setShowUpload(true);
    }, [showUpload]);

    const handleFileChange = (e) => {
        processFiles(e.target.files);
        e.target.value = ''; // Reset so same file can be re-selected
    };

    const removeFromQueue = (id) => {
        setUploadQueue(prev => {
            const item = prev.find(i => i.id === id);
            if (item?.preview) URL.revokeObjectURL(item.preview);
            return prev.filter(i => i.id !== id);
        });
    };

    const updateQueueItem = (id, updates) => {
        setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleUploadAll = async () => {
        const pending = uploadQueue.filter(i => i.status === 'pending');
        if (pending.length === 0) return;

        for (const item of pending) {
            updateQueueItem(item.id, { status: 'uploading' });
            try {
                await addPhoto(item.file, item.desc, user?.name || 'Unknown');
                updateQueueItem(item.id, { status: 'done' });
            } catch (err) {
                console.error('Upload failed:', err);
                updateQueueItem(item.id, { status: 'error' });
            }
        }

        // Auto-clear completed after a delay
        setTimeout(() => {
            setUploadQueue(prev => {
                prev.filter(i => i.status === 'done').forEach(i => URL.revokeObjectURL(i.preview));
                return prev.filter(i => i.status !== 'done');
            });
        }, 2000);
    };

    const handleCloseUpload = () => {
        uploadQueue.forEach(i => { if (i.preview) URL.revokeObjectURL(i.preview); });
        setUploadQueue([]);
        setShowUpload(false);
    };

    // --- Drag and drop ---
    const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const pendingCount = uploadQueue.filter(i => i.status === 'pending').length;
    const uploadingCount = uploadQueue.filter(i => i.status === 'uploading').length;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Site Photos</h2>
                <div className="flex gap-2">
                    {canUploadFiles && (
                        <button
                            onClick={() => setShowUpload(true)}
                            className="btn btn-primary text-xs gap-1"
                        >
                            <Plus size={14} /> Upload Photos
                        </button>
                    )}
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleExecuteDelete}
                title="Delete Photo"
                itemType="photo"
            />

            {/* Upload Panel */}
            {showUpload && (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 mb-6 transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-700 text-sm">Upload Site Photos</h3>
                        <button onClick={handleCloseUpload} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>

                    {/* Drop zone / file selector */}
                    <div className="text-center mb-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,.heic,.heif"
                            multiple
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-outline gap-2 text-sm mx-auto"
                        >
                            <Upload size={16} /> Select Photos
                        </button>
                        <p className="text-xs text-gray-400 mt-2">
                            or drag and drop · Supports JPEG, PNG, HEIC and more
                        </p>
                    </div>

                    {/* Upload Queue */}
                    {uploadQueue.length > 0 && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {uploadQueue.map(item => (
                                    <div key={item.id} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="aspect-[4/3] bg-gray-100 relative">
                                            <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                            {item.status === 'uploading' && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <Loader2 size={24} className="animate-spin text-white" />
                                                </div>
                                            )}
                                            {item.status === 'done' && (
                                                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                    <CheckCircle size={24} className="text-green-600" />
                                                </div>
                                            )}
                                            {item.status === 'error' && (
                                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                    <AlertCircle size={24} className="text-red-600" />
                                                </div>
                                            )}
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => removeFromQueue(item.id)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <input
                                                className="w-full text-xs p-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                placeholder="Description"
                                                value={item.desc}
                                                disabled={item.status !== 'pending'}
                                                onChange={(e) => updateQueueItem(item.id, { desc: e.target.value })}
                                            />
                                            <select
                                                className="w-full text-xs p-1.5 border border-gray-200 rounded"
                                                value={item.tag}
                                                disabled={item.status !== 'pending'}
                                                onChange={(e) => updateQueueItem(item.id, { tag: e.target.value })}
                                            >
                                                <option>Progress</option>
                                                <option>Safety</option>
                                                <option>Site Works</option>
                                                <option>Interior</option>
                                                <option>Exterior</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-gray-500">
                                    {pendingCount} photo{pendingCount !== 1 ? 's' : ''} ready
                                    {uploadingCount > 0 && ` · ${uploadingCount} uploading`}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={handleCloseUpload} className="btn btn-outline text-xs bg-white">Cancel</button>
                                    <button
                                        onClick={handleUploadAll}
                                        disabled={pendingCount === 0 || uploadingCount > 0}
                                        className="btn btn-primary text-xs gap-1 disabled:opacity-50"
                                    >
                                        <Upload size={14} />
                                        Upload {pendingCount > 1 ? `All (${pendingCount})` : ''}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {photos.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Camera size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">No site photos uploaded yet</p>
                    <p className="text-xs text-gray-400">Photos will appear here as they are added by the project team</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {photos.map((photo) => (
                        <div key={photo.id} className="group cursor-pointer relative">
                            <div className="aspect-[4/3] bg-gray-100 rounded-md overflow-hidden relative border border-gray-200 mb-3">
                                <img
                                    src={photo.url || photo.src}
                                    alt={photo.desc || photo.caption}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                                {canDeleteFiles && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); confirmDelete(photo.id); }}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                                        title="Delete Photo"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium text-[var(--color-brand-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">{photo.caption || photo.desc}</h3>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-secondary)]">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {photo.date}</span>
                                    <span className="flex items-center gap-1"><Tag size={12} /> {photo.tag}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhotosTab;
