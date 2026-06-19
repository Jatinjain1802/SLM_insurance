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

      // Count active policies (both newly active and renewed)
      Policy.count({ where: { status: { [Op.in]: ['active', 'renewed'] } } }),

      // Count expired policies
      Policy.count({ where: { status: 'expired' } }),

      // Count policies expiring in next 30 days
      Policy.count({
        where: {
          status: { [Op.in]: ['active', 'renewed'] },
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

    // ============================================
    // AGGREGATE CHART DATA
    // ============================================
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1) // Start of the 6th month ago

    // Generate last 6 months labels
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push({
        label: d.toLocaleString('en-IN', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear()
      })
    }

    const [paidPremiums, recentPolicies, policyCounts, recentCust] = await Promise.all([
      Premium.findAll({
        where: { status: 'paid', paidDate: { [Op.gte]: sixMonthsAgo } },
        attributes: ['paidDate', 'amount']
      }),
      Policy.findAll({
        where: { createdAt: { [Op.gte]: sixMonthsAgo } },
        attributes: ['createdAt', 'status']
      }),
      Policy.findAll({
        attributes: ['policyType', [fn('COUNT', col('id')), 'count']],
        group: ['policyType']
      }),
      Customer.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{ model: Policy, as: 'policies', attributes: ['id'] }]
      })
    ])

    // 1. Revenue Data
    const revenueData = months.map(m => {
      const total = paidPremiums
        .filter(p => {
          const d = new Date(p.paidDate)
          return d.getMonth() === m.monthNum && d.getFullYear() === m.year
        })
        .reduce((sum, p) => sum + Number(p.amount), 0)
      return { month: m.label, revenue: total }
    })

    // 2. Renewal Data
    const renewalData = months.map(m => {
      const monthPolicies = recentPolicies.filter(p => {
        const d = new Date(p.createdAt)
        return d.getMonth() === m.monthNum && d.getFullYear() === m.year
      })
      const active = monthPolicies.filter(p => p.status === 'active').length
      const renewed = monthPolicies.filter(p => p.status === 'renewed').length
      const expired = monthPolicies.filter(p => p.status === 'expired').length
      return { month: m.label, active, renewed, expired }
    })

    // 3. Policy Types
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6']
    const policyTypeData = policyCounts.map((p, index) => ({
      name: p.policyType,
      value: parseInt(p.get('count'), 10),
      color: colors[index % colors.length]
    }))

    // 4. Recent Customers
    const recentCustomers = recentCust.map(c => ({
      name: c.name,
      mobile: c.mobile,
      policies: c.policies ? c.policies.length : 0,
      date: new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }))

    res.json({
      totalCustomers,
      activePolicies,
      expiredPolicies,
      dueSoon,
      monthlyRevenue: monthlyRevenue || 0,
      totalPremium:   totalPremiumCollection || 0,
      chartData: {
        revenueData,
        policyTypeData,
        renewalData,
        recentCustomers
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats.', error: error.message })
  }
}

module.exports = { getStats }
