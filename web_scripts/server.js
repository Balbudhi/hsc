const express = require('express');
const path = require('path');

const app = express();

/**
 * Static file server for MIT HSC website
 * Serves compiled website content from public directory
 */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Route for serving index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`MIT HSC Website server running on port ${PORT}`);
});