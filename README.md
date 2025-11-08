# File Upload & Download Web App

A simple web application that allows users to upload files and download them later using a unique identifier.

## Features

- **File Upload**: Upload files through a simple web interface
- **File Storage**: Files are stored in a SQLite database with metadata
- **File Download**: Download files using a unique file ID
- **Modern UI**: Clean and intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. **Upload a file**:
   - Click "Choose File" to select a file
   - Click "Upload File" to upload
   - Copy the File ID that appears after successful upload

4. **Download a file**:
   - Enter the File ID in the download section
   - Click "Download File"
   - The file will be downloaded to your computer

## Project Structure

```
.
├── server.js          # Express server and database setup
├── package.json       # Project dependencies
├── public/
│   └── index.html     # Frontend interface
├── uploads/           # Directory for uploaded files (created automatically)
└── files.db           # SQLite database (created automatically)
```

## API Endpoints

- `GET /` - Serve the main HTML page
- `POST /upload` - Upload a file (multipart/form-data)
- `GET /download/:id` - Download a file by ID
- `GET /file/:id` - Get file information by ID

## Technologies Used

- **Express.js** - Web framework for Node.js
- **Multer** - Middleware for handling file uploads
- **SQLite3** - Lightweight database for storing file metadata
- **UUID** - Generating unique identifiers for files

## Notes

- Uploaded files are stored in the `uploads/` directory
- File metadata (name, size, type, upload date) is stored in SQLite database
- Each file is assigned a unique UUID for identification
- The database and uploads directory are created automatically on first run

## License

ISC

