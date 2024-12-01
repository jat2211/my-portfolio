import React, { useState, useRef } from 'react';
import './PhotoUpload.css';

const PhotoUpload = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [category, setCategory] = useState('street');
    const [title, setTitle] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        setFile(file);
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('title', title);
        formData.append('category', category);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:5001/api/photos/upload');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    setUploadProgress(progress);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    setTitle('');
                    setFile(null);
                    setPreview(null);
                    onUploadComplete?.();
                }
                setIsUploading(false);
            };

            xhr.onerror = () => {
                console.error('Upload failed');
                setIsUploading(false);
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Upload failed:', error);
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="upload-form">
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                {preview ? (
                    <div className="preview-container">
                        <img src={preview} alt="Preview" className="image-preview" />
                        <div className="preview-overlay">
                            Click or drag to change image
                        </div>
                    </div>
                ) : (
                    <div className="drop-zone-text">
                        <span>Drop image here or click to upload</span>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFile(e.target.files[0])}
                    className="file-input"
                    accept="image/*"
                    hidden
                />
            </div>

            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-input"
            />

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select-input"
            >
                <option value="portrait">Portrait</option>
                <option value="street">Street</option>
                <option value="black and white">Black & White</option>
                <option value="experimental">Experimental</option>
            </select>

            {isUploading && (
                <div className="progress-container">
                    <div
                        className="progress-bar"
                        style={{ width: `${uploadProgress}%` }}
                    />
                    <span className="progress-text">{Math.round(uploadProgress)}%</span>
                </div>
            )}

            <button
                type="submit"
                className="start-chat-btn"
                disabled={isUploading || !file}
            >
                {isUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
        </form>
    );
};

export default PhotoUpload;
