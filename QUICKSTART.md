# 🚀 Quick Start - Medical AI Assistant

Guida rapida per iniziare subito con il progetto.

## ⚡ Setup Rapido (5 minuti)

### 1. Clona e Installa

```bash
# Clona il repository
git clone https://github.com/yourusername/medical-ai-assistant.git
cd medical-ai-assistant

# Installa dipendenze
npm install
```

### 2. Setup Python

```bash
cd src/mcp-servers
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux  
source venv/bin/activate

pip install -r requirements.txt
cd ../..
```

### 3. Configura Environment

```bash
cp .env.example .env
# Modifica .env e imposta MODELS_DIR
```

### 4. Avvia

```bash
npm run dev
```

L'app si aprirà automaticamente! 🎉

## 📁 Struttura Progetto

```
medical-ai-assistant/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point
│   │   ├── mcp-manager.ts # Gestione MCP servers
│   │   ├── first-run.ts   # Setup iniziale
│   │   └── ipc-handlers.ts
│   │
│   ├── renderer/          # React UI
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── styles/
│   │
│   ├── preload/           # Context bridge
│   │   └── index.ts
│   │
│   └── mcp-servers/       # Python MCP servers
│       ├── medgemma/
│       ├── hear/
│       ├── txgemma/
│       └── foundations/
│
├── docs/                  # Documentazione
├── package.json
└── README.md
```

## 🛠️ Comandi Principali

```bash
# Sviluppo
npm run dev              # Avvia con hot-reload

# Build
npm run build            # Compila progetto
npm run package          # Crea installer

# Utilità
npm run lint             # Lint codice
npm run format           # Formatta codice
npm test                 # Esegui test
```

## 🎯 Prossimi Step

### 1. Personalizza README.md
- Sostituisci `yourusername` con il tuo username GitHub
- Aggiungi screenshot
- Personalizza sezione contatti

### 2. Implementa MCP Server MedGemma

Il file `src/mcp-servers/medgemma/server.py` contiene uno skeleton.
Per l'integrazione completa:

```python
# Aggiungi in server.py:
from transformers import AutoTokenizer, AutoModelForCausalLM

# In __init__:
self.tokenizer = AutoTokenizer.from_pretrained("google/medgemma-4b-it")
self.model = AutoModelForCausalLM.from_pretrained(
    "google/medgemma-4b-it",
    device_map="auto",
    torch_dtype=torch.float16
)
```

### 3. Aggiungi Altri MCP Servers

Crea file simili per:
- `src/mcp-servers/hear/server.py` (audio)
- `src/mcp-servers/txgemma/server.py` (drug discovery)
- `src/mcp-servers/foundations/server.py` (imaging)

### 4. Migliora UI

File da personalizzare:
- `src/renderer/styles/index.css` - Styling
- `src/renderer/components/*.tsx` - Componenti UI
- `src/renderer/App.tsx` - Layout principale

### 5. Testing

```bash
# Crea test in tests/
npm test

# E2E testing
npm run test:e2e
```

## 📦 Crea Installer

```bash
# Build per il tuo OS
npm run package

# Gli installer saranno in:
release/1.0.0/
├── Medical-AI-Assistant-Setup-1.0.0.exe  # Windows
├── Medical-AI-Assistant-1.0.0.dmg        # macOS
└── Medical-AI-Assistant-1.0.0.AppImage   # Linux
```

## 🐛 Debug

### Electron DevTools

```bash
# L'app in dev mode apre automaticamente DevTools
npm run dev
```

### Python MCP Servers

```bash
# Testa manualmente
cd src/mcp-servers
source venv/bin/activate
python medgemma/server.py

# Input test (stdin):
{"method": "tools/list", "params": {}}
```

### Database

```bash
# Visualizza database SQLite
sqlite3 ~/Library/Application\ Support/medical-ai-assistant/conversations.db
# o su Windows:
# sqlite3 %APPDATA%\medical-ai-assistant\conversations.db

# Query esempio:
sqlite> SELECT * FROM conversations LIMIT 5;
sqlite> SELECT COUNT(*) FROM messages;
```

## 📚 Risorse

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://react.dev/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Google Health AI](https://developers.google.com/health-ai-developer-foundations)

## 🤝 Contribuire

1. Fork il repo
2. Crea branch: `git checkout -b feature/amazing`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Apri Pull Request

## 📄 File Chiave

| File | Descrizione |
|------|-------------|
| `src/main/mcp-manager.ts` | Core: gestione MCP servers e DB |
| `src/renderer/App.tsx` | UI principale React |
| `src/preload/index.ts` | Bridge IPC main↔renderer |
| `src/mcp-servers/medgemma/server.py` | MCP server MedGemma |
| `package.json` | Dipendenze e script |
| `electron.vite.config.ts` | Configurazione build |

## ⚠️ Note Importanti

1. **Modelli AI**: Prima uso scarica ~8-15GB
2. **GPU**: Fortemente raccomandata per performance
3. **Disclaimer**: App solo educativa, NON uso clinico
4. **Privacy**: Tutto locale, zero telemetria

## 💡 Tips

### Performance

```typescript
// In mcp-manager.ts, abilita solo server necessari:
private serverConfigs: MCPServerConfig[] = [
  { name: 'medgemma', enabled: true },   // Base
  { name: 'hear', enabled: false },      // Solo se serve audio
  { name: 'txgemma', enabled: false },   // Solo se serve drug discovery
  { name: 'foundations', enabled: false } // Solo se serve imaging specialistico
]
```

### Development

```bash
# Hot reload automatico per cambiamenti codice
npm run dev

# In 2 terminali separati per debugging:
# Terminal 1 - Electron
npm run dev

# Terminal 2 - Python server manuale
cd src/mcp-servers && python medgemma/server.py
```

### Deployment

```bash
# Before release:
1. Update version in package.json
2. npm run build
3. npm run package
4. Test installer su OS target
5. Create GitHub release
6. Upload artifacts
```

---

🎉 **Congratulazioni!** Hai un assistente medico AI locale pronto all'uso!

Per domande: [GitHub Issues](https://github.com/yourusername/medical-ai-assistant/issues)
