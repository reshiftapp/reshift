import React from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { MetricCard } from '@/components/dashboard/metric-card'
import { OverviewCharts } from '@/components/dashboard/overview-charts'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { Database } from '@/types/database.types'
import { 
  Users, 
  Home, 
  MessageSquare, 
  LifeBuoy, 
  Calendar, 
  UtensilsCrossed 
} from 'lucide-react'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type PropertyRow = Database['public']['Tables']['properties']['Row']
type PostRow = Database['public']['Tables']['community_posts']['Row']
type TicketRow = Database['public']['Tables']['support_tickets']['Row']
type EventRow = Database['public']['Tables']['events']['Row']
type FoodSpotRow = Database['public']['Tables']['food_spots']['Row']

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Query 1: User Profiles & Demographics
  const { data: rawProfiles } = await supabaseAdmin.from('profiles').select('*')
  const profiles = (rawProfiles || []) as ProfileRow[]

  // Query 2: Active Properties
  const { data: rawProperties } = await supabaseAdmin.from('properties').select('*')
  const properties = (rawProperties || []) as PropertyRow[]

  // Query 3: Community Posts
  const { data: rawPosts } = await supabaseAdmin.from('community_posts').select('*')
  const posts = (rawPosts || []) as PostRow[]

  // Query 4: Support Tickets
  const { data: rawTickets } = await supabaseAdmin.from('support_tickets').select('*')
  const tickets = (rawTickets || []) as TicketRow[]

  // Query 5: Events
  const { data: rawEvents } = await supabaseAdmin.from('events').select('*')
  const events = (rawEvents || []) as EventRow[]

  // Query 6: Food Spots
  const { data: rawFoodSpots } = await supabaseAdmin.from('food_spots').select('*')
  const foodSpots = (rawFoodSpots || []) as FoodSpotRow[]

  // Filter customer profiles (excluding Super Admin root account)
  const customerProfiles = profiles.filter((p) => p.email !== 'reshiftapp@gmail.com')

  // Compute KPI counts from real live database rows
  const totalUsers = customerProfiles.length
  const activeProperties = properties.filter((p) => p.is_active).length
  const totalPosts = posts.length
  const openTickets = tickets.filter((t) => t.status === 'Open').length
  const totalEvents = events.length
  const totalFoodSpots = foodSpots.length

  // Posts created today
  const todayIso = new Date().toISOString().slice(0, 10)
  const postsToday = posts.filter((p) => p.created_at?.startsWith(todayIso)).length

  // User registration trend over time (aggregated daily)
  const regMap: Record<string, number> = {}
  customerProfiles.forEach((u) => {
    if (u.created_at) {
      const d = u.created_at.slice(0, 10)
      regMap[d] = (regMap[d] || 0) + 1
    }
  })
  const registrationTrends = Object.entries(regMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, users]) => ({ date, users }))

  // Community posts category breakdown
  const catMap: Record<string, number> = {}
  posts.forEach((p) => {
    const c = p.category || 'General'
    catMap[c] = (catMap[c] || 0) + 1
  })
  const categoryDistribution = Object.entries(catMap).map(([category, count]) => ({
    category,
    count,
  }))

  // User demographic roles breakdown (registered app customers only)
  const roleMap: Record<string, number> = {}
  customerProfiles.forEach((u) => {
    const r = u.role || 'Unspecified'
    roleMap[r] = (roleMap[r] || 0) + 1
  })
  const roleDistribution = Object.entries(roleMap).map(([role, count]) => ({
    role,
    count,
  }))

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">System Overview</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time control metrics synchronized with the Reshift mobile app.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* KPI 6-Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          subtitle="Registered accounts"
          icon={Users}
          colorScheme="indigo"
        />
        <MetricCard
          title="Active PGs"
          value={activeProperties}
          subtitle="Live on mobile app"
          icon={Home}
          colorScheme="emerald"
        />
        <MetricCard
          title="Community Posts"
          value={totalPosts}
          subtitle={`${postsToday} posted today`}
          icon={MessageSquare}
          colorScheme="purple"
        />
        <MetricCard
          title="Open Tickets"
          value={openTickets}
          subtitle="Requires attention"
          icon={LifeBuoy}
          colorScheme="rose"
        />
        <MetricCard
          title="Events Listed"
          value={totalEvents}
          subtitle="City happenings"
          icon={Calendar}
          colorScheme="sky"
        />
        <MetricCard
          title="Food Spots"
          value={totalFoodSpots}
          subtitle="Restaurants & cafés"
          icon={UtensilsCrossed}
          colorScheme="amber"
        />
      </div>

      {/* Real-time Analytics Visualizations */}
      <OverviewCharts
        registrationTrends={registrationTrends}
        categoryDistribution={categoryDistribution}
        roleDistribution={roleDistribution}
      />
    </div>
  )
}
