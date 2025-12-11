import React, { useState, useEffect, useRef } from 'react'
import { useMessages } from '../hooks/useMessages'
import '../styles/ChatInterface.css'

interface ChatInterfaceProps {
  conversationId: string
  onTitleUpdate?: () => void
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId, onTitleUpdate }) => {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const { messages, loading, sendMessage } = useMessages(conversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && attachments.length === 0) return

    // Convert attachments to base64
    const attachmentData = await Promise.all(
      attachments.map(async file => ({
        type: file.type,
        data: await fileToBase64(file),
        name: file.name
      }))
    )

    await sendMessage(input, attachmentData)
    setInput('')
    setAttachments([])
    
    // Update title if it's the first message
    if (messages.length === 0 && onTitleUpdate) {
      setTimeout(onTitleUpdate, 500)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <p>👋 Inizia la conversazione con una domanda o carica un file</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-body">
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              {msg.modelUsed && (
                <div className="message-meta">
                  Modello: <span className="model-badge">{msg.modelUsed}</span>
                  {' · '}
                  {new Date(msg.timestamp).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-body">
              <div className="loading-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((file, i) => (
              <div key={i} className="attachment-tag">
                <span className="attachment-icon">
                  {file.type.startsWith('image/') ? '🖼️' : 
                   file.type.startsWith('audio/') ? '🎵' : '📎'}
                </span>
                <span className="attachment-name">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="remove-attachment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-row">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="image/*,audio/*,.pdf"
            style={{ display: 'none' }}
            multiple
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="attach-btn"
            title="Allega file"
          >
            📎
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi un messaggio... (es: 'Quali sono i sintomi della bronchite?')"
            className="message-input"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && attachments.length === 0)}
            className="send-btn"
          >
            {loading ? '⏳' : '▶'}
          </button>
        </div>

        <div className="input-hint">
          Puoi allegare immagini mediche, audio respiratori o chiedere informazioni su farmaci
        </div>
      </form>
    </div>
  )
}

export default ChatInterface
