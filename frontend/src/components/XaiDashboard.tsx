import { useState } from 'react'
import axios from 'axios'
import './XaiDashboard.css'

const API_GATEWAY_URL = "http://127.0.0.1:5000"

interface FeatureImportance {
  feature: string
  shap_value: number
  feature_value: number
}

interface ExplanationData {
  feature_importance: FeatureImportance[]
  base_value: number
}

function XaiDashboard({ allLogs }: { allLogs: any[] }) {
  const alerts = allLogs || []
  const [selectedAlertId, setSelectedAlertId] = useState<string>('')
  const [explanation, setExplanation] = useState<ExplanationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAlertSelect = async (alertId: string) => {
    setSelectedAlertId(alertId)
    setError(null)
    
    if (!alertId) {
      setExplanation(null)
      return
    }

    const selectedAlert = alerts.find(a => a.id === alertId)
    if (!selectedAlert) {
      setError("Alert not found")
      return
    }

    console.log("Selected alert:", selectedAlert)
    console.log("Raw data:", selectedAlert.rawData)
    
    const features = selectedAlert.rawData?.features
    console.log("Features:", features)
    
    if (!features) {
      setError(`No features available for this alert. RawData: ${JSON.stringify(selectedAlert.rawData)}`)
      return
    }

    setLoading(true)
    
    try {
      const response = await axios.post(`${API_GATEWAY_URL}/explain`, {
        features: features
      })
      
      setExplanation(response.data)
    } catch (err: any) {
      console.error("Error getting explanation:", err)
      setError(err.response?.data?.error || "Failed to get explanation")
    } finally {
      setLoading(false)
    }
  }

  // Get top 10 features for display
  const topFeatures = explanation?.feature_importance.slice(0, 10) || []

  // Find max absolute value for scaling
  const maxAbsValue = Math.max(...topFeatures.map(f => Math.abs(f.shap_value)), 0.01)

  return (
    <div className="xai-dashboard">
      <div className="xai-header">
        <h2>Explainable AI Dashboard</h2>
        <p>Understand why the AI model flagged specific logs as anomalies</p>
      </div>

      <div className="xai-content">
        {/* Alert Selection */}
        <div className="xai-card">
          <h3>Select an Alert to Explain</h3>
          <select 
            className="alert-dropdown"
            value={selectedAlertId}
            onChange={(e) => handleAlertSelect(e.target.value)}
          >
            <option value="">-- Select an alert --</option>
            {alerts.map(alert => (
              <option key={alert.id} value={alert.id}>
                [{alert.severity}] {alert.type} - {alert.ipAddress} ({alert.timestamp})
              </option>
            ))}
          </select>

          {alerts.length === 0 && (
            <p className="no-alerts-message">
              No alerts available. Simulate an attack from the Dashboard to generate alerts.
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="xai-card loading-card">
            <div className="loading-spinner"></div>
            <p>Generating explanation...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="xai-card error-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Explanation Results */}
        {explanation && !loading && !error && (
          <div className="xai-card explanation-card">
            <h3>Feature Importance (Top 10)</h3>
            <p className="explanation-subtitle">
              Features that most influenced the anomaly detection decision
            </p>

            <div className="feature-chart">
              {topFeatures.map((feature, index) => {
                const isContributingToAnomaly = feature.shap_value < 0
                const barWidth = (Math.abs(feature.shap_value) / maxAbsValue) * 100
                const barColor = isContributingToAnomaly ? '#ef4444' : '#3b82f6'

                return (
                  <div key={index} className="feature-row">
                    <div className="feature-label" title={feature.feature}>
                      {feature.feature}
                    </div>
                    <div className="feature-bar-container">
                      <div 
                        className="feature-bar"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: barColor
                        }}
                      >
                        <span className="feature-value">
                          {feature.shap_value.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                <span>Increases anomaly score (Negative SHAP value)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                <span>Decreases anomaly score (Positive SHAP value)</span>
              </div>
            </div>

            {explanation.base_value !== undefined && (
              <div className="base-value-info">
                <strong>Base Value:</strong> {explanation.base_value.toFixed(4)}
                <p className="base-value-description">
                  The average model output over the training dataset
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        {!selectedAlertId && !loading && (
          <div className="xai-card info-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <h3>How to Use</h3>
            <ol>
              <li>Select an alert from the dropdown above</li>
              <li>The system will analyze the features that led to the anomaly detection</li>
              <li>View the top 10 most influential features in the bar chart</li>
              <li>Red bars indicate features that increased the anomaly score</li>
              <li>Blue bars indicate features that decreased the anomaly score</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

export default XaiDashboard
