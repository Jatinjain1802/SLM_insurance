// jobs/reminder.job.js
// LEARNING NOTE:
// node-cron runs code on a SCHEDULE, like a clock alarm.
// Cron syntax: '0 9 * * *' means "at 9:00 AM every day"
//   0    = minute 0
//   9    = hour 9
//   *    = every day of month
//   *    = every month
//   *    = every day of week
//
// So every morning at 9 AM this function runs automatically.
// It checks which policies are expiring and sends reminders.

const cron  = require('node-cron')
const { Op } = require('sequelize')
const { Policy, Customer, InsuranceCompany } = require('../models')
const { sendExpiryReminder }  = require('../services/whatsapp.service')
const { sendExpirySms }       = require('../services/sms.service')

// The reminder thresholds — how many days before expiry to send which channels
const REMINDER_RULES = [
  { days: 30, channels: ['whatsapp'] },               // 30 days: WhatsApp only
  { days: 15, channels: ['whatsapp', 'sms'] },         // 15 days: WhatsApp + SMS
  { days: 7,  channels: ['whatsapp', 'sms'] },         // 7 days:  WhatsApp + SMS
  { days: 1,  channels: ['whatsapp', 'sms'] },         // 1 day:   Both (urgent)
]

// ============================================================
// Core reminder function — checks and sends all due reminders
// ============================================================
const runDailyReminders = async () => {
  console.log(`\n🔔 [${new Date().toLocaleString()}] Running daily policy reminders...`)

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // normalize to midnight

    for (const rule of REMINDER_RULES) {
      // Calculate the target date
      // e.g., for 30-day rule: targetDate = today + 30 days
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + rule.days)

      // Next day (for BETWEEN range)
      const targetDateEnd = new Date(targetDate)
      targetDateEnd.setDate(targetDate.getDate() + 1)

      // Find all active policies expiring on the target date
      const policies = await Policy.findAll({
        where: {
          status:     'active',
          expiryDate: { [Op.between]: [targetDate, targetDateEnd] },
        },
        include: [
          { model: Customer,         as: 'customer' },
          { model: InsuranceCompany, as: 'company'  },
        ],
      })

      console.log(`  📅 ${rule.days}-day rule: found ${policies.length} polic${policies.length === 1 ? 'y' : 'ies'}`)

      // Send reminder for each policy
      for (const policy of policies) {
        const { customer, company } = policy

        // Send WhatsApp if configured
        if (rule.channels.includes('whatsapp')) {
          await sendExpiryReminder(customer, policy, company, rule.days)
        }

        // Send SMS if configured
        if (rule.channels.includes('sms')) {
          await sendExpirySms(customer, policy, company, rule.days)
        }
      }
    }

    console.log(`✅ Daily reminders complete.\n`)
  } catch (error) {
    console.error('❌ Error in reminder job:', error.message)
  }
}

// ============================================================
// Schedule the cron job
// ============================================================
const startReminderJob = () => {
  // '0 9 * * *' = every day at 9:00 AM
  cron.schedule('0 9 * * *', runDailyReminders, {
    timezone: 'Asia/Kolkata', // Indian Standard Time
  })

  console.log('⏰ Daily reminder cron job scheduled for 9:00 AM IST')
}

// Export both — we call startReminderJob() in server.js
// We also export runDailyReminders for manual testing via an API endpoint
module.exports = { startReminderJob, runDailyReminders }
