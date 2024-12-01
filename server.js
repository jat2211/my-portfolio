const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const photoRoutes = require('./server/routes/photoRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// MongoDB Connection
mongoose.connect("mongodb+srv://jayalexandertrevino:jay123mongodb@photographycluster.w9dev.mongodb.net/?retryWrites=true&w=majority")
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

app.use('/api/photos', photoRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
