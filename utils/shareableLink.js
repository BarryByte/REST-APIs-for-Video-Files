const crypto = require('crypto');
const moment = require('moment'); 
const express = require('express');
const app = express();

app.use(express.json());

// Mock database
const linksDB = {}; // { token: { url: '...', expiresAt: '...' } }

// Function to generate a shareable link
const generateShareableLink = (url, expiryMinutes) => {
    const token = crypto.randomBytes(16).toString('hex'); // Generate a unique token
    const expiresAt = moment().add(expiryMinutes, 'minutes').toISOString(); // Set expiry time
    linksDB[token] = { url, expiresAt };
    return `http://yourdomain.com/share/${token}`; // Create a shareable link
};

// Example endpoint to create a shareable link
app.post('/generate-link', (req, res) => {
    const { url, expiryMinutes } = req.body;
    const shareableLink = generateShareableLink(url, expiryMinutes);
    res.status(200).json({ link: shareableLink });
});
