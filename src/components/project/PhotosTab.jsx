import React, { useState, useRef, useMemo } from 'react';
import { Calendar, Tag, Trash2, Upload, Plus, Camera, Search, Filter, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjectData } from '../../context/ProjectContext';
import { useToast } from '../common/Toast';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const PAGE_SIZE = 9;

const PhotosTab = () => {
    const { user, isAdmin } = useAuth();
    const { photos, addPhoto, deletePhoto } = useProjectData();
    const toast = useToast();

    const [showUpload, setShowUpload] = useState(false);
    const [newPhoto, setNewPhoto] = useState({ desc: '', tag: 'Progress', file: null, preview: '' });
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState('All');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const tags = useMemo(() => {
        const allTags = photos.map(p => p.tag).filter(Boolean);
        return ['All', ...new Set(allTags)];
    }, [photos]);

    const filteredPhotos = useMemo(() => {
        let result = [...photos];
        if (filterTag !== 'All') {
            result = result.filter(p => p.tag === filterTag);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.caption || p.desc || '').toLowerCase().includes(q) ||
                (p.author || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [photos, filterTag, searchQuery]);

    const visiblePhotos = filteredPhotos.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPhotos.length;

    const confirmDelete = (id) => {
        setPhotoToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (photoToDelete) {
            deletePhoto(photoToDelete);
            setPhotoToDelete(null);
            toast.success('Photo deleted.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setNewPhoto(prev => ({ ...prev, file: file, preview: previewUrl }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!newPhoto.file) {
            toast.warning('Please select a photo first.');
            return;
        }
        if (!newPhoto.desc.trim()) {
            toast.warning('Please add a description.');
            return;
        }

        setIsUploading(true);
        try {
            await addPhoto(newPhoto.file, newPhoto.desc, user?.name || 'Unknown');
            toast.success('Photo uploaded successfully.');
            setShowUpload(false);
            setNewPhoto({ desc: '', tag: 'Progress', file: null, preview: '' });
        } catch {
            toast.error('Failed to upload photo. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-brand-primary)]">Site Photos</h2>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => setShowUpload(true)}
                            className="btn btn-primary text-xs gap-1"
                        >
                            <Plus size={14} /> Upload Photo
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

            {/* Search & Filter */}
            {photos.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search photos..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {tags.length > 2 && (
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={filterTag}
                                onChange={(e) => { setFilterTag(e.target.value); setVisibleCount(PAGE_SIZE); }}
                                className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-white"
                            >
                                {tags.map(t => (
                                    <option key={t} value={t}>{t === 'All' ? 'All Tags' : t}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {showUpload && (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-6 animate-in fade-in">
                    <h3 className="font-bold text-gray-700 text-sm mb-3">Upload Site Photo</h3>
                    <form onSubmit={handleUpload} className="space-y-3">
                        <div>
                            <input
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Photo Description"
                                required
                                value={newPhoto.desc}
                                onChange={e => setNewPhoto({ ...newPhoto, desc: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                className="p-2 text-sm border border-gray-300 rounded sm:w-1/3"
                                value={newPhoto.tag}
                                onChange={e => setNewPhoto({ ...newPhoto, tag: e.target.value })}
                            >
                                <option>Progress</option>
                                <option>Safety</option>
                                <option>Site Works</option>
                                <option>Interior</option>
                                <option>Exterior</option>
                            </select>

                            <div className="flex-1 flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    disabled={isUploading}
                                    className={`flex-1 p-2 text-sm border rounded flex items-center justify-center gap-2 transition-colors ${newPhoto.preview ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {newPhoto.preview ? (
                                        <><Camera size={16} /> Photo Selected</>
                                    ) : (
                                        <><Upload size={16} /> Select from Device</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {newPhoto.preview && (
                            <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 bg-black/5">
                                <img src={newPhoto.preview} alt="Preview" className="w-full h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={() => setNewPhoto({ ...newPhoto, file: null, preview: '' })}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => { setShowUpload(false); setNewPhoto({ desc: '', tag: 'Progress', file: null, preview: '' }); }} className="btn btn-outline text-xs bg-white">Cancel</button>
                            <button type="submit" className="btn btn-primary text-xs flex items-center gap-2" disabled={!newPhoto.file || isUploading}>
                                {isUploading ? (
                                    <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                                ) : (
                                    'Save Photo'
                                )}
                            </button>
                        </div>
                    </form>
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
            ) : filteredPhotos.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Search size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 mb-1">No photos match your search</p>
                    <p className="text-xs text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <>
                    {(searchQuery || filterTag !== 'All') && (
                        <p className="text-xs text-gray-400 mb-4">
                            Showing {filteredPhotos.length} of {photos.length} photos
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {visiblePhotos.map((photo) => (
                            <div key={photo.id} className="group cursor-pointer relative">
                                <div className="aspect-[4/3] bg-gray-100 rounded-md overflow-hidden relative border border-gray-200 mb-3">
                                    <img
                                        src={photo.url || photo.src}
                                        alt={photo.desc || photo.caption}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                                    {isAdmin && (
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

                    {hasMore && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                                className="text-sm text-gray-500 hover:text-[var(--color-brand-primary)] bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 transition-colors"
                            >
                                Load More Photos ({filteredPhotos.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PhotosTab;
