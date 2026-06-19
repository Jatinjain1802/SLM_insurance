// controllers/report.controller.js
// LEARNING NOTE:
// sequelize.query() lets us run RAW SQL when Sequelize's JS API
// isn't powerful enough (like complex GROUP BY queries).
// QueryTypes.SELECT tells Sequelize we expect rows back.

const { Op, fn, col, literal, QueryTypes } = require('sequelize')
const { Customer, Policy, Premium, InsuranceCompany, sequelize } = require('../models')

// GET /api/reports/customers
const getCustomerReport = async (req, res) => {
  try {
    const total = await Customer.count()
    // New customers this month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const newThisMonth = await Customer.count({
      where: { createdAt: { [Op.gte]: monthStart } },
    })
    res.json({ total, newThisMonth })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// GET /api/reports/policies
const getPolicyReport = async (req, res) => {
  try {
    const [active, expired, renewed, pending] = await Promise.all([
      Policy.count({ where: { status: 'active'  } }),
      Policy.count({ where: { status: 'expired' } }),
      Policy.count({ where: { status: 'renewed' } }),
      Policy.count({ where: { status: 'pending' } }),
    ])

    // Company-wise policy count using raw SQL GROUP BY
    const byCompany = await sequelize.query(`
      SELECT ic.name AS company, COUNT(p.id) AS policyCount, SUM(p.premiumAmount) AS totalRevenue
      FROM policies p
      JOIN insurance_companies ic ON p.companyId = ic.id
      GROUP BY ic.id, ic.name
      ORDER BY totalRevenue DESC
    `, { type: QueryTypes.SELECT })

    res.json({ active, expired, renewed, pending, byCompany })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// GET /api/reports/revenue
const getRevenueReport = async (req, res) => {
  try {
    // Monthly revenue for last 6 months using raw SQL
    const monthlyRevenue = await sequelize.query(`
      SELECT 
        DATE_FORMAT(paidDate, '%b') AS month,
        DATE_FORMAT(paidDate, '%Y-%m') AS yearMonth,
        SUM(amount) AS revenue
      FROM premiums
      WHERE status = 'paid'
        AND paidDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY yearMonth, month
      ORDER BY yearMonth ASC
    `, { type: QueryTypes.SELECT })

    const totalRevenue = await Premium.sum('amount', { where: { status: 'paid' } })

    res.json({ monthlyRevenue, totalRevenue: totalRevenue || 0 })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// POST /api/reports/reminders/trigger — manually trigger reminder job (for testing)
const triggerReminders = async (req, res) => {
  try {
    const { runDailyReminders } = require('../jobs/reminder.job')
    await runDailyReminders()
    res.json({ message: 'Reminder job triggered successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// GET /api/reports/export-csv
const exportCsvReport = async (req, res) => {
  try {
    const policies = await Policy.findAll({
      include: [
        { model: Customer, as: 'customer', attributes: ['name', 'mobile'] },
        { model: InsuranceCompany, as: 'company', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    })

    // Define CSV headers
    const headers = [
      'Policy Number', 'Customer Name', 'Customer Mobile', 'Company Name',
      'Policy Type', 'Premium Amount', 'Payment Frequency', 'Start Date', 'Expiry Date', 'Status'
    ]

    // Helper to safely escape CSV fields (wrap in quotes if contains comma)
    const escapeCsv = (field) => {
      if (field === null || field === undefined) return ''
      const stringField = String(field)
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`
      }
      return stringField
    }

    // Map rows to CSV strings
    const rows = policies.map(p => {
      return [
        p.policyNumber,
        p.customer ? p.customer.name : 'Unknown',
        p.customer ? p.customer.mobile : 'Unknown',
        p.company ? p.company.name : 'Unknown',
        p.policyType,
        p.premiumAmount,
        p.paymentFrequency,
        p.startDate || '',
        p.expiryDate,
        p.status
      ].map(escapeCsv).join(',')
    })

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="SLM_Comprehensive_Report.csv"')
    
    return res.send(csvContent)
  } catch (error) {
    res.status(500).json({ message: 'Error generating CSV export.', error: error.message })
  }
}

module.exports = { getCustomerReport, getPolicyReport, getRevenueReport, triggerReminders, exportCsvReport }
