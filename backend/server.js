// server.js
// LEARNING NOTE:
// This is the entry point of the backend application.
// 1. We configure Express (cors, json body parser).
// 2. We import all our routes and mount them on /api/...
// 3. We connect to the MySQL database via Sequelize.
// 4. We start the server listening on a port.
// 5. We start background jobs (cron).

require('dotenv').config()
const express = require('express')
const cors    = require('express') // wait, actually cors is its own package
const corsPkg = require('cors')
const path    = require('path')

// Import Sequelize models and connection
const { sequelize } = require('./models')

// Import background jobs
const { startReminderJob } = require('./jobs/reminder.job')

const app = express()

// Trust the first proxy (e.g. Ngrok) to accurately identify client IP for rate limiting
app.set('trust proxy', 1)

// ============================================================
// MIDDLEWARE (SECURITY & PARSING)
// ============================================================

// Import security modules
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// 1. Set Security HTTP Headers
app.use(helmet())
// Configure helmet to allow images from our uploads folder or cross-origin if needed
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))

// 1.5. Enable CORS so our React frontend (port 5173) can talk to this backend (port 5000)
// IMPORTANT: CORS must be before rate limiting, otherwise rate-limited responses will lack CORS headers!
app.use(corsPkg({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// 2. Global Rate Limiter: maximum 1000 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})
// Apply rate limiter to all API routes
app.use('/api', apiLimiter)

// Parse incoming JSON payloads in request bodies
app.use(express.json())

// Serve the 'uploads' folder statically so files can be downloaded
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ============================================================
// ROUTES
// ============================================================

app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/customers', require('./routes/customer.routes'))
app.use('/api/companies', require('./routes/company.routes'))
app.use('/api/policies',  require('./routes/policy.routes'))
app.use('/api/premiums',  require('./routes/premium.routes'))
app.use('/api/documents', require('./routes/document.routes'))
app.use('/api/dashboard', require('./routes/dashboard.routes'))
app.use('/api/whatsapp',  require('./routes/whatsapp.routes'))
app.use('/api/sms',       require('./routes/sms.routes'))
app.use('/api/reports',   require('./routes/report.routes'))

// Base health check route
app.get('/', (req, res) => {
  res.json({ message: 'SLM Insurance CRM API is running.' })
})

// ============================================================
// START SERVER & DATABASE
// ============================================================

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // 1. Connect to Database
    console.log('Connecting to MySQL database...')
    
    // .sync() creates the tables if they don't exist
    // { alter: true } means it updates table structure if you add a column
    // NEVER use { force: true } in production as it DROPS all tables first!
    await sequelize.sync({ alter: true }) 
    console.log('✅ Database connected and models synced.')

    // 2. Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
    })

    // 3. Start background cron jobs (reminders)
    startReminderJob()

  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1) // Exit with failure code
  }
}

// Fire it up!
startServer()
