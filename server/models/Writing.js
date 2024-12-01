const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    images: [{
        url: String,
        caption: String,
        position: Number
    }],
    category: String,
    tags: [String],
    publishDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    }
});

module.exports = mongoose.model('Article', ArticleSchema);
