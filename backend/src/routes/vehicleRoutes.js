const express = require('express');
const multer = require('multer');
const vehicleController = require('../controllers/vehicleController');
const { authenticate } = require('../middlewares/authMiddleware');

// Configure multer memory storage for Excel file processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx or .xls) are allowed!'), false);
    }
  },
});

const router = express.Router();

// Apply JWT auth
router.use(authenticate);

// Sample template download
router.get('/sample-template', vehicleController.downloadSample);

// Import Excel sheet
router.post('/import', upload.single('excelFile'), vehicleController.importExcel);

// Vehicle CRUD
router.get('/', vehicleController.getAll);
router.post('/', vehicleController.create);
router.get('/:id', vehicleController.getById);
router.put('/:id', vehicleController.update);
router.delete('/:id', vehicleController.delete);

module.exports = router;
