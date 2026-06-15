// models/Premium.model.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Premium = sequelize.define('Premium', {
    policyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paidDate: {
      type: DataTypes.DATEONLY,
      // null means not yet paid
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'paid', 'overdue'),
      defaultValue: 'upcoming',
    },
  }, {
    tableName: 'premiums',
    timestamps: true,
  })

  return Premium
}
