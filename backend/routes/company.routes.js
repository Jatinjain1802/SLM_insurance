// routes/company.routes.js
const router = require('express').Router()
const { getAll, create, update, remove } = require('../controllers/company.controller')
const { protect, authorize } = require('../middleware/auth.middleware')

router.use(protect)
router.get ('/', getAll)
router.post('/', create)
router.put ('/:id', update)
router.delete('/:id', authorize('owner', 'admin'), remove)

module.exports = router
