import { useState } from 'react'
import './NetworkCorrelation.css'

interface NetworkNode {
  id: string
  name: string
  type: 'firewall' | 'web-server' | 'mail-server' | 'database' | 'workstation'
  status: 'online' | 'offline' | 'warning'
  ip: string
  connections: number
  suspicious: number
  dataTransfer: string
  position: { x: number; y: number }
  recentActivity: {
    message: string
    time: string
    type: 'success' | 'warning' | 'error'
  }[]
}

const networkNodes: NetworkNode[] = [
  {
    id: 'firewall',
    name: 'Firewall',
    type: 'firewall',
    status: 'online',
    ip: '192.168.1.1',
    connections: 8,
    suspicious: 0,
    dataTransfer: '2.5 GB',
    position: { x: 5, y: 40 },
    recentActivity: [
      { message: 'Connection established', time: '2 minutes ago', type: 'success' },
      { message: 'Authentication successful', time: '10 minutes ago', type: 'success' }
    ]
  },
  {
    id: 'web-server',
    name: 'Web Server',
    type: 'web-server',
    status: 'online',
    ip: '192.168.161.25',
    connections: 5,
    suspicious: 1,
    dataTransfer: '7.1 GB',
    position: { x: 25, y: 15 },
    recentActivity: [
      { message: 'Connection established', time: '2 minutes ago', type: 'success' },
      { message: 'Suspicious data transfer', time: '5 minutes ago', type: 'error' },
      { message: 'Authentication successful', time: '10 minutes ago', type: 'success' }
    ]
  },
  {
    id: 'mail-server',
    name: 'Mail Server',
    type: 'mail-server',
    status: 'online',
    ip: '192.168.150.307',
    connections: 2,
    suspicious: 0,
    dataTransfer: '0.2 MB',
    position: { x: 25, y: 65 },
    recentActivity: [
      { message: 'Connection established', time: '2 minutes ago', type: 'success' },
      { message: 'Suspicious data transfer', time: '5 minutes ago', type: 'error' },
      { message: 'Authentication successful', time: '10 minutes ago', type: 'success' }
    ]
  },
  {
    id: 'database',
    name: 'Database',
    type: 'database',
    status: 'warning',
    ip: '192.168.155.75',
    connections: 1,
    suspicious: 0,
    dataTransfer: '0 B',
    position: { x: 45, y: 40 },
    recentActivity: [
      { message: 'Connection established', time: '2 minutes ago', type: 'success' },
      { message: 'Suspicious data transfer', time: '5 minutes ago', type: 'error' },
      { message: 'Authentication successful', time: '10 minutes ago', type: 'success' }
    ]
  },
  {
    id: 'workstation-1',
    name: 'Workstation',
    type: 'workstation',
    status: 'online',
    ip: '192.168.167.133',
    connections: 1,
    suspicious: 0,
    dataTransfer: '204 KB',
    position: { x: 65, y: 15 },
    recentActivity: [
      { message: 'Connection established', time: '2 minutes ago', type: 'success' },
      { message: 'Authentication successful', time: '10 minutes ago', type: 'success' }
    ]
  },
  {
    id: 'workstation-2',
    name: 'Workstation',
    type: 'workstation',
    status: 'online',
    ip: '192.168.167.134',
    connections: 1,
    suspicious: 0,
    dataTransfer: '156 KB',
    position: { x: 65, y: 65 },
    recentActivity: [
      { message: 'Connection established', time: '2 minutes ago', type: 'success' },
      { message: 'Authentication successful', time: '10 minutes ago', type: 'success' }
    ]
  }
]

const connections = [
  { from: 'firewall', to: 'web-server', type: 'normal' },
  { from: 'firewall', to: 'mail-server', type: 'normal' },
  { from: 'web-server', to: 'database', type: 'suspicious' },
  { from: 'mail-server', to: 'database', type: 'normal' },
  { from: 'database', to: 'workstation-1', type: 'normal' },
  { from: 'database', to: 'workstation-2', type: 'normal' }
]

