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

    const policies = await Policy.findAll({ where, include, order: [['createdAt', 'DESC']] })
    res.json(policies)
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

    // Auto-create the first premium entry based on frequency
    // LEARNING NOTE: This creates the first upcoming payment record automatically
    if (expiryDate && premiumAmount) {
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
