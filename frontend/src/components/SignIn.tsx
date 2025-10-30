import { useState } from 'react'
import './SignIn.css'

interface SignInProps {
  onSignIn: () => void
}

function SignIn({ onSignIn }: SignInProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      alert('Please enter both username and password')
      return
    }

    setIsLoading(true)
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      onSignIn()
    }, 1500)
  }

  return (
    <div className="signin-container">
      <div className="signin-background">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
      </div>

      <div className="signin-card">
        <div className="signin-header">
          <div className="shield-icon">
            <svg viewBox="0 0 100 100" fill="none" className="shield-svg">
              <defs>
                <linearGradient id="shieldGradientSignIn" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <filter id="glowSignIn">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Shield outline */}
              <path 
                className="shield-outline-signin"
                d="M50 10 L20 20 L20 45 C20 65 50 85 50 85 C50 85 80 65 80 45 L80 20 Z" 
                stroke="url(#shieldGradientSignIn)" 
                strokeWidth="2" 
                fill="none"
                filter="url(#glowSignIn)"
              />
              
              {/* Circuit board pattern */}
              <g className="circuit-pattern-signin" opacity="0.6">
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
                className="lightning-bolt-signin"
                d="M55 25 L35 50 L48 50 L45 75 L65 45 L52 45 Z" 
                fill="url(#shieldGradientSignIn)"
                filter="url(#glowSignIn)"
              />
              
              {/* Energy particles */}
              <circle className="particle-signin particle-signin-1" cx="50" cy="50" r="1" fill="#00d4ff"/>
              <circle className="particle-signin particle-signin-2" cx="50" cy="50" r="1" fill="#a78bfa"/>
              <circle className="particle-signin particle-signin-3" cx="50" cy="50" r="1" fill="#00ff88"/>
            </svg>
          </div>
          <h1>ELK APT Detection System</h1>
          <p>Secure Access Portal</p>
        </div>

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="signin-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              'Access System'
            )}
          </button>
        </form>

        <div className="signin-footer">
          Protected by Advanced Threat Detection
        </div>
      </div>
    </div>
  )
}

export default SignIn
