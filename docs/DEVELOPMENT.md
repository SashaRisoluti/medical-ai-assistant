# 👨‍💻 Development Guide

Guida per sviluppatori che vogliono contribuire o personalizzare il progetto.

## 🏗️ Architettura

### Stack Tecnologico

**Frontend (Renderer Process)**
- React 18 + TypeScript
- Electron per UI desktop nativa
- CSS custom (no framework per minimizzare bundle)

**Backend (Main Process)**
- Electron main process
- SQLite (better-sqlite3) per persistenza
- Node.js per orchestrazione

**MCP Servers**
- Python 3.9+
- MCP SDK per comunicazione standardizzata
- PyTorch + Transformers per ML

### Flusso Dati

```
User Input (UI)
    ↓
Renderer Process (React)
    ↓ IPC
Main Process (Electron)
    ↓
MCP Manager
    ↓ stdio
MCP Servers (Python)
    ↓
AI Models
    ↓
Response
```

## 📂 Struttura Dettagliata

```
src/
├── main/                          # Electron main process
│   ├── index.ts                  # Entry point, window creation
│   ├── mcp-manager.ts            # ⭐ Core: routing, DB, servers
│   ├── first-run.ts              # Setup wizard
│   ├── ipc-handlers.ts           # IPC message handlers
│   └── database.ts               # (futuro) DB utilities
│
├── renderer/                      # React UI
│   ├── index.tsx                 # React entry point
│   ├── App.tsx                   # Root component
│   ├── components/               # UI components
│   │   ├── ChatInterface.tsx    # ⭐ Main chat UI
│   │   ├── HistoryPanel.tsx     # Sidebar conversations
│   │   ├── DisclaimerBanner.tsx # Safety warning
│   │   └── SettingsModal.tsx    # Settings dialog
│   ├── hooks/                    # React hooks
│   │   ├── useConversations.ts  # Conversation management
│   │   └── useMessages.ts       # Message handling
│   ├── styles/                   # CSS files
│   │   └── index.css            # Global styles
│   └── index.html               # HTML entry
│
├── preload/                       # Electron preload
│   └── index.ts                  # Context bridge (IPC safe)
│
└── mcp-servers/                   # Python MCP servers
    ├── requirements.txt          # Python dependencies
    ├── shared/                   # Shared utilities
    │   ├── base_server.py       # Base MCP server class
    │   └── utils.py             # Shared functions
    ├── medgemma/                 # MedGemma server
    │   └── server.py            # ⭐ Text/image analysis
    ├── hear/                     # HeAR server  
    │   └── server.py            # Audio analysis
    ├── txgemma/                  # TxGemma server
    │   └── server.py            # Drug discovery
    └── foundations/              # Foundation models server
        └── server.py            # CXR/Derm/Path
```

## 🔧 Setup Ambiente Sviluppo

### 1. Prerequisites

```bash
# Node.js 18+
node --version

# Python 3.9+
python3 --version

# Git
git --version
```

### 2. Clone e Install

```bash
git clone https://github.com/yourusername/medical-ai-assistant.git
cd medical-ai-assistant

# Automatic setup
bash scripts/setup.sh

# O manualmente:
npm install
cd src/mcp-servers
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. IDE Setup

**VS Code (raccomandato)**

Extensions:
- ESLint
- Prettier
- Python
- TypeScript

Settings (`.vscode/settings.json`):
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "python.defaultInterpreterPath": "./src/mcp-servers/venv/bin/python",
  "python.linting.enabled": true
}
```

## 🚀 Development Workflow

### Start Development Mode

```bash
# Terminal 1: Electron app con hot-reload
npm run dev

# Terminal 2 (opzionale): Python server standalone per debug
cd src/mcp-servers
source venv/bin/activate
python medgemma/server.py
```

### Debugging

**Electron Main Process**
- DevTools si apre automaticamente in dev mode
- Console.log visibile nel terminale
- Usa VSCode debugger:

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron Main",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "outputCapture": "std"
    }
  ]
}
```

**React Renderer**
- Usa React DevTools (estensione Chrome)
- Console browser per log
- Source maps abilitati in dev

**Python MCP Servers**
- Logging su stderr
- Usa `logger.info()` per debug
- Test standalone:

```bash
cd src/mcp-servers
source venv/bin/activate
python medgemma/server.py

