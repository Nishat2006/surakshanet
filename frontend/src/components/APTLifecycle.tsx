import { useState, useEffect } from 'react'
import './APTLifecycle.css'

interface Stage {
  id: number
  name: string
  title: string
  description: string
  indicators: string[]
  status: 'Stage 1' | 'Stage 2' | 'Stage 3' | 'Stage 4' | 'Stage 5' | 'Stage 6'
  active: boolean
}

const stages: Stage[] = [
  {
    id: 1,
    name: 'Reconnaissance',
    title: 'Reconnaissance',
    description: 'Initial target scanning and information gathering',
    indicators: [
      'Port scan detected from 203.0.113.45',
      'DNS enumeration attempts on domain'
    ],
    status: 'Stage 1',
    active: false
  },
  {
    id: 2,
    name: 'Initial Compromise',
    title: 'Initial Compromise',
    description: 'First foothold established in the network',
    indicators: [
      'Phishing email opened by user@company.com',
      'Malicious payload executed'
    ],
    status: 'Stage 2',
    active: false
  },
  {
    id: 3,
    name: 'Establish Foothold',
    title: 'Establish Foothold',
    description: 'Backdoor backdoor deployed',
    indicators: [
      'Persistence mechanism installed',
      'Registry key modified for autostart'
    ],
    status: 'Stage 3',
    active: false
  },
  {
    id: 4,
    name: 'Privilege Escalation',
    title: 'Privilege Escalation',
    description: 'Attacker gains elevated access',
    indicators: [
      'Exploit CVE-2023-1234 attempted',
      'Admin credentials harvested'
    ],
    status: 'Stage 4',
    active: false
  },
  {
    id: 5,
    name: 'Lateral Movement',
    title: 'Lateral Movement',
    description: 'Spreading across the network',
    indicators: [
      'SMB connections to multiple hosts',
      'Pass-the-hash attack detected'
    ],
    status: 'Stage 5',
    active: false
  },
  {
    id: 6,
    name: 'Data Exfiltration',
    title: 'Data Exfiltration',
    description: 'Data theft in progress',
    indicators: [
      'Large data transfer to external IP',
      'Encrypted tunnel established'
    ],
    status: 'Stage 6',
    active: false
  }
]

const timelineData = [
  {
    id: 1,
    title: 'Reconnaissance',
    stage: 'Stage 1',
    time: '1 week',
    description: 'Initial target scanning and information gathering',
    active: true,
    indicators: [
      'Port scan detected from 203.0.113.45',
      'DNS enumeration attempts on domain'
    ],
    threatLevel: 45,
    events: 23,
    duration: '7d'
  },
  {
    id: 2,
    title: 'Initial Compromise',
    stage: 'Stage 2',
    time: '3-5 days',
    description: 'First foothold established in the network',
    active: true,
    indicators: [
      'Phishing email opened by user@company.com',
      'Malicious payload executed'
    ],
    threatLevel: 78,
    events: 45,
    duration: '4d'
  },
  {
    id: 3,
    title: 'Establish Foothold',
    stage: 'Stage 3',
    time: '2-4 hours',
    description: 'Persistence mechanisms deployed',
    active: true,
    indicators: [
      'Persistence mechanism installed',
      'Registry key modified for autostart'
    ],
    threatLevel: 65,
    events: 18,
    duration: '3h'
  },
  {
    id: 4,
    title: 'Privilege Escalation',
    stage: 'Stage 4',
    time: '2-4 hours',
    description: 'Attacker gains elevated access',
    active: true,
    indicators: [
      'Exploit CVE-2023-1234 attempted',
      'Admin credentials harvested'
    ],
    threatLevel: 92,
    events: 56,
    duration: '2h'
  },
  {
    id: 5,
    title: 'Lateral Movement',
    stage: 'Stage 5',
    time: '1-2 days',
    description: 'Spreading across the network',
    active: true,
    indicators: [
      'SMB connection to multiple hosts',
      'Pass-the-hash attack detected'
    ],
    threatLevel: 100,
    events: 81,
    duration: '8m'
  },
  {
    id: 6,
    title: 'Data Exfiltration',
    stage: 'Stage 6',
    time: '1-2 days',
    description: 'Data theft in progress',
    active: true,
    indicators: [
      'Large data transfer to external IP',
      'Encrypted tunnel established'
    ],
    threatLevel: 88,
    events: 34,
    duration: '5h'
  }
]

