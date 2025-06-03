"use client"

import { useState, useEffect } from "react"
import LoginPage from "./login/page"
import NetflixHome from "./home/page"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("netflix-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem("netflix-user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("netflix-user")
    localStorage.removeItem(`netflix-videos-${user?.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 text-4xl font-bold animate-pulse">NETFLIX</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <NetflixHome user={user} onLogout={handleLogout} />
}
