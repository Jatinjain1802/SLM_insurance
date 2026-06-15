// services/sms.service.js
// LEARNING NOTE:
// Fast2SMS is an Indian SMS gateway. Their API is simple:
// POST https://www.fast2sms.com/dev/bulkV2 with:
//   - authorization: your API key (in headers)
//   - message: SMS text
//   - numbers: comma-separated mobile numbers
//
// SMS messages should be SHORT (max 160 chars = 1 SMS credit)

const axios = require('axios')
const { MessageLog } = require('../models')

// ============================================================
// Send SMS via Fast2SMS
// ============================================================
const sendSms = async (to, message, customerId = null) => {
  try {
    // Fast2SMS needs numbers WITHOUT the country code (+91)
    // If number starts with 91, remove it
    const mobile = to.replace(/^(\+91|91)/, '').trim()

    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route:    'q',              // 'q' = Quick SMS route
        message,
        numbers:  mobile,
        flash:    0,                // 0 = normal SMS, 1 = flash SMS
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    // Log to database
    await MessageLog.create({
      mobile:     to,
      channel:    'sms',
      direction:  'outbound',
      message,
      status:     response.data?.return === true ? 'sent' : 'failed',
      customerId,
    })

    console.log(`✅ SMS sent to ${to}`)
    return { success: true, data: response.data }

  } catch (error) {
    await MessageLog.create({
      mobile:    to,
      channel:   'sms',
      direction: 'outbound',
      message,
      status:    'failed',
      customerId,
    }).catch(() => {})

    console.error(`❌ SMS failed to ${to}:`, error.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

// ============================================================
// Policy Expiry SMS (short version for SMS)
// ============================================================
const sendExpirySms = async (customer, policy, company, daysLeft) => {
  // SMS must be SHORT — keep it under 160 chars
  const message = `[ABC Insurance] Hi ${customer.name}, your policy ${policy.policyNumber} with ${company.name} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Please renew to stay covered.`

  return sendSms(customer.mobile, message, customer.id)
}

module.exports = { sendSms, sendExpirySms }
