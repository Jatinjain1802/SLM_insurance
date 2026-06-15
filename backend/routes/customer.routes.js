// routes/customer.routes.js
const router = require('express').Router()
const { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer.controller')
const { protect, authorize } = require('../middleware/auth.middleware')

// All customer routes require login
router.use(protect)

router.get ('/',    getAllCustomers)
router.post('/',    createCustomer)
router.get ('/:id', getCustomerById)
router.put ('/:id', updateCustomer)
// Only owner or admin can delete customers
router.delete('/:id', authorize('owner', 'admin'), deleteCustomer)

module.exports = router
