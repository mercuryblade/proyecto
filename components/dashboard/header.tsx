'use client'

import { TrendingUp, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-card px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">CryptoSim</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-6 md:flex">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Saldo del Portafolio</div>
            <div className="font-mono text-sm font-medium text-primary">
              {formatBalance(profile?.balance ?? 10000)}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:inline">
                {profile?.display_name || user.email?.split('@')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium">
                {profile?.display_name || 'Trader'}
              </div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="md:hidden">
              <span className="text-muted-foreground">Saldo:</span>
              <span className="ml-auto font-mono text-primary">
                {formatBalance(profile?.balance ?? 10000)}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configuracion
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
