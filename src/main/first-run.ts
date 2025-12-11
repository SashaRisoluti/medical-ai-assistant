import { app, BrowserWindow, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

export class FirstRunSetup {
  private configPath: string

  constructor() {
    this.configPath = path.join(app.getPath('userData'), '.initialized')
  }

  async check(): Promise<boolean> {
    return !fs.existsSync(this.configPath)
  }

  async runSetup(mainWindow: BrowserWindow | null): Promise<void> {
    console.log('🎉 Welcome! Running first-time setup...')

    // Show welcome dialog
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Benvenuto in Medical AI Assistant',
      message: 'Prima configurazione richiesta',
      detail: `Questo è il primo avvio dell'applicazione.

📥 Sarà necessario scaricare i modelli AI (circa 8-15GB).
⏱️ Il download può richiedere 20-60 minuti.
💾 Assicurati di avere spazio sufficiente.

⚠️ IMPORTANTE: Questo software è SOLO educativo e NON sostituisce il parere medico professionale.`,
      buttons: ['Continua', 'Esci'],
      defaultId: 0,
      cancelId: 1
    })

    if (result.response === 1) {
      app.quit()
      return
    }

    // Select models directory
    const modelsDir = await this.selectModelsDirectory()
    if (!modelsDir) {
      app.quit()
      return
    }

    // Save configuration
    const config = {
      modelsDirectory: modelsDir,
      setupDate: new Date().toISOString(),
      version: app.getVersion()
    }

    fs.writeFileSync(
      this.configPath,
      JSON.stringify(config, null, 2)
    )

    // Show completion message
    await dialog.showMessageBox({
      type: 'info',
      title: 'Configurazione completata',
      message: 'Setup iniziale completato!',
      detail: `Directory modelli: ${modelsDir}

Al primo utilizzo di ciascun modello, verrà scaricato automaticamente dalla rete.

Puoi ora utilizzare l'applicazione.`,
      buttons: ['OK']
    })

    console.log('✅ First-time setup completed')
  }

  private async selectModelsDirectory(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: 'Seleziona cartella per i modelli AI',
      message: 'Scegli dove salvare i modelli (necessari ~15GB)',
      buttonLabel: 'Seleziona',
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const selectedPath = result.filePaths[0]
    
    // Create models subdirectory
    const modelsPath = path.join(selectedPath, 'medical-ai-models')
    if (!fs.existsSync(modelsPath)) {
      fs.mkdirSync(modelsPath, { recursive: true })
    }

    return modelsPath
  }

  getConfig(): any {
    if (!fs.existsSync(this.configPath)) {
      return null
    }

    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'))
    } catch (error) {
      console.error('Failed to read config:', error)
      return null
    }
  }
}
