#!/bin/bash

# Medical AI Assistant - Setup Script
# Automatizza l'installazione e configurazione

set -e  # Exit on error

echo "🏥 Medical AI Assistant - Setup Script"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trovato. Installalo da https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js v18+ richiesto. Versione corrente: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) trovato"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 non trovato. Installalo da https://python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 -V | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Python $PYTHON_VERSION trovato"

# Install Node.js dependencies
echo ""
echo "📦 Installazione dipendenze Node.js..."
npm install

# Setup Python environment
echo ""
echo "🐍 Setup ambiente Python..."
cd src/mcp-servers

if [ ! -d "venv" ]; then
    echo "Creazione virtual environment..."
    python3 -m venv venv
fi

echo "Attivazione virtual environment..."
source venv/bin/activate

echo "Installazione dipendenze Python..."
pip install --upgrade pip
pip install -r requirements.txt

cd ../..

# Create .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creazione file .env..."
    cp .env.example .env
    echo "✅ File .env creato. Ricorda di configurarlo!"
else
    echo "✅ File .env già esistente"
fi

# Create directories
echo ""
echo "📁 Creazione directory necessarie..."
mkdir -p logs
mkdir -p models

echo ""
echo "✅ Setup completato con successo!"
echo ""
echo "📋 Prossimi passi:"
echo "1. Modifica .env e imposta MODELS_DIR"
echo "2. Esegui: npm run dev"
echo ""
echo "📖 Per maggiori informazioni: README.md o QUICKSTART.md"
echo ""
