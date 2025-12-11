import { app } from 'electron'
import path from 'path'
import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import { spawn, ChildProcess } from 'child_process'

interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  modelUsed?: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount?: number
}

interface MCPServerConfig {
  name: string
  command: string
  args: string[]
  enabled: boolean
}

export class MCPManager {
  private db: Database.Database
  private servers: Map<string, ChildProcess> = new Map()
  private serverConfigs: MCPServerConfig[] = [
    {
      name: 'medgemma',
      command: 'python',
      args: [path.join(app.getAppPath(), 'resources/mcp-servers/medgemma/server.py')],
      enabled: true
    },
    {
      name: 'hear',
      command: 'python',
      args: [path.join(app.getAppPath(), 'resources/mcp-servers/hear/server.py')],
      enabled: false
    },
    {
      name: 'txgemma',
      command: 'python',
      args: [path.join(app.getAppPath(), 'resources/mcp-servers/txgemma/server.py')],
      enabled: false
    },
    {
      name: 'foundations',
      command: 'python',
      args: [path.join(app.getAppPath(), 'resources/mcp-servers/foundations/server.py')],
      enabled: false
    }
  ]

  constructor() {
    // Initialize database
    const dbPath = path.join(app.getPath('userData'), 'conversations.db')
    this.db = new Database(dbPath)
    this.initDatabase()
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT,
        role TEXT CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        model_used TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS session_metadata (
        conversation_id TEXT,
        key TEXT,
        value TEXT,
        PRIMARY KEY (conversation_id, key),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
        ON messages(conversation_id, timestamp);
      
      CREATE INDEX IF NOT EXISTS idx_conversations_updated 
        ON conversations(updated_at DESC);

      -- Full text search
      CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
        content,
        content=messages,
        content_rowid=rowid
      );

      -- Triggers for FTS sync
      CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
        INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
      END;

      CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
        DELETE FROM messages_fts WHERE rowid = old.rowid;
      END;

      CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
        UPDATE messages_fts SET content = new.content WHERE rowid = new.rowid;
      END;
    `)
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing MCP servers...')
    
    // Start enabled servers
    for (const config of this.serverConfigs) {
      if (config.enabled) {
        await this.startServer(config)
      }
    }
  }

  private async startServer(config: MCPServerConfig): Promise<void> {
    try {
      console.log(`🚀 Starting ${config.name} server...`)
      
      const serverProcess = spawn(config.command, config.args, {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      serverProcess.stdout?.on('data', (data) => {
        console.log(`[${config.name}] ${data.toString()}`)
      })

      serverProcess.stderr?.on('data', (data) => {
        console.error(`[${config.name}] ERROR: ${data.toString()}`)
      })

      serverProcess.on('close', (code) => {
        console.log(`[${config.name}] Process exited with code ${code}`)
        this.servers.delete(config.name)
      })

      this.servers.set(config.name, serverProcess)
      
      // Wait for server to be ready
      await this.waitForServerReady(config.name)
      
      console.log(`✅ ${config.name} server ready`)
    } catch (error) {
      console.error(`❌ Failed to start ${config.name} server:`, error)
    }
  }

  private async waitForServerReady(serverName: string, timeout = 30000): Promise<void> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      // Check if server process is still running
      const server = this.servers.get(serverName)
      if (!server || server.killed) {
        throw new Error(`Server ${serverName} failed to start`)
      }
      
      // TODO: Add actual health check via MCP protocol
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For now, assume ready after 2 seconds
      if (Date.now() - startTime > 2000) {
        return
      }
    }
    
    throw new Error(`Server ${serverName} failed to become ready within ${timeout}ms`)
  }

  // Conversation management
  createConversation(title?: string): Conversation {
    const id = uuidv4()
    const defaultTitle = title || `Conversazione ${new Date().toLocaleDateString('it-IT')}`
    
    this.db.prepare(`
      INSERT INTO conversations (id, title) VALUES (?, ?)
    `).run(id, defaultTitle)

    return {
      id,
      title: defaultTitle,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  getConversation(id: string): Conversation | null {
    const row = this.db.prepare(`
      SELECT id, title, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `).get(id) as any

    if (!row) return null

    return {
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  listConversations(limit = 100): Conversation[] {
    const rows = this.db.prepare(`
      SELECT 
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        COUNT(m.id) as message_count
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
      LIMIT ?
    `).all(limit) as any[]

    return rows.map(row => ({
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      messageCount: row.message_count
    }))
  }

  deleteConversation(id: string): void {
    this.db.prepare('DELETE FROM conversations WHERE id = ?').run(id)
  }

  updateConversationTitle(id: string, title: string): void {
    this.db.prepare(`
      UPDATE conversations 
      SET title = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(title, id)
  }

