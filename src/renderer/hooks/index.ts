// useConversations.ts
import { useState, useCallback } from 'react'

export const useConversations = () => {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const refreshConversations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await window.electronAPI.listConversations(100)
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createConversation = useCallback(async (title?: string) => {
    const newConv = await window.electronAPI.createConversation(title)
    await refreshConversations()
    return newConv
  }, [refreshConversations])

  const deleteConversation = useCallback(async (id: string) => {
    await window.electronAPI.deleteConversation(id)
    await refreshConversations()
  }, [refreshConversations])

  return {
    conversations,
    loading,
    createConversation,
    deleteConversation,
    refreshConversations
  }
}

// useMessages.ts
import { useState, useEffect, useCallback } from 'react'

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [conversationId])

  const loadMessages = useCallback(async () => {
    if (!conversationId) return
    
    try {
      const data = await window.electronAPI.listMessages(conversationId, 100)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }, [conversationId])

  const sendMessage = useCallback(async (
    text: string,
    attachments?: Array<{ type: string; data: string; name: string }>
  ) => {
    setLoading(true)
    try {
      const response = await window.electronAPI.sendMessage({
        conversationId,
        message: text,
        attachments
      })
      
      // Reload messages to show the new ones
      await loadMessages()
      
      return response
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [conversationId, loadMessages])

  return {
    messages,
    loading,
    sendMessage
  }
}

export default { useConversations, useMessages }
