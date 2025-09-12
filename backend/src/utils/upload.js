const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (we won't save the file to disk)
const storage = multer.memoryStorage();

// File filter to accept any file type
const fileFilter = (req, file, cb) => {
  // Accept any file type
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
