const multer = require('multer');

// Configure multer for file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Validate CSV mimetype (also accept files without specific mimetype or octet-stream)
  const validMimeTypes = [
    'text/csv', 
    'application/csv',
    'text/plain',
    'application/octet-stream'
  ];
  
  const isValidMimetype = validMimeTypes.includes(file.mimetype);
  const hasCSVExtension = file.originalname && file.originalname.toLowerCase().endsWith('.csv');
  
  if (isValidMimetype || hasCSVExtension) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
