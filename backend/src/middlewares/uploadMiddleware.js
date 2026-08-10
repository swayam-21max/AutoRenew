const multer = require('multer');

// Memory storage for Excel file processing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isExcelMime =
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'application/octet-stream';
  const isExcelExt =
    file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls');

  if (isExcelMime || isExcelExt) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx or .xls) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = { upload };
