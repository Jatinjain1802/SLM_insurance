// pages/SettingsPage.jsx
// System settings, API key configuration, and user profile

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiKey, FiBell, FiMessageSquare, FiSmartphone, FiAlertTriangle, FiCheck } from 'react-icons/fi'

function SettingsPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    agencyName: 'ABC Insurance Agency',
  })

  const [apiKeys, setApiKeys] = useState({
    whatsappToken: '',
    whatsappPhoneId: '',
    whatsappVerifyToken: '',
    fast2smsKey: '',
  })

  const handleSave = (e) => {
    e.preventDefault()
    // In real app: call API to save settings
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const InputRow = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type={type} name={name} className="form-control" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )

  return (
    <div className="page-container page-fade-in">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage your account and integrations</p>
        </div>
      </div>

      {saved && <div className="alert alert-success" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheck /> Settings saved successfully!</div>}

      <div className="tabs">
        {[
          { key: 'profile',   label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiUser /> Profile</span> },
          { key: 'api',       label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiKey /> API Keys</span> },
          { key: 'reminders', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiBell /> Auto Reminders</span> },
        ].map(tab => (
          <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Profile Information</div>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <InputRow label="Full Name" name="name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" />
                <InputRow label="Email" name="email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                <InputRow label="Phone" name="phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="9876543210" />
                <InputRow label="Agency Name" name="agencyName" value={profile.agencyName} onChange={e => setProfile({ ...profile, agencyName: e.target.value })} />
              </div>
              <div style={{ marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck /> Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div style={{ maxWidth: 600 }}>
          {/* WhatsApp API */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMessageSquare /> WhatsApp Cloud API</div>
                <div className="card-subtitle">Meta Business Manager credentials</div>
              </div>
              <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                Get Keys →
              </a>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Access Token</label>
                <input type="password" className="form-control" value={apiKeys.whatsappToken} onChange={e => setApiKeys({ ...apiKeys, whatsappToken: e.target.value })} placeholder="EAAxxxxxx..." />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phone Number ID</label>
                  <input className="form-control" value={apiKeys.whatsappPhoneId} onChange={e => setApiKeys({ ...apiKeys, whatsappPhoneId: e.target.value })} placeholder="1234567890" />
                </div>
                <div className="form-group">
                  <label className="form-label">Webhook Verify Token</label>
                  <input type="password" className="form-control" value={apiKeys.whatsappVerifyToken} onChange={e => setApiKeys({ ...apiKeys, whatsappVerifyToken: e.target.value })} placeholder="your_verify_token" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck /> Save WhatsApp Config</button>
            </form>
          </div>

          {/* Fast2SMS */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiSmartphone /> Fast2SMS (SMS)</div>
                <div className="card-subtitle">India SMS gateway</div>
              </div>
              <a href="https://www.fast2sms.com/" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                Get Key →
              </a>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Fast2SMS API Key</label>
                <input type="password" className="form-control" value={apiKeys.fast2smsKey} onChange={e => setApiKeys({ ...apiKeys, fast2smsKey: e.target.value })} placeholder="your-fast2sms-api-key" />
              </div>
              <div className="alert alert-warning" style={{ marginBottom: 12, fontSize: 12, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAlertTriangle /> SMS will only be sent when your Fast2SMS account has sufficient credits.
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCheck /> Save SMS Config</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiBell /> Automatic Reminder Schedule</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { days: 30, channel: 'WhatsApp only',    color: 'var(--info)',    enabled: true },
                { days: 15, channel: 'WhatsApp + SMS',   color: 'var(--warning)', enabled: true },
                { days: 7,  channel: 'WhatsApp + SMS',   color: 'var(--warning)', enabled: true },
                { days: 1,  channel: 'WhatsApp + SMS', color: 'var(--danger)',  enabled: true },
              ].map(rule => (
                <div key={rule.days} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${rule.color}33`,
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${rule.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: rule.color }}>
                      {rule.days}d
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{rule.days} Days Before Expiry</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rule.channel}</div>
                    </div>
                  </div>
                  <div style={{
                    width: 40, height: 22, borderRadius: '9999px',
                    background: rule.enabled ? 'var(--primary-600)' : 'var(--bg-border)',
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3, left: rule.enabled ? 21 : 3,
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-secondary)' }}>
              🕘 Reminders are sent daily at <strong>9:00 AM</strong>. Make sure your WhatsApp and SMS API keys are configured above.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
