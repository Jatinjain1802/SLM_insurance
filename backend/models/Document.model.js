// models/Document.model.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    policyId: {
      type: DataTypes.INTEGER,
      allowNull: true, // document can belong to customer without a specific policy
    },
    docType: {
      // What kind of document is this?
      type: DataTypes.ENUM('Policy PDF', 'Aadhaar', 'PAN', 'Premium Receipt', 'Proposal Form', 'Other'),
      allowNull: false,
    },
    // Original file name (e.g., "LIC-2024-001.pdf")
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // Path on disk (e.g., "uploads/1234567890-LIC-2024-001.pdf")
    // LEARNING NOTE: We store the PATH, not the file itself, in the database.
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER, // in bytes
    },
    mimeType: {
      type: DataTypes.STRING(100),
    },
  }, {
    tableName: 'documents',
    timestamps: true,
  })

  return Document
}
