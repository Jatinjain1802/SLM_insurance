// models/MessageLog.model.js
// LEARNING NOTE:
// This table logs every WhatsApp and SMS message sent/received.
// Useful for: auditing, debugging, showing message history in dashboard.

const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const MessageLog = sequelize.define('MessageLog', {
    // The mobile number of the customer
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    // Which channel was used?
    channel: {
      type: DataTypes.ENUM('whatsapp', 'sms'),
      allowNull: false,
    },
    // outbound = we sent it, inbound = customer replied (WhatsApp bot)
    direction: {
      type: DataTypes.ENUM('outbound', 'inbound'),
      defaultValue: 'outbound',
    },
    // The actual message text
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Did the message send successfully?
    status: {
      type: DataTypes.ENUM('sent', 'failed', 'delivered', 'read'),
      defaultValue: 'sent',
    },
    // Optional: which customer this message belongs to
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // WhatsApp message ID returned by Meta API (for tracking delivery)
    externalId: {
      type: DataTypes.STRING(200),
    },
  }, {
    tableName: 'message_logs',
    timestamps: true,
  })

  return MessageLog
}
