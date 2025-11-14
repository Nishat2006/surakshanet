# 🛡️ SurakshaNet - AI-Powered Threat Detection & Blockchain Logging System

> Real-time cybersecurity threat detection with AI-powered analysis and immutable blockchain logging

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

**SurakshaNet** is an enterprise-grade cybersecurity monitoring system that combines:

- **AI-Powered Detection**: Machine learning models (Isolation Forest, XGBoost, Autoencoder) for anomaly detection
- **Blockchain Logging**: Immutable threat log storage using custom Node.js blockchain with Proof of Work
- **Real-Time Dashboard**: React-based monitoring interface with live updates
- **RESTful API**: Flask backend for seamless integration

---

## ✨ Features

### 🤖 AI-Powered Threat Detection
- Isolation Forest for anomaly detection
- XGBoost classifier for attack categorization
- Autoencoder for deep learning-based analysis
- Real-time severity scoring (LOW, MEDIUM, HIGH, CRITICAL)

### 🔗 Blockchain Integration
- Custom Node.js blockchain implementation
- SHA-256 cryptographic hashing
- Proof of Work consensus mechanism
- Immutable audit trail for all threats
- Chain integrity verification

### 📊 Interactive Dashboard
- Real-time threat monitoring
- Live blockchain visualization
- Attack simulation for testing
- Block inspection and verification
- Statistics and analytics

### 🔌 RESTful API
- Log ingestion endpoint
- Dashboard data retrieval
- Blockchain integration
- CORS-enabled for cross-origin requests

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  React Frontend │◄────►│  Flask Backend  │◄────►│ Node.js Blockchain│
│   (Port 5173)   │      │   (Port 5000)   │      │   (Port 3001)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                         │
         │                        ▼                         │
         │                 ┌─────────────┐                 │
         │                 │  AI Models  │                 │
         │                 │  (Optional) │                 │
         │                 └─────────────┘                 │
         │                                                  │
         └──────────────────────────────────────────────────┘
                    Real-time Data Flow
```

---

## ⚡ Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and npm
- **Git**

### One-Command Setup (Windows)

```bash
# Clone the repository
git clone <repository-url>
cd "elk stack"

# Double-click START_ALL.bat
```

This will automatically start:
- Blockchain Server (http://localhost:3001)
- Flask Backend (http://localhost:5000)
- React Frontend (http://localhost:5173)

### Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

---

## 📦 Installation

### 1. Backend Setup (Python/Flask)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

**Optional**: Place AI models in `backend/models/`:
- `scaler.pkl`
- `isolation_forest.pkl`
- `classifier_model.pkl` (optional)
- `autoencoder_model.h5` (optional)

*Note: System runs in demo mode without models*

### 2. Blockchain Setup (Node.js)

```bash
cd blockchain

# Install dependencies
npm install
```

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install
```

---

## 🚀 Usage

### Option 1: Automatic Startup (Recommended)

**Windows:**
```bash
.\START_ALL.bat
```

### Option 2: Manual Startup

**Terminal 1 - Blockchain Server:**
```bash
cd blockchain
npm start
```

