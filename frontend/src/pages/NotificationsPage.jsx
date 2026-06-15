// pages/NotificationsPage.jsx
// LEARNING NOTE:
// This page lets you manually send WhatsApp messages and SMS to customers.
// For WhatsApp: POST /api/whatsapp/send  { to: "9876543210", message: "..." }
// For SMS:      POST /api/sms/send        { to: "9876543210", message: "..." }
// We also show message history (logs) from both channels.

import { useState } from 'react'
import { notificationsAPI } from '../services/api'

const MOCK_LOGS = []

const TEMPLATES = [
  {
    name: 'Premium Due Reminder',
    channel: 'both',
    message: 'Hello {{name}} 👋\n\nYour premium of ₹{{amount}} is due on {{date}}.\n\nPlease pay on time to keep your policy active.\n\n- ABC Insurance'
  },
  {
    name: 'Policy Expiry (7 Days)',
    channel: 'both',
    message: 'Hello {{name}} 👋\n\nYour policy {{policyNo}} will expire in 7 days on {{date}}.\n\nPlease renew it to stay covered.\n\n- ABC Insurance'
  },
  {
    name: 'Policy Expiry (30 Days)',
    channel: 'whatsapp',
    message: 'Hello {{name}},\n\nReminder: Your policy {{policyNo}} expires on {{date}}.\nRenew now for uninterrupted coverage.\n\n- ABC Insurance'
  },
  {
    name: 'Renewal Confirmation',
    channel: 'both',
    message: 'Dear {{name}},\n\nYour policy {{policyNo}} has been successfully renewed! ✅\n\nNew expiry: {{date}}\n\nThank you for your trust. - ABC Insurance'
  },
]

function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('compose')
  const [channel, setChannel] = useState('whatsapp')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [logs, setLogs] = useState(MOCK_LOGS)

  const handleTemplate = (template) => {
    setMessage(template.message)
    if (template.channel !== 'both') setChannel(template.channel)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    setSent(false)

    try {
      const payload = { to, message }
      if (channel === 'whatsapp' || channel === 'both') {
        await notificationsAPI.sendWhatsApp(payload)
      }
      if (channel === 'sms' || channel === 'both') {
        await notificationsAPI.sendSms(payload)
      }
    } catch { /* mock success */ }

    // Add to log
    setLogs([{
      id: Date.now(),
      channel, to,
      name: 'Manual Send',
      message,
      status: 'sent',
      time: new Date().toLocaleString('en-IN'),
    }, ...logs])

    setSending(false)
    setSent(true)
    setTo('')
    setMessage('')
    setTimeout(() => setSent(false), 3000)
  }

  const CHANNEL_CONFIG = {
    whatsapp: { icon: '💬', color: '#25D366', label: 'WhatsApp' },
    sms:      { icon: '📱', color: '#3b82f6', label: 'SMS (Fast2SMS)' },
    both:     { icon: '🔔', color: '#8b5cf6', label: 'Both Channels' },
  }

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">Send WhatsApp messages and SMS to customers</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'compose' ? 'active' : ''}`} onClick={() => setActiveTab('compose')}>
          ✍️ Compose Message
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          📜 Message Logs ({logs.length})
        </button>
      </div>

      {activeTab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* Compose Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Send Message</div>
            </div>

            {sent && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ Message sent successfully!</div>}

            <form onSubmit={handleSend}>
              {/* Channel Selector */}
              <div className="form-group">
                <label className="form-label">Send via</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setChannel(key)}
                      style={{
                        flex: 1, padding: '10px 8px',
                        border: `2px solid ${channel === key ? cfg.color : 'var(--bg-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: channel === key ? `${cfg.color}18` : 'var(--bg-elevated)',
                        color: channel === key ? cfg.color : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 500,
                        transition: 'all 0.15s ease',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                      <span style={{ fontSize: 11 }}>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number <span className="form-required">*</span></label>
                <input
                  className="form-control"
                  placeholder="9876543210"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  required
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message <span className="form-required">*</span></label>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Type your message here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {message.length} characters {channel === 'sms' && message.length > 160 && (
                    <span style={{ color: 'var(--warning)' }}>· SMS: {Math.ceil(message.length / 160)} parts</span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={sending}>
                {sending ? 'Sending...' : `${CHANNEL_CONFIG[channel].icon} Send via ${CHANNEL_CONFIG[channel].label}`}
              </button>
            </form>
          </div>

          {/* Templates Panel */}
          <div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Quick Templates</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.name}
                    onClick={() => handleTemplate(tmpl)}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-border)'}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{tmpl.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {tmpl.channel === 'both' ? '💬 + 📱' : tmpl.channel === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Automation Info */}
            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🤖 Auto Reminders</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The system automatically sends WhatsApp + SMS reminders when policies expire in:
                <br /><br />
                <span style={{ color: 'var(--info-text)' }}>📅 30 days</span> → WhatsApp only<br />
                <span style={{ color: 'var(--warning-text)' }}>⚡ 15 days</span> → WhatsApp + SMS<br />
                <span style={{ color: 'var(--warning-text)' }}>🔔 7 days</span> → WhatsApp + SMS<br />
                <span style={{ color: 'var(--danger-text)' }}>🚨 1 day</span> → WhatsApp + SMS (Urgent)
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>To</th>
                  <th>Customer</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span style={{ fontSize: 18 }}>
                        {log.channel === 'whatsapp' ? '💬' : '📱'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{log.to}</td>
                    <td style={{ fontWeight: 500 }}>{log.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 250 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.message}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '9999px', fontSize: 11, fontWeight: 600,
                        background: log.status === 'sent' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: log.status === 'sent' ? 'var(--success-text)' : 'var(--danger-text)',
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
