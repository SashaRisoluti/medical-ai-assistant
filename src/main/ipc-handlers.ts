import { ipcMain } from 'electron'
import { MCPManager } from './mcp-manager'

export function setupIPCHandlers(mcpManager: MCPManager): void {
  // Conversations
  ipcMain.handle('conversation:create', async (_, title?: string) => {
    return mcpManager.createConversation(title)
  })

  ipcMain.handle('conversation:get', async (_, id: string) => {
    return mcpManager.getConversation(id)
  })

  ipcMain.handle('conversation:list', async (_, limit?: number) => {
    return mcpManager.listConversations(limit)
  })

  ipcMain.handle('conversation:delete', async (_, id: string) => {
    return mcpManager.deleteConversation(id)
  })

  ipcMain.handle('conversation:updateTitle', async (_, id: string, title: string) => {
    return mcpManager.updateConversationTitle(id, title)
  })

  // Messages
  ipcMain.handle('message:list', async (_, conversationId: string, limit?: number) => {
    return mcpManager.getMessages(conversationId, limit)
  })

  ipcMain.handle('message:send', async (_, data: {
    conversationId: string
    message: string
    attachments?: Array<{ type: string; data: string }>
  }) => {
    return mcpManager.routeQuery(data)
  })

  // Search
  ipcMain.handle('search:conversations', async (_, query: string) => {
    return mcpManager.searchConversations(query)
  })

  // Stats
  ipcMain.handle('stats:get', async () => {
    return mcpManager.getUsageStats()
  })
}
