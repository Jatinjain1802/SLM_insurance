// controllers/sms.controller.js
const { sendSms } = require('../services/sms.service')
const { MessageLog } = require('../models')

// POST /api/sms/send
const sendManualSms = async (req, res) => {
  try {
    const { to, message } = req.body
    if (!to || !message) return res.status(400).json({ message: 'to and message are required.' })

    const result = await sendSms(to, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// GET /api/sms/logs
const getSmsLogs = async (req, res) => {
  try {
    const logs = await MessageLog.findAll({
      where: { channel: 'sms' },
      order: [['createdAt', 'DESC']],
      limit: 100,
    })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

module.exports = { sendManualSms, getSmsLogs }
