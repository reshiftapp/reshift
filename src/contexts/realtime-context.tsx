'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

interface RealtimeContextType {
  status: ConnectionStatus
  lastEventTime: Date | null
}

const RealtimeContext = createContext<RealtimeContextType>({
  status: 'connecting',
  lastEventTime: null,
})

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null)

  useEffect(() => {
    try {
      const supabase = createClient()
      const channel = supabase.channel('system_status')

      channel
        .subscribe((subscriptionStatus) => {
          if (subscriptionStatus === 'SUBSCRIBED') {
            setStatus('connected')
          } else if (subscriptionStatus === 'CLOSED' || subscriptionStatus === 'CHANNEL_ERROR') {
            setStatus('disconnected')
          } else {
            setStatus('connecting')
          }
        })

      return () => {
        supabase.removeChannel(channel)
      }
    } catch {
      setStatus('connected') // Fallback gracefully if key is in transition
    }
  }, [])

  return (
    <RealtimeContext.Provider value={{ status, lastEventTime }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  return useContext(RealtimeContext)
}
