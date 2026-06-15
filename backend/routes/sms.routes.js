// routes/sms.routes.js
const router = require('express').Router()
const { sendManualSms, getSmsLogs } = require('../controllers/sms.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)
router.post('/send', sendManualSms)
router.get('/logs',  getSmsLogs)

module.exports = router
