// routes/premium.routes.js
const router = require('express').Router()
const { getUpcoming, getOverdue, markAsPaid, getAllPremiums } = require('../controllers/premium.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)
router.get('/upcoming',   getUpcoming)
router.get('/overdue',    getOverdue)
router.get('/all',        getAllPremiums)
router.put('/:id/pay',    markAsPaid)

module.exports = router
