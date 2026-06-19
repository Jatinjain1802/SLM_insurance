// controllers/premium.controller.js
// LEARNING NOTE:
// Sequelize.literal() lets us write raw SQL snippets inside Sequelize queries.
// We use it here to calculate DATEDIFF (days difference) in MySQL.
// Op.lte = "less than or equal" (<=)
// Op.gte = "greater than or equal" (>=)

const { Op, literal } = require('sequelize')
const { Premium, Policy, Customer, InsuranceCompany } = require('../models')

// GET /api/premiums/upcoming
// Returns all premiums due in the next 30 days
const getUpcoming = async (req, res) => {
  try {
    const today    = new Date()
    const in30Days = new Date()
    in30Days.setDate(today.getDate() + 30)

    const premiums = await Premium.findAll({
      where: {
        status:  'upcoming',
        dueDate: { [Op.between]: [today, in30Days] }, // BETWEEN today AND 30 days from now
      },
      include: [
        {
          model: Policy,
          as: 'policy',
          attributes: ['id', 'policyNumber', 'policyType'],
          include: [
            { model: Customer,         as: 'customer',  attributes: ['id', 'name', 'mobile'] },
            { model: InsuranceCompany, as: 'company',   attributes: ['id', 'name'] },
          ],
        },
      ],
      order: [['dueDate', 'ASC']], // soonest first
    })

    res.json(premiums)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming premiums.', error: error.message })
  }
}

// GET /api/premiums/overdue
// Returns all premiums whose due date has passed and status is still 'upcoming'
const getOverdue = async (req, res) => {
  try {
    // First, automatically update overdue premiums in DB
    // Any premium with dueDate < today and status = 'upcoming' → mark as 'overdue'
    await Premium.update(
      { status: 'overdue' },
      { where: { status: 'upcoming', dueDate: { [Op.lt]: new Date() } } }
    )

    const premiums = await Premium.findAll({
      where: { status: 'overdue' },
      include: [
        {
          model: Policy,
          as: 'policy',
          include: [
            { model: Customer,         as: 'customer', attributes: ['id', 'name', 'mobile'] },
            { model: InsuranceCompany, as: 'company',  attributes: ['id', 'name'] },
          ],
        },
      ],
      order: [['dueDate', 'ASC']],
    })

    res.json(premiums)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overdue premiums.', error: error.message })
  }
}

// PUT /api/premiums/:id/pay
// Marks a premium as paid
const markAsPaid = async (req, res) => {
  try {
    const premium = await Premium.findByPk(req.params.id)
    if (!premium) return res.status(404).json({ message: 'Premium record not found.' })

    await premium.update({
      status:   'paid',
      paidDate: new Date(), // record today as the payment date
    })

    res.json({ message: 'Premium marked as paid.', premium })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

const getAllPremiums = async (req, res) => {
  try {
    // Automatically update overdue premiums in DB
    await Premium.update(
      { status: 'overdue' },
      { where: { status: 'upcoming', dueDate: { [Op.lt]: new Date() } } }
    )

    const premiums = await Premium.findAll({
      include: [
        {
          model: Policy,
          as: 'policy',
          include: [
            { model: Customer,         as: 'customer', attributes: ['id', 'name', 'mobile'] },
            { model: InsuranceCompany, as: 'company',  attributes: ['id', 'name'] },
          ],
        },
      ],
      order: [['dueDate', 'ASC']],
    })
    res.json(premiums)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

module.exports = { getUpcoming, getOverdue, markAsPaid, getAllPremiums }
