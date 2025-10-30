import { useState } from 'react'
import './RuleManagement.css'

interface Rule {
  id: string
  name: string
  ruleId: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  enabled: boolean
}

interface Suggestion {
  id: string
  title: string
  description: string
}

const activeRules: Rule[] = [
  {
    id: '1',
    name: 'Detect Brute Force SSH',
    ruleId: 'rule-1',
    priority: 'HIGH',
    enabled: true
  },
  {
    id: '2',
    name: 'Monitor Privilege Escalation',
    ruleId: 'rule-2',
    priority: 'CRITICAL',
    enabled: false
  },
  {
    id: '3',
    name: 'Track Lateral Movement',
    ruleId: 'rule-3',
    priority: 'HIGH',
    enabled: false
  },
  {
    id: '4',
    name: 'Identify Data Exfiltration',
    ruleId: 'rule-4',
    priority: 'CRITICAL',
    enabled: false
  },
  {
    id: '5',
    name: 'Detect Port Scanning',
    ruleId: 'rule-5',
    priority: 'MEDIUM',
    enabled: true
  },
  {
    id: '6',
    name: 'Monitor DNS Tunneling',
    ruleId: 'rule-6',
    priority: 'HIGH',
    enabled: false
  },
  {
    id: '7',
    name: 'Track File Integrity Changes',
    ruleId: 'rule-7',
    priority: 'MEDIUM',
    enabled: false
  }
]

const aiSuggestions: Suggestion[] = [
  {
    id: '1',
    title: 'Enable correlation rule for SQL injection patterns',
    description: 'Apply Suggestion'
  },
  {
    id: '2',
    title: 'Add anomaly detection for C2/cross database access',
    description: 'Apply Suggestion'
  },
  {
    id: '3',
    title: 'Create alert for repeated failed login attempts',
    description: 'Apply Suggestion'
  }
]

