// models/InsuranceCompany.model.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const InsuranceCompany = sequelize.define('InsuranceCompany', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,  // e.g., "LIC001" — must be unique
    },
    type: {
      type: DataTypes.ENUM('Life', 'General', 'Health', 'Travel'),
      allowNull: false,
    },
    contactDetails: {
      type: DataTypes.STRING(200),
    },
  }, {
    tableName: 'insurance_companies',
    timestamps: true,
  })

  return InsuranceCompany
}
