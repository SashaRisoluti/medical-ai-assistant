# 🏥 Medical AI Assistant

Un assistente medico AI multi-modello locale con memoria persistente, basato sui modelli Google Health AI Developer Foundations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## ⚠️ DISCLAIMER IMPORTANTE

**Questo software è ESCLUSIVAMENTE uno strumento educativo e di ricerca.**

- ❌ NON sostituisce il parere di un medico professionista
- ❌ NON deve essere utilizzato per diagnosi o decisioni cliniche
- ❌ NON è validato clinicamente
- ✅ Solo per scopi accademici e di apprendimento
- 🚨 Per emergenze mediche contattare immediatamente il 118

## 📋 Indice

- [Caratteristiche](#caratteristiche)
- [Architettura](#architettura)
- [Requisiti](#requisiti)
- [Installazione](#installazione)
- [Utilizzo](#utilizzo)
- [Modelli Supportati](#modelli-supportati)
- [Struttura del Progetto](#struttura-del-progetto)
- [Sviluppo](#sviluppo)
- [FAQ](#faq)
- [Licenza](#licenza)

## ✨ Caratteristiche

### 🔒 Privacy-First
- **100% Locale**: Nessun dato lascia il tuo computer
- **Memoria Persistente**: Tutte le conversazioni salvate localmente
- **Zero Telemetria**: Nessun tracking o analytics

### 🤖 Multi-Modello
Integra 7 modelli specializzati di Google Health AI:
- **MedGemma**: Analisi testo e immagini mediche
- **HeAR**: Analisi audio respiratorio (tosse, respiro)
- **TxGemma**: Drug discovery e analisi molecole
- **CXR Foundation**: Radiografie torace
- **Path Foundation**: Istopatologia
- **Derm Foundation**: Dermatologia
- **MedSigLIP**: Encoder visione-linguaggio medico

### 💾 Memoria Intelligente
- Ricerca semantica nelle conversazioni
- Context awareness tra sessioni
- Esportazione conversazioni
- Statistiche utilizzo

### 🎨 Interfaccia Moderna
- UI desktop nativa (Electron)
- Dark/Light mode
- Drag & drop per immagini
- Supporto multimodale (testo, immagini, audio)

## 🏗️ Architettura

```
┌────────────────────────────────────────┐
│    Electron Desktop App (UI Layer)     │
│         React + TypeScript             │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│    MCP Manager (Orchestration Layer)   │
│  - Routing intelligente                │
│  - Gestione memoria (SQLite)           │
│  - Context management                  │
└──────────────┬─────────────────────────┘
               │
      ┌────────┼────────┬────────┐
      ▼        ▼        ▼        ▼
  ┌──────┐┌───────┐┌──────┐┌───────┐
  │MedGem││ HeAR  ││TxGem ││ Found.│
  │ma    ││       ││ma    ││ Models│
  │ MCP  ││  MCP  ││ MCP  ││  MCP  │
  │Server││Server ││Server││Server │
  └──────┘└───────┘└──────┘└───────┘
```

**Model Context Protocol (MCP)**: Standard aperto per connettere AI a sistemi esterni ([spec](https://modelcontextprotocol.io/))

## 💻 Requisiti

### Hardware Minimo
- **CPU**: Intel i5 / AMD Ryzen 5 (8+ core raccomandati)
- **RAM**: 16GB (32GB raccomandati)
- **GPU**: NVIDIA con 12GB+ VRAM (RTX 3060 o superiore)
- **Storage**: 100GB liberi (SSD raccomandato)

### Software
- **OS**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **Node.js**: v18.0.0 o superiore
- **Python**: 3.9+ (per MCP servers)
- **CUDA**: 11.8+ (per GPU NVIDIA)
- **Docker** (opzionale, per deployment isolato)

### Driver GPU
- NVIDIA: [CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
- AMD: [ROCm](https://rocm.docs.amd.com/) (supporto sperimentale)

## 📥 Installazione

### Metodo 1: Installer Pre-compilato (Consigliato per Utenti)

1. Scarica l'installer dalla [pagina Releases](https://github.com/tuo-username/medical-ai-assistant/releases)
   - **Windows**: `Medical-AI-Assistant-Setup-1.0.0.exe`
   - **macOS**: `Medical-AI-Assistant-1.0.0.dmg`
   - **Linux**: `Medical-AI-Assistant-1.0.0.AppImage`

2. Installa seguendo le istruzioni del wizard

3. Al primo avvio, l'applicazione scaricherà automaticamente i modelli necessari (~15GB)

### Metodo 2: Build da Sorgente (Per Sviluppatori)

```bash
# 1. Clona il repository
git clone https://github.com/tuo-username/medical-ai-assistant.git
cd medical-ai-assistant

# 2. Installa dipendenze
npm install

# 3. Setup Python environment per MCP servers
cd src/mcp-servers
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# 4. Build applicazione
npm run build

# 5. Avvia in modalità sviluppo
npm run dev

# 6. Oppure crea installer
npm run package  # Crea installer per il tuo OS
```

### Configurazione Iniziale

Al primo avvio:

1. **Seleziona Modelli**: Scegli quali modelli scaricare (minimo 15GB)
   - MedGemma 4B (richiesto) - 8GB
   - HeAR (opzionale) - 500MB
   - TxGemma 2B (opzionale) - 4GB
   - Foundation Models (opzionale) - 3GB

2. **Scegli Cartella Modelli**: Indica dove salvare i modelli

3. **Attendi Download**: Il download può richiedere 20-60 minuti

## 🚀 Utilizzo

### Avvio Applicazione

```bash
# Modalità utente
npm start

# Modalità sviluppo con hot-reload
npm run dev
```

### Esempi di Interazione

#### 1. Domanda Testuale Medica
```
User: "Quali sono i sintomi principali della bronchite acuta?"
Assistant: [Risposta basata su MedGemma con disclaimer]
```

#### 2. Analisi Radiografia
```
User: [Carica immagine CXR]
      "Analizza questa radiografia torace"
Assistant: [Referto generato da CXR Foundation + MedGemma]
          ⚠️ Richiede validazione radiologica professionale
```

#### 3. Analisi Audio Respiratorio
```
User: [Carica file audio tosse]
      "Analizza questo suono respiratorio"
Assistant: [Analisi da HeAR model]
          Possibili pattern: [risultati]
          ⚠️ Consultare pneumologo per diagnosi
```

#### 4. Drug Discovery
```
User: "Analizza questa molecola: CN1C(=O)CN=C(C2=CCCCC2)c2cc(Cl)ccc21"
Assistant: [Analisi TxGemma]
          - Attraversa BBB: Sì (probabilità: 0.85)
          - Tossicità: Bassa
          ⚠️ Predizione computazionale - richiede validazione
```

### Gestione Conversazioni

- **Nuova Conversazione**: Click su "+ Nuova Chat"
- **Ricerca**: Usa la barra di ricerca in alto
- **Esporta**: Click destro > "Esporta conversazione"
- **Elimina**: Click destro > "Elimina conversazione"

### Shortcuts Tastiera

- `Ctrl/Cmd + N`: Nuova conversazione
- `Ctrl/Cmd + F`: Cerca conversazioni
- `Ctrl/Cmd + E`: Esporta conversazione corrente
- `Ctrl/Cmd + ,`: Apri impostazioni
- `Esc`: Chiudi pannelli modali

## 🧬 Modelli Supportati

### MedGemma (Text & Vision)
- **Versione**: 4B multimodal, 27B text-only
- **Capacità**: 
  - Risponde domande mediche
  - Analizza immagini mediche
  - Genera referti
- **Uso**: Query generali, analisi multimodale

### HeAR (Health Acoustic Representations)
- **Input**: Audio 2 secondi, 16kHz mono
- **Output**: Embedding 512-d + classificazione
- **Capacità**:
  - Riconosce tosse, respiro, clearing throat
  - Predice condizioni respiratorie
  - Misura parametri spirometrici

### TxGemma (Therapeutics)
- **Versione**: 2B, 9B, 27B (predict & chat)
- **Capacità**:
  - Predice proprietà farmaci
  - Analizza molecole (SMILES)
  - Clinical trial predictions
- **Tasks**: 66 task su Therapeutic Data Commons

### Foundation Models
- **CXR Foundation**: Chest X-ray embedding
- **Path Foundation**: Histopathology embedding
- **Derm Foundation**: Dermatology embedding
- **Uso**: Classificazione efficiente, zero-shot learning

## 📁 Struttura del Progetto

```
medical-ai-assistant/
├── README.md                    # Questo file
├── LICENSE                      # Licenza MIT
├── package.json                 # Dipendenze Node.js
├── tsconfig.json               # Config TypeScript
├── electron-builder.yml        # Config build Electron
├── .gitignore
├── .env.example                # Template variabili ambiente
│
├── docs/                       # Documentazione dettagliata
│   ├── ARCHITECTURE.md         # Architettura sistema
│   ├── API.md                  # API MCP servers
│   ├── MODELS.md               # Guida modelli
│   └── DEVELOPMENT.md          # Guida sviluppo
│
├── src/
│   ├── main/                   # Electron main process
│   │   ├── index.ts            # Entry point
│   │   ├── mcp-manager.ts      # Gestione MCP servers
│   │   ├── database.ts         # SQLite manager
│   │   ├── model-loader.ts     # Download/caricamento modelli
│   │   ├── memory-system.ts    # Sistema memoria avanzato
│   │   ├── first-run.ts        # Setup iniziale
│   │   └── ipc-handlers.ts     # IPC con renderer
│   │
│   ├── renderer/               # UI React
│   │   ├── App.tsx             # Componente root
│   │   ├── index.html          # HTML entry
│   │   ├── styles/             # CSS/SCSS
│   │   ├── components/         # Componenti React
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── HistoryPanel.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   └── DisclaimerBanner.tsx
│   │   ├── hooks/              # React hooks custom
│   │   │   ├── useConversations.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useModels.ts
│   │   └── utils/              # Utilities
│   │       ├── formatting.ts
│   │       └── validation.ts
│   │
│   ├── mcp-servers/            # MCP server implementations
│   │   ├── requirements.txt    # Dipendenze Python
│   │   ├── medgemma/
│   │   │   ├── server.py       # MCP server MedGemma
│   │   │   └── model.py        # Model wrapper
│   │   ├── hear/
│   │   │   ├── server.py
│   │   │   └── audio_processor.py
│   │   ├── txgemma/
│   │   │   ├── server.py
│   │   │   └── molecule_analyzer.py
│   │   ├── foundations/
│   │   │   ├── server.py
│   │   │   ├── cxr_model.py
│   │   │   ├── derm_model.py
│   │   │   └── path_model.py
│   │   └── shared/
│   │       ├── base_server.py  # Base class MCP
│   │       └── utils.py
│   │
│   └── preload/                # Electron preload scripts
│       └── index.ts
│
├── resources/                  # Risorse statiche
│   ├── icons/                  # Icone app
│   ├── splash.png              # Splash screen
│   └── disclaimer.html         # Disclaimer HTML
│
├── scripts/                    # Script utility
│   ├── download-models.js      # Download automatico modelli
│   ├── setup-dev.sh           # Setup ambiente sviluppo
│   └── build-all.sh           # Build cross-platform
│
└── tests/                     # Test suite
    ├── unit/
    ├── integration/
    └── e2e/
```

## 🔧 Sviluppo

### Setup Ambiente Sviluppo

```bash
# 1. Setup completo
npm run setup:dev

# 2. Avvia in modalità dev con hot-reload
npm run dev

# 3. Lint e format
npm run lint
npm run format

# 4. Test
npm run test
npm run test:e2e
```

### Contribuire

1. Fork il repository
2. Crea un branch: `git checkout -b feature/nuova-feature`
3. Commit: `git commit -am 'Add: nuova feature'`
4. Push: `git push origin feature/nuova-feature`
5. Apri una Pull Request

### Guidelines

- Usa TypeScript strict mode
- Aggiungi test per nuove features
- Documenta funzioni pubbliche
- Segui [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ FAQ

### I modelli occupano troppo spazio. Posso usarne solo alcuni?

Sì! Al primo avvio puoi selezionare solo MedGemma (8GB minimo). Gli altri modelli possono essere scaricati successivamente da Impostazioni > Modelli.

### L'app funziona senza GPU?

Sì, ma sarà molto lenta (CPU inference). Fortemente consigliata GPU NVIDIA con 12GB+ VRAM.

### Posso usare l'app offline?

Sì, completamente! Dopo il download iniziale dei modelli, tutto funziona offline.

### Come esporto le mie conversazioni?

Click destro su una conversazione > "Esporta" > Scegli formato (JSON, Markdown, PDF).

### I miei dati sono sicuri?

Sì. Tutti i dati rimangono sul tuo PC. Nessuna connessione internet dopo download modelli.

### Posso usare quest'app per diagnosi?

**NO**. Quest'app è SOLO educativa. NON sostituisce un medico. Per questioni mediche, consulta sempre un professionista.

## 📄 Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli.

## 🙏 Ringraziamenti

- **Google Health AI Team** per i modelli open-source
- **Anthropic** per il protocollo MCP
- **Community open-source** per le numerose librerie utilizzate

## 📞 Contatti

- **Autore**: [Tuo Nome]
- **Email**: tuo@email.com
- **GitHub**: [@tuo-username](https://github.com/tuo-username)
- **Issues**: [GitHub Issues](https://github.com/tuo-username/medical-ai-assistant/issues)

## 🔗 Link Utili

- [Google Health AI Foundations](https://developers.google.com/health-ai-developer-foundations)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Hugging Face Models](https://huggingface.co/google)

---

⚠️ **IMPORTANTE**: Questo software è fornito "AS IS" senza garanzie. L'autore non si assume responsabilità per l'uso del software. Per emergenze mediche, contattare il 118.

**Made with ❤️ for Medical Education**
