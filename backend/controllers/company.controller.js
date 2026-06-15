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

module.exports = { getAll, create, update, remove }