# In another terminal, send test input:
echo '{"method":"tools/list","params":{}}' | python medgemma/server.py
```

## 📝 Code Style

### TypeScript/JavaScript

```typescript
// Use TypeScript strict mode
// Prefer const over let
// Use meaningful variable names
// Add JSDoc for public functions

/**
 * Saves a message to the database
 * @param conversationId - ID of the conversation
 * @param role - Message role (user/assistant/system)
 * @param content - Message content
 * @returns Saved message object
 */
saveMessage(conversationId: string, role: string, content: string): Message {
  // Implementation
}
```

### Python

```python
# Follow PEP 8
# Use type hints
# Add docstrings

def analyze_text(query: str, context: str = "") -> Dict[str, Any]:
    """
    Analyze medical text using MedGemma.
    
    Args:
        query: Medical question or text
        context: Additional context
        
    Returns:
        Analysis result with content and metadata
    """
    # Implementation
```

### CSS

```css
/* Use CSS variables for theming */
/* Follow BEM naming: block__element--modifier */
/* Mobile-first approach */

.chat-interface__message--user {
  background: var(--primary-color);
  /* ... */
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

Example test (`src/main/__tests__/mcp-manager.test.ts`):

```typescript
import { MCPManager } from '../mcp-manager'

describe('MCPManager', () => {
  let manager: MCPManager
  
  beforeEach(() => {
    manager = new MCPManager()
  })
  
  it('should create a conversation', () => {
    const conv = manager.createConversation('Test')
    expect(conv.title).toBe('Test')
    expect(conv.id).toBeDefined()
  })
})
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Crea nuova conversazione
- [ ] Invia messaggio testuale
- [ ] Carica immagine (se disponibile)
- [ ] Cerca nelle conversazioni
- [ ] Elimina conversazione
- [ ] Apri impostazioni
- [ ] Chiudi e riapri app (test persistenza)

## 🔨 Build & Release

### Development Build

```bash
npm run build
```

Output in `dist/`

### Production Build

```bash
# Build for current platform
npm run package

# Build for specific platform
npm run package:win
npm run package:mac
npm run package:linux
```

Output in `release/`

### Release Process

1. **Update Version**
```bash
npm version patch  # 1.0.0 → 1.0.1
# or
npm version minor  # 1.0.0 → 1.1.0
# or
npm version major  # 1.0.0 → 2.0.0
```

2. **Update CHANGELOG.md**

3. **Build**
```bash
npm run package
```

4. **Test Installer**
- Install on clean machine
- Test all features
- Check auto-updater (if implemented)

5. **Create GitHub Release**
```bash
git tag v1.0.1
git push origin v1.0.1
```

6. **Upload Artifacts**
- Upload installers to GitHub Releases
- Write release notes

## 🐛 Common Issues

### `better-sqlite3` Build Errors

```bash
# Rebuild native modules
npm run rebuild

# Or manually:
cd node_modules/better-sqlite3
npm run build-release
```

### Python Import Errors

```bash
# Ensure venv is activated
cd src/mcp-servers
source venv/bin/activate

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### IPC Communication Issues

- Check `src/preload/index.ts` exposes methods correctly
- Verify `contextIsolation: true` in `webPreferences`
- Check `ipcMain.handle()` matches `ipcRenderer.invoke()` names

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit

# Update @types
npm update @types/node @types/react @types/react-dom
```

## 📚 Resources

- [Electron API Docs](https://www.electronjs.org/docs/latest/api/app)
- [React Hooks](https://react.dev/reference/react)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes
4. Add tests
5. Lint: `npm run lint`
6. Format: `npm run format`
7. Commit: `git commit -m "feat: add feature"`
8. Push: `git push origin feature/name`
9. Open Pull Request

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

---

**Questions?** Open an issue or discussion on GitHub!
