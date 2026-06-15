// controllers/dashboard.controller.js
// LEARNING NOTE:
// sequelize.fn() lets us use SQL aggregate functions like COUNT, SUM
// Promise.all() runs multiple async operations IN PARALLEL — much faster
// than running them one after another with await.

const { Op, fn, col, literal } = require('sequelize')
const { Customer, Policy, Premium, InsuranceCompany, sequelize } = require('../models')

// GET /api/dashboard/stats
// Returns all numbers needed for the dashboard stat cards
const getStats = async (req, res) => {
  try {
    const today    = new Date()
    const in30Days = new Date()
    in30Days.setDate(today.getDate() + 30)

    // This month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Run all counts in PARALLEL using Promise.all
    // Each item runs at the same time → faster response
    const [
      totalCustomers,
      activePolicies,
      expiredPolicies,
      dueSoon,
      monthlyRevenue,
      totalPremiumCollection,
    ] = await Promise.all([
      // Count all customers
      Customer.count(),

      // Count active policies
      Policy.count({ where: { status: 'active' } }),

      // Count expired policies
      Policy.count({ where: { status: 'expired' } }),

      // Count policies expiring in next 30 days
      Policy.count({
        where: {
          status:     'active',
          expiryDate: { [Op.between]: [today, in30Days] },
        },
      }),

      // Sum of premiums PAID this month = monthly revenue
      Premium.sum('amount', {
        where: {
          status:   'paid',
          paidDate: { [Op.between]: [monthStart, monthEnd] },
        },
      }),

      // Total all-time premium collection
      Premium.sum('amount', { where: { status: 'paid' } }),
    ])

    res.json({
      totalCustomers,
      activePolicies,
      expiredPolicies,
      dueSoon,
      monthlyRevenue: monthlyRevenue || 0,
      totalPremium:   totalPremiumCollection || 0,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats.', error: error.message })
  }
}

module.exports = { getStats }
