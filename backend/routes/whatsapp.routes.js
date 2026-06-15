// routes/whatsapp.routes.js
// LEARNING NOTE:
// The webhook GET route does NOT use protect middleware
// because Meta calls it without any JWT token — it's a public verification endpoint.
// The POST webhook is also public (Meta doesn't send JWT).
// Only the manual send and logs endpoints require authentication.

const router = require('express').Router()
const { verifyWebhook, receiveMessage, sendManual, getLogs } = require('../controllers/whatsapp.controller')
const { protect } = require('../middleware/auth.middleware')

// Public routes (no auth — Meta calls these directly)
router.get ('/webhook', verifyWebhook)
router.post('/webhook', receiveMessage)

// Protected routes (require login from dashboard)
router.post('/send', protect, sendManual)
router.get ('/logs', protect, getLogs)

module.exports = router
