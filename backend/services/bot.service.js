// services/bot.service.js
// LEARNING NOTE:
// This is the WhatsApp chatbot logic — a menu-driven system.
// When a customer sends a message, we look at what they typed
// and send back the appropriate response.
//
// We track "conversation state" in a simple in-memory Map.
// Map is like a JavaScript object but better for storing key-value pairs.
// Key = mobile number, Value = { step, selectedPolicyIndex }

const { Customer, Policy, Premium, InsuranceCompany, User } = require('../models')
const { sendTextMessage } = require('./whatsapp.service')

// In-memory conversation state store
// LEARNING NOTE: In production, use Redis for this (persists across server restarts)
// Map<mobileNumber, { step: string, data: object }>
const conversationState = new Map()

// ============================================================
// Main menu text
// ============================================================
const MAIN_MENU = `Welcome to *ABC Insurance* 🛡️

Please choose an option:

1️⃣  My Policies
2️⃣  Upcoming Premium Due
3️⃣  Policy Renewal Status
4️⃣  Download Policy Document
5️⃣  Contact My Agent

Reply with a number (1-5)`

// ============================================================
// Handle an incoming WhatsApp message
// Called by the WhatsApp webhook controller
// ============================================================
const handleIncomingMessage = async (from, messageText) => {
  const text = messageText.trim().toLowerCase()

  // Find customer by mobile number
  const customer = await Customer.findOne({
    where: { mobile: from },
    include: [
      { model: Policy, as: 'policies',
        include: [{ model: InsuranceCompany, as: 'company' }]
      },
      { model: User, as: 'assignedAgent', attributes: ['name', 'mobile'] },
    ],
  })

  // If customer not found in our system
  if (!customer) {
    await sendTextMessage(from,
      `Sorry, we couldn't find your number in our system. 😔\n\nPlease contact us at:\n📞 9876543210\n📧 contact@abcinsurance.com`
    )
    return
  }

  // Get or create conversation state for this number
  const state = conversationState.get(from) || { step: 'menu' }

  // Handle "hi", "hello", "menu", "0" → always go back to main menu
  if (['hi', 'hello', 'hey', 'menu', '0', 'start', 'home'].includes(text)) {
    conversationState.set(from, { step: 'menu' })
    await sendTextMessage(from, `Hello ${customer.name}! 👋\n\n${MAIN_MENU}`, customer.id)
    return
  }

  // Route based on current state
  switch (state.step) {

    // ---- MAIN MENU ----
    case 'menu':
      await handleMenuChoice(from, text, customer)
      break

    // ---- POLICY LIST: waiting for user to pick a policy ----
    case 'policy_select':
      await handlePolicySelection(from, text, customer, state)
      break

    default:
      // Unknown state — reset to menu
      conversationState.set(from, { step: 'menu' })
      await sendTextMessage(from, MAIN_MENU, customer.id)
  }
}

