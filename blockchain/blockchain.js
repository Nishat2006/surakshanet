const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// ==================== BLOCKCHAIN IMPLEMENTATION ====================

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce)
            .digest('hex');
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Mining difficulty
        this.pendingTransactions = [];
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), {
            log_id: "genesis",
            log_hash: "0000000000000000",
            severity: "SYSTEM",
            message: "Genesis Block - SurakshaNet Blockchain Initialized",
            logCount: 1
        }, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(logData) {
        const block = new Block(
            this.chain.length,
            Date.now(),
            logData,
            this.getLatestBlock().hash
        );
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        return block;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verify hash
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Verify chain linkage
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    getBlockByHash(hash) {
        return this.chain.find(block => block.hash === hash);
    }

    getBlockByLogId(logId) {
        return this.chain.find(block => block.data.log_id === logId);
    }

    getAllBlocks() {
        return this.chain.map(block => ({
            index: block.index,
            timestamp: block.timestamp,
            hash: block.hash,
            previousHash: block.previousHash,
            data: block.data,
            nonce: block.nonce
        }));
    }

    getRecentBlocks(count = 10) {
        return this.chain.slice(-count).reverse();
    }
}

// ==================== HELPER FUNCTIONS ====================

function prefillBlockchain(blockchain) {
    console.log('🔄 Pre-filling blockchain with demo blocks...');
    
    const demoLogCounts = [41, 23, 56, 19, 72, 33, 61];
    
    const demoAttacks = [
        {
            log_id: 'demo-001',
            severity: 'HIGH',
            source_ip: '192.168.1.100',
            attack_type: 'Port Scan',
            message: 'Suspicious port scanning activity detected from external IP'
        },
        {
            log_id: 'demo-002',
            severity: 'CRITICAL',
            source_ip: '10.0.0.45',
            attack_type: 'SQL Injection',
            message: 'SQL injection attempt detected in login form'
        },
        {
            log_id: 'demo-003',
            severity: 'MEDIUM',
            source_ip: '172.16.0.88',
            attack_type: 'Brute Force',
            message: 'Multiple failed login attempts detected'
        },
        {
            log_id: 'demo-004',
            severity: 'HIGH',
            source_ip: '203.0.113.42',
            attack_type: 'DDoS',
            message: 'Distributed denial of service attack detected'
        },
        {
            log_id: 'demo-005',
            severity: 'MEDIUM',
            source_ip: '198.51.100.23',
            attack_type: 'XSS Attack',
            message: 'Cross-site scripting attempt in user input field'
        },
        {
            log_id: 'demo-006',
            severity: 'LOW',
            source_ip: '192.0.2.15',
            attack_type: 'Unauthorized Access',
            message: 'Unauthorized access attempt to restricted resource'
        },
        {
            log_id: 'demo-007',
            severity: 'CRITICAL',
            source_ip: '198.18.0.99',
            attack_type: 'Malware Detection',
            message: 'Malicious payload detected in uploaded file'
        }
    ];

    demoAttacks.forEach((attack, i) => {
        const timestamp = Date.now() - (7 - i) * 3600000; // Stagger timestamps by 1 hour
        const logString = `${attack.log_id}|${timestamp}|${attack.source_ip}|${attack.severity}|${attack.attack_type}|${attack.message}`;
        const log_hash = crypto.createHash('sha256').update(logString).digest('hex');
        
        blockchain.addBlock({
            log_id: attack.log_id,
            log_hash: log_hash,
            severity: attack.severity,
            source_ip: attack.source_ip,
            attack_type: attack.attack_type,
            message: attack.message,
            timestamp: timestamp,
            logCount: demoLogCounts[i]
        });
        
        console.log(`   ✓ Added demo block ${i + 1}/7: ${attack.attack_type} (${attack.severity})`);
    });
    
    console.log('✅ Blockchain pre-filled with 7 demo blocks\n');
}

// ==================== EXPRESS API SERVER ====================

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize blockchain
const surakshaBlockchain = new Blockchain();

console.log('🔗 SurakshaNet Blockchain initialized');
console.log('⛏️  Mining difficulty:', surakshaBlockchain.difficulty);

