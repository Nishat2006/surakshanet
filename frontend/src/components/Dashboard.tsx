import { useState, useEffect } from 'react'
import axios from 'axios'
import './Dashboard.css'
import ThreatChart from './ThreatChart.tsx'
import AlertModal from './AlertModal.tsx'
import APTLifecycle from './APTLifecycle.tsx'
import LogAnalytics from './LogAnalytics.tsx'
import NetworkCorrelation from './NetworkCorrelation.tsx'
import RuleManagement from './RuleManagement.tsx'
import BlockchainLogs from './BlockchainLogs.tsx'
import BlockchainDemo from './BlockchainDemo.tsx'
import MetricDetailsModal from './MetricDetailsModal.tsx'
import XaiDashboard from './XaiDashboard.tsx'
import { useSystemStats } from '../hooks/useSystemStats'

const API_GATEWAY_URL = "http://127.0.0.1:5000"

interface Alert {
  id: string
  title: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL'
  sourceIp: string
  targetIp: string
  timestamp: string
  description: string
  recommendedActions: string[]
  affectedSystem: string
  color: string
  status: 'Active' | 'Mitigated' | string
}

interface DashboardProps {
  onSignOut: () => void
}

function Dashboard({ onSignOut }: DashboardProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState<'dashboard' | 'apt-lifecycle' | 'log-analytics' | 'network-correlation' | 'rule-management' | 'blockchain-logs' | 'blockchain-demo' | 'xai-dashboard'>('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [metricModal, setMetricModal] = useState<'cpu' | 'memory' | 'storage' | null>(null)
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSimulating, setIsSimulating] = useState(false)
  const [allLogs, setAllLogs] = useState([])
  const [liveStats, setLiveStats] = useState({
    cpuUsage: 35,
    memoryUsage: 53,
    logIngestionRate: "12,577/s",
    totalThreats: 0,
    anomalies: 0,
    activeAlerts: 0,
  })
  const [dynamicStorageStats, setDynamicStorageStats] = useState({
    logsPerSecond: "12,577/s",
    totalLogs: "2,334,423",
    iops: "2,920",
    logBarPercent: 70
  })

  // Real-time system stats via WebSocket
  const { stats: systemStats, isConnected: statsConnected } = useSystemStats()

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert)
  }

  const closeModal = () => {
    setSelectedAlert(null)
  }

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_GATEWAY_URL}/dashboard`)
      setLiveAlerts(response.data.alerts)
      setLiveStats(response.data.stats)
      setAllLogs(response.data.all_logs)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomFeatures = () => {
    const baseFeatures = "443,141385,9,7,568,320,385,0,240.5,142,88,0,0,51.8,17296.5,567,141385,0,141385,17296.5,567,141385,0,6,17337.3,346,141385,0,296,240,14.5,14.5,0,385,183.5,187.9,35306.9,0,0,1,183.5,9,88,5,184,443,30.3,56.9,23.1,45.8,51.8,17296.5"
    const featuresArray = baseFeatures.split(',')
    
    const randomizedFeatures = featuresArray.map(valueStr => {
      const originalValue = parseFloat(valueStr)
      const isInteger = !valueStr.includes('.')
      
      // Apply random noise (+/- 10%)
      const noisePercent = (Math.random() * 4.0) + 1.0 // -10% to +10%
      let newValue = originalValue * noisePercent;
      
      // Ensure no negative values
      newValue = Math.max(0, newValue)
      
      // Round to integer if original was integer
      if (isInteger) {
        newValue = Math.round(newValue)
      }
      
      // Format to 4 decimal places
      return newValue.toFixed(4)
    })
    
    return randomizedFeatures.join(',')
  }

  const handleSimulateAttack = async () => {
    setIsSimulating(true)
    const randomFeatures = generateRandomFeatures()
    const randomIp = `185.190.25.${Math.floor(Math.random() * 254) + 1}`
    
    const fakeLog = {
      timestamp: new Date().toISOString(),
      source_ip: randomIp,
      attack_type: "Brute Force",
      features: randomFeatures
    }
    try {
      await axios.post(`${API_GATEWAY_URL}/ingest`, fakeLog)
      alert("Attack Simulated! Backend processing...")
      fetchData() // Refetch data
    } catch (error) {
      console.error("Error simulating attack:", error)
    } finally {
      setIsSimulating(false)
    }
  }

  const handleTakeAction = async (logId: string) => {
    try {
      await axios.post(`${API_GATEWAY_URL}/mitigate`, { log_id: logId })
      closeModal()
      fetchData() // Refetch data to show updated status
    } catch (error) {
      console.error("Error mitigating threat:", error)
      alert("Failed to mitigate threat. Please try again.")
    }
  }

  // Update liveStats when systemStats changes
  useEffect(() => {
    if (systemStats) {
      setLiveStats(prev => ({
        ...prev,
        cpuUsage: systemStats.cpu.usage_percent,
        memoryUsage: systemStats.memory.usage_percent,
      }))
    }
  }, [systemStats])

  // Update time, fetch data on load, and set up poller
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    fetchData() // Fetch data on initial load
    const dataPoller = setInterval(fetchData, 5000) // Poll every 5 seconds

    return () => {
      clearInterval(timer)
      clearInterval(dataPoller)
    }
  }, [])

  // Update dynamic storage stats every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicStorageStats({
        logsPerSecond: `${Math.floor(Math.random() * 2000 + 10000).toLocaleString()}/s`,
        totalLogs: `${Math.floor(Math.random() * 100000 + 2300000).toLocaleString()}`,
        iops: `${Math.floor(Math.random() * 500 + 2700).toLocaleString()}`,
        logBarPercent: Math.floor(Math.random() * 30 + 50)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
    return date.toLocaleString('en-US', options)
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <svg viewBox="0 0 100 100" fill="none" className="logo-svg">
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Shield outline */}
              <path 
                className="shield-outline"
                d="M50 10 L20 20 L20 45 C20 65 50 85 50 85 C50 85 80 65 80 45 L80 20 Z" 
                stroke="url(#shieldGradient)" 
                strokeWidth="2" 
                fill="none"
                filter="url(#glow)"
              />
              
              {/* Circuit board pattern */}
              <g className="circuit-pattern" opacity="0.6">
                <line x1="30" y1="30" x2="40" y2="30" stroke="#00d4ff" strokeWidth="1"/>
                <line x1="40" y1="30" x2="40" y2="40" stroke="#00d4ff" strokeWidth="1"/>
                <circle cx="40" cy="40" r="1.5" fill="#00d4ff"/>
                
                <line x1="60" y1="30" x2="70" y2="30" stroke="#a78bfa" strokeWidth="1"/>
                <line x1="60" y1="30" x2="60" y2="40" stroke="#a78bfa" strokeWidth="1"/>
                <circle cx="60" cy="40" r="1.5" fill="#a78bfa"/>
                
                <line x1="30" y1="60" x2="40" y2="60" stroke="#00d4ff" strokeWidth="1"/>
                <line x1="40" y1="60" x2="40" y2="70" stroke="#00d4ff" strokeWidth="1"/>
                <circle cx="40" cy="70" r="1.5" fill="#00d4ff"/>
                
                <line x1="60" y1="60" x2="70" y2="60" stroke="#a78bfa" strokeWidth="1"/>
                <line x1="60" y1="60" x2="60" y2="70" stroke="#a78bfa" strokeWidth="1"/>
                <circle cx="60" cy="70" r="1.5" fill="#a78bfa"/>
              </g>
              
              {/* Lightning bolt */}
              <path 
                className="lightning-bolt"
                d="M55 25 L35 50 L48 50 L45 75 L65 45 L52 45 Z" 
                fill="url(#shieldGradient)"
                filter="url(#glow)"
              />
              
              {/* Energy particles */}
              <circle className="particle particle-1" cx="50" cy="50" r="1" fill="#00d4ff"/>
              <circle className="particle particle-2" cx="50" cy="50" r="1" fill="#a78bfa"/>
              <circle className="particle particle-3" cx="50" cy="50" r="1" fill="#00ff88"/>
            </svg>
            <div className="logo-text">
              <span className="logo-title">ELK APT</span>
              <span className="logo-subtitle">Detection System</span>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Dashboard</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${currentView === 'apt-lifecycle' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('apt-lifecycle'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>APT Lifecycle</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${currentView === 'log-analytics' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('log-analytics'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Log Analytics</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${currentView === 'network-correlation' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('network-correlation'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
              <line x1="12" y1="9" x2="12" y2="3"/>
              <line x1="12" y1="15" x2="12" y2="21"/>
              <line x1="15" y1="12" x2="19" y2="12"/>
              <line x1="5" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Network Correlation</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${currentView === 'rule-management' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('rule-management'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
            </svg>
            <span>Rule Management</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${currentView === 'blockchain-logs' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('blockchain-logs'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Blockchain Logs</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${currentView === 'blockchain-demo' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('blockchain-demo'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>🔗 Blockchain Demo</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${currentView === 'xai-dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentView('xai-dashboard'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <span>XAI Dashboard</span>
          </a>
        </nav>

        {/* User Profile Section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">SO</div>
            <div className="user-details">
              <div className="user-name">SOC Operator</div>
              <div className="user-email">operator@soc.com</div>
            </div>
          </div>
          <button 
            className="logout-btn"
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                onSignOut()
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1>
              {currentView === 'dashboard' ? 'Dashboard' :
               currentView === 'apt-lifecycle' ? 'APT Lifecycle' :
               currentView === 'log-analytics' ? 'Log Analytics' :
               currentView === 'network-correlation' ? 'Network Correlation' :
               currentView === 'rule-management' ? 'Rule Management' :
               currentView === 'blockchain-logs' ? 'Blockchain Logs' :
               currentView === 'blockchain-demo' ? 'Blockchain Demo' :
               currentView === 'xai-dashboard' ? 'XAI Dashboard' :
               'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <button 
                className="header-btn notification-btn"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {liveAlerts.length > 0 && (
                  <span className="notification-badge">{liveAlerts.length}</span>
                )}
              </button>
              
              {notificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <span className="notification-count">{liveAlerts.length} new</span>
                  </div>
                  <div className="notification-list">
                    {liveAlerts.slice(0, 5).map((alert: Alert) => (
                      <div 
                        key={alert.id} 
                        className="notification-item"
                        onClick={() => {
                          handleAlertClick(alert)
                          setNotificationOpen(false)
                        }}
                      >
                        <div className="notification-icon" style={{ background: alert.color }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{alert.title}</div>
                          <div className="notification-time">{alert.timestamp}</div>
                        </div>
                        <span className={`notification-severity ${alert.severity.toLowerCase()}`}>
                          {alert.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="notification-footer">
                    <button onClick={() => {
                        setCurrentView('log-analytics')
                        setNotificationOpen(false)
                    }}>View All Alerts</button>
                  </div>
                </div>
              )}
            </div>
            <div className="user-info">
              <span>{formatDateTime(currentTime)}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {currentView === 'xai-dashboard' ? (
          <XaiDashboard allLogs={allLogs} />
        ) : currentView === 'blockchain-demo' ? (
          <BlockchainDemo />
        ) : currentView === 'blockchain-logs' ? (
          <BlockchainLogs />
        ) : currentView === 'rule-management' ? (
          <RuleManagement />
        ) : currentView === 'network-correlation' ? (
          <NetworkCorrelation />
        ) : currentView === 'dashboard' ? (
          <div className="dashboard-content">
          {/* Simulator Widget */}
          <div className="simulator-widget">
            <h4>Demo Center</h4>
            <p>Simulate a real-time cyber attack to test the AI pipeline.</p>
            <button
              onClick={handleSimulateAttack}
              disabled={isSimulating}
              className="simulator-btn"
            >
              {isSimulating ? "Simulating..." : "Launch Brute Force Attack"}
            </button>
          </div>

          {/* Title Section */}
          <div className="section-header">
            <h2>Threat Detection Dashboard</h2>
            <p>Real-time monitoring and analysis</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {/* Row 1: CPU, Memory, Log Ingestion */}
            {/* CPU Usage */}
            <div className="metric-card" onClick={() => setMetricModal('cpu')}>
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'rgba(0, 212, 255, 0.15)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <rect x="9" y="9" width="6" height="6"/>
                    <line x1="9" y1="1" x2="9" y2="4"/>
                    <line x1="15" y1="1" x2="15" y2="4"/>
                    <line x1="9" y1="20" x2="9" y2="23"/>
                    <line x1="15" y1="20" x2="15" y2="23"/>
                    <line x1="20" y1="9" x2="23" y2="9"/>
                    <line x1="20" y1="14" x2="23" y2="14"/>
                    <line x1="1" y1="9" x2="4" y2="9"/>
                    <line x1="1" y1="14" x2="4" y2="14"/>
                  </svg>
                </div>
                <div className="metric-info">
                  <div className="metric-label">CPU Usage</div>
                  <div className="metric-value">{liveStats.cpuUsage}%</div>
                </div>
              </div>
              <div className="metric-bar">
                <div className="metric-bar-fill" style={{ width: `${liveStats.cpuUsage}%`, background: '#00d4ff' }}></div>
              </div>
              <div className="metric-footer">Click for details</div>
            </div>

            {/* Memory Usage */}
            <div className="metric-card" onClick={() => setMetricModal('memory')}>
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'rgba(0, 255, 136, 0.15)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
                    <path d="M2 20h20"/>
                    <path d="M5 20V10h4v10"/>
                    <path d="M10 20V4h4v16"/>
                    <path d="M15 20v-6h4v6"/>
                  </svg>
                </div>
                <div className="metric-info">
                  <div className="metric-label">Memory Usage</div>
                  <div className="metric-value">{liveStats.memoryUsage}%</div>
                </div>
              </div>
              <div className="metric-bar">
                <div className="metric-bar-fill" style={{ width: `${liveStats.memoryUsage}%`, background: '#00ff88' }}></div>
              </div>
              <div className="metric-footer">Click for details</div>
            </div>

            {/* Log Ingestion */}
            <div className="metric-card" onClick={() => setMetricModal('storage')}>
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className="metric-info">
                  <div className="metric-label">Log Ingestion</div>
                  <div className="metric-value">{dynamicStorageStats.logsPerSecond}</div>
                </div>
              </div>
              <div className="metric-bar">
                <div className="metric-bar-fill" style={{ width: `${dynamicStorageStats.logBarPercent}%`, background: '#a855f7' }}></div>
              </div>
              <div className="metric-footer">Click for details</div>
            </div>

            {/* Row 2: Total Threats, Anomalies, Active Alerts */}
            {/* Total Threats */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M12 8v4"/>
                    <path d="M12 16h.01"/>
                  </svg>
                </div>
                <div className="metric-info">
                  <div className="metric-label">Total Threats</div>
                  <div className="metric-value">{liveStats.totalThreats}</div>
                </div>
              </div>
              <div className="metric-icon-large" style={{ color: '#ef4444' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
              </div>
              <div className="metric-footer">Click for details</div>
            </div>

            {/* Anomalies */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="metric-info">
                  <div className="metric-label">Anomalies</div>
                  <div className="metric-value">{liveStats.anomalies}</div>
                </div>
              </div>
              <div className="metric-icon-large" style={{ color: '#eab308' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="metric-footer">Click for details</div>
            </div>

            {/* Active Alerts */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ background: 'rgba(0, 212, 255, 0.15)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="metric-info">
                  <div className="metric-label">Active Alerts</div>
                  <div className="metric-value">{liveStats.activeAlerts}</div>
                </div>
              </div>
              <div className="metric-icon-large" style={{ color: '#00d4ff' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="metric-footer">Click for details</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Threat Activity (24h)</h3>
              </div>
              <ThreatChart type="threat" />
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Normal vs Threat Traffic</h3>
              </div>
              <ThreatChart type="traffic" />
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="alerts-section">
            <div className="section-header">
              <h3>Recent Alerts</h3>
              <button 
                className="view-all-btn"
                onClick={() => {
                  if (liveAlerts.length === 0) {
                    alert('There are no active alerts to view.')
                  } else {
                    setCurrentView('log-analytics')
                  }
                }}
              >
                View All
              </button>
            </div>
            <div className="alerts-list">
              {liveAlerts.length === 0 && !isLoading && (
                <div className="alert-item-empty">No recent alerts. Simulate an attack to see results.</div>
              )}
              {liveAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="alert-item"
                  onClick={() => handleAlertClick(alert)}
                  style={{ borderLeftColor: alert.color }}
                >
                  <div className="alert-content">
                    <div className="alert-title-row">
                      <h4>{alert.title}</h4>
                      {alert.status === 'Mitigated' ? (
                        <span className="severity-badge mitigated">
                          MITIGATED
                        </span>
                      ) : (
                        <span className={`severity-badge ${alert.severity.toLowerCase()}`}>
                          {alert.severity}
                        </span>
                      )}
                    </div>
                    <div className="alert-details">
                      <span>Source IP: {alert.sourceIp}</span>
                      <span>Target: {alert.targetIp}</span>
                      <span>System: {alert.affectedSystem}</span>
                    </div>
                  </div>
                  <div className="alert-indicator" style={{ background: alert.color }} />
                </div>
              ))}
            </div>
          </div>
          </div>
        ) : currentView === 'apt-lifecycle' ? (
          <APTLifecycle />
        ) : (
          <LogAnalytics />
        )}
      </main>

      {/* Alert Modal */}
      {selectedAlert && (
        <AlertModal alert={selectedAlert} onClose={closeModal} onTakeAction={handleTakeAction} />
      )}

      {/* Metric Details Modal */}
      {metricModal && (
        <MetricDetailsModal 
          type={metricModal} 
          onClose={() => setMetricModal(null)} 
          liveStorageStats={dynamicStorageStats}
        />
      )}
    </div>
  )
}

export default Dashboard
