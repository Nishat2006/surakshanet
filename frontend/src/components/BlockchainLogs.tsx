import { useState } from 'react'
import './BlockchainLogs.css'

interface Block {
  id: number
  hash: string
  previousHash: string
  timestamp: string
  logCount: number
  verified: boolean
  logs: string[]
}

interface BlockLog {
  blockNumber: number
  hash: string
  previousHash: string
  timestamp: string
  logCount: number
  status: 'Verified' | 'Pending'
  action: string
}

const generateHash = (length: number = 16): string => {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < length; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

const generateBlocks = (): Block[] => {
  const blocks: Block[] = []
  const now = new Date()
  
  for (let i = 0; i < 8; i++) {
    const timestamp = new Date(now.getTime() - (7 - i) * 3600000)
    const logCount = Math.floor(Math.random() * 100) + 50
    const verified = Math.random() > 0.2 // 80% verified
    
    blocks.push({
      id: i,
      hash: generateHash(12),
      previousHash: i === 0 ? '0x000000000000000' : blocks[i - 1].hash,
      timestamp: timestamp.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      logCount,
      verified,
      logs: [
        '[2025-10-16T15:20:54.795Z] Log entry #1 - Suspicious activity detected',
        '[2025-10-16T15:19:54.795Z] Log entry #2 - Suspicious activity detected',
        '[2025-10-16T15:18:54.795Z] Log entry #3 - Suspicious activity detected'
      ]
    })
  }
  
  return blocks
}

const generateBlockLogs = (): BlockLog[] => {
  const logs: BlockLog[] = []
  const now = new Date()
  
  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now.getTime() - i * 3600000)
    logs.push({
      blockNumber: i,
      hash: generateHash(12),
      previousHash: generateHash(12),
      timestamp: timestamp.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      logCount: Math.floor(Math.random() * 100) + 20,
      status: Math.random() > 0.15 ? 'Verified' : 'Pending',
      action: 'View'
    })
  }
  
  return logs
}

function BlockchainLogs() {
  const [blocks] = useState<Block[]>(generateBlocks())
  const [blockLogs] = useState<BlockLog[]>(generateBlockLogs())
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block)
  }

  const closeModal = () => {
    setSelectedBlock(null)
  }

  const handleViewLog = (blockNumber: number) => {
    const block = blocks.find(b => b.id === blockNumber)
    if (block) {
      setSelectedBlock(block)
    }
  }

  const totalBlocks = blocks.length
  const verifiedBlocks = blocks.filter(b => b.verified).length
  const totalLogs = blocks.reduce((sum, b) => sum + b.logCount, 0)

  return (
    <div className="blockchain-logs">
      <div className="blockchain-header">
        <div>
          <h1>Blockchain Log Verification</h1>
          <p>Immutable audit trail with cryptographic verification</p>
        </div>
        <button className="system-online-btn">
          <span className="status-dot"></span>
          System Online
        </button>
      </div>

      {/* Stats Cards */}
      <div className="blockchain-stats">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18"/>
              <path d="M9 21V9"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Blocks</div>
            <div className="stat-value">{totalBlocks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Verified</div>
            <div className="stat-value">{verifiedBlocks}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Logs</div>
            <div className="stat-value">{totalLogs}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Latest Block</div>
            <div className="stat-value">Just now</div>
          </div>
        </div>
      </div>

      {/* Blockchain Visualization */}
      <div className="blockchain-visualization-section">
        <h2>Blockchain Chain Visualization</h2>
        <div className="blockchain-chain">
          {blocks.map((block, index) => (
            <div key={block.id} className="block-wrapper">
              <div
                className={`blockchain-block ${block.verified ? 'verified' : 'pending'} ${hoveredBlock === block.id ? 'hovered' : ''}`}
                onClick={() => handleBlockClick(block)}
                onMouseEnter={() => setHoveredBlock(block.id)}
                onMouseLeave={() => setHoveredBlock(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="block-header">
                  <span className="block-number"># Block {block.id}</span>
                </div>
                <div className="block-hash">{block.hash.substring(0, 12)}...</div>
                <div className="block-footer">
                  <span className="block-logs">{block.logCount} logs</span>
                  <button 
                    className="block-verify-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBlockClick(block)
                    }}
                    title="View Block Details"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              {index < blocks.length - 1 && (
                <div className="block-connector">
                  <svg viewBox="0 0 40 20" preserveAspectRatio="none">
                    <line x1="0" y1="10" x2="40" y2="10" stroke="#00d4ff" strokeWidth="2" strokeDasharray="5,5">
                      <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
                    </line>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain Audit Trail Table */}
      <div className="audit-trail-section">
        <h2>Blockchain Audit Trail</h2>
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Block Number</th>
                <th>Hash</th>
                <th>Previous Hash</th>
                <th>Timestamp</th>
                <th>Log Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockLogs.map((log, index) => (
                <tr 
                  key={index}
                  className="audit-row"
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <td className="block-num">Block {log.blockNumber}</td>
                  <td className="hash-col">{log.hash}</td>
                  <td className="hash-col">{log.previousHash}</td>
                  <td className="timestamp-col">{log.timestamp}</td>
                  <td className="count-col">{log.logCount}</td>
                  <td>
                    <span className={`status-badge ${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn"
                      onClick={() => handleViewLog(log.blockNumber)}
                    >
                      {log.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Details Modal */}
      {selectedBlock && (
        <div className="block-modal-backdrop" onClick={closeModal}>
          <div className="block-modal" onClick={(e) => e.stopPropagation()}>
            <div className="block-modal-header">
              <h2>Block Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="block-modal-body">
              <div className="block-title">block-{selectedBlock.id}</div>

              <div className="hash-grid">
                <div className="hash-box">
                  <label>Block Hash</label>
                  <div className="hash-value">{selectedBlock.hash}</div>
                </div>
                <div className="hash-box">
                  <label>Previous Hash</label>
                  <div className="hash-value prev-hash">{selectedBlock.previousHash}</div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-box">
                  <label>Timestamp</label>
                  <div className="info-value">{selectedBlock.timestamp}</div>
                </div>
                <div className="info-box">
                  <label>Log Count</label>
                  <div className="info-value">{selectedBlock.logCount}</div>
                </div>
                <div className="info-box">
                  <label>Verification Status</label>
                  <span className={`verification-badge ${selectedBlock.verified ? 'verified' : 'failed'}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {selectedBlock.verified ? (
                        <polyline points="20 6 9 17 4 12"/>
                      ) : (
                        <>
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </>
                      )}
                    </svg>
                    {selectedBlock.verified ? 'Verified' : 'Verification Failed'}
                  </span>
                </div>
              </div>

              <div className="crypto-verification">
                <div className="crypto-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Cryptographic Verification</span>
                </div>
                <div className="crypto-details">
                  <div className="crypto-item">
                    <span className="crypto-label">Hash Algorithm</span>
                    <span className="crypto-value">SHA-256</span>
                  </div>
                  <div className="crypto-item">
                    <span className="crypto-label">Chain Integrity</span>
                    <span className="crypto-badge valid">Valid</span>
                  </div>
                  <div className="crypto-item">
                    <span className="crypto-label">Consensus</span>
                    <span className="crypto-badge confirmed">Confirmed</span>
                  </div>
                </div>
              </div>

              <div className="contained-logs">
                <h3>Contained Logs (Sample)</h3>
                <div className="logs-list">
                  {selectedBlock.logs.map((log, index) => (
                    <div key={index} className="log-entry">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlockchainLogs
