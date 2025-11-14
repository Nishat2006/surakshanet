# SurakshaNet Unified Backend

## Overview

The backend has been consolidated into a single `app.py` file that runs both Flask and FastAPI services.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
pip install -r requirements-database.txt
pip install -r requirements-stats.txt
```

### 2. Initialize Database (First Time Only)
```bash
python app.py --init-db
```

### 3. Start the Backend
```bash
python app.py
```

## Services

### Flask API (Port 5000)
- **POST** `/ingest` - Ingest security logs with AI analysis
- **GET** `/dashboard` - Retrieve dashboard data (alerts, logs, blockchain)

### FastAPI System Stats (Port 8001)
- **GET** `/stats` - Get current system statistics
- **WebSocket** `/ws/stats` - Real-time system stats stream

## Features

### ✅ Log Ingestion & AI Analysis
- Receives security event logs
- Runs AI inference for threat detection
- Assigns severity levels (LOW, MEDIUM, HIGH, CRITICAL)

### ✅ Blockchain Integration
- Logs high-severity events to blockchain (port 3001)
- Maintains immutable audit trail

### ✅ Database Persistence
- PostgreSQL database for log storage
- Tracks all ingestions with complete metadata
- Blockchain block tracking

### ✅ Real-time System Monitoring
- CPU, Memory, Disk, Network stats
- WebSocket streaming for live updates

## Architecture

```
app.py (Unified Backend)
├── Database Models (SQLAlchemy)
│   ├── LogIngestion
│   ├── BlockchainBlock
│   └── SystemMetrics
│
├── Flask API (Port 5000)
│   ├── /ingest endpoint
│   ├── /dashboard endpoint
│   ├── AI model inference
│   └── Blockchain integration
│
└── FastAPI Stats Service (Port 8001)
    ├── /stats endpoint
    └── /ws/stats WebSocket
```

## Configuration

### Environment Variables
- `BLOCKCHAIN_URL` - Blockchain service URL (default: http://localhost:3001)
- `DATABASE_URL` - PostgreSQL connection string

### Database Configuration
- **Host**: localhost:5432
- **Database**: surakshanet_logs
- **User**: surakshanet
- **Password**: surakshanet123

## Dependencies

### Core
- Flask + Flask-CORS
- FastAPI + Uvicorn
- SQLAlchemy + psycopg2

### AI/ML
- numpy
- pandas
- scikit-learn
- joblib

### System Monitoring
- psutil

### Blockchain Integration
- requests

## Running in Production

For production deployment, consider:
1. Use a production WSGI server (gunicorn) for Flask
2. Use a reverse proxy (nginx) for both services
3. Set up proper database credentials
4. Enable SSL/TLS
5. Configure proper CORS origins

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Windows: Check Services for 'postgresql'
# Linux: sudo systemctl status postgresql

# Initialize database
python app.py --init-db
```

### Blockchain Connection Issues
- Ensure blockchain service is running on port 3001
- Check `BLOCKCHAIN_URL` environment variable

### Port Already in Use
- Flask uses port 5000
- FastAPI uses port 8001
- Ensure these ports are available

## Migration from Old Structure

This backend replaces the following files:
- `app_nodejs_blockchain.py`
- `database.py`
- `db_logger.py`
- `init_database.py`
- `system_stats_service.py`

See `MIGRATION_NOTES.md` for details.
