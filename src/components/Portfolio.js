import React, { useState, useEffect } from 'react';
import PhotoUpload from './PhotoUpload';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import './Portfolio.css';

function Portfolio() {
    const [photos, setPhotos] = useState([]);
    const [showAdmin, setShowAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const CATEGORIES = [
        'portrait',
        'street',
        'black and white',
        'experimental'
    ];

    const fetchPhotos = () => {
        fetch('http://localhost:5001/api/photos')
            .then(res => res.json())
            .then(data => {
                console.log('Fetched photos:', data);
                setPhotos(data);
            })
            .catch(error => {
                console.error('Error fetching photos:', error);
            });
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const handleAdminAccess = (e) => {
        e.preventDefault();
        if (password === process.env.REACT_APP_ADMIN_PASSWORD) {
            setShowAdmin(true);
            setError(null);
            document.getElementById('adminModal').close();
            setPassword('');
        } else {
            setError('Invalid password');
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/photos/${photoId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchPhotos();
                } else {
                    throw new Error('Failed to delete photo');
                }
            } catch (error) {
                console.error('Error deleting photo:', error);
                alert('Failed to delete photo');
            }
        }
    };

    const PhotoGrid = ({ photos, showAdmin, onDelete }) => {
        const [loadedImages, setLoadedImages] = useState({});

        const handleImageLoad = (imageId) => {
            setLoadedImages(prev => ({
                ...prev,
                [imageId]: true
            }));
        };

        return (
            <div className="photo-grid">
                {photos.map(photo => (
                    <div key={photo._id} className="photo-container">
                        {!loadedImages[photo._id] && (
                            <div className="image-loading-skeleton" />
                        )}
                        <Zoom>
                            <img
                                src={photo.imageUrl}
                                alt={photo.title}
                                loading="lazy"
                                className={`photo-image ${loadedImages[photo._id] ? 'loaded' : ''}`}
                                onLoad={() => handleImageLoad(photo._id)}
                            />
                        </Zoom>
                        {showAdmin && (
                            <button
                                className="delete-btn"
                                onClick={() => onDelete(photo._id)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="portfolio-container">
            {CATEGORIES.map(category => {
                const categoryPhotos = photos.filter(photo => photo.category === category);
                if (categoryPhotos.length === 0) return null;

                return (
                    <div key={category} className="category-section">
                        <h2 className="category-title">{category}</h2>
                        <PhotoGrid
                            photos={categoryPhotos}
                            showAdmin={showAdmin}
                            onDelete={handleDeletePhoto}
                        />
                    </div>
                );
            })}

            <div className="admin-section">
                {!showAdmin && (
                    <button
                        className="classified-btn"
                        onClick={() => document.getElementById('adminModal').showModal()}
                    >
                        classified
                    </button>
                )}

                <dialog id="adminModal" className="admin-modal">
                    <form onSubmit={handleAdminAccess} className="admin-form">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="admin-input"
                        />
                        {error && <div className="error-message">{error}</div>}
                        <div className="modal-buttons">
                            <button type="submit">Submit</button>
                            <button
                                type="button"
                                onClick={() => {
                                    document.getElementById('adminModal').close();
                                    setPassword('');
                                    setError(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </dialog>
            </div>

            {showAdmin && (
                <div className="admin-controls">
                    <PhotoUpload
                        onUploadComplete={fetchPhotos}
                        categories={CATEGORIES}
                    />
                    <button
                        onClick={() => setShowAdmin(false)}
                        className="start-chat-btn"
                    >
                        Exit Admin Mode
                    </button>
                </div>
            )}
        </div>
    );
}

export default Portfolio;
