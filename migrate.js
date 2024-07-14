const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("video.db");

// Add cloudinary_url column to videos table if it doesn't exist
db.serialize(() => {
	db.run(
		`
    ALTER TABLE videos ADD COLUMN cloudinary_url TEXT
  `,
		(err) => {
			if (err) {
				if (err.message.includes("duplicate column name")) {
					console.log("Column cloudinary_url already exists");
				} else {
					console.error(
						"Error adding column cloudinary_url:",
						err.message
					);
				}
			} else {
				console.log("Column cloudinary_url added successfully");
			}
		}
	);
});

db.close();
