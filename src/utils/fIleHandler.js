const multer = require('multer');

// Allowed file types
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
];

// Valid field names for file uploads
const validTypes = ['evidences', 'survey1', 'survey2', 'survey3'];

// Configure in-memory storage
const storage = multer.memoryStorage();

// File type filter
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max per file
  }
});

// Export configured fields middleware and file processing utility
module.exports = {
  uploadFields: upload.fields(validTypes.map(name => ({ name, maxCount: 1 }))),
  
  handleFiles: (files) => {
    const result = {};
    validTypes.forEach(type => {
      if (files && files[type]) {
        const file = files[type][0];
        result[type] = file.buffer;
        result[`${type}_mimetype`] = file.mimetype;
      }
    });
    return result;
  }
};
