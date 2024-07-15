const crypto = require('crypto');
const moment = require('moment'); 
const express = require('express');
const app = express();

app.use(express.json());

// Mock database
// Mock database for link storage
const linksDB = {};

// Function to generate a shareable link
const generateShareableLink = (url, expiryMinutes) => {
    const token = crypto.randomBytes(16).toString('hex'); // Generate a unique token
    const expiresAt = moment().add(expiryMinutes, 'minutes').toISOString(); // Set expiry time
    linksDB[token] = { url, expiresAt };
    return `http://yourdomain.com/share/${token}`; // Create a shareable link
};