function NetworkCorrelation() {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [activeTab, setActiveTab] = useState<'normal' | 'suspicious'>('normal')

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node)
  }

  const closeModal = () => {
    setSelectedNode(null)
  }

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      networkTopology: {
        totalNodes: networkNodes.length,
        totalConnections: connections.length,
        vulnerableConnections: connections.filter(c => c.type === 'suspicious').length
      },
      nodes: networkNodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        ip: node.ip,
        status: node.status,
        connections: node.connections,
        suspiciousActivity: node.suspicious,
        dataTransfer: node.dataTransfer,
        vulnerabilityLevel: node.status === 'warning' ? 'HIGH' : node.suspicious > 0 ? 'MEDIUM' : 'LOW'
      })),
      connections: connections.map(conn => {
        const fromNode = networkNodes.find(n => n.id === conn.from)
        const toNode = networkNodes.find(n => n.id === conn.to)
        return {
          from: {
            id: conn.from,
            name: fromNode?.name,
            ip: fromNode?.ip
          },
          to: {
            id: conn.to,
            name: toNode?.name,
            ip: toNode?.ip
          },
          type: conn.type,
          isVulnerable: conn.type === 'suspicious',
          vulnerabilityDetails: conn.type === 'suspicious' ? {
            severity: 'HIGH',
            description: 'Suspicious data transfer detected between nodes',
            recommendation: 'Investigate traffic patterns and implement additional monitoring'
          } : null
        }
      }),
      vulnerabilities: [
        {
          connection: 'Web Server → Database',
          severity: 'HIGH',
          description: 'Suspicious data transfer pattern detected',
          affectedNodes: ['192.168.161.25', '192.168.155.75'],
          actionsTaken: [
            'Increased monitoring on connection',
            'Logged suspicious activity',
            'Alerted security team',
            'Implemented rate limiting'
          ],
          recommendations: [
            'Review database access logs',
            'Verify web server integrity',
            'Update firewall rules',
            'Enable enhanced logging'
          ]
        },
        {
          connection: 'Database Server',
          severity: 'MEDIUM',
          description: 'Database server showing warning status',
          affectedNodes: ['192.168.155.75'],
          actionsTaken: [
            'System health check initiated',
            'Performance metrics collected',
            'Administrator notified'
          ],
          recommendations: [
            'Check system resources',
            'Review recent configuration changes',
            'Verify backup integrity'
          ]
        }
      ],
      summary: {
        totalVulnerabilities: 2,
        criticalIssues: 0,
        highSeverity: 1,
        mediumSeverity: 1,
        lowSeverity: 0,
        actionsTaken: 8,
        status: 'MONITORING'
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `network-correlation-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'online': return '#00ff88'
      case 'warning': return '#ffaa00'
      case 'offline': return '#ff4444'
      default: return '#4AF2C5'
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'firewall':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        )
      case 'web-server':
      case 'mail-server':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
            <line x1="6" y1="6" x2="6.01" y2="6"/>
            <line x1="6" y1="18" x2="6.01" y2="18"/>
          </svg>
        )
      case 'database':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        )
      case 'workstation':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        )
      default:
        return null
    }
  }

  const totalConnections = networkNodes.reduce((sum, node) => sum + node.connections, 0)
  const suspiciousConnections = networkNodes.reduce((sum, node) => sum + node.suspicious, 0)
  const activeNodes = networkNodes.filter(node => node.status === 'online').length

  return (
    <div className="network-correlation">
      <div className="network-header">
        <div>
          <h1>Cross-System Correlation</h1>
          <p>Network topology and correlation between stages</p>
        </div>
        <div className="header-buttons">
          <button className="export-btn" onClick={handleExport}>Export</button>
          <button className="refresh-btn" onClick={handleRefresh}>Refresh</button>
        </div>
      </div>

      {/* Network Topology */}
      <div className="topology-section">
        <h2>Network Topology</h2>
        <div className="topology-canvas">
          <svg className="connections-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {connections.map((conn, index) => {
              const fromNode = networkNodes.find(n => n.id === conn.from)
              const toNode = networkNodes.find(n => n.id === conn.to)
              if (!fromNode || !toNode) return null

              // Calculate center of each node
              const x1 = fromNode.position.x + 7.5  // half of node width in percentage
              const y1 = fromNode.position.y + 10   // half of node height in percentage
              const x2 = toNode.position.x + 7.5
              const y2 = toNode.position.y + 10

              return (
                <g key={index}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className={`connection-line ${conn.type}`}
                    strokeDasharray="5,5"
                  />
                  <circle
                    className={`connection-dot ${conn.type}`}
                    r="3"
                  >
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={`M ${x1} ${y1} L ${x2} ${y2}`}
                    />
                  </circle>
                </g>
              )
            })}
          </svg>

          {networkNodes.map((node) => (
            <div
              key={node.id}
              className={`network-node ${node.status}`}
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                borderColor: getNodeColor(node.status)
              }}
              onClick={() => handleNodeClick(node)}
            >
              <div className="node-icon" style={{ color: getNodeColor(node.status) }}>
                {getNodeIcon(node.type)}
              </div>
              <div className="node-name">{node.name}</div>
              <div className="node-status" style={{ background: getNodeColor(node.status) }}>
                {node.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="correlation-tabs">
        <button
          className={`tab-btn ${activeTab === 'normal' ? 'active' : ''}`}
          onClick={() => setActiveTab('normal')}
        >
          Normal Connection
        </button>
        <button
          className={`tab-btn ${activeTab === 'suspicious' ? 'active' : ''}`}
          onClick={() => setActiveTab('suspicious')}
        >
          Suspicious Connection
        </button>
      </div>

      {/* Connection Analysis */}
      <div className="analysis-grid">
        <div className="analysis-card">
          <h3>Total Connections</h3>
          <div className="analysis-value">{totalConnections}</div>
        </div>
        <div className="analysis-card suspicious">
          <h3>Suspicious</h3>
          <div className="analysis-value">{suspiciousConnections}</div>
        </div>
        <div className="analysis-card success">
          <h3>Data Transfer</h3>
          <div className="analysis-value">204.52 MB</div>
        </div>
      </div>

      {/* Threat Intelligence */}
      <div className="threat-intelligence">
        <h3>Threat Intelligence</h3>
        <div className="threat-message">
          This node has been flagged for unusual network behavior. Recommend immediate investigation of outbound connections and recent authentication attempts.
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="bottom-stats">
        <div className="stat-box">
          <h4>Total Connections</h4>
          <div className="stat-value">{totalConnections}</div>
        </div>
        <div className="stat-box">
          <h4>Suspicious Connections</h4>
          <div className="stat-value">{suspiciousConnections}</div>
        </div>
        <div className="stat-box">
          <h4>Active Nodes</h4>
          <div className="stat-value">{activeNodes}</div>
        </div>
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="node-modal-backdrop" onClick={closeModal}>
          <div className="node-modal" onClick={(e) => e.stopPropagation()}>
            <div className="node-modal-header">
              <h2>{selectedNode.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="node-modal-body">
              <div className="modal-section">
                <h3>System Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Node ID</label>
                    <div className="info-value">{selectedNode.id}</div>
                  </div>
                  <div className="info-item">
                    <label>Type</label>
                    <div className="info-value">{selectedNode.type}</div>
                  </div>
                  <div className="info-item">
                    <label>IP Address</label>
                    <div className="info-value ip-address">{selectedNode.ip}</div>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span className="status-badge" style={{ background: getNodeColor(selectedNode.status) }}>
                      {selectedNode.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {selectedNode.recentActivity.map((activity, index) => (
                    <div key={index} className={`activity-item ${activity.type}`}>
                      <div className="activity-message">{activity.message}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>Connection Analysis</h3>
                <div className="analysis-grid-modal">
                  <div className="analysis-card-modal">
                    <h4>Total Connections</h4>
                    <div className="analysis-value-modal">{selectedNode.connections}</div>
                  </div>
                  <div className="analysis-card-modal suspicious">
                    <h4>Suspicious</h4>
                    <div className="analysis-value-modal">{selectedNode.suspicious}</div>
                  </div>
                  <div className="analysis-card-modal success">
                    <h4>Data Transfer</h4>
                    <div className="analysis-value-modal">{selectedNode.dataTransfer}</div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Threat Intelligence</h3>
                <div className="threat-message-modal">
                  This node has been flagged for unusual network behavior. Recommend immediate investigation of outbound connections and recent authentication attempts.
                </div>
              </div>

              <div className="modal-section">
                <div className="bottom-stats-modal">
                  <div className="stat-box-modal">
                    <h4>Total Connections</h4>
                    <div className="stat-value-modal">{selectedNode.connections}</div>
                  </div>
                  <div className="stat-box-modal">
                    <h4>Suspicious Connections</h4>
                    <div className="stat-value-modal">{selectedNode.suspicious}</div>
                  </div>
                  <div className="stat-box-modal">
                    <h4>Active Nodes</h4>
                    <div className="stat-value-modal">{activeNodes}</div>
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

export default NetworkCorrelation
