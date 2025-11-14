import { useEffect, useState } from 'react'
import './MetricDetailsModal.css'

interface Process {
  name: string
  pid: number
  threads?: number
  usage: number
}

interface MetricDetailsModalProps {
  type: 'cpu' | 'memory' | 'storage'
  onClose: () => void
  liveStorageStats: {
    logsPerSecond: string
    totalLogs: string
    iops: string
  }
}

function MetricDetailsModal({ type, onClose, liveStorageStats }: MetricDetailsModalProps) {
  const [processes, setProcesses] = useState<Process[]>([])
  const [stats, setStats] = useState({
    cpu: {
      cores: 8,
      frequency: '2.73 GHz',
      temperature: '49°C',
      loadAvg: '2.67'
    },
    memory: {
      total: '32GB',
      used: '17.60GB',
      cached: '2.45GB',
      swap: '0.19GB'
    }
  })

  useEffect(() => {
    // Generate random processes based on type
    const generateProcesses = () => {
      if (type === 'cpu') {
        return [
          { name: 'kibana', pid: 1712, threads: 3, usage: Math.random() * 30 + 15 },
          { name: 'postgresql', pid: 6623, threads: 11, usage: Math.random() * 20 + 10 },
          { name: 'filebeat', pid: 4413, threads: 20, usage: Math.random() * 20 + 10 },
          { name: 'prometheus', pid: 8682, threads: 2, usage: Math.random() * 35 + 20 },
          { name: 'redis', pid: 8548, threads: 18, usage: Math.random() * 25 + 10 }
        ]
      } else if (type === 'memory') {
        return [
          { name: 'nginx', pid: 7251, usage: Math.random() * 5 + 7 },
          { name: 'zookeeper', pid: 3116, usage: Math.random() * 3 + 3 },
          { name: 'zookeeper', pid: 1629, usage: Math.random() * 5 + 7 },
          { name: 'postgresql', pid: 5709, usage: Math.random() * 4 + 4 },
          { name: 'kafka', pid: 3273, usage: Math.random() * 5 + 6 }
        ]
      } else {
        return []
      }
    }

    setProcesses(generateProcesses())

    // Update values every 2 seconds
    const interval = setInterval(() => {
      setProcesses(generateProcesses())
      setStats(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          temperature: `${Math.floor(Math.random() * 10 + 45)}°C`,
          loadAvg: (Math.random() * 2 + 1.5).toFixed(2)
        },
        memory: {
          ...prev.memory,
          used: `${(Math.random() * 5 + 15).toFixed(2)}GB`,
          cached: `${(Math.random() * 1 + 2).toFixed(2)}GB`,
          swap: `${(Math.random() * 0.3 + 0.1).toFixed(2)}GB`
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [type])

  const getTitle = () => {
    switch (type) {
      case 'cpu': return 'CPU Usage Details'
      case 'memory': return 'Memory Usage Details'
      case 'storage': return 'Storage Details'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'cpu': return '#00d4ff'
      case 'memory': return '#00ff88'
      case 'storage': return '#a855f7'
    }
  }

  return (
    <div className="metric-modal-backdrop" onClick={onClose}>
      <div className="metric-modal" onClick={(e) => e.stopPropagation()}>
        <div className="metric-modal-header">
          <h2 style={{ color: getColor() }}>{getTitle()}</h2>
          <button className="metric-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="metric-modal-body">
          {/* Stats Grid */}
          <div className="metric-stats-grid">
            {type === 'cpu' && (
              <>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Cores</div>
                  <div className="metric-stat-value">{stats.cpu.cores}</div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Frequency</div>
                  <div className="metric-stat-value">{stats.cpu.frequency}</div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Temperature</div>
                  <div className="metric-stat-value">{stats.cpu.temperature}</div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Load Avg</div>
                  <div className="metric-stat-value">{stats.cpu.loadAvg}</div>
                </div>
              </>
            )}

            {type === 'memory' && (
              <>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Total</div>
                  <div className="metric-stat-value">{stats.memory.total}</div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Used</div>
                  <div className="metric-stat-value" style={{ color: getColor() }}>
                    {stats.memory.used}
                  </div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Cached</div>
                  <div className="metric-stat-value">{stats.memory.cached}</div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Swap</div>
                  <div className="metric-stat-value">{stats.memory.swap}</div>
                </div>
              </>
            )}

            {type === 'storage' && (
              <>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Logs/Second</div>
                  <div className="metric-stat-value">{liveStorageStats.logsPerSecond}</div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">Total Logs</div>
                  <div className="metric-stat-value">{liveStorageStats.totalLogs}</div>
                </div>
                <div className="metric-stat-card">
                  <div className="metric-stat-label">IOPS</div>
                  <div className="metric-stat-value">{liveStorageStats.iops}</div>
                </div>
              </>
            )}
          </div>

          {/* Processes List */}
          {type !== 'storage' && (
            <div className="metric-processes">
              <h3>Top Processes by {type === 'cpu' ? 'CPU' : 'Memory'}</h3>
              <div className="metric-processes-list">
                {processes.map((process, index) => (
                  <div key={index} className="metric-process-item">
                    <div className="metric-process-info">
                      <div className="metric-process-name">{process.name}</div>
                      <div className="metric-process-details">
                        PID: {process.pid}
                        {process.threads && ` | Threads: ${process.threads}`}
                      </div>
                    </div>
                    <div className="metric-process-usage">
                      <div className="metric-process-bar">
                        <div 
                          className="metric-process-bar-fill"
                          style={{ 
                            width: `${process.usage}%`,
                            background: getColor()
                          }}
                        ></div>
                      </div>
                      <div className="metric-process-percentage" style={{ color: getColor() }}>
                        {type === 'cpu' ? `${Math.round(process.usage)}%` : `${process.usage.toFixed(2)}GB`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disk Partitions for Storage */}
          {type === 'storage' && (
            <div className="metric-partitions">
              <h3>Disk Partitions</h3>
              <div className="metric-partitions-list">
                <div className="metric-partition-item">
                  <div className="metric-partition-header">
                    <span className="metric-partition-name">/dev/sda1</span>
                    <span className="metric-partition-type">ext4</span>
                  </div>
                  <div className="metric-partition-bar">
                    <div 
                      className="metric-partition-bar-fill"
                      style={{ width: '32%', background: '#00d4ff' }}
                    ></div>
                  </div>
                  <div className="metric-partition-usage">32% of 500GB</div>
                </div>

                <div className="metric-partition-item">
                  <div className="metric-partition-header">
                    <span className="metric-partition-name">/dev/sda2</span>
                    <span className="metric-partition-type">ext4</span>
                  </div>
                  <div className="metric-partition-bar">
                    <div 
                      className="metric-partition-bar-fill"
                      style={{ width: '70%', background: '#00d4ff' }}
                    ></div>
                  </div>
                  <div className="metric-partition-usage">70% of 1TB</div>
                </div>

                <div className="metric-partition-item">
                  <div className="metric-partition-header">
                    <span className="metric-partition-name">/dev/sdb1</span>
                    <span className="metric-partition-type">xfs</span>
                  </div>
                  <div className="metric-partition-bar">
                    <div 
                      className="metric-partition-bar-fill"
                      style={{ width: '10%', background: '#00d4ff' }}
                    ></div>
                  </div>
                  <div className="metric-partition-usage">10% of 2TB</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MetricDetailsModal
