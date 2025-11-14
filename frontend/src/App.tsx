import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import SignIn from './components/SignIn'
import { auth, logout } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleSignIn = (authenticatedUser: any) => {
    setUser(authenticatedUser)
  }

  const handleSignOut = async () => {
    try {
      await logout()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0f'
      }}>
        <div style={{ color: '#00d4ff', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <SignIn onSignIn={handleSignIn} />
  }

  return <Dashboard onSignOut={handleSignOut} />
}

export default App
