import React, { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import HistoryPanel from './components/HistoryPanel'
import DisclaimerBanner from './components/DisclaimerBanner'
import SettingsModal from './components/SettingsModal'
import { useConversations } from './hooks/useConversations'
import './styles/App.css'

const App: React.FC = () => {
  const [currentConversationId, setCurrentConversationId] = useState<string>()
  const [showSettings, setShowSettings] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { conversations, loading, createConversation, deleteConversation, refreshConversations } = useConversations()

  useEffect(() => {
    // Load conversations on mount
    refreshConversations()
  }, [])

  const handleNewConversation = async () => {
    const newConv = await createConversation()
    setCurrentConversationId(newConv.id)
  }

  const handleDeleteConversation = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa conversazione?')) {
      await deleteConversation(id)
      if (currentConversationId === id) {
        setCurrentConversationId(undefined)
      }
    }
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
  }

  return (
    <div className="app">
      <DisclaimerBanner />
      
      <div className="app-container">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h1 className="app-title">🏥 Medical AI</h1>
            <button 
              className="toggle-sidebar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Chiudi sidebar' : 'Apri sidebar'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          {sidebarOpen && (
            <>
              <button 
                onClick={handleNewConversation} 
                className="new-chat-btn"
              >
                + Nuova Conversazione
              </button>
              
              <HistoryPanel
                conversations={conversations}
                currentId={currentConversationId}
                loading={loading}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
              />

              <div className="sidebar-footer">
                <button
                  onClick={() => setShowSettings(true)}
                  className="settings-btn"
                >
                  ⚙️ Impostazioni
                </button>
              </div>
            </>
          )}
        </aside>

        <main className="chat-main">
          {currentConversationId ? (
            <ChatInterface 
              conversationId={currentConversationId}
              onTitleUpdate={() => refreshConversations()}
            />
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <h1>👋 Benvenuto in Medical AI Assistant</h1>
                <p className="welcome-description">
                  Un assistente AI locale con modelli specializzati per l'analisi medica
                </p>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">💬</div>
                    <h3>Analisi Testuale</h3>
                    <p>Risposte a domande mediche basate su MedGemma</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">🖼️</div>
                    <h3>Analisi Immagini</h3>
                    <p>Radiografie, dermatologia, istopatologia</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">🎵</div>
                    <h3>Analisi Audio</h3>
                    <p>Suoni respiratori con HeAR model</p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">💊</div>
                    <h3>Drug Discovery</h3>
                    <p>Analisi molecole con TxGemma</p>
                  </div>
                </div>

                <button 
                  onClick={handleNewConversation}
                  className="cta-button"
                >
                  Inizia una Conversazione
                </button>

                <div className="disclaimer-box">
                  <strong>⚠️ IMPORTANTE:</strong> Questo strumento è SOLO educativo.
                  NON sostituisce il parere medico professionale.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App
