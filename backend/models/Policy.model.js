// models/Policy.model.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Policy = sequelize.define('Policy', {
    policyNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    // customerId and companyId are foreign keys
    // Their associations are defined in models/index.js
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    policyType: {
      type: DataTypes.ENUM('Life', 'Health', 'Vehicle', 'Travel', 'Home', 'Term'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      // This is the key field for expiry reminder logic
    },
    premiumAmount: {
      // DECIMAL(10, 2) = up to 10 digits with 2 decimal places
      // Good for money values (e.g., 5000.00)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentFrequency: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'half-yearly', 'yearly'),
      defaultValue: 'yearly',
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'renewed', 'pending'),
      defaultValue: 'active',
    },
    // Stores any notes about the policy
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'policies',
    timestamps: true,
  })

  return Policy
}
