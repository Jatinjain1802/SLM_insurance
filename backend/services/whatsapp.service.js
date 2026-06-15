// services/whatsapp.service.js
// LEARNING NOTE:
// The Meta WhatsApp Cloud API works like this:
// 1. We make a POST request to Meta's servers with our message
// 2. Meta delivers it to the customer's WhatsApp
// 3. When a customer replies, Meta sends a POST to OUR webhook URL
//
// axios.post(url, data, { headers }) = HTTP POST request with headers

const axios = require('axios')
const { MessageLog } = require('../models')

// Base URL for Meta WhatsApp API (v19.0 is stable)
const WA_API_URL = `https://graph.facebook.com/v19.0`

// ============================================================
// Send a plain text message to a WhatsApp number
// ============================================================
const sendTextMessage = async (to, message, customerId = null) => {
  try {
    const response = await axios.post(
      `${WA_API_URL}/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type:    'individual',
        to:                to,            // customer's WhatsApp number (with country code)
        type:              'text',
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // Log the sent message to our database
    await MessageLog.create({
      mobile:     to,
      channel:    'whatsapp',
      direction:  'outbound',
      message,
      status:     'sent',
      customerId,
      externalId: response.data?.messages?.[0]?.id,
    })

    console.log(`✅ WhatsApp sent to ${to}`)
    return { success: true, data: response.data }

  } catch (error) {
    // Log failed message too
    await MessageLog.create({
      mobile:    to,
      channel:   'whatsapp',
      direction: 'outbound',
      message,
      status:    'failed',
      customerId,
    }).catch(() => {}) // ignore logging errors

    console.error(`❌ WhatsApp failed to ${to}:`, error.response?.data || error.message)
    return { success: false, error: error.response?.data || error.message }
  }
}

// ============================================================
// Policy Expiry Reminder Message (used by cron job)
// ============================================================
const sendExpiryReminder = async (customer, policy, company, daysLeft) => {
  const urgency = daysLeft <= 1 ? '🚨 URGENT: ' : daysLeft <= 7 ? '⚡ ' : ''

  const message = `${urgency}Hello ${customer.name} 👋

Your policy *${policy.policyNumber}* with ${company.name} is expiring in *${daysLeft} day${daysLeft === 1 ? '' : 's'}* on *${new Date(policy.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}*.

Please renew it before the expiry date to stay protected.

Reply *HI* to chat with us anytime.

— ABC Insurance 🛡️`

  return sendTextMessage(customer.mobile, message, customer.id)
}

// ============================================================
// Renewal Confirmation Message
// ============================================================
const sendRenewalConfirmation = async (customer, policy) => {
  const message = `Dear ${customer.name},

Your policy *${policy.policyNumber}* has been successfully renewed! ✅

New Expiry Date: *${new Date(policy.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}*

Thank you for your continued trust in ABC Insurance. 🙏

— ABC Insurance 🛡️`

  return sendTextMessage(customer.mobile, message, customer.id)
}

module.exports = { sendTextMessage, sendExpiryReminder, sendRenewalConfirmation }