  // Message management
  saveMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string, modelUsed?: string): Message {
    const id = uuidv4()
    
    this.db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content, model_used)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, conversationId, role, content, modelUsed || null)

    // Update conversation timestamp
    this.db.prepare(`
      UPDATE conversations 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(conversationId)

    return {
      id,
      conversationId,
      role,
      content,
      modelUsed,
      timestamp: new Date()
    }
  }

  getMessages(conversationId: string, limit = 100): Message[] {
    const rows = this.db.prepare(`
      SELECT id, conversation_id, role, content, model_used, timestamp
      FROM messages
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
      LIMIT ?
    `).all(conversationId, limit) as any[]

    return rows.map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      modelUsed: row.model_used,
      timestamp: new Date(row.timestamp)
    }))
  }

  // Search
  searchConversations(query: string): Array<{conversation: Conversation; snippet: string}> {
    const rows = this.db.prepare(`
      SELECT DISTINCT
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        snippet(messages_fts, 0, '<mark>', '</mark>', '...', 30) as snippet
      FROM messages_fts
      JOIN messages m ON messages_fts.rowid = m.rowid
      JOIN conversations c ON m.conversation_id = c.id
      WHERE messages_fts MATCH ?
      ORDER BY rank
      LIMIT 50
    `).all(query) as any[]

    return rows.map(row => ({
      conversation: {
        id: row.id,
        title: row.title,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      },
      snippet: row.snippet
    }))
  }

  // Query routing
  async routeQuery(input: {
    conversationId: string
    message: string
    attachments?: Array<{ type: string; data: string }>
  }): Promise<{
    content: string
    modelUsed: string
    disclaimer: string
  }> {
    // Determine target server
    let targetServer = 'medgemma'
    
    if (input.attachments && input.attachments.length > 0) {
      const attachment = input.attachments[0]
      
      if (attachment.type.startsWith('image/')) {
        // Image classification logic
        targetServer = 'medgemma' // Default to medgemma for images
      } else if (attachment.type.startsWith('audio/')) {
        targetServer = 'hear'
      }
    } else if (this.isMoleculeQuery(input.message)) {
      targetServer = 'txgemma'
    }

    // Check if server is available
    if (!this.servers.has(targetServer)) {
      throw new Error(`Server ${targetServer} is not available. Please enable it in settings.`)
    }

    // Save user message
    this.saveMessage(input.conversationId, 'user', input.message)

    // Get conversation history for context
    const history = this.getMessages(input.conversationId, 10)

    // Call MCP server
    // TODO: Implement actual MCP protocol communication
    // For now, return a mock response
    const response = await this.callMCPServer(targetServer, {
      message: input.message,
      history,
      attachments: input.attachments
    })

    // Save assistant message
    this.saveMessage(input.conversationId, 'assistant', response.content, targetServer)

    return {
      content: response.content,
      modelUsed: targetServer,
      disclaimer: this.getDisclaimer()
    }
  }

  private async callMCPServer(
    serverName: string, 
    params: any
  ): Promise<{ content: string }> {
    // TODO: Implement actual MCP protocol communication via stdio
    // This is a placeholder that returns a mock response
    
    console.log(`📡 Calling ${serverName} with params:`, params)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      content: `[Mock response from ${serverName}]\n\nRicevuto messaggio: "${params.message}"\n\n⚠️ Questa è una risposta simulata. L'integrazione MCP completa sarà implementata nei prossimi step.`
    }
  }

  private isMoleculeQuery(message: string): boolean {
    const moleculePatterns = [
      /SMILES/i,
      /InChI/i,
      /molecola/i,
      /farmaco/i,
      /composto/i,
      /drug/i
    ]
    return moleculePatterns.some(pattern => pattern.test(message))
  }

  private getDisclaimer(): string {
    return `⚠️ DISCLAIMER: Questo sistema è SOLO educativo. NON sostituisce il parere medico. Per emergenze, contattare il 118.`
  }

  // Statistics
  getUsageStats() {
    return {
      totalConversations: (this.db.prepare('SELECT COUNT(*) as count FROM conversations').get() as any).count,
      totalMessages: (this.db.prepare('SELECT COUNT(*) as count FROM messages').get() as any).count,
      modelUsage: this.db.prepare(`
        SELECT model_used, COUNT(*) as count
        FROM messages
        WHERE model_used IS NOT NULL
        GROUP BY model_used
      `).all(),
      activeServers: Array.from(this.servers.keys())
    }
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down MCP servers...')
    
    // Close database
    this.db.close()
    
    // Kill all server processes
    for (const [name, process] of this.servers) {
      console.log(`Stopping ${name}...`)
      process.kill()
    }
    
    this.servers.clear()
  }
}
