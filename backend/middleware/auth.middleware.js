// middleware/auth.middleware.js
// LEARNING NOTE:
// Middleware is a function that runs BETWEEN the request arriving
// and the route handler executing. Think of it as a "gatekeeper".
//
// How JWT auth works:
// 1. User logs in → backend creates a JWT token with user info inside
// 2. Frontend stores token in localStorage
// 3. Every API request sends token in: Authorization: Bearer <token>
// 4. This middleware verifies the token before allowing access

const jwt = require('jsonwebtoken')
const { User } = require('../models')

// protect() — verifies JWT. Use on routes that require login.
const protect = async (req, res, next) => {
  try {
    // 1. Get token from the Authorization header
    // Header format: "Bearer eyJhbGc..."
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' })
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1]

    // 2. Verify the token using our secret key
    // jwt.verify() throws an error if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Find the user in the database using the id stored in the token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } // never return the password
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or account is deactivated.' })
    }

    // 4. Attach user to req so route handlers can access it
    // e.g., req.user.role, req.user.id
    req.user = user

    // 5. Call next() to proceed to the actual route handler
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' })
    }
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

// authorize(...roles) — checks if the logged-in user has permission
// LEARNING NOTE: This is a "factory function" — it returns a middleware function.
// Usage: router.delete('/customers/:id', protect, authorize('owner', 'admin'), handler)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      })
    }
    next()
  }
}

module.exports = { protect, authorize }
