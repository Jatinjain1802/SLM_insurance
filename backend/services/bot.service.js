// services/bot.service.js
// LEARNING NOTE:
// This is the WhatsApp chatbot logic — a menu-driven system.
// When a customer sends a message, we look at what they typed
// and send back the appropriate response.
//
// We track "conversation state" in a simple in-memory Map.
// Map is like a JavaScript object but better for storing key-value pairs.
// Key = mobile number, Value = { step, selectedPolicyIndex }

const { Op } = require('sequelize')
const { Customer, Policy, Premium, InsuranceCompany, User } = require('../models')
const { sendTextMessage, sendInteractiveList, sendInteractiveButton } = require('./whatsapp.service')

// In-memory conversation state store
// LEARNING NOTE: In production, use Redis for this (persists across server restarts)
// Map<mobileNumber, { step: string, data: object }>
const conversationState = new Map()

const sendMainMenu = async (from, customer) => {
  const sections = [
    {
      title: 'Main Menu',
      rows: [
        { id: '1', title: 'My Policies', description: 'View your active policies' },
        { id: '2', title: 'Upcoming Premiums', description: 'Check premiums due soon' },
        { id: '3', title: 'Renewal Status', description: 'Check expiring policies' },
        { id: '4', title: 'Download Document', description: 'Get policy PDF copies' },
        { id: '5', title: 'Contact Agent', description: 'Get agent contact details' }
      ]
    }
  ]
  
  await sendInteractiveList(
    from,
    `Hello ${customer.name}! 👋\n\nWelcome to *SLM Insurance* 🛡️\n\nPlease choose an option below:`,
    'View Options',
    sections,
    customer.id
  )
}

const sendTextWithMenuButton = async (from, text, customerId) => {
  await sendInteractiveButton(from, text, [{ id: '0', title: '🏠 Main Menu' }], customerId)
}

// ============================================================
// Handle an incoming WhatsApp message
// Called by the WhatsApp webhook controller
// ============================================================
const handleIncomingMessage = async (from, messageText) => {
  const text = messageText.trim().toLowerCase()

  // Extract the last 10 digits as the local number
  const localNumber = from.length > 10 ? from.slice(-10) : from

  // Find customer by mobile number (matching either full WA number or 10-digit number)
  const customer = await Customer.findOne({
    where: { 
      mobile: {
        [Op.or]: [from, localNumber, `91${localNumber}`, `+91${localNumber}`]
      }
    },
    include: [
      { model: Policy, as: 'policies',
        include: [{ model: InsuranceCompany, as: 'company' }]
      },
      { model: User, as: 'assignedAgent', attributes: ['name', 'email'] },
    ],
  })

  // If customer not found in our system
  if (!customer) {
    await sendTextMessage(from,
      `Sorry, we couldn't find your number in our system. 😔\n\nPlease contact us at:\n📞 9876543210\n📧 contact@slminsurance.com`
    )
    return
  }

  // Get or create conversation state for this number
  const state = conversationState.get(from) || { step: 'menu' }

  // Handle "hi", "hello", "menu", "0" → always go back to main menu
  if (['hi', 'hello', 'hey', 'menu', '0', 'start', 'home'].includes(text)) {
    conversationState.set(from, { step: 'menu' })
    await sendMainMenu(from, customer)
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
      await sendMainMenu(from, customer)
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
        await sendTextWithMenuButton(from, `You don't have any policies registered yet.\n\nPlease contact your agent.`, customer.id)
        return
      }
      const list = policies.map((p, i) =>
        `${i + 1}. *${p.policyNumber}* — ${p.policyType} (${p.company?.name || ''})\n   Status: ${p.status.toUpperCase()}`
      ).join('\n\n')

      await sendTextWithMenuButton(from, `📋 *Your Policies*\n\n${list}\n\nTotal: ${policies.length} policies`, customer.id)
      break
    }

    // 2 — Upcoming Premium Due
    case '2': {
      const today    = new Date()
      const in30Days = new Date()
      in30Days.setDate(today.getDate() + 30)

      const policyIds = policies.map(p => p.id)

      if (policyIds.length === 0) {
        await sendTextWithMenuButton(from, 'No policies found.', customer.id)
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
        await sendTextWithMenuButton(from, `✅ No premiums due in the next 30 days.`, customer.id)
        return
      }

      const lines = upcoming.map(u => {
        const days = Math.ceil((new Date(u.dueDate) - today) / (1000*60*60*24))
        return `📋 *${u.policy.policyNumber}*\n💰 Amount: ₹${Number(u.amount).toLocaleString('en-IN')}\n📅 Due: ${new Date(u.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n⏰ ${days} day${days === 1 ? '' : 's'} left`
      }).join('\n\n')

      await sendTextWithMenuButton(from, `💰 *Upcoming Premiums*\n\n${lines}`, customer.id)
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
        await sendTextWithMenuButton(from, `✅ All your policies are valid for the next 30 days.`, customer.id)
        return
      }

      const lines = expiring.map(p => {
        const days = Math.ceil((new Date(p.expiryDate) - today) / (1000*60*60*24))
        return `📋 *${p.policyNumber}*\nStatus: ${p.status.toUpperCase()}\nExpiry: ${new Date(p.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}\n⏰ ${days} days left — Please renew!`
      }).join('\n\n')

      await sendTextWithMenuButton(from, `🔄 *Renewal Required*\n\n${lines}`, customer.id)
      break
    }

    case '4': {
      await sendTextWithMenuButton(from, `📥 *Policy Documents*\n\nTo download your policy documents, please contact your agent:\n\n👤 ${customer.assignedAgent?.name || 'Your Agent'}\n📧 ${customer.assignedAgent?.email || 'Contact us at documents@slminsurance.com'}`, customer.id)
      break
    }

    // 5 — Contact Agent
    case '5': {
      const agent = customer.assignedAgent
      const msg = agent
        ? `👤 *Your Agent*\n\nName: ${agent.name}\nEmail: ${agent.email}\n\nFeel free to contact them for any queries!`
        : `📞 *Contact Us*\n\nPhone: 9876543210\nEmail: contact@slminsurance.com\nHours: Mon–Sat, 9 AM – 6 PM`
      await sendTextWithMenuButton(from, msg, customer.id)
      break
    }

    default:
      await sendTextWithMenuButton(from, `❓ I didn't understand that.`, customer.id)
  }
}

// ============================================================
// Handle policy selection (step 2 for some flows)
// ============================================================
const handlePolicySelection = async (from, choice, customer, state) => {
  const index = parseInt(choice) - 1
  const policies = customer.policies || []

  if (index < 0 || index >= policies.length) {
    await sendTextWithMenuButton(from, `Invalid choice. Please enter a number between 1 and ${policies.length}.`, customer.id)
    return
  }

  const policy = policies[index]
  const company = policy.company?.name || ''
  const expiry  = new Date(policy.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const premium = Number(policy.premiumAmount).toLocaleString('en-IN')

  const msg = `📋 *Policy Details*\n\nPolicy No: *${policy.policyNumber}*\nType: ${policy.policyType}\nCompany: ${company}\nPremium: ₹${premium}\nExpiry: ${expiry}\nStatus: ${policy.status.toUpperCase()}`
  await sendTextWithMenuButton(from, msg, customer.id)
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