// ============================================================
// Handle main menu number selection
// ============================================================
const handleMenuChoice = async (from, choice, customer) => {
  const policies = customer.policies || []

  switch (choice) {

    // 1 — My Policies
    case '1': {
      if (policies.length === 0) {
        await sendTextMessage(from, `You don't have any policies registered yet.\n\nPlease contact your agent.`, customer.id)
        return
      }
      const list = policies.map((p, i) =>
        `${i + 1}. *${p.policyNumber}* — ${p.policyType} (${p.company?.name || ''})\n   Status: ${p.status.toUpperCase()}`
      ).join('\n\n')

      await sendTextMessage(from, `📋 *Your Policies*\n\n${list}\n\nTotal: ${policies.length} policies\n\nReply *0* for main menu`, customer.id)
      break
    }

    // 2 — Upcoming Premium Due
    case '2': {
      const today    = new Date()
      const in30Days = new Date()
      in30Days.setDate(today.getDate() + 30)

      const policyIds = policies.map(p => p.id)

      if (policyIds.length === 0) {
        await sendTextMessage(from, 'No policies found.\n\nReply *0* for main menu', customer.id)
        return
      }

      const { Op } = require('sequelize')
      const upcoming = await Premium.findAll({
        where: {
          policyId: { [Op.in]: policyIds },
          status:   'upcoming',
          dueDate:  { [Op.between]: [today, in30Days] },
        },
        include: [{ model: Policy, as: 'policy', attributes: ['policyNumber', 'policyType'] }],
        order:   [['dueDate', 'ASC']],
        limit:   3,
      })

      if (upcoming.length === 0) {
        await sendTextMessage(from, `✅ No premiums due in the next 30 days.\n\nReply *0* for main menu`, customer.id)
        return
      }

      const lines = upcoming.map(u => {
        const days = Math.ceil((new Date(u.dueDate) - today) / (1000*60*60*24))
        return `📋 *${u.policy.policyNumber}*\n💰 Amount: ₹${Number(u.amount).toLocaleString('en-IN')}\n📅 Due: ${new Date(u.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n⏰ ${days} day${days === 1 ? '' : 's'} left`
      }).join('\n\n')

      await sendTextMessage(from, `💰 *Upcoming Premiums*\n\n${lines}\n\nReply *0* for main menu`, customer.id)
      break
    }

    // 3 — Policy Renewal Status
    case '3': {
      const today    = new Date()
      const in30Days = new Date()
      in30Days.setDate(today.getDate() + 30)

      const expiring = policies.filter(p => {
        const exp = new Date(p.expiryDate)
        return exp >= today && exp <= in30Days
      })

      if (expiring.length === 0) {
        await sendTextMessage(from, `✅ All your policies are valid for the next 30 days.\n\nReply *0* for main menu`, customer.id)
        return
      }

      const lines = expiring.map(p => {
        const days = Math.ceil((new Date(p.expiryDate) - today) / (1000*60*60*24))
        return `📋 *${p.policyNumber}*\nStatus: ${p.status.toUpperCase()}\nExpiry: ${new Date(p.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n⏰ ${days} days left — Please renew!`
      }).join('\n\n')

      await sendTextMessage(from, `🔄 *Renewal Required*\n\n${lines}\n\nReply *0* for main menu`, customer.id)
      break
    }

    // 4 — Download Policy (we send a note to contact agent)
    case '4': {
      await sendTextMessage(from, `📥 *Policy Documents*\n\nTo download your policy documents, please contact your agent:\n\n👤 ${customer.assignedAgent?.name || 'Your Agent'}\n📞 ${customer.assignedAgent?.mobile || 'Contact us at 9876543210'}\n\nOr email: documents@abcinsurance.com\n\nReply *0* for main menu`, customer.id)
      break
    }

    // 5 — Contact Agent
    case '5': {
      const agent = customer.assignedAgent
      const msg = agent
        ? `👤 *Your Agent*\n\nName: ${agent.name}\nMobile: ${agent.mobile}\n\nFeel free to contact them for any queries!\n\nReply *0* for main menu`
        : `📞 *Contact Us*\n\nPhone: 9876543210\nEmail: contact@abcinsurance.com\nHours: Mon–Sat, 9 AM – 6 PM\n\nReply *0* for main menu`
      await sendTextMessage(from, msg, customer.id)
      break
    }

    default:
      await sendTextMessage(from, `❓ I didn't understand that.\n\n${MAIN_MENU}`, customer.id)
  }
}

// ============================================================
// Handle policy selection (step 2 for some flows)
// ============================================================
const handlePolicySelection = async (from, choice, customer, state) => {
  const index = parseInt(choice) - 1
  const policies = customer.policies || []

  if (index < 0 || index >= policies.length) {
    await sendTextMessage(from, `Invalid choice. Please enter a number between 1 and ${policies.length}.\n\nReply *0* for main menu`, customer.id)
    return
  }

  const policy = policies[index]
  const company = policy.company?.name || ''
  const expiry  = new Date(policy.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const premium = Number(policy.premiumAmount).toLocaleString('en-IN')

  const msg = `📋 *Policy Details*\n\nPolicy No: *${policy.policyNumber}*\nType: ${policy.policyType}\nCompany: ${company}\nPremium: ₹${premium}\nExpiry: ${expiry}\nStatus: ${policy.status.toUpperCase()}\n\nReply *0* for main menu`
  await sendTextMessage(from, msg, customer.id)
  conversationState.set(from, { step: 'menu' })
}

// Log an inbound message to the database
const logInbound = async (from, message) => {
  const { MessageLog } = require('../models')
  await MessageLog.create({
    mobile:    from,
    channel:   'whatsapp',
    direction: 'inbound',
    message,
    status:    'delivered',
  }).catch(() => {})
}

module.exports = { handleIncomingMessage, logInbound }
