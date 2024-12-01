const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Photo = require('../models/Photo');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Upload route
router.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        console.log('Upload started');
        console.log('File:', req.file);
        console.log('Body:', req.body);

        if (!req.file) {
            throw new Error('No file uploaded');
        }

        // Create the photo URL (relative to server root)
        const photoUrl = `/uploads/${req.file.filename}`;

        // Create and save photo document
        const photo = new Photo({
            title: req.body.title || 'Untitled',
            category: req.body.category,
            imageUrl: photoUrl,
            metadata: {
                format: path.extname(req.file.originalname).substring(1),
                size: req.file.size
            }
        });

        await photo.save();
        console.log('Photo saved to database:', photo);

        res.json(photo);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all photos route
router.get('/', async (req, res) => {
    try {
        const photos = await Photo.find({}).sort({ uploadDate: -1 });
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});

// Delete photo route
router.delete('/:id', async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        // Delete file from uploads folder
        const filePath = path.join(__dirname, '../../public', photo.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await Photo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
