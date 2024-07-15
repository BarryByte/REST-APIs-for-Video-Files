const db = require("../db");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("node:fs");
const {cloudinary, uploadOnCloudinary} = require("../utils/cloudinary");
const https = require('https');


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

const trimVideo = async (req, res) => {
    const public_id = req.params.public_id;
    console.log(public_id);
    const start = req.body.start;
    const end = req.body.end;

    // Download the video from Cloudinary
    // http://res.cloudinary.com/<cloud_name>/video/upload/fl_attachment/<public_id>.mp4
                    // https://res.cloudinary.com/dvlif7x5p/video/upload/v1720983679/video_uploads/ltfsxj6htxlz3crf0kqx.mp4
    const videoUrl = `https://res.cloudinary.com/dvlif7x5p/video/upload/v1720983679/video_uploads/${public_id}.mp4`;
    const inputPath = `/tmp/${public_id}.mp4`;
    const outputPath = `/tmp/trimmed-${public_id}.mp4`;

    // Download the video locally
    const download = (url, path) => {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(path);
            const request = https.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            }).on('error', (err) => {
                fs.unlink(path);
                reject(err);
            });
        });
    };

    try {
        console.log(`Downloading video from ${videoUrl}`);
        await download(videoUrl, inputPath);
        console.log(`Video downloaded successfully, now trimming from ${start} to ${end}` );

		// Flag to track if the response has been sent
		let responseSent = false;
        // Trim the video
        ffmpeg(inputPath)
            .setStartTime(start)
            .duration(end)
            .output(outputPath)
            .saveToFile("cut.mp4")
            .on('end', async () => {
                try {
                    const response = await uploadOnCloudinary(outputPath);
                    fs.unlinkSync(inputPath); // Remove the downloaded file
                    fs.unlinkSync(outputPath); // Remove the trimmed file
                    return res.status(200).json({ message: 'Video trimmed and uploaded', url: response.secure_url });
                } catch (err) {
                    return res.status(500).json({ error: 'Error uploading to Cloudinary', details: err.message });
                }
            })
            .on('error', (err) => {
                console.error('Error trimming video:', err);
                return res.status(500).json({ error: 'Error trimming video', details: err.message });
            })
            .run();
    } catch (err) {
        console.error('Error downloading video:', err);
        return res.status(500).json({ error: 'Error downloading video', details: err.message });
    }
};
const mergeVideos = async (req, res) => {
    const { videoIds } = req.body;
    const videoPaths = videoIds.map(id => path.join(__dirname, `../uploads/${id}`));
    const outputPath = path.join(__dirname, `../uploads/merged-${Date.now()}.mp4`);

    const ffmpegCommand = ffmpeg();
    videoPaths.forEach((videoPath) => {
        ffmpegCommand.input(videoPath);
    });

    ffmpegCommand
        .on('end', async () => {
            try {
                const response = await uploadOnCloudinary(outputPath);
                fs.unlinkSync(outputPath); // Remove the locally saved merged file
                res.status(200).json({ message: 'Videos merged and uploaded', url: response.url });
            } catch (err) {
                res.status(500).json({ error: 'Error uploading to Cloudinary', details: err.message });
            }
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Error merging videos', details: err.message });
        })
        .mergeToFile(outputPath);
};

module.exports = {
	uploadVideos,
	trimVideo,
	mergeVideos
};
