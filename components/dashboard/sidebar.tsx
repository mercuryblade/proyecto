'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Wallet,
  History,
  Bot,
  Crown,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Operar', href: '/dashboard/trade', icon: BarChart3 },
  { name: 'Portafolio', href: '/dashboard/portfolio', icon: Wallet },
  { name: 'Historial', href: '/dashboard/history', icon: History },
  { name: 'Asistente IA', href: '/dashboard/assistant', icon: Bot },
  { name: 'Membresia', href: '/dashboard/membership', icon: Crown },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-border/50 bg-sidebar md:block">
      <nav className="flex flex-col gap-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
