// models/Customer.model.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
      // Mobile is used to identify the customer in WhatsApp bot
      comment: 'WhatsApp mobile number for bot identification',
    },
    email: {
      type: DataTypes.STRING(150),
      validate: { isEmail: true },
    },
    address: {
      type: DataTypes.TEXT,
    },
    dob: {
      type: DataTypes.DATEONLY, // stores only date, no time (YYYY-MM-DD)
    },
    aadhaar: {
      type: DataTypes.STRING(12),
    },
    pan: {
      type: DataTypes.STRING(10),
    },
    // Foreign key to User (which agent manages this customer)
    // Defined here — association set up in models/index.js
    assignedAgentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null means no agent assigned yet
    },
  }, {
    tableName: 'customers',
    timestamps: true,
  })

  return Customer
}
