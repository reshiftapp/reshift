import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { CityProvider } from '@/contexts/city-context'
import { RealtimeProvider } from '@/contexts/realtime-context'
import { DashboardShell } from '@/components/layout/dashboard-shell'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Reshift Moderator Dashboard',
  description: 'Production Control Panel for Reshift Relocation Companion',
  icons: {
    icon: '/reshift-icon.png',
    shortcut: '/reshift-icon.png',
    apple: '/reshift-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body className="h-full bg-slate-950 text-slate-100 flex overflow-hidden">
        <QueryProvider>
          <AuthProvider>
            <CityProvider>
              <RealtimeProvider>
                <DashboardShell>{children}</DashboardShell>
              </RealtimeProvider>
            </CityProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
