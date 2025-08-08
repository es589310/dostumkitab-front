"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api, { type User, type LoginData, type RegisterData } from "@/lib/api"

interface AuthContextType {
  user: User | null
  login: (credentials: LoginData) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Səhifə yüklənəndə istifadəçi məlumatlarını yoxla
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) {
        const userData = await api.getProfile()
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      // Token invalid olarsa təmizlə
      api.logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginData) => {
    try {
      const response = await api.login(credentials)
      setUser(response.user)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.register(userData)
      setUser(response.user)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
