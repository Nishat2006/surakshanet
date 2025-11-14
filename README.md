# 🛡️ SurakshaNet - AI-Powered Cybersecurity Threat Detection & Blockchain Logging System

> Enterprise-grade real-time threat detection with AI-powered analysis, immutable blockchain logging, and comprehensive security monitoring

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Database Setup](#-database-setup)
- [Troubleshooting](#-troubleshooting)
- [Security Notes](#-security-notes)
- [Contributing](#-contributing)

---

## 🎯 Overview

**SurakshaNet** is a comprehensive cybersecurity monitoring and threat detection system that combines cutting-edge AI/ML technologies with blockchain-based immutable logging. The system provides real-time threat analysis, automated alerting, and a complete audit trail for security events.

### Core Capabilities

- **🤖 Trinity AI Pipeline**: Multi-model ensemble (Isolation Forest, Autoencoder, XGBoost) for accurate threat detection
- **🔗 Blockchain Logging**: Custom Node.js blockchain with Proof of Work for immutable threat records
- **💾 PostgreSQL Database**: Complete log persistence with hash-based integrity verification
- **📊 Real-Time Dashboard**: React-based monitoring interface with live updates
- **🔔 Automated Alerts**: Slack and Gmail notifications for high-severity threats
- **📈 System Monitoring**: Real-time CPU, memory, disk, and network statistics via WebSocket
- **🔐 Firebase Authentication**: Secure user authentication and session management

---

## ✨ Key Features

### 🤖 AI-Powered Threat Detection (Trinity Pipeline)

- **Isolation Forest**: Anomaly detection using unsupervised learning
- **Autoencoder**: Deep learning-based reconstruction error analysis
- **XGBoost Classifier**: Attack type classification and probability scoring
- **Voting System**: Ensemble decision-making for improved accuracy
- **SHAP Explanations**: Explainable AI with feature importance analysis
- **Severity Classification**: Automatic categorization (LOW, MEDIUM, HIGH, CRITICAL)

### 🔗 Blockchain Integration

- **Custom Blockchain**: Node.js implementation with SHA-256 hashing
- **Proof of Work**: Mining mechanism for block validation
- **Immutable Audit Trail**: All threats permanently recorded
- **Chain Verification**: Integrity checking and tamper detection
- **Block Inspection**: Detailed block viewing and hash verification

### 💾 Database & Persistence

- **PostgreSQL Integration**: Complete log storage with full metadata
- **Hash-Based Integrity**: SHA-256 hashing for log verification
- **Query Capabilities**: Search by IP, attack type, severity
- **Performance Metrics**: Processing time and response tracking
- **Audit Trail**: Complete forensic data retention

### 📊 Interactive Dashboard

- **Real-Time Monitoring**: Live threat updates and alerts
- **Blockchain Visualization**: Interactive chain explorer
- **System Statistics**: CPU, memory, disk, network metrics
- **Log Analytics**: Advanced filtering and search
- **Threat Mitigation**: One-click threat handling
- **XAI Dashboard**: Explainable AI insights and feature importance

### 🔔 Automated Alerting

- **Slack Integration**: Real-time alerts via Composio SDK
- **Gmail Notifications**: Email alerts for critical threats
- **Severity-Based**: Configurable alert thresholds
- **Rich Context**: Detailed threat information in alerts

### 📈 System Monitoring

- **Real-Time Stats**: WebSocket streaming of system metrics
- **CPU Monitoring**: Per-core usage and frequency tracking
- **Memory Analysis**: RAM, swap, and usage statistics
- **Disk Metrics**: Storage usage and I/O statistics
- **Network Stats**: Traffic, packets, and error monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│  (Port 5173) - Firebase Auth, Real-time Dashboard, Analytics     │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP/WebSocket
┌───────────────────────▼─────────────────────────────────────────┐
│                    Unified Backend (app.py)                       │
│  ┌─────────────────────────┬─────────────────────────────────┐  │
│  │   Flask API (Port 5000) │  FastAPI Stats (Port 8001)     │  │
│  │   - /ingest             │  - /stats (HTTP)                │  │
│  │   - /dashboard          │  - /ws/stats (WebSocket)        │  │
│  │   - /explain            │                                  │  │
│  │   - /mitigate           │                                  │  │
│  └───────────┬─────────────┴─────────────────────────────────┘  │
│              │                                                    │
│  ┌───────────▼───────────┐  ┌──────────────────────────────┐   │
│  │  Trinity AI Pipeline  │  │  PostgreSQL Database         │   │
│  │  - Isolation Forest    │  │  - Log Storage               │   │
│  │  - Autoencoder         │  │  - Hash Verification        │   │
│  │  - XGBoost             │  │  - Query Interface          │   │
│  └───────────┬───────────┘  └──────────────────────────────┘   │
└──────────────┼──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│              Node.js Blockchain (Port 3001)                      │
│  - Proof of Work Mining                                          │
│  - SHA-256 Hashing                                               │
│  - Immutable Chain Storage                                       │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Log Ingestion**: Frontend/API sends security event → Flask `/ingest`
2. **AI Analysis**: Trinity pipeline processes features → Severity classification
3. **Database Storage**: Log saved to PostgreSQL with hash verification
4. **Blockchain Logging**: High-severity threats → Blockchain (immutable record)
5. **Alerting**: Critical threats → Slack & Gmail notifications
6. **Dashboard Update**: Real-time UI refresh with new data
7. **System Monitoring**: WebSocket streams system metrics continuously

---

## 💻 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Firebase Auth |
| **Backend API** | Python 3.11, Flask, Flask-CORS |
| **System Stats** | FastAPI, Uvicorn, WebSocket |
| **Blockchain** | Node.js, Express, SHA-256, Proof of Work |
| **Database** | PostgreSQL 14+, SQLAlchemy, pg8000 |
| **AI/ML** | scikit-learn, TensorFlow 2.20, XGBoost, SHAP |
| **Data Processing** | NumPy, Pandas, Joblib |
| **Alerting** | Composio SDK (Slack, Gmail) |
| **System Monitoring** | psutil |

---

## ⚡ Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **PostgreSQL 14+** (optional, for database features)
- **Git**

### One-Command Setup (Windows)

```bash
# Clone the repository
git clone https://github.com/Nishat2006/surakshanet.git
cd SurakshaNet

# Start all services
START_ALL.bat
```

This automatically starts:
- ✅ Blockchain Server (http://localhost:3001)
- ✅ Flask Backend (http://localhost:5000)
- ✅ FastAPI Stats Service (http://localhost:8001)
- ✅ React Frontend (http://localhost:5173)

### Access the Dashboard

1. Open browser: **http://localhost:5173**
2. Sign in with Firebase (Google or Email/Password)
3. Navigate to **"🔗 Blockchain Demo"** to simulate threats
4. View real-time updates in the dashboard
5. Check system stats in the monitoring panel

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

**AI Models (Optional)**: Place trained models in `backend/models/`:
- `scaler.pkl` - Feature scaler
- `anomaly_model.pkl` - Isolation Forest model
- `classifier_model.pkl` - XGBoost classifier
- `autoencoder_model.h5` - Autoencoder model

*Note: System runs in demo mode without models, but with reduced accuracy*

### 2. Blockchain Setup (Node.js)

```bash
cd blockchain

# Install dependencies
npm install

# Start blockchain server
npm start
```

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Setup (PostgreSQL - Optional)

See [Database Setup](#-database-setup) section for detailed instructions.

---

## ⚙️ Configuration

### Backend Configuration (`backend/app.py`)

```python
# Database Configuration
DATABASE_URL = "postgresql+pg8000://surakshanet:surakshanet123@localhost:5432/surakshanet_db"

# Blockchain Configuration
BLOCKCHAIN_URL = "http://localhost:3001"

# Composio API (for Slack/Gmail alerts)
COMPOSIO_API_KEY = "your_api_key_here"
SLACK_CHANNEL_ID = "#surakshanet-alerts"
```

### Frontend Configuration (`frontend/src/firebase/config.ts`)

Update Firebase configuration with your project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### Environment Variables

Create `.env` files for sensitive configuration (not tracked in git):

**Backend `.env`:**
```
COMPOSIO_API_KEY=your_key_here
DATABASE_URL=postgresql+pg8000://user:pass@localhost:5432/dbname
BLOCKCHAIN_URL=http://localhost:3001
```

---

## 🚀 Usage

### Option 1: Automatic Startup (Recommended)

**Windows:**
```bash
START_ALL.bat
```

**Linux/Mac:**
```bash
# Create similar script or run manually (see Option 2)
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
.\venv\Scripts\activate  # Windows
python app.py
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
```

### Using the Dashboard

1. **Login**: Use Firebase authentication (Google or Email/Password)
2. **View Dashboard**: See real-time threats and alerts
3. **Blockchain Demo**: Click "🚀 Launch Attack" to simulate threats
4. **View Blocks**: Click any block to inspect details
5. **Verify Chain**: Click "🔐 Verify Chain" to check integrity
6. **System Stats**: Monitor real-time system metrics
7. **Mitigate Threats**: Click "Mitigate" on alerts to handle threats

---

## 📡 API Documentation

### Flask API (Port 5000)

#### POST `/ingest`
Ingest a security log with AI analysis

**Request:**
```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "source_ip": "192.168.1.100",
  "target_ip": "10.0.0.1",
  "attack_type": "Brute Force",
  "features": "443,141385,9,7,568,...",
  "user": "admin",
  "source_system": "firewall"
}
```

**Response:**
```json
{
  "log_id": "uuid-here",
  "message": "Log ingested successfully",
  "severity": "HIGH",
  "blockchain": true
}
```

#### GET `/dashboard`
Retrieve dashboard data (alerts, logs, stats)

**Response:**
```json
{
  "alerts": [...],
  "all_logs": [...],
  "stats": {
    "cpuUsage": 35,
    "memoryUsage": 53,
    "totalThreats": 123,
    "activeAlerts": 45
  }
}
```

#### POST `/explain`
Get SHAP-based AI explanation for a prediction

**Request:**
```json
{
  "features": "443,141385,9,7,568,..."
}
```

**Response:**
```json
{
  "feature_importance": [
    {
      "feature": "Flow Duration",
      "shap_value": 0.45,
      "feature_value": 141385
    },
    ...
  ],
  "base_value": 0.0
}
```

#### POST `/mitigate`
Mark a threat as mitigated

**Request:**
```json
{
  "log_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Threat mitigated successfully. IP 192.168.1.100 blocked.",
  "log_id": "uuid-here"
}
```

### FastAPI System Stats (Port 8001)

#### GET `/stats`
Get current system statistics (one-time)

**Response:**
```json
{
  "timestamp": "2025-01-01T12:00:00",
  "cpu": {
    "usage_percent": 35.2,
    "count": 8,
    "frequency_mhz": 3200
  },
  "memory": {
    "total_gb": 16.0,
    "used_gb": 8.5,
    "usage_percent": 53.1
  },
  "disk": {...},
  "network": {...},
  "system": {...}
}
```

#### WebSocket `/ws/stats`
Real-time system stats stream (updates every second)

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/stats');
ws.onmessage = (event) => {
  const stats = JSON.parse(event.data);
  console.log(stats);
};
```

### Blockchain API (Node.js - Port 3001)

#### POST `/log`
Add threat log to blockchain

#### GET `/blocks`
Get all blocks in the chain

#### GET `/blocks/recent?count=N`
Get recent N blocks

#### GET `/verify`
Verify blockchain integrity

#### GET `/stats`
Get blockchain statistics

#### GET `/block/hash/:hash`
Get block by hash

#### GET `/block/log/:logId`
Get block by log ID

---

## 📁 Project Structure

```
SurakshaNet/
├── backend/
│   ├── app.py                    # Unified backend (Flask + FastAPI)
│   ├── models/                   # AI models directory
│   │   ├── scaler.pkl
│   │   ├── anomaly_model.pkl
│   │   ├── classifier_model.pkl
│   │   └── autoencoder_model.h5
│   ├── venv/                     # Python virtual environment (gitignored)
│   ├── requirements.txt          # Python dependencies
│   ├── README.md                 # Backend documentation
│   └── README_DATABASE.md        # Database documentation
│
├── blockchain/
│   ├── blockchain.js             # Node.js blockchain implementation
│   ├── package.json               # Node.js dependencies
│   └── README.md                  # Blockchain documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   ├── BlockchainDemo.tsx # Blockchain demo
│   │   │   ├── SignIn.tsx        # Authentication
│   │   │   ├── XaiDashboard.tsx  # Explainable AI
│   │   │   └── ...                # Other components
│   │   ├── firebase/
│   │   │   └── config.ts          # Firebase configuration
│   │   ├── hooks/
│   │   │   └── useSystemStats.ts  # System stats hook
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── package.json               # Frontend dependencies
│   └── vite.config.ts             # Vite configuration
│
├── auth.js                        # JWT authentication service (optional)
├── START_ALL.bat                  # Auto-start script (Windows)
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

---

## 💾 Database Setup

### Quick Setup

1. **Install PostgreSQL**: Download from https://www.postgresql.org/download/

2. **Create Database User**:
```sql
CREATE USER surakshanet WITH PASSWORD 'surakshanet123';
ALTER USER surakshanet CREATEDB;
```

3. **Initialize Database**:
```bash
cd backend
python -c "from app import Base, engine; Base.metadata.create_all(bind=engine)"
```

### Database Schema

**Logs Table:**
- `log_id` (Primary Key)
- `timestamp_iso`, `display_timestamp`
- `source_ip`, `target_ip`, `attack_type`
- `severity`, `features`, `message`
- `ai_if_score`, `status`, `log_count`

### Query Examples

```sql
-- Get recent critical threats
SELECT log_id, source_ip, attack_type, severity
FROM logs
WHERE severity = 'CRITICAL'
ORDER BY timestamp_iso DESC
LIMIT 10;

-- Search by IP address
SELECT * FROM logs
WHERE source_ip = '192.168.1.100';

-- Get severity statistics
SELECT severity, COUNT(*) as count
FROM logs
GROUP BY severity;
```

For detailed database documentation, see `backend/README_DATABASE.md` and `QUICK_START_DATABASE.md`.

---

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Windows: Check what's using the ports
netstat -ano | findstr :3001
netstat -ano | findstr :5000
netstat -ano | findstr :5173
netstat -ano | findstr :8001

# Kill the process
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### Blockchain Server Won't Start

- Verify Node.js version: `node --version` (should be 18+)
- Run `npm install` in blockchain folder
- Check if port 3001 is available
- Review blockchain server logs

### Backend Errors

- Ensure virtual environment is activated
- Verify Python version: `python --version` (should be 3.11+)
- Check if all dependencies are installed: `pip install -r requirements.txt`
- Verify PostgreSQL is running (if using database)
- Check blockchain server is running on port 3001
- Review backend console logs for detailed errors

### Frontend Issues

- Clear browser cache
- Run `npm install` in frontend folder
- Verify backend (5000) and blockchain (3001) are running
- Check browser console for errors
- Verify Firebase configuration is correct

### Database Connection Issues

```bash
# Check PostgreSQL is running
# Windows: Check Services for 'postgresql'
# Linux: sudo systemctl status postgresql

# Test connection
psql -U surakshanet -d surakshanet_db -h localhost

# If connection fails, verify credentials in app.py
```

### AI Models Not Loading

- Verify model files exist in `backend/models/`
- Check file permissions
- Ensure models are compatible versions
- System will run in demo mode without models

### Connection Errors

- Ensure all services are running (blockchain, backend, frontend)
- Check firewall settings
- Verify CORS is enabled (pre-configured)
- Check network connectivity between services

---

## 🔐 Security Notes

⚠️ **This is a demo/educational system**

### For Production Deployment:

- ✅ **Use strong authentication**: Implement proper JWT/OAuth
- ✅ **Enable HTTPS/TLS**: Encrypt all communications
- ✅ **Secure API endpoints**: Implement rate limiting and authentication
- ✅ **Protect credentials**: Use environment variables, never hardcode
- ✅ **Database security**: Use strong passwords, limit access
- ✅ **Firewall rules**: Restrict access to necessary ports only
- ✅ **Regular updates**: Keep dependencies updated
- ✅ **Security audits**: Regular penetration testing
- ✅ **Log monitoring**: Monitor for suspicious activities
- ✅ **Backup strategy**: Regular database backups

### Current Security Features:

- ✅ CORS enabled for cross-origin requests
- ✅ Hash-based log integrity verification
- ✅ Immutable blockchain logging
- ✅ Firebase authentication
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ Input validation on API endpoints

---

## 🎓 How It Works

### Trinity AI Pipeline

1. **Feature Extraction**: 51 network features extracted from log data
2. **Data Scaling**: Features normalized using trained scaler
3. **Model Inference**:
   - **Isolation Forest**: Calculates anomaly score
   - **Autoencoder**: Computes reconstruction error
   - **XGBoost**: Predicts attack probability
4. **Voting Logic**: 
   - 2+ votes = CRITICAL (Confirmed Intrusion)
   - 1 vote = MEDIUM/HIGH (Suspected Anomaly)
   - 0 votes = LOW (Normal Traffic)
5. **Severity Assignment**: Based on voting results
6. **SHAP Explanation**: Feature importance analysis for explainability

### Blockchain Flow

1. **Threat Detection**: Backend detects threat via AI models
2. **Block Creation**: New block created with threat data
3. **Mining**: Proof of Work algorithm finds valid nonce
4. **Chain Addition**: Block added to blockchain
5. **Verification**: Chain integrity maintained via hash linking
6. **Database Sync**: Block information stored in PostgreSQL

### Alert System

1. **Severity Check**: High/Critical threats trigger alerts
2. **Slack Notification**: Alert sent via Composio SDK
3. **Gmail Alert**: Email notification sent
4. **Logging**: All alerts logged for audit

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality
- Ensure all services start without errors

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 Success Checklist

- ✅ Blockchain server running on port 3001
- ✅ Flask backend running on port 5000
- ✅ FastAPI stats service running on port 8001
- ✅ React frontend accessible at port 5173
- ✅ PostgreSQL database connected (optional)
- ✅ Firebase authentication working
- ✅ Can login to dashboard
- ✅ Can simulate attacks
- ✅ Blockchain updates in real-time
- ✅ Can verify chain integrity
- ✅ System stats streaming via WebSocket
- ✅ Alerts working (Slack/Gmail)

**Congratulations! Your SurakshaNet system is fully operational!** 🚀

---

## 📞 Support

For issues or questions:

1. Check this README first
2. Review console logs in each terminal
3. Verify all services are running
4. Check browser console for frontend errors
5. Review `backend/README.md` for backend-specific issues
6. Review `QUICK_START_DATABASE.md` for database setup
7. Open an issue on GitHub

---

## 🙏 Acknowledgments

- Built with modern web technologies
- AI models trained on cybersecurity datasets
- Blockchain implementation for immutable logging
- Real-time monitoring and alerting capabilities

---

**Built with ❤️ for cybersecurity education, research, and enterprise security operations**
