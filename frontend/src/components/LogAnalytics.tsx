import { useState, useEffect } from 'react'
import './LogAnalytics.css'

interface LogEntry {
  id: string
  timestamp: string
  type: string
  source: string
  user: string
  ipAddress: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  rawData?: any
}

const logTypes = ['All Types', 'Authentication', 'Network', 'Process', 'File', 'Registry']
const severities = ['All Severities', 'Critical', 'High', 'Medium', 'Low']

const generateLogs = (): LogEntry[] => {
  const types = ['NETWORK', 'PROCESS', 'AUTHENTICATION', 'FILE', 'REGISTRY']
  const sources = ['web-server-01', 'mail-server-01', 'db-server-01', 'dns-server-01', 'app-server-01']
  const users = ['admin', 'root', 'john', 'jane', 'system', 'guest']
  const severityLevels: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const messages = [
    'Suspicious activity detected',
    'Unauthorized access attempt',
    'Failed login attempt',
    'Port scan detected',
    'Malware signature detected',
    'Privilege escalation detected',
    'Data exfiltration attempt',
    'Brute force attack detected',
    'SQL injection attempt',
    'Cross-site scripting detected'
  ]

  const logs: LogEntry[] = []
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    const message = messages[Math.floor(Math.random() * messages.length)]
    
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))
    date.setSeconds(Math.floor(Math.random() * 60))
    
    const log: LogEntry = {
      id: `log-${1000 + i}`,
      timestamp: date.toLocaleString('en-US', { 
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      type,
      source,
      user,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      severity,
      message: `${message}: ${Math.random().toString(36).substring(7)}`,
      rawData: {
        id: `log-${1000 + i}`,
        timestamp: date.toISOString(),
        type,
        source,
        user,
        severity,
        message: `${message}: ${Math.random().toString(36).substring(7)}`,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      }
    }
    logs.push(log)
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function LogAnalytics() {
  const [logs] = useState<LogEntry[]>(generateLogs())
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(logs)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [severityFilter, setSeverityFilter] = useState('All Severities')
  const [showingCount, setShowingCount] = useState(50)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [severityDropdownOpen, setSeverityDropdownOpen] = useState(false)

  useEffect(() => {
    let filtered = logs

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (typeFilter !== 'All Types') {
      filtered = filtered.filter(log => 
        log.type.toLowerCase() === typeFilter.toLowerCase()
      )
    }

    // Apply severity filter
    if (severityFilter !== 'All Severities') {
      filtered = filtered.filter(log => 
        log.severity.toLowerCase() === severityFilter.toLowerCase()
      )
    }

    setFilteredLogs(filtered)
  }, [searchQuery, typeFilter, severityFilter, logs])

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log)
  }

  const closeModal = () => {
    setSelectedLog(null)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ff4444'
      case 'HIGH': return '#ff6600'
      case 'MEDIUM': return '#ffaa00'
      case 'LOW': return '#00ff88'
      default: return '#4AF2C5'
    }
  }

  return (
    <div className="log-analytics">
      <div className="log-header">
        <h1>Log Analytics</h1>
        <p>Track, filter, and analyze system logs</p>
      </div>

      {/* Search and Filters */}
      <div className="log-controls">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-dropdown">
            <button 
              className="filter-btn"
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
            >
              {typeFilter}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {typeDropdownOpen && (
              <div className="dropdown-menu">
                {logTypes.map(type => (
                  <div 
                    key={type}
                    className={`dropdown-item ${typeFilter === type ? 'active' : ''}`}
                    onClick={() => {
                      setTypeFilter(type)
                      setTypeDropdownOpen(false)
                    }}
                  >
                    {type}
                    {typeFilter === type && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown">
            <button 
              className="filter-btn"
              onClick={() => setSeverityDropdownOpen(!severityDropdownOpen)}
            >
              {severityFilter}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {severityDropdownOpen && (
              <div className="dropdown-menu">
                {severities.map(severity => (
                  <div 
                    key={severity}
                    className={`dropdown-item ${severityFilter === severity ? 'active' : ''}`}
                    onClick={() => {
                      setSeverityFilter(severity)
                      setSeverityDropdownOpen(false)
                    }}
                  >
                    {severity}
                    {severityFilter === severity && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Count */}
      <div className="log-count">
        <span>Showing {Math.min(showingCount, filteredLogs.length)} of {filteredLogs.length} logs</span>
      </div>

      {/* Logs Table */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Type</th>
              <th>Source</th>
              <th>User</th>
              <th>IP Address</th>
              <th>Severity</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice(0, showingCount).map((log, index) => (
              <tr 
                key={log.id} 
                className="log-row"
                onClick={() => handleLogClick(log)}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <td className="timestamp-col">{log.timestamp}</td>
                <td>
                  <span className="type-badge">{log.type}</span>
                </td>
                <td>{log.source}</td>
                <td>{log.user}</td>
                <td className="ip-col">{log.ipAddress}</td>
                <td>
                  <span 
                    className="severity-badge"
                    style={{ background: getSeverityColor(log.severity) }}
                  >
                    {log.severity}
                  </span>
                </td>
                <td className="message-col">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {showingCount < filteredLogs.length && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={() => setShowingCount(prev => prev + 10)}
          >
            Load More Logs
          </button>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="log-modal-backdrop" onClick={closeModal}>
          <div className="log-modal" onClick={(e) => e.stopPropagation()}>
            <div className="log-modal-header">
              <h2>Log Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="log-modal-body">
              <div className="log-detail-grid">
                <div className="log-detail-item">
                  <label>Log ID</label>
                  <div className="log-detail-value">{selectedLog.id}</div>
                </div>

                <div className="log-detail-item">
                  <label>Timestamp</label>
                  <div className="log-detail-value">{selectedLog.timestamp}</div>
                </div>

                <div className="log-detail-item">
                  <label>Type</label>
                  <span className="type-badge">{selectedLog.type}</span>
                </div>

                <div className="log-detail-item">
                  <label>Severity</label>
                  <span 
                    className="severity-badge"
                    style={{ background: getSeverityColor(selectedLog.severity) }}
                  >
                    {selectedLog.severity}
                  </span>
                </div>

                <div className="log-detail-item">
                  <label>Source</label>
                  <div className="log-detail-value">{selectedLog.source}</div>
                </div>

                <div className="log-detail-item">
                  <label>User</label>
                  <div className="log-detail-value">{selectedLog.user}</div>
                </div>

                <div className="log-detail-item full-width">
                  <label>IP Address</label>
                  <div className="log-detail-value ip-value">{selectedLog.ipAddress}</div>
                </div>

                <div className="log-detail-item full-width">
                  <label>Message</label>
                  <div className="log-message-box">{selectedLog.message}</div>
                </div>

                <div className="log-detail-item full-width">
                  <label>Raw Log Data (JSON)</label>
                  <pre className="log-json">
                    {JSON.stringify(selectedLog.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogAnalytics
