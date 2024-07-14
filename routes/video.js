const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db");
const ffmpeg = require("fluent-ffmpeg");
const router = express.Router();

// Custom filename by multer for easy timeline maintainance
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); // Directory for uploaded files
	},
	filename: (req, file, cb) => {
		const date = new Date(); // Created a Date object for the current time
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const year = date.getFullYear();
		const hour = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		// Customize filename: fieldname + timestamp + original extension
		cb(
			null,
			`${
				file.fieldname
			}-${day}-${month}-${year}-${hour}-${minutes}-${seconds}${path.extname(
				file.originalname
			)}`
		);
	}
});
const fileSizeLimit = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;
const upload = multer({ storage: storage, limits:{fileSize : fileSizeLimit} });

// const checkSize = (size) => {
// 	if (size > process.env.MAX_FILE_SIZE) {
// 		throw new Error(
// 			`File size exceeds the maximum limit of ${process.env.MAX_FILE_SIZE}`
// 		);
// 	}
// };

// Upload video endpoint
router.post("/upload", upload.single("video"), async (req, res) => {
	try {
		const { filename, size, path: filePath } = req.file;
		
		// checkSize(size);

		// Calculate video duration using ffmpeg
		const duration = await new Promise((resolve, reject) => {
			ffmpeg.ffprobe(filePath, (err, metadata) => {
				if (err) {
					reject(err);
					console.log("Error in calculating duration");
				} else {
					const durationInSeconds = Math.round(
						metadata.format.duration
					);
					resolve(durationInSeconds);
					console.log("Resolved with the duration");
				}
			});
		});

		// Insert video metadata into the database
		await new Promise((resolve, reject) => {
			db.run(
				`INSERT INTO videos (filename, size, duration, upload_time) VALUES (?, ?, ?, ?)`,
				[filename, size, duration, new Date().toISOString()],
				function (err) {
					if (err) {
						reject(err);
						console.log("db insertion not completed");
					} else {
						resolve(this.lastID);
						console.log(filename + " Resolved insertion in db");
					}
				}
			);
		});

		res.status(201).json({ id: this.lastID, filename, size, duration });
	} catch (err) {
        console.error(err.message); // Log for debug
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds the maximum limit.' });
        }
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds the maximum limit.' });
        }
    } else if (err) {
        // An unknown error occurred when uploading.
        console.error(err.message); // Log for debug
        return res.status(500).json({ error: 'An error occurred', details: err.message });
    }

    // If this middleware is hit without an error, pass to the next middleware
    next();
});
// trimming video
router.post("/trim/:id", (req, res) => {
	const { id } = req.params;
	//
	res.status(200).json({ message: "Video trimmed", id });
});

//  for merging videos
router.post('/merge', (req, res) => {
    const { videoIds } = req.body;
    // 
    res.status(200).json({ message: 'Videos merged' });
});

module.exports = router;
