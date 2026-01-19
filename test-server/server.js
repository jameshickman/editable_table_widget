const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename to prevent conflicts
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files from parent directory to access Smart Table
app.use(express.static(path.join(__dirname, '..')));

// File upload endpoint
app.post('/api/upload', (req, res) => {
    // Check for JWT if provided (optional)
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Extract token from "Bearer {token}"
        // In a real app, you would validate the JWT here
        // For this test server, we'll just log it
        console.log('Received JWT:', token.substring(0, 10) + '...');
    }
    
    upload.single('file')(req, res, function(err) {
        if (err) {
            console.error('Upload error:', err);
            return res.status(500).json({ 
                error: 'Upload failed',
                message: err.message 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No file uploaded' 
            });
        }
        
        // Return file info
        const fileInfo = {
            url: `/api/download/${req.file.filename}`,
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        };
        
        console.log('File uploaded:', req.file.filename);
        res.json(fileInfo);
    });
});

// File download endpoint
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Security check: ensure the file is in the uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        return res.status(400).send('Invalid file path');
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }
    
    // Check for JWT if provided (optional)
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Extract token from "Bearer {token}"
        // In a real app, you would validate the JWT here
        console.log('Download requested with JWT:', token.substring(0, 10) + '...');
    }
    
    // Send the file
    res.download(filePath, (err) => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).send('Download failed');
        } else {
            console.log('File downloaded:', filename);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log(`Upload endpoint: POST /api/upload`);
    console.log(`Download endpoint: GET /api/download/:filename`);
    console.log(`Uploads directory: ${uploadsDir}`);
});