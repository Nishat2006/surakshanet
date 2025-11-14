# SurakshaNet Database Integration

## Overview

The SurakshaNet backend now includes comprehensive PostgreSQL database integration for permanent log storage and advanced querying capabilities.

## What Gets Stored

Every log ingestion is recorded with:

### Core Log Data
- **Unique identifiers**: UUID and auto-increment ID
- **Timestamps**: Ingestion time and original log time
- **Network info**: Source IP, target IP, ports, protocol
- **Attack details**: Type, severity, message

### AI Analysis Results
- Attack probability score
- Isolation Forest anomaly score
- Autoencoder error score

### Blockchain Integration
- Whether logged to blockchain
- Block index and hash
- Previous block hash
- Blockchain timestamp

### Security & Integrity
- **Log hash**: SHA256 of complete log data (prevents duplicates)
- **Content hash**: SHA256 of message content
- Both hashes are indexed for fast lookups

### Response Tracking
- Whether automated response was triggered
- List of actions taken
- Processing time in milliseconds

### Complete Audit Trail
- Full raw request data stored as JSON
- Status tracking (processed/failed/pending)
- Error messages if any

## Architecture

```
┌─────────────────┐
│  Flask Backend  │
│                 │
│  /ingest        │──┐
│  endpoint       │  │
└─────────────────┘  │
                     │
                     ▼
         ┌──────────────────────┐
         │   db_logger.py       │
         │                      │
         │  - Generate hashes   │
         │  - Store to DB       │
         │  - Handle errors     │
         └──────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   database.py        │
         │                      │
         │  - SQLAlchemy ORM    │
         │  - Connection pool   │
         │  - Table definitions │
         └──────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   PostgreSQL         │
         │                      │
         │  - log_ingestions    │
         │  - blockchain_blocks │
         │  - system_metrics    │
         └──────────────────────┘
```

## Database Tables

### log_ingestions
Main table storing all log records with complete details, hashes, and metadata.

**Indexes:**
- `log_id` (unique)
- `log_hash` (unique) - prevents duplicate logs
- `blockchain_block_hash`
- `source_ip`
- `attack_type`
- `severity`
- `ingestion_timestamp`

### blockchain_blocks
Mirrors blockchain state for quick queries without hitting blockchain server.

**Indexes:**
- `block_index` (unique)
- `block_hash` (unique)
- `log_id`

### system_metrics
Stores periodic system performance metrics for monitoring.

## API Endpoints

### POST /ingest
Ingests a new log and stores it in database.

**Response includes:**
```json
{
  "log_id": "uuid",
  "message": "Log ingested successfully",
  "severity": "HIGH",
  "blockchain": true,
  "database": true,
  "processing_time_ms": 45.23
}
```

### GET /database/logs
Retrieve logs with pagination and filtering.

**Parameters:**
- `limit` (default: 100) - Number of logs to return
- `offset` (default: 0) - Pagination offset
- `severity` (optional) - Filter by severity

**Example:**
```
GET /database/logs?limit=50&severity=CRITICAL
```

### GET /database/logs/<log_id>
Get a specific log by its UUID.

**Returns:** Complete log record with all fields

### GET /database/stats
Get database statistics.

**Returns:**
```json
{
  "total_logs": 5432,
  "severity_breakdown": {
    "critical": 234,
    "high": 876,
    "medium": 2145,
    "low": 2177
  },
  "blockchain_logged": 5400,
  "blockchain_percentage": 99.4
}
```

### GET /database/search
Search logs with multiple filters.

**Parameters:**
- `source_ip` - Filter by source IP
- `attack_type` - Filter by attack type (partial match)
- `limit` - Maximum results

**Example:**
```
GET /database/search?source_ip=192.168.1.100&attack_type=DDoS
```

## Hash-Based Integrity

### Log Hash
Generated from: `log_id + timestamp + source_ip + features`

**Purpose:**
- Prevents duplicate log entries
- Ensures data integrity
- Enables quick duplicate detection

### Content Hash
Generated from: `message content`

**Purpose:**
- Detects message tampering
- Groups similar logs
- Enables content-based deduplication

## Usage Examples

### Python
```python
import requests

# Ingest a log
response = requests.post('http://localhost:5000/ingest', json={
    'source_ip': '192.168.1.100',
    'attack_type': 'DDoS Attack',
    'features': '80,1000,50,...',
    'timestamp': '2024-01-01T12:00:00Z'
})

log_id = response.json()['log_id']

# Retrieve the log
log = requests.get(f'http://localhost:5000/database/logs/{log_id}')
print(log.json())

# Get statistics
stats = requests.get('http://localhost:5000/database/stats')
print(stats.json())
```

