// routes/document.routes.js
// LEARNING NOTE:
// multer is configured here, not in the controller.
// diskStorage saves files to disk (our uploads/ folder).
// We give each file a unique name using Date.now() + originalname
// to prevent collisions when two files have the same name.

const router  = require('express').Router()
const multer  = require('multer')
const path    = require('path')
const { getAll, getByCustomer, upload, download, remove } = require('../controllers/document.controller')
const { protect } = require('../middleware/auth.middleware')

// Multer disk storage configuration
const storage = multer.diskStorage({
  // destination: where to save files
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // saves to backend/uploads/
  },
  // filename: what to call the file on disk
  filename: (req, file, cb) => {
    // Unique name: timestamp + original name (spaces replaced with dashes)
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    cb(null, uniqueName)
  },
})

// File filter: only allow PDF and images
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)  // accept the file
  } else {
    cb(new Error('Only PDF, JPG, JPEG, PNG files are allowed.'), false)
  }
}

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
})

router.use(protect)
router.get('/', getAll)
router.get('/customer/:customerId', getByCustomer)
router.post('/upload', uploadMiddleware.single('file'), upload) // 'file' = form field name
router.get('/:id/download', download)
router.delete('/:id', remove)

module.exports = router
