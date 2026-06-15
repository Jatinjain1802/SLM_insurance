// models/User.model.js
// LEARNING NOTE:
// A Sequelize model is a JavaScript class that represents a database TABLE.
// Each property in the model = one column in the table.
// DataTypes.STRING = VARCHAR, DataTypes.ENUM = a fixed set of allowed values.
// Sequelize automatically adds `id`, `createdAt`, `updatedAt` columns.

const { DataTypes } = require('sequelize')

// We export a function that receives the sequelize instance
// and returns the model. This pattern lets us reuse the same connection.
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    // id is auto-created by Sequelize (AUTO_INCREMENT PRIMARY KEY)
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,           // required field
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,               // no two users with same email
      validate: {
        isEmail: true,            // Sequelize validates email format
      },
    },
    // We never store plain passwords — always store the hashed version
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      // ENUM restricts value to only these options
      type: DataTypes.ENUM('owner', 'admin', 'agent'),
      defaultValue: 'agent',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'users',   // actual table name in MySQL
    timestamps: true,     // adds createdAt and updatedAt automatically
  })

  return User
}