function APTLifecycle() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [expandedTimeline, setExpandedTimeline] = useState<number | null>(null)
  const [animatedValues, setAnimatedValues] = useState<{[key: number]: {events: number, threatLevel: number}}>({})

  // Animate values
  useEffect(() => {
    const interval = setInterval(() => {
      const newValues: {[key: number]: {events: number, threatLevel: number}} = {}
      timelineData.forEach(item => {
        newValues[item.id] = {
          events: item.events + Math.floor(Math.random() * 10 - 5),
          threatLevel: Math.min(100, Math.max(0, item.threatLevel + Math.floor(Math.random() * 6 - 3)))
        }
      })
      setAnimatedValues(newValues)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage)
  }

  const closeModal = () => {
    setSelectedStage(null)
  }

  const toggleTimeline = (id: number) => {
    setExpandedTimeline(expandedTimeline === id ? null : id)
  }

  return (
    <div className="apt-lifecycle">
      <div className="apt-header">
        <h1>APT Attack Lifecycle</h1>
        <p>Interactive visualization of attack progression stages</p>
      </div>

      {/* Attack Stages */}
      <div className="stages-container">
        <h2 className="section-title">Attack Stages</h2>
        <div className="stages-grid">
          {stages.map((stage, index) => (
            <div key={stage.id} className="stage-wrapper">
              <div 
                className="stage-card"
                onClick={() => handleStageClick(stage)}
              >
                <div className="stage-badge">{stage.status}</div>
                <h3>{stage.name}</h3>
                <p>{stage.description}</p>
                <div className="stage-indicators">
                  <span className="indicators-label">Sample Indicators:</span>
                  {stage.indicators.map((indicator, idx) => (
                    <div key={idx} className="indicator-text">{indicator}</div>
                  ))}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="stage-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attack Timeline Visualization */}
      <div className="timeline-container">
        <h2 className="section-title">Attack Timeline Visualization</h2>
        <div className="timeline-list">
          {timelineData.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
                <div className="timeline-line"></div>
              </div>
              <div className="timeline-content">
                <div 
                  className="timeline-header"
                  onClick={() => toggleTimeline(item.id)}
                >
                  <div className="timeline-info">
                    <span className="timeline-stage">{item.stage}</span>
                    <span className="timeline-time">{item.time}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.active && (
                    <span className="timeline-status">● Active</span>
                  )}
                </div>
                
                {expandedTimeline === item.id && (
                  <div className="timeline-details">
                    <div className="details-section">
                      <h4>• Detected Indicators:</h4>
                      <div className="indicator-code">
                        {item.indicators.map((indicator, idx) => (
                          <div key={idx}>{indicator}</div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="details-section">
                      <h4>• Threat Level:</h4>
                      <div className="threat-level-bar">
                        <div 
                          className="threat-level-fill" 
                          style={{ 
                            width: `${animatedValues[item.id]?.threatLevel || item.threatLevel}%`,
                            background: item.threatLevel > 80 ? 'linear-gradient(90deg, #ff4444, #ff0000)' : 
                                       item.threatLevel > 50 ? 'linear-gradient(90deg, #ffaa00, #ff6600)' : 
                                       'linear-gradient(90deg, #4AF2C5, #00d4ff)'
                          }}
                        />
                        <span className="threat-level-value">{animatedValues[item.id]?.threatLevel || item.threatLevel}%</span>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>• Key Metrics:</h4>
                      <div className="key-metrics">
                        <div className="metric-item">
                          <span className="metric-label">Events</span>
                          <span className="metric-value">{animatedValues[item.id]?.events || item.events}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Duration</span>
                          <span className="metric-value">{item.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="details-toggle" onClick={() => setExpandedTimeline(null)}>
                      ▲ Click to collapse
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Detail Modal */}
      {selectedStage && (
        <div className="stage-modal-backdrop" onClick={closeModal}>
          <div className="stage-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <div className="modal-header">
              <span className="modal-badge">{selectedStage.status}</span>
              <h2>{selectedStage.name}</h2>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">{selectedStage.description}</p>
              
              <div className="modal-section">
                <h3>Sample Indicators:</h3>
                <div className="modal-indicators">
                  {selectedStage.indicators.map((indicator, idx) => (
                    <div key={idx} className="modal-indicator">{indicator}</div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>Recommended Actions:</h3>
                <ul className="modal-actions">
                  <li>Monitor network traffic for suspicious patterns</li>
                  <li>Review security logs for anomalies</li>
                  <li>Implement additional security controls</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default APTLifecycle