**Terminal 2 - Flask Backend:**
```bash
cd backend
.\venv\Scripts\activate
python app_nodejs_blockchain.py
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Dashboard

1. Open browser: http://localhost:5173
2. Login with credentials above
3. Navigate to **"🔗 Blockchain Demo"**
4. Click **"🚀 Launch Attack"** to simulate threats
5. Watch real-time blockchain updates
6. Click **"🔐 Verify Chain"** to check integrity
7. Click any block to inspect details

---

## 📡 API Documentation

### Backend API (Flask - Port 5000)

#### POST /ingest
Ingest a new threat log

**Request:**
```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "source_ip": "192.168.1.100",
  "target_ip": "10.0.0.1",
  "attack_type": "Brute Force",
  "features": "443,141385,9,7,568,..."
}
```

**Response:**
```json
{
  "log_id": "uuid",
  "message": "Log ingested successfully",
  "severity": "HIGH",
  "blockchain": true
}
```

#### GET /dashboard
Retrieve dashboard data

**Response:**
```json
{
  "alerts": [...],
  "blockchain": {...},
  "all_logs": [...],
  "stats": {...}
}
```

### Blockchain API (Node.js - Port 3001)

#### POST /log
Add log to blockchain

#### GET /blocks
Get all blocks

#### GET /blocks/recent?count=N
Get recent N blocks

#### GET /verify
Verify blockchain integrity

#### GET /stats
Get blockchain statistics

#### GET /block/hash/:hash
Get block by hash

#### GET /block/log/:logId
Get block by log ID

#### GET /health
Health check

---

## 📁 Project Structure

```
elk-stack/
├── backend/
│   ├── app_nodejs_blockchain.py    # Main Flask application
│   ├── models/                     # AI models (optional)
│   │   ├── scaler.pkl
│   │   ├── isolation_forest.pkl
│   │   └── ...
│   ├── venv/                       # Python virtual environment
│   └── requirements.txt            # Python dependencies
│
├── blockchain/
│   ├── blockchain.js               # Node.js blockchain implementation
│   ├── package.json                # Node.js dependencies
│   └── README.md                   # Blockchain documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx       # Main dashboard
│   │   │   ├── BlockchainDemo.tsx  # Blockchain demo panel
│   │   │   └── ...
│   │   └── App.tsx                 # Root component
│   ├── package.json                # Frontend dependencies
│   └── vite.config.ts              # Vite configuration
│
├── START_ALL.bat                   # Auto-start script (Windows)
├── requirements.txt                # Root Python dependencies
└── README.md                       # This file
```

---

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Check what's using the ports
netstat -ano | findstr :3001
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F
```

### Blockchain Server Won't Start
- Verify Node.js version: `node --version` (18+)
- Run `npm install` in blockchain folder
- Check if port 3001 is available

### Backend Errors
- Ensure virtual environment is activated
- Verify Python version: `python --version` (3.11+)
- Check if all dependencies are installed
- System runs in demo mode without AI models

### Frontend Issues
- Clear browser cache
- Run `npm install` in frontend folder
- Verify backend (5000) and blockchain (3001) are running
- Check browser console for errors

### Connection Errors
- Ensure all three services are running
- Check firewall settings
- Verify CORS is enabled (pre-configured)

---

## 🔐 Security Notes

⚠️ **This is a demo/educational system**

For production deployment:
- Use strong authentication mechanisms
- Enable HTTPS/TLS encryption
- Implement proper API authentication
- Secure private keys and credentials
- Regular security audits
- Implement rate limiting
- Use environment variables for sensitive data

---

## 🎓 How It Works

### Blockchain Flow
1. **Threat Detection**: Backend detects threat via AI models
2. **Block Creation**: New block created with threat data
3. **Mining**: Proof of Work algorithm finds valid nonce
4. **Chain Addition**: Block added to blockchain
5. **Verification**: Chain integrity maintained via hash linking

### AI Detection Flow
1. **Log Ingestion**: Backend receives network log data
2. **Feature Extraction**: 51 network features extracted
3. **AI Inference**: Models analyze for anomalies
4. **Severity Scoring**: Threat severity determined
5. **Blockchain Logging**: High/Critical threats logged
6. **Dashboard Update**: Real-time visualization

---

## 📊 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Python 3.11, Flask, Flask-CORS |
| Blockchain | Node.js, Express, SHA-256 |
| AI/ML | scikit-learn, TensorFlow, XGBoost |
| Data Processing | NumPy, Pandas |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 Success Checklist

- ✅ Blockchain server running on port 3001
- ✅ Flask backend running on port 5000
- ✅ React frontend accessible at port 5173
- ✅ Can login to dashboard
- ✅ Can simulate attacks
- ✅ Blockchain updates in real-time
- ✅ Can verify chain integrity

**Congratulations! Your SurakshaNet system is fully operational!** 🚀

---

## 📞 Support

For issues or questions:
1. Check this README first
2. Review console logs in each terminal
3. Verify all services are running
4. Check browser console for frontend errors
5. Open an issue on GitHub

---

**Built with ❤️ for cybersecurity education and research**
