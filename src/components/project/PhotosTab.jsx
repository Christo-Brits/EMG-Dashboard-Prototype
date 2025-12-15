import React, { useState, useRef } from 'react';
import { Calendar, Tag, Trash2, Upload, Plus, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PROJECTS } from '../../data/mockData';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const PhotosTab = () => {
    const { isAdmin } = useAuth();

    const baseImage = PROJECTS[0].image;
    const [photos, setPhotos] = useState([
        { id: 1, src: baseImage, date: '14 Dec 2025', tag: 'Exterior', desc: 'North Elevation completion' },
        { id: 2, src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070', date: '12 Dec 2025', tag: 'Site Works', desc: 'Excavation for Zone C' },
        { id: 3, src: 'https://images.unsplash.com/photo-1590644365607-1c5a38fc43e0?auto=format&fit=crop&q=80&w=2043', date: '10 Dec 2025', tag: 'Interior', desc: 'Cold store panel installation' },
        { id: 4, src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2070', date: '08 Dec 2025', tag: 'Safety', desc: 'Site safety briefing area' },
        { id: 5, src: 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&q=80&w=1997', date: '05 Dec 2025', tag: 'Structure', desc: 'Steel beams arrival' },
        { id: 6, src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2000', date: '01 Dec 2025', tag: 'Progress', desc: 'Foundation pouring' },
    ]);

    const [showUpload, setShowUpload] = useState(false);
    const [newPhoto, setNewPhoto] = useState({ desc: '', tag: 'Progress', src: '' });
    const fileInputRef = useRef(null);

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState(null);

    const confirmDelete = (id) => {
        setPhotoToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (photoToDelete) {
            setPhotos(prev => prev.filter(p => p.id !== photoToDelete));
            setPhotoToDelete(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPhoto(prev => ({ ...prev, src: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();

        if (!newPhoto.src) {
            alert("Please select a photo first.");
            return;
        }

        const photo = {
            id: Date.now(),
            src: newPhoto.src,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            tag: newPhoto.tag,
            desc: newPhoto.desc
        };
        setPhotos(prev => [photo, ...prev]);
        setShowUpload(false);
        setNewPhoto({ desc: '', tag: 'Progress', src: '' });
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
                    <button className="btn btn-outline text-xs px-3">Latest</button>
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleExecuteDelete}
                title="Delete Photo"
                itemType="photo"
            />

            {/* Upload Modal (Simplified inline) */}
            {showUpload && (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 mb-6 animate-in fade-in">
                    <h3 className="font-bold text-gray-700 text-sm mb-3">Add New Photo</h3>
                    <form onSubmit={handleUpload} className="space-y-3">
                        <div>
                            <input
                                className="w-full p-2 text-sm border border-gray-300 rounded"
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
                                    className={`flex-1 p-2 text-sm border rounded flex items-center justify-center gap-2 transition-colors ${newPhoto.src ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {newPhoto.src ? (
                                        <>
                                            <Camera size={16} /> Photo Selected
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} /> Upload form Device / Camera
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {newPhoto.src && (
                            <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 bg-black/5">
                                <img src={newPhoto.src} alt="Preview" className="w-full h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={() => setNewPhoto({ ...newPhoto, src: '' })}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowUpload(false)} className="btn btn-outline text-xs bg-white">Cancel</button>
                            <button type="submit" className="btn btn-primary text-xs" disabled={!newPhoto.src}>Save Photo</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {photos.map((photo) => (
                    <div key={photo.id} className="group cursor-pointer relative">
                        <div className="aspect-[4/3] bg-gray-100 rounded-md overflow-hidden relative border border-gray-200 mb-3">
                            <img
                                src={photo.src}
                                alt={photo.desc}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                                <h3 className="text-sm font-medium text-[var(--color-brand-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">{photo.desc}</h3>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-secondary)]">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {photo.date}</span>
                                <span className="flex items-center gap-1"><Tag size={12} /> {photo.tag}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotosTab;
