import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { TransportManager } from '@/components/transport/transport-manager'
import { Database } from '@/types/database.types'
import { Bus } from 'lucide-react'

type RouteRow = Database['public']['Tables']['bus_routes']['Row']
type StopRow = Database['public']['Tables']['transport_stops']['Row']
type RouteStopRow = Database['public']['Tables']['bus_route_stops']['Row']

export const dynamic = 'force-dynamic'

export default async function TransportPage() {
  const { data: rawRoutes } = await supabaseAdmin.from('bus_routes').select('*')
  const routes = (rawRoutes || []) as RouteRow[]

  const { data: rawStops } = await supabaseAdmin.from('transport_stops').select('*')
  const stops = (rawStops || []) as StopRow[]

  const { data: rawRouteStops } = await supabaseAdmin.from('bus_route_stops').select('*')
  const routeStops = (rawRouteStops || []) as RouteStopRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Bus className="w-6 h-6 text-[#5B6FD0]" />
          <span>Transport & Transit Schedule Control</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage local bus routes, transit stops, departure timers, and ordered stop sequences shown in the mobile app.
        </p>
      </div>

      <TransportManager
        routes={routes}
        stops={stops}
        routeStops={routeStops}
      />
    </div>
  )
}
