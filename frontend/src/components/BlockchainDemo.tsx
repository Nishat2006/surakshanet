import { useState, useEffect } from 'react'
import axios from 'axios'
import './BlockchainDemo.css'

const BLOCKCHAIN_URL = "http://localhost:3001"
const BACKEND_URL = "http://127.0.0.1:5000"

interface Block {
  index: number
  timestamp: number
  hash: string
  previousHash: string
  data: {
    log_id: string
    log_hash: string
    severity: string
    source_ip: string
    attack_type: string
    message: string
    logCount: number
  }
  nonce: number
}

interface BlockchainStats {
  totalBlocks: number
  isValid: boolean
  severityDistribution: {
    CRITICAL: number
    HIGH: number
    MEDIUM: number
    LOW: number
  }
}

function BlockchainDemo() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [stats, setStats] = useState<BlockchainStats | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<string | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [processSteps, setProcessSteps] = useState<string[]>([])
  const [showProcess, setShowProcess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    fetchBlockchainData()
    const interval = setInterval(fetchBlockchainData, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchBlockchainData = async () => {
    try {
      const [blocksRes, statsRes] = await Promise.all([
        axios.get(`${BLOCKCHAIN_URL}/blocks/recent?count=10`),
        axios.get(`${BLOCKCHAIN_URL}/stats`)
      ])
      setBlocks(blocksRes.data.blocks)
      setStats(statsRes.data)
    } catch (error) {
      console.error("Error fetching blockchain data:", error)
    }
  }

  const simulateAttack = async () => {
    setIsSimulating(true)
    setShowProcess(true)
    setProcessSteps([])
    setCurrentStep(0)

    const attackTypes = [
      'Brute Force Attack',
      'SQL Injection',
      'DDoS Attack',
      'Port Scan',
      'Malware Detection'
    ]
    const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)]
    const sourceIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    
    const fakeLog = {
      timestamp: new Date().toISOString(),
      source_ip: sourceIp,
      attack_type: randomAttack,
      features: "443,141385,9,7,568,320,385,0,240.5,142,88,0,0,51.8,17296.5,567,141385,0,141385,17296.5,567,141385,0,6,17337.3,346,141385,0,296,240,14.5,14.5,0,385,183.5,187.9,35306.9,0,0,1,183.5,9,88,5,184,443,30.3,56.9,23.1,45.8,51.8,17296.5"
    }

    // Step 1: Detect Attack
    await new Promise(resolve => setTimeout(resolve, 800))
    setProcessSteps(prev => [...prev, `🚨 Attack Detected: ${randomAttack} from ${sourceIp}`])
    setCurrentStep(1)

    // Step 2: AI Processing
    await new Promise(resolve => setTimeout(resolve, 1200))
    setProcessSteps(prev => [...prev, '🤖 AI Models Processing: Isolation Forest, XGBoost, Autoencoder'])
    setCurrentStep(2)

    // Step 3: Severity Analysis
    await new Promise(resolve => setTimeout(resolve, 1000))
    const severities = ['HIGH', 'CRITICAL', 'MEDIUM']
    const severity = severities[Math.floor(Math.random() * severities.length)]
    setProcessSteps(prev => [...prev, `⚠️ Threat Severity Determined: ${severity} (Confidence: ${(Math.random() * 0.3 + 0.7).toFixed(2)})`])
    setCurrentStep(3)

    try {
      // Step 4: Generate Hash
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockHash = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      setProcessSteps(prev => [...prev, `🔐 SHA-256 Hash Generated: ${mockHash.substring(0, 16)}...`])
      setCurrentStep(4)

      // Step 5: Send to Backend
      await new Promise(resolve => setTimeout(resolve, 600))
      setProcessSteps(prev => [...prev, '📡 Sending to Backend API...'])
      setCurrentStep(5)

      await axios.post(`${BACKEND_URL}/ingest`, fakeLog)

      // Step 6: Blockchain Logging
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProcessSteps(prev => [...prev, '⛏️ Mining Block with Proof of Work...'])
      setCurrentStep(6)

      await new Promise(resolve => setTimeout(resolve, 1200))
      setProcessSteps(prev => [...prev, '🔗 Block Added to Blockchain Successfully'])
      setCurrentStep(7)

      // Step 7: Admin Notification
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessSteps(prev => [...prev, `📧 Admin Notification Sent: ${severity} threat detected`])
      setCurrentStep(8)

      // Step 8: Security Alert
      await new Promise(resolve => setTimeout(resolve, 600))
      setProcessSteps(prev => [...prev, '🚨 Security Team Alerted - Incident Response Initiated'])
      setCurrentStep(9)

      // Step 9: Complete
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessSteps(prev => [...prev, '✅ Process Complete - Threat Logged Immutably'])
      setCurrentStep(10)

      // Refresh blockchain data
      await new Promise(resolve => setTimeout(resolve, 1000))
      fetchBlockchainData()
      
    } catch (error) {
      console.error("Error simulating attack:", error)
      setProcessSteps(prev => [...prev, '❌ Error occurred during simulation'])
    } finally {
      setIsSimulating(false)
      // Auto-hide process after 10 seconds
      setTimeout(() => setShowProcess(false), 10000)
    }
  }

  const verifyBlockchain = async () => {
    setVerifying(true)
    try {
      const response = await axios.get(`${BLOCKCHAIN_URL}/verify`)
      setVerificationResult(response.data.valid ? 'VALID' : 'INVALID')
      setTimeout(() => setVerificationResult(null), 5000)
    } catch (error) {
      console.error("Error verifying blockchain:", error)
      setVerificationResult('ERROR')
    } finally {
      setVerifying(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ff4444'
      case 'HIGH': return '#ff6600'
      case 'MEDIUM': return '#ffaa00'
      case 'LOW': return '#00ff88'
      default: return '#00d4ff'
    }
  }

  return (
    <div className="blockchain-demo">
      <div className="demo-header">
        <h1>🔗 Blockchain Verification Demo</h1>
        <p>Real-time threat detection with immutable blockchain logging</p>
      </div>

      {/* Process Visualization */}
      {showProcess && (
        <div className="process-container">
          <div className="process-header">
            <h2>🔄 Attack Processing Pipeline</h2>
            <button className="close-process-btn" onClick={() => setShowProcess(false)}>×</button>
          </div>
          <div className="process-steps">
            {processSteps.map((step, index) => (
              <div 
                key={index} 
                className={`process-step ${index === currentStep - 1 ? 'active' : index < currentStep - 1 ? 'completed' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="step-icon">
                  {index < currentStep - 1 ? '✓' : index === currentStep - 1 ? '⚡' : '○'}
                </div>
                <div className="step-content">{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-card">
          <h3>🎯 Attack Simulator</h3>
          <p>Simulate a cyber attack and watch it get logged to the blockchain</p>
          <button 
            onClick={simulateAttack} 
            disabled={isSimulating}
            className="btn-simulate"
          >
            {isSimulating ? '⚡ Simulating...' : '🚀 Launch Brute Force Attack'}
          </button>
        </div>

        <div className="control-card">
          <h3>✅ Blockchain Verification</h3>
          <p>Verify the integrity of the entire blockchain</p>
          <button 
            onClick={verifyBlockchain} 
            disabled={verifying}
            className="btn-verify"
          >
            {verifying ? '🔍 Verifying...' : '🔐 Verify Chain'}
          </button>
          {verificationResult && (
            <div className={`verification-result ${verificationResult.toLowerCase()}`}>
              {verificationResult === 'VALID' ? '✅ Blockchain is Valid!' : 
               verificationResult === 'INVALID' ? '❌ Blockchain Tampered!' : 
               '⚠️ Verification Error'}
            </div>
          )}
        </div>

        {stats && (
          <div className="control-card stats-card">
            <h3>📊 Blockchain Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Blocks</span>
                <span className="stat-value">{stats.totalBlocks}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className={`stat-value ${stats.isValid ? 'valid' : 'invalid'}`}>
                  {stats.isValid ? '✅ Valid' : '❌ Invalid'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Critical</span>
                <span className="stat-value critical">{stats.severityDistribution.CRITICAL}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">High</span>
                <span className="stat-value high">{stats.severityDistribution.HIGH}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blockchain Visualization */}
      <div className="blockchain-container">
        <h2>🔗 Recent Blocks</h2>
        <div className="blocks-list">
          {blocks.map((block, index) => (
            <div 
              key={block.index} 
              className="block-card"
              onClick={() => setSelectedBlock(block)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="block-header">
                <span className="block-number">Block #{block.index}</span>
                <span 
                  className="block-severity"
                  style={{ background: getSeverityColor(block.data.severity) }}
                >
                  {block.data.severity}
                </span>
              </div>
              
              <div className="block-content">
                <div className="block-field">
                  <span className="field-label">Hash:</span>
                  <span className="field-value hash">{block.hash.substring(0, 16)}...</span>
                </div>
                <div className="block-field">
                  <span className="field-label">Previous:</span>
                  <span className="field-value hash">{block.previousHash.substring(0, 16)}...</span>
                </div>
                <div className="block-field">
                  <span className="field-label">Attack Type:</span>
                  <span className="field-value">{block.data.attack_type}</span>
                </div>
                <div className="block-field">
                  <span className="field-label">Source IP:</span>
                  <span className="field-value">{block.data.source_ip}</span>
                </div>
                <div className="block-field">
                  <span className="field-label">Timestamp:</span>
                  <span className="field-value">{formatTimestamp(block.timestamp)}</span>
                </div>
                <div className="block-field">
                  <span className="field-label">Nonce:</span>
                  <span className="field-value">{block.nonce}</span>
                </div>
              </div>

              <div className="block-chain-link">
                {index < blocks.length - 1 && <div className="chain-arrow">⬇️</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Block Details Modal */}
      {selectedBlock && (
        <div className="modal-backdrop" onClick={() => setSelectedBlock(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Block #{selectedBlock.index} Details</h2>
              <button className="close-btn" onClick={() => setSelectedBlock(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Block Information</h3>
                <div className="detail-item">
                  <span>Index:</span>
                  <span>{selectedBlock.index}</span>
                </div>
                <div className="detail-item">
                  <span>Timestamp:</span>
                  <span>{formatTimestamp(selectedBlock.timestamp)}</span>
                </div>
                <div className="detail-item">
                  <span>Nonce:</span>
                  <span>{selectedBlock.nonce}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Hashes</h3>
                <div className="detail-item">
                  <span>Block Hash:</span>
                  <span className="hash-full">{selectedBlock.hash}</span>
                </div>
                <div className="detail-item">
                  <span>Previous Hash:</span>
                  <span className="hash-full">{selectedBlock.previousHash}</span>
                </div>
                <div className="detail-item">
                  <span>Log Hash:</span>
                  <span className="hash-full">{selectedBlock.data.log_hash}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Threat Data</h3>
                <div className="detail-item">
                  <span>Log ID:</span>
                  <span>{selectedBlock.data.log_id}</span>
                </div>
                <div className="detail-item">
                  <span>Severity:</span>
                  <span style={{ color: getSeverityColor(selectedBlock.data.severity) }}>
                    {selectedBlock.data.severity}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Attack Type:</span>
                  <span>{selectedBlock.data.attack_type}</span>
                </div>
                <div className="detail-item">
                  <span>Source IP:</span>
                  <span>{selectedBlock.data.source_ip}</span>
                </div>
                <div className="detail-item full-width">
                  <span>Message:</span>
                  <span>{selectedBlock.data.message}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlockchainDemo
