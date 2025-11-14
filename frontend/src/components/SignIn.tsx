import { useState } from 'react';
import { loginWithEmailAndPassword, signInWithGoogle, registerWithEmailAndPassword } from '../firebase/config';
import './SignIn.css';

interface SignInProps {
  onSignIn: (user: any) => void;
}

function SignIn({ onSignIn }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        // Handle registration
        const user = await registerWithEmailAndPassword(email, password);
        onSignIn(user);
      } else {
        // Handle login
        const user = await loginWithEmailAndPassword(email, password);
        onSignIn(user);
      }
    } catch (err: any) {
      // More specific error messages based on error code
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email. Please register first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please sign in or use a different email.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      onSignIn(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

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
              
              {/* Shield inner fill */}
              <path 
                className="shield-inner-signin"
                d="M50 10 L20 20 L20 45 C20 65 50 85 50 85 C50 85 80 65 80 45 L80 20 Z" 
                fill="rgba(0, 0, 0, 0.2)"
                stroke="none"
              />
              
              {/* Lock icon */}
              <path 
                className="shield-lock-signin"
                d="M45 50 L45 40 C45 37.24 47.24 35 50 35 C52.76 35 55 37.24 55 40 L55 50" 
                stroke="#fff" 
                strokeWidth="2"
                fill="none"
              />
              <rect 
                x="40" 
                y="50" 
                width="20" 
                height="15" 
                rx="2" 
                fill="#fff"
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
            </svg>
          </div>
          <h2>{isRegistering ? 'Create Account' : 'Sign In'}</h2>
          <p>Secure Access to SurakshaNet</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0110 0v4"></path>
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="signin-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isRegistering ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isRegistering ? 'Create Account' : 'Sign In'
            )}
          </button>

          <div className="divider">OR</div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="google-signin-button"
          >
            {/* Inline Google "G" logo (robust, no external network dependency) */}
            <span className="google-logo" aria-hidden>
              <svg viewBox="0 0 533.5 544.3" width="20" height="20" xmlns="http://www.w3.org/2000/svg" focusable="false" role="img">
                <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.6-36.5-4.7-53.9H272v102.1h146.9c-6.3 34.3-25.2 63.4-53.8 83v68.8h86.9c50.8-46.8 82.5-115.8 82.5-200z"/>
                <path fill="#34A853" d="M272 544.3c72.9 0 134.3-24.2 179-65.7l-86.9-68.8c-24.2 16.3-55 25.9-92.1 25.9-70.8 0-130.8-47.8-152.2-112.1H31.5v70.6C75.9 483.3 168.2 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M119.8 323.6c-10.8-32.3-10.8-66.9 0-99.2V153.8H31.5C11.2 197.3 0 238.9 0 278.4s11.2 81.1 31.5 124.6l88.3-79.4z"/>
                <path fill="#EA4335" d="M272 109.6c39.6 0 75.3 13.6 103.5 40.3l77.6-77.6C406.3 24.2 344.9 0 272 0 168.2 0 75.9 61 31.5 153.8l88.3 70.6C141.2 157.4 201.2 109.6 272 109.6z"/>
              </svg>
            </span>
            <span className="google-button-text">
              {isRegistering ? 'Sign up with Google' : 'Sign in with Google'}
            </span>
          </button>

          <p className="toggle-form">
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="toggle-button"
              disabled={isLoading}
            >
              {isRegistering ? 'Sign in' : 'Register'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default SignIn