function RuleManagement() {
  const [rules, setRules] = useState<Rule[]>(activeRules)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(aiSuggestions)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editedRuleName, setEditedRuleName] = useState('')
  const [editedPriority, setEditedPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH')
  const [newRuleName, setNewRuleName] = useState('')
  const [newRulePriority, setNewRulePriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM')

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const handleEditClick = (rule: Rule) => {
    setSelectedRule(rule)
    setEditedRuleName(rule.name)
    setEditedPriority(rule.priority)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(rules.filter(rule => rule.id !== ruleId))
    }
  }

  const handleSaveChanges = () => {
    if (selectedRule) {
      setRules(rules.map(rule => 
        rule.id === selectedRule.id 
          ? { ...rule, name: editedRuleName, priority: editedPriority }
          : rule
      ))
      setEditModalOpen(false)
      setSelectedRule(null)
    }
  }

  const handleCancel = () => {
    setEditModalOpen(false)
    setSelectedRule(null)
  }

  const handleAddRule = () => {
    setNewRuleName('')
    setNewRulePriority('MEDIUM')
    setAddModalOpen(true)
  }

  const handleSaveNewRule = () => {
    if (newRuleName.trim()) {
      const newRule: Rule = {
        id: `${rules.length + 1}`,
        name: newRuleName,
        ruleId: `rule-${rules.length + 1}`,
        priority: newRulePriority,
        enabled: true
      }
      setRules([...rules, newRule])
      setAddModalOpen(false)
      setNewRuleName('')
    }
  }

  const handleApplySuggestion = (suggestion: Suggestion) => {
    const newRule: Rule = {
      id: `${rules.length + 1}`,
      name: suggestion.title,
      ruleId: `rule-${rules.length + 1}`,
      priority: 'HIGH',
      enabled: true
    }
    setRules([...rules, newRule])
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id))
  }

  const handleGenerateMore = () => {
    const moreSuggestions: Suggestion[] = [
      {
        id: `${suggestions.length + 1}`,
        title: 'Monitor unusual outbound traffic patterns',
        description: 'Apply Suggestion'
      },
      {
        id: `${suggestions.length + 2}`,
        title: 'Detect credential stuffing attempts',
        description: 'Apply Suggestion'
      },
      {
        id: `${suggestions.length + 3}`,
        title: 'Alert on privilege escalation via sudo',
        description: 'Apply Suggestion'
      }
    ]
    setSuggestions([...suggestions, ...moreSuggestions])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '#ff4444'
      case 'HIGH': return '#ff6600'
      case 'MEDIUM': return '#ffaa00'
      case 'LOW': return '#00ff88'
      default: return '#4AF2C5'
    }
  }

  const enabledRulesCount = rules.filter(r => r.enabled).length
  const criticalCount = rules.filter(r => r.priority === 'CRITICAL').length
  const highCount = rules.filter(r => r.priority === 'HIGH').length
  const mediumCount = rules.filter(r => r.priority === 'MEDIUM').length

  return (
    <div className="rule-management">
      <div className="rule-header">
        <div>
          <h1>Rule Management</h1>
          <p>Configure detection rules and automation</p>
        </div>
        <button className="add-rule-btn" onClick={handleAddRule}>+ Add Rule</button>
      </div>

      <div className="rule-content-grid">
        {/* Active Rules Section */}
        <div className="active-rules-section">
          <div className="section-header-rules">
            <h2>Active Rules</h2>
            <span className="rules-count">{enabledRulesCount} Enabled</span>
          </div>

          <div className="rules-list">
            {rules.map((rule, index) => (
              <div 
                key={rule.id} 
                className="rule-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="rule-left">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="rule-info">
                    <div className="rule-name">{rule.name}</div>
                    <div className="rule-id">Rule ID: {rule.ruleId}</div>
                  </div>
                </div>
                <div className="rule-right">
                  <span 
                    className="priority-badge"
                    style={{ background: getPriorityColor(rule.priority) }}
                  >
                    {rule.priority}
                  </span>
                  <button 
                    className="icon-btn edit-btn"
                    onClick={() => handleEditClick(rule)}
                    title="Edit Rule"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button 
                    className="icon-btn delete-btn"
                    onClick={() => handleDeleteClick(rule.id)}
                    title="Delete Rule"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="rules-sidebar">
          {/* AI Suggestions */}
          <div className="ai-suggestions-section">
            <div className="section-header-ai">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h3>AI Suggestions</h3>
            </div>

            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={suggestion.id} 
                  className="suggestion-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="suggestion-title">{suggestion.title}</div>
                  <button 
                    className="apply-suggestion-btn"
                    onClick={() => handleApplySuggestion(suggestion)}
                  >
                    {suggestion.description}
                  </button>
                </div>
              ))}
            </div>

            <button className="generate-more-btn" onClick={handleGenerateMore}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Generate More
            </button>
          </div>

          {/* Rule Statistics */}
          <div className="rule-statistics-section">
            <h3>Rule Statistics</h3>
            
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">Critical</span>
                <span className="stat-value">{criticalCount}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill critical"
                  style={{ width: `${(criticalCount / rules.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">High</span>
                <span className="stat-value">{highCount}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill high"
                  style={{ width: `${(highCount / rules.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">Medium</span>
                <span className="stat-value">{mediumCount}</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill medium"
                  style={{ width: `${(mediumCount / rules.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Rule Modal */}
      {editModalOpen && selectedRule && (
        <div className="rule-modal-backdrop" onClick={handleCancel}>
          <div className="rule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rule-modal-header">
              <h2>Edit Rule</h2>
              <button className="modal-close" onClick={handleCancel}>×</button>
            </div>

            <div className="rule-modal-body">
              <div className="form-group">
                <label>Rule Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={editedRuleName}
                  onChange={(e) => setEditedRuleName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select 
                  className="form-select"
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')}
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="save-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {addModalOpen && (
        <div className="rule-modal-backdrop" onClick={() => setAddModalOpen(false)}>
          <div className="rule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rule-modal-header">
              <h2>Add New Rule</h2>
              <button className="modal-close" onClick={() => setAddModalOpen(false)}>×</button>
            </div>

            <div className="rule-modal-body">
              <div className="form-group">
                <label>Rule Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Enter rule name"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select 
                  className="form-select"
                  value={newRulePriority}
                  onChange={(e) => setNewRulePriority(e.target.value as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')}
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="save-btn" onClick={handleSaveNewRule}>
                  Add Rule
                </button>
                <button className="cancel-btn" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RuleManagement
