// controllers/customer.controller.js
// LEARNING NOTE:
// Sequelize query methods:
//   findAll()      → SELECT * (returns array)
//   findByPk(id)   → SELECT WHERE id = ? (returns single record or null)
//   findOne({where}) → SELECT WHERE ... LIMIT 1
//   create(data)   → INSERT INTO ...
//   update(data, {where}) → UPDATE ... WHERE ...
//   destroy({where}) → DELETE WHERE ...
//
// { include: [...] } = JOIN another table (like SQL JOIN)
// Op is Sequelize's operator for complex conditions (like, gt, lt, etc.)

const { Op } = require('sequelize')
const { Customer, Policy, User } = require('../models')

const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    const where = {}

    // ROLE-BASED FILTER:
    // If the user is an agent, only show their assigned customers
    if (req.user.role === 'agent') {
      where.assignedAgentId = req.user.id
    }

    // Optional search query: GET /api/customers?search=rahul
    if (req.query.search) {
      where[Op.or] = [
        { name:   { [Op.like]: `%${req.query.search}%` } },
        { mobile: { [Op.like]: `%${req.query.search}%` } },
        { email:  { [Op.like]: `%${req.query.search}%` } },
      ]
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true, // important when using includes
      include: [
        {
          model: Policy,
          as: 'policies',
          attributes: ['id', 'status'], // only fetch id and status
        },
        {
          model: User,
          as: 'assignedAgent',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']], // newest first
    })

    res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers.', error: error.message })
  }
}

// GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: Policy,    as: 'policies',      include: [] },
        { model: User,      as: 'assignedAgent', attributes: ['id', 'name', 'email'] },
      ],
    })

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' })
    }

    // Agents can only view their own customers
    if (req.user.role === 'agent' && customer.assignedAgentId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer.', error: error.message })
  }
}

// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, mobile, email, address, dob, aadhaar, pan, assignedAgentId } = req.body

    if (!name || !mobile) {
      return res.status(400).json({ message: 'Name and mobile are required.' })
    }

    // Check if mobile already exists
    const existing = await Customer.findOne({ where: { mobile } })
    if (existing) {
      return res.status(400).json({ message: 'A customer with this mobile number already exists.' })
    }

    const customer = await Customer.create({
      name, mobile, email, address, dob, aadhaar, pan,
      // If creating agent assigns themselves; admin/owner can specify any agent
      assignedAgentId: assignedAgentId || (req.user.role === 'agent' ? req.user.id : null),
    })

    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer.', error: error.message })
  }
}

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })

    if (req.user.role === 'agent' && customer.assignedAgentId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    await customer.update(req.body)
    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer.', error: error.message })
  }
}

// DELETE /api/customers/:id — only owner/admin can delete
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })

    await customer.destroy()
    res.json({ message: 'Customer deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer.', error: error.message })
  }
}

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer }
