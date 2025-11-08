const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Initialize database
const db = new sqlite3.Database('files.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Database table ready');
      }
    });
  }
});

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileId = uuidv4();
  const fileData = {
    id: fileId,
    original_name: req.file.originalname,
    stored_name: req.file.filename,
    mime_type: req.file.mimetype,
    size: req.file.size
  };

  db.run(
    `INSERT INTO files (id, original_name, stored_name, mime_type, size) 
     VALUES (?, ?, ?, ?, ?)`,
    [fileData.id, fileData.original_name, fileData.stored_name, fileData.mime_type, fileData.size],
    function(err) {
      if (err) {
        console.error('Error inserting file:', err.message);
        return res.status(500).json({ error: 'Failed to save file information' });
      }

      res.json({
        message: 'File uploaded successfully',
        fileId: fileId,
        fileName: fileData.original_name,
        fileSize: fileData.size
      });
    }
  );
});

// Download endpoint
app.get('/download/:id', (req, res) => {
  const fileId = req.params.id;

  db.get(
    'SELECT * FROM files WHERE id = ?',
    [fileId],
    (err, row) => {
      if (err) {
        console.error('Error querying database:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'File not found' });
      }

      const filePath = path.join(uploadsDir, row.stored_name);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      // Set headers and send file
      res.setHeader('Content-Type', row.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${row.original_name}"`);
      res.sendFile(filePath);
    }
  );
});

// Get file info endpoint (optional, for verification)
app.get('/file/:id', (req, res) => {
  const fileId = req.params.id;

  db.get(
    'SELECT id, original_name, mime_type, size, uploaded_at FROM files WHERE id = ?',
    [fileId],
    (err, row) => {
      if (err) {
        console.error('Error querying database:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json(row);
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

