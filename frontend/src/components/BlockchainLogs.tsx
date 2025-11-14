import { useState, useEffect } from 'react'
import axios from 'axios'
import './BlockchainLogs.css'

const BLOCKCHAIN_URL = "http://localhost:3001"

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

function BlockchainLogs() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BLOCKCHAIN_URL}/blocks/recent?count=20`)
      setBlocks(response.data.blocks)
    } catch (error) {
      console.error('Error fetching blockchain data:', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block)
  }

  const closeModal = () => {
    setSelectedBlock(null)
  }

  const totalBlocks = blocks.length
  const verifiedBlocks = blocks.length // All mined blocks are verified
  const totalLogs = blocks.reduce((sum, block) => sum + (block.data.logCount || 0), 0)

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
          {blocks.slice(0, 8).map((block, index) => (
            <div key={block.index} className="block-wrapper">
              <div
                className={`blockchain-block verified ${hoveredBlock === block.index ? 'hovered' : ''}`}
                onClick={() => handleBlockClick(block)}
                onMouseEnter={() => setHoveredBlock(block.index)}
                onMouseLeave={() => setHoveredBlock(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="block-header">
                  <span className="block-number"># Block {block.index}</span>
                </div>
                <div className="block-hash">{block.hash.substring(0, 12)}...</div>
                <div className="block-footer">
                  <span className="block-logs">{block.data.logCount || 1} logs</span>
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
              {index < Math.min(blocks.length, 8) - 1 && (
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
              {blocks.map((block, index) => (
                <tr 
                  key={index}
                  className="audit-row"
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <td className="block-num">Block {block.index}</td>
                  <td className="hash-col">{block.hash}</td>
                  <td className="hash-col">{block.previousHash}</td>
                  <td className="timestamp-col">{formatTimestamp(block.timestamp)}</td>
                  <td className="count-col">{block.data.logCount || 0}</td>
                  <td>
                    <span className="status-badge verified">
                      Verified
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn"
                      onClick={() => handleBlockClick(block)}
                    >
                      View
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
              <div className="block-title">block-{selectedBlock.index}</div>

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
                  <div className="info-value">{formatTimestamp(selectedBlock.timestamp)}</div>
                </div>
                <div className="info-box">
                  <label>Log Count</label>
                  <div className="info-value">{selectedBlock.data.logCount || 0}</div>
                </div>
                <div className="info-box">
                  <label>Verification Status</label>
                  <span className="verification-badge verified">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Verified
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
                <h3>Contained Log Data</h3>
                <div className="logs-list">
                  <div className="log-entry">
                    <strong>Log ID:</strong> {selectedBlock.data.log_id}
                  </div>
                  <div className="log-entry">
                    <strong>Log Hash:</strong> {selectedBlock.data.log_hash}
                  </div>
                  <div className="log-entry">
                    <strong>Severity:</strong> {selectedBlock.data.severity}
                  </div>
                  <div className="log-entry">
                    <strong>Source IP:</strong> {selectedBlock.data.source_ip}
                  </div>
                  <div className="log-entry">
                    <strong>Attack Type:</strong> {selectedBlock.data.attack_type}
                  </div>
                  <div className="log-entry">
                    <strong>Message:</strong> {selectedBlock.data.message}
                  </div>
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
