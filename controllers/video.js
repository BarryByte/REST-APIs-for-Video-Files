const db = require("../db");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("node:fs");
const cloudinary = require("../utils/cloudinary");

let durationLimitFlag = false;

const uploadVideos = async (req, res) => {
	try {
		const { filename, size, path: filePath } = req.file;

		// Reset flag before each request.
		durationLimitFlag = false;

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

					if (durationInSeconds > process.env.MAX_VIDEO_DURATION) {
						durationLimitFlag = true;
						console.log("Duration limit exceeded");
						reject(new Error("Duration limit exceeded"));
					} else {
						resolve(durationInSeconds);
						console.log("Resolved with the duration");
					}
				}
			});
		});

		if (!durationLimitFlag) {
			// Load video to cloudinary
			const result = await cloudinary.uploadOnCloudinary(filePath);
			// Insert video metadata into the database
			const videoId = await new Promise((resolve, reject) => {
				db.run(
					`INSERT INTO videos (filename, size, duration, upload_time, cloudinary_url) VALUES (?, ?, ?, ?, ?)`,
					[
						filename,
						size,
						duration,
						new Date().toISOString(),
						result.secure_url
					],
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

			// Delete local file after successful upload to Cloudinary
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				console.log("File deleted:", filePath);
			}

			res.status(201).json({
				id: this.lastID,
				filename,
				size,
				duration,
				url: result.secure_url
			});
		}
	} catch (err) {
		console.error(err.message);
		// Log for debugging
		if (req.file && req.file.path && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
			console.log("File deleted:", req.file.path);
		}

		if (err.message === "Duration limit exceeded") {
			return res
				.status(400)
				.json({ error: "Video duration exceeds the maximum limit." });
		}
		if (err.code === "LIMIT_FILE_SIZE") {
			return res
				.status(400)
				.json({ error: "File size exceeds the maximum limit." });
		}
		res.status(500).json({ error: "Database error", details: err.message });
	}
};

const trimVideo = (req, res) => {
	const { id } = req.params;
	res.status(200).json({ message: "Video trimmed", id });
};

const mergeVideos = (req, res) => {
	const { videoIds } = req.body;
	res.status(200).json({ message: "Videos merged" });
};

module.exports = {
	uploadVideos,
	trimVideo,
	mergeVideos
};
