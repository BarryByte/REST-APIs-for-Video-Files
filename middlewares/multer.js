const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/temp"); // Directory for uploaded files
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

const upload = multer({
  storage: storage,
  limits: { fileSize: fileSizeLimit }
});


module.exports = upload;