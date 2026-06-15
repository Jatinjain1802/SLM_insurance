// routes/report.routes.js
const router = require('express').Router()
const { getCustomerReport, getPolicyReport, getRevenueReport, triggerReminders } = require('../controllers/report.controller')
const { protect, authorize } = require('../middleware/auth.middleware')

router.use(protect)

// Reports are only for owners and admins
router.use(authorize('owner', 'admin'))

router.get('/customers', getCustomerReport)
router.get('/policies',  getPolicyReport)
router.get('/revenue',   getRevenueReport)

// Manual trigger for testing reminder job
router.post('/reminders/trigger', triggerReminders)

module.exports = router
