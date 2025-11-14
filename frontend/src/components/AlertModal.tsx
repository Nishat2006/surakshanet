import { useEffect, useState } from 'react'
import './AlertModal.css'

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
}

interface AlertModalProps {
  alert: Alert
  onClose: () => void
  onTakeAction: (logId: string) => Promise<void>
}

function AlertModal({ alert, onClose, onTakeAction }: AlertModalProps) {
  const [isMitigating, setIsMitigating] = useState(false)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleActionButtonClick = async () => {
    setIsMitigating(true)
    try {
      await onTakeAction(alert.id)
    } catch (error) {
      console.error('Error taking action:', error)
    } finally {
      setIsMitigating(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Alert Details</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <label>Alert Title</label>
            <div className="modal-value">{alert.title}</div>
          </div>

          <div className="modal-section">
            <label>Severity</label>
            <span className={`severity-badge-modal ${alert.severity.toLowerCase()}`}>
              {alert.severity}
            </span>
          </div>

          <div className="modal-section">
            <label>Source IP</label>
            <div className="modal-value ip-value">{alert.sourceIp}</div>
          </div>

          <div className="modal-section">
            <label>Affected System</label>
            <div className="modal-value">{alert.affectedSystem}</div>
          </div>

          <div className="modal-section">
            <label>Timestamp</label>
            <div className="modal-value">{alert.timestamp}</div>
          </div>

          <div className="modal-section">
            <label>Description</label>
            <div className="modal-value">{alert.description}</div>
          </div>

          <div className="modal-section">
            <label>Recommended Actions</label>
            <ul className="actions-list">
              {alert.recommendedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn secondary" onClick={onClose}>
            Close
          </button>
          <button 
            className="modal-btn primary" 
            onClick={handleActionButtonClick}
            disabled={isMitigating}
          >
            {isMitigating ? 'Mitigating...' : 'Take Action'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
