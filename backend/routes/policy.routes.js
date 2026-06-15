// routes/policy.routes.js
const router = require('express').Router()
const { getAllPolicies, getPoliciesByCustomer, getPolicyById, createPolicy, updatePolicy, deletePolicy } = require('../controllers/policy.controller')
const { protect, authorize } = require('../middleware/auth.middleware')

router.use(protect)

// IMPORTANT: specific routes must come BEFORE /:id routes
// Otherwise Express would match /customer/:customerId as /:id = "customer"
router.get('/customer/:customerId', getPoliciesByCustomer)
router.get('/',    getAllPolicies)
router.post('/',   createPolicy)
router.get('/:id', getPolicyById)
router.put('/:id', updatePolicy)
router.delete('/:id', authorize('owner', 'admin'), deletePolicy)

module.exports = router
