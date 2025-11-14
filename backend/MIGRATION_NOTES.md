# Backend Migration Notes

## Changes Made

All backend Python files have been merged into a single `app.py` file for easier maintenance and deployment.

### Previous Structure (5 separate files):
- `app_nodejs_blockchain.py` - Flask API with AI inference and blockchain integration
- `database.py` - PostgreSQL database models and configuration
- `db_logger.py` - Database logging operations
- `init_database.py` - Database initialization script
- `system_stats_service.py` - FastAPI system stats service with WebSocket support

### New Structure (1 unified file):
- `app.py` - Complete backend with all functionality merged

## What's Included in app.py

1. **Database Models & Configuration**
   - LogIngestion model
   - BlockchainBlock model
   - SystemMetrics model
   - Database connection setup with SQLAlchemy

2. **Database Logger Class**
   - Log ingestion tracking
   - Hash generation
   - Statistics retrieval

3. **Flask API (Port 5000)**
   - POST `/ingest` - Log ingestion endpoint
   - GET `/dashboard` - Dashboard data endpoint
   - AI model inference
   - Blockchain integration

4. **FastAPI System Stats Service (Port 8001)**
   - GET `/stats` - HTTP stats endpoint
   - WebSocket `/ws/stats` - Real-time stats streaming
   - System monitoring (CPU, Memory, Disk, Network)

5. **Database Initialization**
   - Built-in database setup with `--init-db` flag
   - Automatic table creation

## How to Run

### Start the unified backend:
```bash
cd backend
python app.py
```

### Initialize database (first time only):
```bash
python app.py --init-db
```

### Services will start on:
- Flask API: http://127.0.0.1:5000
- FastAPI Stats: http://127.0.0.1:8001

## No Frontend Changes Required

The frontend already uses the correct endpoints:
- `http://127.0.0.1:5000` for Flask API
- `http://127.0.0.1:8001` for system stats

## No Blockchain Changes Required

The blockchain service remains unchanged and runs independently on port 3001.

## Old Files (Archived)

The following files have been archived and can be safely removed:
- `app_nodejs_blockchain.py`
- `database.py`
- `db_logger.py`
- `init_database.py`
- `system_stats_service.py`

All functionality from these files is now in `app.py`.
