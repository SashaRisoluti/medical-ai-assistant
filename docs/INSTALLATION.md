# 📥 Guida Installazione - Medical AI Assistant

Questa guida ti accompagnerà attraverso l'installazione completa del Medical AI Assistant sul tuo computer.

## 📋 Prerequisiti

### Hardware
- **CPU**: 8+ core (Intel i5/i7 o AMD Ryzen 5/7)
- **RAM**: 16GB minimo (32GB raccomandati)
- **GPU**: NVIDIA con 12GB+ VRAM (RTX 3060 Ti / RTX 4060 o superiore)
- **Storage**: 100GB liberi su SSD

### Software
- **Sistema Operativo**:
  - Windows 10/11 (64-bit)
  - macOS 12 Monterey o superiore
  - Ubuntu 20.04 LTS o superiore
- **Node.js**: v18.0.0 o superiore ([Download](https://nodejs.org/))
- **Python**: 3.9, 3.10 o 3.11 ([Download](https://www.python.org/downloads/))
- **Git**: Per clonare il repository ([Download](https://git-scm.com/))

### Driver GPU (solo per utenti NVIDIA)
- **CUDA Toolkit 11.8+**: [Download CUDA](https://developer.nvidia.com/cuda-downloads)
- **cuDNN**: [Download cuDNN](https://developer.nvidia.com/cudnn)

## 🚀 Installazione

### Opzione 1: Installer Precompilato (Consigliato)

#### Windows
1. Scarica `Medical-AI-Assistant-Setup-1.0.0.exe` dalla [pagina Releases](https://github.com/yourusername/medical-ai-assistant/releases)
2. Esegui l'installer
3. Segui il wizard di installazione
4. Avvia l'app dal menu Start o dal desktop

#### macOS
1. Scarica `Medical-AI-Assistant-1.0.0.dmg`
2. Apri il file DMG
3. Trascina l'app nella cartella Applicazioni
4. Al primo avvio, autorizza l'app in Impostazioni > Privacy e Sicurezza

#### Linux
1. Scarica `Medical-AI-Assistant-1.0.0.AppImage`
2. Rendi eseguibile: `chmod +x Medical-AI-Assistant-1.0.0.AppImage`
3. Esegui: `./Medical-AI-Assistant-1.0.0.AppImage`

### Opzione 2: Build da Sorgente

#### 1. Clona il Repository

```bash
git clone https://github.com/yourusername/medical-ai-assistant.git
cd medical-ai-assistant
```

#### 2. Installa Dipendenze Node.js

```bash
npm install
```

#### 3. Setup Python Environment

```bash
# Crea virtual environment
cd src/mcp-servers
python -m venv venv

# Attiva environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Installa dipendenze Python
pip install -r requirements.txt

# (Opzionale) Installa PyTorch con supporto GPU
# CUDA 11.8:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
# CUDA 12.1:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Torna alla root
cd ../..
```

#### 4. Configura Environment

```bash
# Copia il file di esempio
cp .env.example .env

# Modifica .env con il tuo editor preferito
# Imposta MODELS_DIR al path dove vuoi salvare i modelli
```

#### 5. Avvia in Modalità Sviluppo

```bash
npm run dev
```

L'app si aprirà automaticamente. Al primo avvio, vedrai il wizard di configurazione.

#### 6. (Opzionale) Crea Installer

```bash
# Per il tuo sistema operativo:
npm run package

# O specificamente:
npm run package:win   # Windows
npm run package:mac   # macOS
npm run package:linux # Linux
```

Gli installer saranno creati nella cartella `release/`.

## 🎛️ Primo Avvio

### 1. Wizard di Benvenuto

Al primo avvio vedrai un messaggio di benvenuto:
- Leggi attentamente il disclaimer
- Click su "Continua"

### 2. Seleziona Cartella Modelli

- Scegli una cartella con almeno 20GB liberi
- Consigliato: SSD per performance migliori
- Il path sarà salvato per i prossimi avvii

### 3. Selezione Modelli

Scegli quali modelli scaricare:

#### MedGemma 4B (RICHIESTO) - 8GB
- Modello base per analisi testo e immagini
- ✅ Sempre necessario

#### HeAR (Opzionale) - 500MB
- Analisi audio respiratorio
- ✅ Scarica se prevedi di usare analisi audio

#### TxGemma 2B (Opzionale) - 4GB
- Drug discovery e analisi molecole
- ✅ Scarica solo se interessato a farmacologia

#### Foundation Models (Opzionale) - 3GB
- CXR: Radiografie torace
- Derm: Dermatologia
- Path: Istopatologia
- ✅ Scarica per analisi specialistiche

### 4. Download Modelli

- Il download inizierà automaticamente
- Tempo stimato: 20-60 minuti (dipende dalla connessione)
- Puoi monitorare il progresso nella finestra

### 5. Configurazione Completata

Una volta completato, l'app è pronta!

## 🧪 Verifica Installazione

### Test Base

1. Avvia l'applicazione
2. Click su "+ Nuova Conversazione"
3. Scrivi: "Ciao! Come funzioni?"
4. Dovresti ricevere una risposta dal sistema

### Test GPU (se disponibile)

```bash
# Apri un terminale Python
python

# Verifica CUDA
>>> import torch
>>> torch.cuda.is_available()
True  # Deve essere True se GPU disponibile
>>> torch.cuda.get_device_name(0)
'NVIDIA GeForce RTX ...'  # Nome della tua GPU
```

### Test MCP Servers

1. Vai in Impostazioni (⚙️)
2. Controlla la sezione "Modelli Disponibili"
3. Dovresti vedere "medgemma" come attivo

## 🔧 Risoluzione Problemi

### L'app non si avvia

**Windows:**
```bash
# Verifica che Node.js sia installato
node --version  # Deve essere v18+

# Se hai errori con better-sqlite3, rebuilda:
npm install --build-from-source
```

**macOS:**
```bash
# Se ottieni "app damaged", esegui:
xattr -cr /Applications/Medical\ AI\ Assistant.app
```

**Linux:**
```bash
# Assicurati che l'AppImage sia eseguibile
chmod +x Medical-AI-Assistant-*.AppImage

# Se mancano dipendenze:
sudo apt install libfuse2  # Ubuntu/Debian
```

### Download modelli fallisce

1. Controlla la connessione internet
2. Verifica spazio disponibile
3. Prova a scaricare manualmente da [Hugging Face](https://huggingface.co/google)
4. Posiziona i modelli in `MODELS_DIR/nome-modello/`

### GPU non rilevata

```bash
# Verifica driver NVIDIA
nvidia-smi

# Se non funziona, reinstalla:
# 1. NVIDIA Driver
# 2. CUDA Toolkit
# 3. PyTorch con CUDA
```

### Errori Python

```bash
# Reinstalla dipendenze Python
cd src/mcp-servers
source venv/bin/activate  # o venv\Scripts\activate su Windows
pip install --upgrade -r requirements.txt
```

### Database corrotto

Se l'app non carica le conversazioni:

```bash
# Backup e reset database
# Windows:
copy "%APPDATA%\medical-ai-assistant\conversations.db" conversations-backup.db
del "%APPDATA%\medical-ai-assistant\conversations.db"

# macOS/Linux:
cp ~/Library/Application\ Support/medical-ai-assistant/conversations.db conversations-backup.db
rm ~/Library/Application\ Support/medical-ai-assistant/conversations.db
```

Riavvia l'app e verrà creato un nuovo database.

## 📚 Prossimi Passi

- 📖 Leggi la [Guida Utente](USER_GUIDE.md)
- 🏗️ Esplora l'[Architettura](ARCHITECTURE.md)
- 🤝 Contribuisci su [GitHub](https://github.com/yourusername/medical-ai-assistant)

## 💬 Supporto

- 🐛 **Bug Report**: [GitHub Issues](https://github.com/yourusername/medical-ai-assistant/issues)
- 💡 **Feature Request**: [GitHub Discussions](https://github.com/yourusername/medical-ai-assistant/discussions)
- 📧 **Email**: support@example.com

---

⚠️ **RICORDA**: Questo software è SOLO educativo. NON sostituisce il parere medico professionale.
