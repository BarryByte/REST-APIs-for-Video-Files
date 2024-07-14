const express = require('express');
const multer = require('multer');
const path = require('path');
const videoRoutes = require('./routes/video');
const authMiddleware = require('./authMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// global authmiddleware which will authenticate all the routes
app.use(authMiddleware);

// Use video routes
app.use('/api/videos', videoRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
