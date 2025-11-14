# Quick Start: PostgreSQL Database Integration

## What Was Added

Your SurakshaNet system now has **complete PostgreSQL database integration** that records every log ingestion with full details including:

✅ **Complete log details** - IPs, ports, attack types, severity  
✅ **AI model scores** - Attack probability, anomaly detection scores  
✅ **Blockchain integration** - Block hashes, indexes, timestamps  
✅ **SHA256 hashes** - Log integrity verification  
✅ **Response tracking** - Automated actions taken  
✅ **Processing metrics** - Performance monitoring  
✅ **Full audit trail** - Complete raw data stored  

## Quick Setup (3 Steps)

### 1. Install PostgreSQL
Download and install from: https://www.postgresql.org/download/

During installation:
- Set password for `postgres` user
- Keep default port: 5432

### 2. Create Database User
Open SQL Shell (psql) and run:
```sql
CREATE USER surakshanet WITH PASSWORD 'surakshanet123';
ALTER USER surakshanet CREATEDB;
\q
```

### 3. Run Setup Script
```bash
SETUP_DATABASE.bat
```

That's it! The database is now ready.

## Files Created

### Core Database Files
- `backend/database.py` - Database models and configuration
- `backend/db_logger.py` - Logging functions with hash generation
- `backend/init_database.py` - Database initialization script

### Setup & Documentation
- `SETUP_DATABASE.bat` - Automated setup script
- `DATABASE_SETUP.md` - Complete setup guide
- `backend/README_DATABASE.md` - Technical documentation
- `backend/requirements-database.txt` - Python dependencies

### Updated Files
- `backend/app_nodejs_blockchain.py` - Integrated database logging

## Database Schema

### log_ingestions Table (Main)
Stores every log with:
- Unique identifiers (UUID + auto-increment ID)
- Network info (IPs, ports, protocol)
- Attack details (type, severity, message)
- AI scores (attack probability, anomaly scores)
- Blockchain data (block hash, index)
- **SHA256 hashes** (log hash + content hash)
- Response actions taken
- Processing time
- Complete raw data

### blockchain_blocks Table
Mirrors blockchain state for quick queries

### system_metrics Table
Performance and analytics data

## New API Endpoints

```
GET  /database/logs              - Get logs with pagination
GET  /database/logs/<id>         - Get specific log by ID
GET  /database/stats             - Get database statistics
GET  /database/search            - Search logs by IP, attack type
```

## Example Usage

### Check Statistics
```bash
curl http://localhost:5000/database/stats
```

Returns:
```json
{
  "total_logs": 1234,
  "severity_breakdown": {
    "critical": 45,
    "high": 123,
    "medium": 456,
    "low": 610
  },
  "blockchain_logged": 1200,
  "blockchain_percentage": 97.2
}
```

### Search Logs
```bash
curl "http://localhost:5000/database/search?source_ip=192.168.1.100"
```

### Query Database Directly
```bash
psql -U surakshanet -d surakshanet_logs -h localhost
```

```sql
-- Get recent critical logs
SELECT log_id, source_ip, attack_type, blockchain_block_hash
FROM log_ingestions 
WHERE severity = 'CRITICAL'
ORDER BY ingestion_timestamp DESC 
LIMIT 10;

-- Verify log integrity by hash
SELECT log_id, log_hash, content_hash 
FROM log_ingestions 
WHERE log_hash = 'your_hash_here';
```

## What Happens When You Ingest a Log

1. **Log received** at `/ingest` endpoint
2. **AI analysis** runs (attack detection)
3. **Saved to memory** (existing functionality)
4. **Logged to blockchain** (existing functionality)
5. **🆕 Hashes generated** (SHA256 of log + content)
6. **🆕 Stored in PostgreSQL** with all details
7. **🆕 Blockchain block recorded** in database
8. **Response returned** with processing time

## Hash-Based Integrity

Every log gets two hashes:

### Log Hash
- Generated from: `log_id + timestamp + source_ip + features`
- **Prevents duplicates** - Unique constraint
- **Ensures integrity** - Any change breaks the hash

### Content Hash  
- Generated from: `message content`
- **Detects tampering** - Message modification detected
- **Groups similar logs** - Same content = same hash

## Benefits

### 🔒 Security
- Permanent audit trail
- Hash-based integrity verification
- Tamper detection
- Complete forensic data

### 📊 Analytics
- Query historical data
- Trend analysis
- Attack pattern detection
- Performance metrics

### 🔍 Investigation
- Search by IP, attack type, severity
- Trace blockchain records
- Verify log integrity
- Track response actions

### ⚡ Performance
- Indexed queries (fast lookups)
- Connection pooling
- Efficient storage
- Scalable design

## Graceful Degradation

If PostgreSQL is not available:
- ✅ System continues to work
- ✅ Logs stored in memory
- ✅ Blockchain still works
- ⚠️ Warning displayed
- 💾 No permanent storage

## Next Steps

1. **Run setup**: `SETUP_DATABASE.bat`
2. **Start services**: `START_ALL.bat`
3. **Ingest test logs**: Use the simulator
4. **Check database**: `curl http://localhost:5000/database/stats`
5. **Query logs**: Use psql or pgAdmin

## Troubleshooting

### Database not connecting?
```bash
# Check PostgreSQL is running
# Windows: services.msc → look for postgresql

# Test connection
cd backend
.\venv\Scripts\activate
python -c "from database import test_connection; test_connection()"
```

### Need to reset database?
```bash
# Drop and recreate
psql -U postgres
DROP DATABASE surakshanet_logs;
\q

# Run setup again
python backend/init_database.py
```

## Documentation

- **Complete setup guide**: `DATABASE_SETUP.md`
- **Technical docs**: `backend/README_DATABASE.md`
- **This quick start**: `QUICK_START_DATABASE.md`

## Support

The system will show database status on startup:
```
💾 Database: ✅ Connected
```

Or if not available:
```
💾 Database: ⚠️  Not Available
⚠️  PostgreSQL not connected. Run 'python init_database.py' to set up database.
```

---

**Ready to go!** Run `SETUP_DATABASE.bat` to get started. 🚀
