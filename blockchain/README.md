# SurakshaNet Blockchain

Node.js-based blockchain implementation for immutable threat detection logging.

## Features

- ✅ **Proof of Work** - Mining with configurable difficulty
- ✅ **SHA-256 Hashing** - Cryptographic security
- ✅ **Chain Validation** - Verify blockchain integrity
- ✅ **RESTful API** - Easy integration with backend
- ✅ **Real-time Logging** - Instant threat log storage

## Installation

```bash
cd blockchain
npm install
```

## Running the Blockchain Server

```bash
npm start
```

The blockchain server will start on `http://localhost:3001`

## API Endpoints

### POST /log
Add a new threat log to the blockchain

**Request Body:**
```json
{
  "log_id": "uuid",
  "severity": "HIGH",
  "source_ip": "192.168.1.100",
  "attack_type": "Brute Force",
  "message": "Attack detected",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "block": {
    "index": 5,
    "hash": "0012abc...",
    "previousHash": "0034def...",
    "timestamp": 1704110400000,
    "log_hash": "sha256hash...",
    "nonce": 1234
  }
}
```

### GET /blocks
Get all blocks in the blockchain

### GET /blocks/recent?count=10
Get recent blocks (default: 10)

### GET /verify
Verify blockchain integrity

**Response:**
```json
{
  "valid": true,
  "totalBlocks": 15,
  "message": "Blockchain is valid"
}
```

### GET /stats
Get blockchain statistics

**Response:**
```json
{
  "totalBlocks": 15,
  "isValid": true,
  "severityDistribution": {
    "CRITICAL": 2,
    "HIGH": 5,
    "MEDIUM": 6,
    "LOW": 2
  }
}
```

### GET /health
Health check endpoint

## How It Works

1. **Block Creation**: Each threat log creates a new block
2. **Hashing**: Block data is hashed using SHA-256
3. **Mining**: Proof of Work algorithm finds valid hash
4. **Chain Linking**: Each block references previous block's hash
5. **Verification**: Chain integrity can be verified at any time

## Integration with Backend

The Flask backend (`app_nodejs_blockchain.py`) automatically logs threats to this blockchain server when severity is HIGH or CRITICAL.

## Demo Panel

Access the interactive demo at: `http://localhost:5173` → Blockchain Demo

Features:
- 🚀 Simulate cyber attacks
- ✅ Verify blockchain integrity
- 📊 View real-time statistics
- 🔍 Inspect individual blocks
