import type { UserType } from '@/types/auth'
import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'

export type AuthContextType = {
  user: UserType | undefined
  isAuthenticated: boolean
  isLocked: boolean
  saveSession: (session: UserType) => void
  removeSession: () => void
  lockSession: () => void
  unlockSession: (password: string) => Promise<boolean>
  updateAvatar: (avatarUrl: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

const authSessionKey = '_TECHMIN_AUTH_KEY_'
const lockScreenKey = '_TECHMIN_LOCK_SCREEN_'
const lockTimestampKey = '_TECHMIN_LOCK_TIMESTAMP_'
const LOCK_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()

  const getSession = (): AuthContextType['user'] => {
    const fetchedCookie = getCookie(authSessionKey)?.toString()
    
    if (!fetchedCookie) return undefined
    
    try {
      const parsed = JSON.parse(fetchedCookie)
      // Validate that the session has required fields
      if (parsed && parsed.token && parsed.email) {
        return parsed
      }
      // Invalid session, clear it
      deleteCookie(authSessionKey)
      return undefined
    } catch (error) {
      // Invalid JSON, clear cookie
      deleteCookie(authSessionKey)
      return undefined
    }
  }

  const getLockScreenData = (): { user: UserType | null; timestamp: number | null } => {
    const lockData = getCookie(lockScreenKey)?.toString()
    const timestamp = getCookie(lockTimestampKey)?.toString()
    
    if (!lockData || !timestamp) {
      return { user: null, timestamp: null }
    }

    try {
      const user = JSON.parse(lockData)
      const lockTime = parseInt(timestamp)
      return { user, timestamp: lockTime }
    } catch (error) {
      return { user: null, timestamp: null }
    }
  }

  const [user, setUser] = useState<UserType | undefined>(getSession())
  const [isLocked, setIsLocked] = useState(false)

  // Check for expired lock screen on mount
  useEffect(() => {
    const { user: lockedUser, timestamp } = getLockScreenData()
    
    if (lockedUser && timestamp) {
      const now = Date.now()
      const elapsed = now - timestamp

      if (elapsed < LOCK_DURATION) {
        // Still within 5 minutes, show lock screen
        setIsLocked(true)
        setUser(lockedUser)
      } else {
        // More than 5 minutes, clear everything and redirect to login
        deleteCookie(lockScreenKey)
        deleteCookie(lockTimestampKey)
        deleteCookie(authSessionKey)
        setUser(undefined)
        setIsLocked(false)
        navigate('/auth/login')
      }
    }
  }, [navigate])

  // Auto-clear lock screen after 5 minutes
  useEffect(() => {
    if (isLocked) {
      const { timestamp } = getLockScreenData()
      
      if (timestamp) {
        const remaining = LOCK_DURATION - (Date.now() - timestamp)
        
        if (remaining > 0) {
          const timer = setTimeout(() => {
            // Clear everything after 5 minutes
            deleteCookie(lockScreenKey)
            deleteCookie(lockTimestampKey)
            deleteCookie(authSessionKey)
            setUser(undefined)
            setIsLocked(false)
            navigate('/auth/login')
          }, remaining)

          return () => clearTimeout(timer)
        }
      }
    }
  }, [isLocked, navigate])

  const saveSession = (user: UserType) => {
    setCookie(authSessionKey, JSON.stringify(user))
    setUser(user)
    setIsLocked(false)
    // Clear any lock screen data
    deleteCookie(lockScreenKey)
    deleteCookie(lockTimestampKey)
  }

  const updateAvatar = (avatarUrl: string) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, avatar: avatarUrl }
      setCookie(authSessionKey, JSON.stringify(updated))
      return updated
    })
  }

  // Sync fresh profile data (avatar, name) from backend on mount
  // so the nav always shows the current avatar even if the cookie is stale
  const syncProfile = useCallback(async (token: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.success && data.data) {
        setUser(prev => {
          if (!prev) return prev
          const updated = {
            ...prev,
            avatar: data.data.avatar || prev.avatar,
            name: data.data.name || prev.name,
          }
          setCookie(authSessionKey, JSON.stringify(updated))
          return updated
        })
      }
    } catch {
      // silently ignore — nav will just use the cookie value
    }
  }, [])

  useEffect(() => {
    const session = getSession()
    if (session?.token && !isLocked) {
      syncProfile(session.token)
    }
  }, [syncProfile, isLocked])

  const removeSession = () => {
    deleteCookie(authSessionKey)
    setUser(undefined)
    navigate('/auth/login')
  }

  const lockSession = () => {
    if (user) {
      // Save user data to lock screen cookie
      setCookie(lockScreenKey, JSON.stringify(user))
      setCookie(lockTimestampKey, Date.now().toString())
      // Remove auth token but keep user data
      deleteCookie(authSessionKey)
      setIsLocked(true)
      navigate('/auth/lock-screen')
    }
  }

  const unlockSession = async (password: string): Promise<boolean> => {
    const { user: lockedUser, timestamp } = getLockScreenData()
    
    if (!lockedUser || !timestamp) {
      return false
    }

    // Check if lock screen has expired
    const elapsed = Date.now() - timestamp
    if (elapsed >= LOCK_DURATION) {
      // Expired, clear everything
      deleteCookie(lockScreenKey)
      deleteCookie(lockTimestampKey)
      setUser(undefined)
      setIsLocked(false)
      navigate('/auth/login')
      return false
    }

    try {
      // Verify password with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: lockedUser.email,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Password correct, restore session
        saveSession({
          ...lockedUser,
          token: data.token,
        })
        // Clear lock screen data
        deleteCookie(lockScreenKey)
        deleteCookie(lockTimestampKey)
        setIsLocked(false)
        navigate('/dashboard')
        return true
      }

      return false
    } catch (error) {
      console.error('Unlock error:', error)
      return false
    }
  }

  // Check if user is actually authenticated (has valid token)
  const isAuthenticated = user !== undefined && user.token !== undefined && !isLocked

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLocked,
        saveSession,
        removeSession,
        lockSession,
        unlockSession,
        updateAvatar,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