// Pre-fill blockchain with demo blocks
prefillBlockchain(surakshaBlockchain);

// ==================== API ENDPOINTS ====================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        blockchainValid: surakshaBlockchain.isChainValid(),
        totalBlocks: surakshaBlockchain.chain.length,
        latestBlock: surakshaBlockchain.getLatestBlock().hash
    });
});

// Add new log to blockchain
app.post('/log', (req, res) => {
    try {
        const { log_id, severity, source_ip, attack_type, message, timestamp, log_count } = req.body;

        if (!log_id || !message) {
            return res.status(400).json({ error: 'Missing required fields: log_id, message' });
        }

        // Create hash of the log data
        const logString = `${log_id}|${timestamp}|${source_ip}|${severity}|${attack_type}|${message}`;
        const log_hash = crypto.createHash('sha256').update(logString).digest('hex');

        // Use log_count from request body, or generate random if not provided
        const logCount = log_count || Math.floor(Math.random() * (76 - 12 + 1)) + 12;

        // Add to blockchain
        const block = surakshaBlockchain.addBlock({
            log_id,
            log_hash,
            severity,
            source_ip,
            attack_type,
            message,
            timestamp,
            logCount
        });

        console.log(`✅ New block added: ${block.hash.substring(0, 16)}... for log ${log_id}`);

        res.json({
            success: true,
            block: {
                index: block.index,
                hash: block.hash,
                previousHash: block.previousHash,
                timestamp: block.timestamp,
                log_hash: log_hash,
                nonce: block.nonce
            },
            message: 'Log successfully added to blockchain'
        });

    } catch (error) {
        console.error('Error adding block:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all blocks
app.get('/blocks', (req, res) => {
    res.json({
        blocks: surakshaBlockchain.getAllBlocks(),
        totalBlocks: surakshaBlockchain.chain.length,
        isValid: surakshaBlockchain.isChainValid()
    });
});

// Get recent blocks
app.get('/blocks/recent', (req, res) => {
    const count = parseInt(req.query.count) || 10;
    res.json({
        blocks: surakshaBlockchain.getRecentBlocks(count),
        isValid: surakshaBlockchain.isChainValid()
    });
});

// Get block by hash
app.get('/block/hash/:hash', (req, res) => {
    const block = surakshaBlockchain.getBlockByHash(req.params.hash);
    if (block) {
        res.json({ block });
    } else {
        res.status(404).json({ error: 'Block not found' });
    }
});

// Get block by log ID
app.get('/block/log/:logId', (req, res) => {
    const block = surakshaBlockchain.getBlockByLogId(req.params.logId);
    if (block) {
        res.json({ block });
    } else {
        res.status(404).json({ error: 'Block not found' });
    }
});

// Verify blockchain integrity
app.get('/verify', (req, res) => {
    const isValid = surakshaBlockchain.isChainValid();
    res.json({
        valid: isValid,
        totalBlocks: surakshaBlockchain.chain.length,
        message: isValid ? 'Blockchain is valid' : 'Blockchain has been tampered with!'
    });
});

// Get blockchain statistics
app.get('/stats', (req, res) => {
    const blocks = surakshaBlockchain.chain;
    const severityCounts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
    };

    blocks.forEach(block => {
        if (block.data.severity && severityCounts.hasOwnProperty(block.data.severity)) {
            severityCounts[block.data.severity]++;
        }
    });

    res.json({
        totalBlocks: blocks.length,
        isValid: surakshaBlockchain.isChainValid(),
        severityDistribution: severityCounts,
        latestBlock: {
            index: blocks[blocks.length - 1].index,
            hash: blocks[blocks.length - 1].hash,
            timestamp: blocks[blocks.length - 1].timestamp
        }
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`\n🚀 SurakshaNet Blockchain Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   - POST /log - Add new log to blockchain`);
    console.log(`   - GET  /blocks - Get all blocks`);
    console.log(`   - GET  /blocks/recent?count=10 - Get recent blocks`);
    console.log(`   - GET  /verify - Verify blockchain integrity`);
    console.log(`   - GET  /stats - Get blockchain statistics`);
    console.log(`   - GET  /health - Health check\n`);
});
