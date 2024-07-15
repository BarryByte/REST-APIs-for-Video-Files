

# Video Editor Project

## Overview
This project is a video editor application built using Node.js, Express, SQLite, and Cloudinary. It allows users to upload, trim, merge, and generate time-limited download links for videos.

## Features
- **Upload Videos**: Users can upload videos, which are stored in Cloudinary.
- **Trim Videos**: Allows users to specify start and end times to trim videos.
- **Merge Videos**: Users can merge multiple videos into one.
- **Time-Limited Download Links**: Generate secure download links with expiration times. (currenntly not working, will update soon...)

## Technologies Used## License
This project is licensed under the MIT License.

- **Backend**: Node.js, Express
- **Database**: SQLite
- **File Storage**: Cloudinary
- **Video Processing**: FFmpeg

## Setup Instructions

### Prerequisites
- Node.js
- SQLite
- Cloudinary account (with credentials)




### Installation
1. Clone the repository:
   
   git clone https://github.com/BarryByte/REST-APIs-for-Video-Files
   
2. Navigate to the project directory:
   
   cd video-editor-project
   
3. Install dependencies:
   
   npm install
   

### Environment Variables
Create a `.env` file in the root directory and add the following variables:
```
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
MAX_VIDEO_DURATION=<max_duration_in_seconds>
API_TOKEN=
MAX_FILE_SIZE=26214400 
DATABASE_URL=video.db

```
### Dependencies
```
The project uses the following dependencies:

cloudinary: ^2.2.0
dotenv: ^16.4.5
express: ^4.19.2
ffmpeg: ^0.0.4
fluent-ffmpeg: ^2.1.3
fs: ^0.0.1-security
https: ^1.0.0
multer: ^1.4.5-lts.1
nodemon: ^3.1.4
sqlite3: ^5.1.7
```

### Few Things which needs to be taken care of 
Cloudinary uses versioning to help manage and serve updated media files. Each time a file is uploaded or modified, a new version number is generated. This ensures that any changes to the file can be accessed via a unique URL, which avoids caching issues.

If the asset is updated, the version number in the URL will change, so users will always get the latest version of the file. If the file hasn't changed, the version will remain the same.


### Running the Application
To start the server, run:
```bash
npm start
```
The application will be accessible at `http://localhost:3000`.

## API Endpoints
- `POST /upload`: Upload a video.
- `POST /trim/:public_id`: Trim a video by specifying the start and end times.
- `POST /merge`: Merge multiple videos.

## Usage
1. Upload a video using the `/upload` endpoint.
2. Use the `/trim/:public_id` endpoint to trim a video.
3. Use the `/merge` endpoint to merge multiple videos.
4. Each uploaded video will have a time-limited download link generated for access.


## Acknowledgments
- [Cloudinary](https://cloudinary.com/) for media storage and management.
- [FFmpeg](https://ffmpeg.org/) for video processing.

## Contributing
Contributions are welcome! Please create a pull request for any changes you wish to propose.
