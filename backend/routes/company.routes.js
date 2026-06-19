// routes/company.routes.js
const router = require('express').Router()
const { getAll, create, update, remove, createBulk } = require('../controllers/company.controller')
const { protect, authorize } = require('../middleware/auth.middleware')

router.use(protect)
router.get ('/', getAll)
router.post('/', create)
router.post('/bulk', createBulk)
router.put ('/:id', update)
router.delete('/:id', authorize('owner', 'admin'), remove)

module.exports = router
