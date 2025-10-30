import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import SignIn from './components/SignIn'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleSignIn = () => {
    setIsAuthenticated(true)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <SignIn onSignIn={handleSignIn} />
  }

  return <Dashboard onSignOut={handleSignOut} />
}

export default App
