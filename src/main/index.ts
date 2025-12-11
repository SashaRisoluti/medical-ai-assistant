import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { MCPManager } from './mcp-manager'
import { FirstRunSetup } from './first-run'
import { setupIPCHandlers } from './ipc-handlers'

// Abilita strict mode
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'false'

let mainWindow: BrowserWindow | null = null
let mcpManager: MCPManager | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })

  // Ready to show
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App ready
app.whenReady().then(async () => {
  console.log('🚀 Medical AI Assistant starting...')
  
  // First run setup
  const firstRun = new FirstRunSetup()
  const isFirstRun = await firstRun.check()
  
  if (isFirstRun) {
    console.log('📥 First run detected, starting setup...')
    await firstRun.runSetup(mainWindow)
  }

  // Initialize MCP Manager
  mcpManager = new MCPManager()
  await mcpManager.initialize()
  console.log('✅ MCP Manager initialized')

  // Setup IPC handlers
  setupIPCHandlers(mcpManager)
  console.log('✅ IPC handlers registered')

  // Create window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Cleanup before quit
app.on('before-quit', async () => {
  console.log('🛑 Shutting down...')
  if (mcpManager) {
    await mcpManager.shutdown()
  }
})

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason)
})
