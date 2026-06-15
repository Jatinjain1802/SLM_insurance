// routes/auth.routes.js
// LEARNING NOTE:
// express.Router() creates a mini Express app for a specific URL prefix.
// These routes are mounted on /api/auth in server.js, so:
//   POST /login  becomes  POST /api/auth/login
//   GET  /me     becomes  GET  /api/auth/me

const router = require('express').Router()
const { register, login, getMe } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')

router.post('/register', register)
router.post('/login',    login)
router.get ('/me',       protect, getMe) // protect = must be logged in

module.exports = router
