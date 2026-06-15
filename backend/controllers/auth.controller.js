// controllers/auth.controller.js
// LEARNING NOTE:
// A controller contains the business logic for a route.
// The route file just says "which function handles which URL".
// The controller function does the actual work.
//
// bcryptjs: hashes passwords so we never store plain text in DB
//   bcrypt.hash("mypassword", 10)  → "$2b$10$....." (hash)
//   bcrypt.compare("mypassword", hash) → true/false
//
// jsonwebtoken: creates and verifies JWT tokens
//   jwt.sign({ id: 1 }, secret, { expiresIn: '7d' }) → token string
//   jwt.verify(token, secret) → decoded payload { id: 1, iat: ..., exp: ... }

const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const { User } = require('../models')

// Helper: creates a JWT token for a user
const createToken = (user) => {
  // We put the user's id and role INSIDE the token
  // The frontend can decode this to know who's logged in
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// POST /api/auth/register
// Creates a new user account
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if email already exists
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' })
    }

    // Hash the password with salt rounds = 10
    // LEARNING NOTE: bcrypt is intentionally slow to prevent brute-force attacks.
    // The "10" means it runs 2^10 = 1024 hashing rounds.
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'agent',
    })

    // Create token for the new user
    const token = createToken(user)

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message })
  }
}

// POST /api/auth/login
// Authenticates user and returns JWT token
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact admin.' })
    }

    // Create JWT token
    const token = createToken(user)

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message })
  }
}

// GET /api/auth/me
// Returns the currently logged-in user's profile
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.json({ user: req.user })
}

module.exports = { register, login, getMe }
