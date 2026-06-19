// controllers/company.controller.js
const { InsuranceCompany } = require('../models')

const getAll = async (req, res) => {
  try {
    const companies = await InsuranceCompany.findAll({ order: [['name', 'ASC']] })
    res.json(companies)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

const create = async (req, res) => {
  try {
    const { name, code, type, contactDetails } = req.body
    if (!name || !code || !type) {
      return res.status(400).json({ message: 'Name, code, and type are required.' })
    }
    const existing = await InsuranceCompany.findOne({ where: { code } })
    if (existing) return res.status(400).json({ message: 'Company code already exists.' })

    const company = await InsuranceCompany.create({ name, code, type, contactDetails })
    res.status(201).json(company)
  } catch (error) {
    res.status(500).json({ message: 'Error creating company.', error: error.message })
  }
}

// POST /api/companies/bulk
const createBulk = async (req, res) => {
  try {
    const { companies } = req.body
    
    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({ message: 'No companies provided for bulk upload.' })
    }

    let successCount = 0
    let skipCount = 0
    let errors = []

    for (const data of companies) {
      const { name, code, type, contactDetails } = data
      
      if (!name || !code || !type) {
        skipCount++
        errors.push(`Row skipped: Missing name, code, or type.`)
        continue
      }

      const existing = await InsuranceCompany.findOne({ where: { code } })
      if (existing) {
        skipCount++
        errors.push(`Row skipped: Company code ${code} already exists.`)
        continue
      }

      try {
        await InsuranceCompany.create({ name, code, type, contactDetails })
        successCount++
      } catch (err) {
        skipCount++
        errors.push(`Error saving company ${code}: ${err.message}`)
      }
    }

    res.status(201).json({
      message: 'Bulk upload completed.',
      successCount,
      skipCount,
      errors
    })
  } catch (error) {
    res.status(500).json({ message: 'Error processing bulk upload.', error: error.message })
  }
}

const update = async (req, res) => {
  try {
    const company = await InsuranceCompany.findByPk(req.params.id)
    if (!company) return res.status(404).json({ message: 'Company not found.' })
    await company.update(req.body)
    res.json(company)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

const remove = async (req, res) => {
  try {
    const company = await InsuranceCompany.findByPk(req.params.id)
    if (!company) return res.status(404).json({ message: 'Company not found.' })
    await company.destroy()
    res.json({ message: 'Company deleted.' })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

module.exports = { getAll, create, update, remove, createBulk }
