import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { Spinner } from './components/UI'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for saved session
    try {
      const saved = localStorage.getItem('ct_user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
    setLoading(false)
  }, [])

  const handleLogin = (u) => setUser(u)

  const handleLogout = () => {
    localStorage.removeItem('ct_user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-dvh gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl">🚗</div>
          <Spinner size={28} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="login"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div key="dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <Dashboard user={user} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
      <Analytics />
    </div>
  )
}
