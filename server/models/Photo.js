const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: {
        type: String,
        enum: ['portrait', 'street', 'black and white', 'experimental'],
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    cdnUrl: String,
    metadata: {
        width: Number,
        height: Number,
        format: String,
        size: Number
    },
    tags: [String],
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Photo', PhotoSchema);
