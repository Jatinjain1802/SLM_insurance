// controllers/policy.controller.js
const { Op }  = require('sequelize')
const { Policy, Customer, InsuranceCompany, Premium } = require('../models')

// Helper: build agent-based where clause
const agentFilter = (user) => {
  // Agents can only see policies for their own customers
  // We'll handle this via a customer join — see getAllPolicies below
  return user.role === 'agent' ? user.id : null
}

// GET /api/policies
const getAllPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    const include = [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'mobile'],
        // If agent: only include customers assigned to them
        where: req.user.role === 'agent' ? { assignedAgentId: req.user.id } : undefined,
      },
      {
        model: InsuranceCompany,
        as: 'company',
        attributes: ['id', 'name', 'code'],
      },
    ]

    const where = {}
    if (req.query.status) where.status = req.query.status

    const { count, rows } = await Policy.findAndCountAll({ 
      where, 
      include, 
      limit, 
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']] 
    })

    res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching policies.', error: error.message })
  }
}

// GET /api/policies/customer/:customerId — all policies for one customer
const getPoliciesByCustomer = async (req, res) => {
  try {
    const policies = await Policy.findAll({
      where: { customerId: req.params.customerId },
      include: [
        { model: InsuranceCompany, as: 'company', attributes: ['id', 'name', 'code', 'type'] },
      ],
      order: [['expiryDate', 'ASC']],
    })
    res.json(policies)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// GET /api/policies/:id
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id, {
      include: [
        { model: Customer,         as: 'customer', attributes: ['id', 'name', 'mobile', 'email'] },
        { model: InsuranceCompany, as: 'company'  },
        { model: Premium,          as: 'premiums', order: [['dueDate', 'ASC']] },
      ],
    })
    if (!policy) return res.status(404).json({ message: 'Policy not found.' })
    res.json(policy)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// POST /api/policies
const createPolicy = async (req, res) => {
  try {
    const { policyNumber, customerId, companyId, policyType, startDate, expiryDate, premiumAmount, paymentFrequency, status, notes } = req.body

    if (!policyNumber || !customerId || !companyId || !expiryDate || !premiumAmount) {
      return res.status(400).json({ message: 'Required fields: policyNumber, customerId, companyId, expiryDate, premiumAmount' })
    }

    // Check policy number uniqueness
    const existing = await Policy.findOne({ where: { policyNumber } })
    if (existing) return res.status(400).json({ message: 'Policy number already exists.' })

    const policy = await Policy.create({
      policyNumber, customerId, companyId, policyType,
      startDate, expiryDate, premiumAmount, paymentFrequency, status, notes,
    })

    // Auto-create premium entries based on frequency
    // LEARNING NOTE: We use a loop to generate the full payment schedule automatically
    if (startDate && expiryDate && premiumAmount) {
      const premiumsToCreate = []
      const start = new Date(startDate)
      const end = new Date(expiryDate)
      
      let monthsToAdd = 12
      if (paymentFrequency === 'monthly') monthsToAdd = 1
      else if (paymentFrequency === 'quarterly') monthsToAdd = 3
      else if (paymentFrequency === 'half-yearly') monthsToAdd = 6
      else if (paymentFrequency === 'yearly') monthsToAdd = 12

      let currentDue = new Date(start)
      let count = 0 // Safety limit to prevent infinite loops
      
      while (currentDue < end && count < 120) {
        premiumsToCreate.push({
          policyId: policy.id,
          dueDate: new Date(currentDue),
          amount: premiumAmount,
          status: 'upcoming',
        })
        currentDue.setMonth(currentDue.getMonth() + monthsToAdd)
        count++
      }

      if (premiumsToCreate.length > 0) {
        await Premium.bulkCreate(premiumsToCreate)
      }
    } else if (expiryDate && premiumAmount) {
      // Fallback if no start date is provided: just create one premium at expiry
      await Premium.create({
        policyId: policy.id,
        dueDate: expiryDate,
        amount: premiumAmount,
        status: 'upcoming',
      })
    }

    res.status(201).json(policy)
  } catch (error) {
    res.status(500).json({ message: 'Error creating policy.', error: error.message })
  }
}

// PUT /api/policies/:id
const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id)
    if (!policy) return res.status(404).json({ message: 'Policy not found.' })
    await policy.update(req.body)
    res.json(policy)
  } catch (error) {
    res.status(500).json({ message: 'Error updating policy.', error: error.message })
  }
}

// DELETE /api/policies/:id
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id)
    if (!policy) return res.status(404).json({ message: 'Policy not found.' })
    await policy.destroy()
    res.json({ message: 'Policy deleted.' })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

module.exports = { getAllPolicies, getPoliciesByCustomer, getPolicyById, createPolicy, updatePolicy, deletePolicy }
