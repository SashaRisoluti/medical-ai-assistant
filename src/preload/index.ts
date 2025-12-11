import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Conversations
  createConversation: (title?: string) => 
    ipcRenderer.invoke('conversation:create', title),
  
  getConversation: (id: string) => 
    ipcRenderer.invoke('conversation:get', id),
  
  listConversations: (limit?: number) => 
    ipcRenderer.invoke('conversation:list', limit),
  
  deleteConversation: (id: string) => 
    ipcRenderer.invoke('conversation:delete', id),
  
  updateConversationTitle: (id: string, title: string) => 
    ipcRenderer.invoke('conversation:updateTitle', id, title),

  // Messages
  listMessages: (conversationId: string, limit?: number) => 
    ipcRenderer.invoke('message:list', conversationId, limit),
  
  sendMessage: (data: {
    conversationId: string
    message: string
    attachments?: Array<{ type: string; data: string }>
  }) => ipcRenderer.invoke('message:send', data),

  // Search
  searchConversations: (query: string) => 
    ipcRenderer.invoke('search:conversations', query),

  // Stats
  getStats: () => 
    ipcRenderer.invoke('stats:get')
})

// Type definitions for TypeScript
export interface ElectronAPI {
  createConversation: (title?: string) => Promise<any>
  getConversation: (id: string) => Promise<any>
  listConversations: (limit?: number) => Promise<any[]>
  deleteConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title: string) => Promise<void>
  listMessages: (conversationId: string, limit?: number) => Promise<any[]>
  sendMessage: (data: any) => Promise<any>
  searchConversations: (query: string) => Promise<any[]>
  getStats: () => Promise<any>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
