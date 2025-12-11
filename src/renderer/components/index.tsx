// HistoryPanel.tsx
import React from 'react'
import '../styles/HistoryPanel.css'

interface HistoryPanelProps {
  conversations: any[]
  currentId?: string
  loading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  conversations,
  currentId,
  loading,
  onSelect,
  onDelete
}) => {
  if (loading) {
    return <div className="history-loading">Caricamento...</div>
  }

  if (conversations.length === 0) {
    return (
      <div className="history-empty">
        <p>Nessuna conversazione ancora</p>
      </div>
    )
  }

  return (
    <div className="history-panel">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={`history-item ${currentId === conv.id ? 'active' : ''}`}
          onClick={() => onSelect(conv.id)}
        >
          <div className="history-item-content">
            <div className="history-item-title">{conv.title}</div>
            <div className="history-item-meta">
              {new Date(conv.updatedAt).toLocaleDateString('it-IT')}
              {conv.messageCount && ` · ${conv.messageCount} messaggi`}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(conv.id)
            }}
            className="delete-conversation-btn"
            title="Elimina"
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  )
}

export default HistoryPanel

// DisclaimerBanner.tsx
import React, { useState } from 'react'
import '../styles/DisclaimerBanner.css'

const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-content">
        <span className="disclaimer-icon">⚠️</span>
        <span className="disclaimer-text">
          <strong>IMPORTANTE:</strong> Questo è uno strumento EDUCATIVO. 
          NON sostituisce il parere medico. Per emergenze: 118
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="disclaimer-close"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default DisclaimerBanner

// SettingsModal.tsx
import React, { useState, useEffect } from 'react'
import '../styles/SettingsModal.css'

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const data = await window.electronAPI.getStats()
    setStats(data)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Impostazioni</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          <section className="settings-section">
            <h3>📊 Statistiche</h3>
            {stats ? (
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Conversazioni</div>
                  <div className="stat-value">{stats.totalConversations}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Messaggi</div>
                  <div className="stat-value">{stats.totalMessages}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Server Attivi</div>
                  <div className="stat-value">{stats.activeServers?.length || 0}</div>
                </div>
              </div>
            ) : (
              <p>Caricamento...</p>
            )}
          </section>

          <section className="settings-section">
            <h3>🤖 Modelli Disponibili</h3>
            <div className="models-list">
              {stats?.activeServers?.map((model: string) => (
                <div key={model} className="model-item">
                  <span className="model-status">✅</span>
                  <span className="model-name">{model}</span>
                </div>
              )) || <p>Nessun modello attivo</p>}
            </div>
          </section>

          <section className="settings-section">
            <h3>ℹ️ Informazioni</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Versione:</strong> 1.0.0
              </div>
              <div className="info-item">
                <strong>Licenza:</strong> MIT
              </div>
              <div className="info-item">
                <strong>Repository:</strong>{' '}
                <a href="https://github.com/yourusername/medical-ai-assistant" target="_blank">
                  GitHub
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
