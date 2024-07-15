const express = require('express');
const multer = require('multer');

const videoRoutes = require('./routes/video');
const authMiddleware = require('./middlewares/authMiddleware');
require('dotenv').config();

const app = express();
// very important to parse the incoming request body to json
app.use(express.json());
const PORT = process.env.PORT || 3000;

// global authmiddleware which will authenticate all the routes
app.use(authMiddleware);

// Use video routes
app.use("/api/videos", videoRoutes);

// Global error handling middleware for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File size exceeds the maximum limit." });
    }
  } else if (err) {
    // An unknown error occurred when uploading.
    console.error(err.message); // Log for debug
    return res.status(500).json({ error: "An error occurred", details: err.message });
  }

  // If this middleware is hit without an error, pass to the next middleware
  next();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
