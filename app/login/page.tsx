"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserType {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

interface LoginPageProps {
  onLogin: (user: UserType) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!loginForm.email || !loginForm.password) {
        throw new Error("Please fill in all fields")
      }

      if (!validateEmail(loginForm.email)) {
        throw new Error("Please enter a valid email address")
      }

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("netflix-users") || "[]")
      const user = users.find((u: any) => u.email === loginForm.email && u.password === loginForm.password)

      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = user
      onLogin(userWithoutPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
        throw new Error("Please fill in all fields")
      }

      if (!validateEmail(registerForm.email)) {
        throw new Error("Please enter a valid email address")
      }

      if (registerForm.password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Get existing users
      const users = JSON.parse(localStorage.getItem("netflix-users") || "[]")

      // Check if email already exists
      if (users.find((u: any) => u.email === registerForm.email)) {
        throw new Error("Email already registered")
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.name}`,
        createdAt: new Date().toISOString(),
      }

      // Save to localStorage
      users.push(newUser)
      localStorage.setItem("netflix-users", JSON.stringify(users))

      // Login the user
      const { password, ...userWithoutPassword } = newUser
      onLogin(userWithoutPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const demoUser = {
      id: "demo",
      name: "Demo User",
      email: "demo@netflix.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      createdAt: new Date().toISOString(),
    }
    onLogin(demoUser)
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Netflix Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="text-red-600 text-3xl font-bold">NETFLIX</div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <Card className="w-full max-w-md bg-black/75 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="login" className="text-white data-[state=active]:bg-red-600">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="text-white data-[state=active]:bg-red-600">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4 border-red-600 bg-red-600/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-gray-400">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800"
                  onClick={handleDemoLogin}
                >
                  Try Demo Account
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-white">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="text-white">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-gray-400 text-sm py-6">
        <p>&copy; 2024 Netflix Clone. Built for demonstration purposes.</p>
      </footer>
    </div>
  )
}