### SQL Queries
```sql
-- Find all critical logs from last hour
SELECT * FROM log_ingestions 
WHERE severity = 'CRITICAL' 
  AND ingestion_timestamp > NOW() - INTERVAL '1 hour'
ORDER BY ingestion_timestamp DESC;

-- Get top attacking IPs
SELECT source_ip, COUNT(*) as attack_count 
FROM log_ingestions 
WHERE severity IN ('HIGH', 'CRITICAL')
GROUP BY source_ip 
ORDER BY attack_count DESC 
LIMIT 10;

-- Verify blockchain integrity
SELECT 
  l.log_id,
  l.blockchain_block_hash,
  b.block_hash,
  CASE 
    WHEN l.blockchain_block_hash = b.block_hash THEN 'Valid'
    ELSE 'Mismatch'
  END as integrity_status
FROM log_ingestions l
LEFT JOIN blockchain_blocks b ON l.log_id = b.log_id
WHERE l.blockchain_logged = true;

-- Average processing time by severity
SELECT 
  severity,
  AVG(processing_time_ms) as avg_ms,
  MIN(processing_time_ms) as min_ms,
  MAX(processing_time_ms) as max_ms
FROM log_ingestions
GROUP BY severity;
```

## Performance Considerations

### Connection Pooling
- Pool size: 10 connections
- Max overflow: 20 connections
- Pre-ping enabled for connection health checks

### Indexes
All frequently queried columns are indexed:
- Primary keys (auto-indexed)
- Foreign keys
- Search columns (IP, severity, attack_type)
- Hash columns for integrity checks

### Bulk Operations
For high-volume ingestion:
```python
from database import SessionLocal, LogIngestion

session = SessionLocal()
logs = [LogIngestion(...) for _ in range(1000)]
session.bulk_save_objects(logs)
session.commit()
```

## Error Handling

The system gracefully handles database failures:

1. **Database unavailable**: Falls back to in-memory storage
2. **Connection errors**: Logs warning, continues operation
3. **Constraint violations**: Catches duplicates, logs error
4. **Transaction failures**: Automatic rollback

## Monitoring

### Check Database Health
```python
from database import test_connection
if test_connection():
    print("Database is healthy")
```

### Monitor Logs
```python
from db_logger import db_logger

stats = db_logger.get_statistics()
print(f"Total logs: {stats['total_logs']}")
print(f"Blockchain coverage: {stats['blockchain_percentage']}%")
```

## Maintenance

### Regular Tasks

1. **Vacuum database** (weekly)
   ```sql
   VACUUM ANALYZE log_ingestions;
   ```

2. **Backup database** (daily)
   ```bash
   pg_dump -U surakshanet surakshanet_logs > backup_$(date +%Y%m%d).sql
   ```

3. **Archive old logs** (monthly)
   ```sql
   -- Move logs older than 6 months to archive table
   INSERT INTO log_ingestions_archive 
   SELECT * FROM log_ingestions 
   WHERE ingestion_timestamp < NOW() - INTERVAL '6 months';
   
   DELETE FROM log_ingestions 
   WHERE ingestion_timestamp < NOW() - INTERVAL '6 months';
   ```

## Security

### Best Practices

1. **Change default password** in production
2. **Use environment variables** for credentials
3. **Enable SSL** for database connections
4. **Restrict database access** to backend server only
5. **Regular security audits** of stored data

### Encryption

For sensitive data, consider:
```python
from cryptography.fernet import Fernet

# Encrypt sensitive fields before storing
key = Fernet.generate_key()
cipher = Fernet(key)
encrypted_ip = cipher.encrypt(source_ip.encode())
```

## Troubleshooting

### Database not connecting
```bash
# Check PostgreSQL is running
# Windows: services.msc → postgresql
# Linux: sudo systemctl status postgresql

# Test connection manually
python -c "from database import test_connection; test_connection()"
```

### Slow queries
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_custom ON log_ingestions(column_name);
```

### Disk space issues
```sql
-- Check table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

## Future Enhancements

Planned features:
- [ ] Time-series data aggregation
- [ ] Automated archival policies
- [ ] Real-time analytics views
- [ ] Machine learning on historical data
- [ ] Anomaly detection on query patterns
- [ ] Automated backup scheduling
- [ ] Multi-tenant support
- [ ] Data retention policies
