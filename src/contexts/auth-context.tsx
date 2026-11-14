'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isSuperAdmin: boolean
  isStaff: boolean
  userRole: 'super_admin' | 'moderator' | 'volunteer' | 'content_editor' | 'customer' | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  useEffect(() => {
    const supabase = createClient()

    // 1. Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)

      if (!user && !isPublicRoute) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
    })

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      setLoading(false)

      if (!currentUser && !isPublicRoute) {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, isPublicRoute, router])

  const meta = user?.user_metadata || {}
  const isSuperAdmin = user?.email === 'reshiftapp@gmail.com' || meta.role === 'super_admin'
  const isStaff = isSuperAdmin || (meta.is_staff === true && meta.approval_status === 'approved')

  const userRole: AuthContextType['userRole'] = isSuperAdmin
    ? 'super_admin'
    : meta.role || meta.requested_role || (isStaff ? 'volunteer' : 'customer')

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSuperAdmin,
        isStaff,
        userRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
