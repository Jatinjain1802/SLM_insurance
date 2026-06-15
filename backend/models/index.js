// models/index.js
// LEARNING NOTE:
// Sequelize is an ORM (Object-Relational Mapper).
// Instead of writing raw SQL like:
//   SELECT * FROM customers WHERE id = 1
// We write JavaScript:
//   Customer.findByPk(1)
//
// This file:
// 1. Creates the MySQL connection using env variables
// 2. Imports all models and registers them with Sequelize
// 3. Defines associations (relationships) between models
// 4. Exports everything so other files can import models

const { Sequelize } = require('sequelize')
require('dotenv').config()

// Create Sequelize instance — this IS the database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,     // database name
  process.env.DB_USER,     // mysql username
  process.env.DB_PASSWORD, // mysql password
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    process.env.DB_PORT || 3306,
    dialect: 'mysql',        // we're using MySQL (not PostgreSQL/SQLite)
    logging: false,          // set to console.log to see SQL queries in terminal
    pool: {
      max: 10,   // max 10 simultaneous DB connections
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
)

// Import all model definition functions
const UserModel             = require('./User.model')
const CustomerModel         = require('./Customer.model')
const InsuranceCompanyModel = require('./InsuranceCompany.model')
const PolicyModel           = require('./Policy.model')
const PremiumModel          = require('./Premium.model')
const DocumentModel         = require('./Document.model')
const MessageLogModel       = require('./MessageLog.model')

// Initialize each model by calling its function with sequelize instance
// Each model function defines the table structure (columns)
const User             = UserModel(sequelize)
const Customer         = CustomerModel(sequelize)
const InsuranceCompany = InsuranceCompanyModel(sequelize)
const Policy           = PolicyModel(sequelize)
const Premium          = PremiumModel(sequelize)
const Document         = DocumentModel(sequelize)
const MessageLog       = MessageLogModel(sequelize)

// ============================================================
// ASSOCIATIONS (Relationships between tables)
// LEARNING NOTE:
// - hasMany: "A customer has many policies"
// - belongsTo: "A policy belongs to a customer"
// - foreignKey: the column name in the child table that links back
// ============================================================

// A User (agent) can be assigned many Customers
User.hasMany(Customer, { foreignKey: 'assignedAgentId', as: 'assignedCustomers' })
Customer.belongsTo(User, { foreignKey: 'assignedAgentId', as: 'assignedAgent' })

// A Customer can have many Policies
Customer.hasMany(Policy, { foreignKey: 'customerId', as: 'policies' })
Policy.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })

// An InsuranceCompany can have many Policies
InsuranceCompany.hasMany(Policy, { foreignKey: 'companyId', as: 'policies' })
Policy.belongsTo(InsuranceCompany, { foreignKey: 'companyId', as: 'company' })

// A Policy can have many Premiums (monthly/quarterly/yearly payments)
Policy.hasMany(Premium, { foreignKey: 'policyId', as: 'premiums' })
Premium.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' })

// A Customer can have many Documents
Customer.hasMany(Document, { foreignKey: 'customerId', as: 'documents' })
Document.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })

// A Policy can have many Documents
Policy.hasMany(Document, { foreignKey: 'policyId', as: 'documents' })
Document.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' })

// Export everything so other files can do:
// const { Customer, Policy } = require('../models')
module.exports = {
  sequelize,
  User,
  Customer,
  InsuranceCompany,
  Policy,
  Premium,
  Document,
  MessageLog,
}
