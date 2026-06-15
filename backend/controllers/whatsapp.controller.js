// controllers/whatsapp.controller.js
// LEARNING NOTE:
// The WhatsApp webhook has TWO endpoints on the same URL:
// GET  /api/whatsapp/webhook → Meta calls this to VERIFY our server is real
// POST /api/whatsapp/webhook → Meta calls this when a customer sends a message
//
// Webhook verification (GET):
// Meta sends: ?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
// We check the token, then respond with hub.challenge to confirm we own this URL.

const { handleIncomingMessage, logInbound } = require('../services/bot.service')
const { sendTextMessage } = require('../services/whatsapp.service')
const { MessageLog } = require('../models')

// GET /api/whatsapp/webhook — Meta verification (one-time setup)
const verifyWebhook = (req, res) => {
  const mode      = req.query['hub.mode']
  const token     = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified successfully')
    res.status(200).send(challenge) // echo back the challenge to confirm
  } else {
    console.error('❌ Webhook verification failed — check WHATSAPP_VERIFY_TOKEN in .env')
    res.status(403).json({ message: 'Verification failed.' })
  }
}

// POST /api/whatsapp/webhook — incoming messages from customers
const receiveMessage = async (req, res) => {
  try {
    const body = req.body

    // Meta sends a complex nested object — we dig into it
    if (body.object === 'whatsapp_business_account') {
      const entry    = body.entry?.[0]
      const changes  = entry?.changes?.[0]
      const messages = changes?.value?.messages

      if (messages && messages.length > 0) {
        const msg  = messages[0]
        const from = msg.from       // customer's WhatsApp number
        const text = msg.text?.body // message text

        if (text) {
          console.log(`📱 Incoming WhatsApp from ${from}: "${text}"`)

          // Log the inbound message
          await logInbound(from, text)

          // Process the message through the chatbot
          await handleIncomingMessage(from, text)
        }
      }
    }

    // Always respond with 200 to Meta (even on errors)
    // If we return anything else, Meta will retry the webhook
    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(200).json({ status: 'ok' }) // still return 200
  }
}

// POST /api/whatsapp/send — manual message send from dashboard
const sendManual = async (req, res) => {
  try {
    const { to, message } = req.body
    if (!to || !message) return res.status(400).json({ message: 'to and message are required.' })

    const result = await sendTextMessage(to, message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// GET /api/whatsapp/logs
const getLogs = async (req, res) => {
  try {
    const logs = await MessageLog.findAll({
      where: { channel: 'whatsapp' },
      order: [['createdAt', 'DESC']],
      limit: 100,
    })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

module.exports = { verifyWebhook, receiveMessage, sendManual, getLogs }
