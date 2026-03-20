import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MarketOverview } from '@/components/dashboard/market-overview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, holdingsResult, cryptosResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('holdings').select('*, cryptocurrency:cryptocurrencies(*)').eq('user_id', user?.id),
    supabase.from('cryptocurrencies').select('*').order('market_cap', { ascending: false }),
  ])

  const profile = profileResult.data
  const holdings = holdingsResult.data || []
  const cryptos = cryptosResult.data || []

  // Calculate portfolio value
  const portfolioValue = holdings.reduce((total, holding) => {
    const crypto = holding.cryptocurrency
    if (crypto) {
      return total + (holding.quantity * crypto.current_price)
    }
    return total
  }, 0)

  const totalValue = (profile?.balance || 0) + portfolioValue

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Panel Principal</h1>
        <p className="text-muted-foreground">Bienvenido de vuelta, {profile?.display_name || 'Trader'}</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Efectivo + Valor del Portafolio
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Efectivo Disponible
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profile?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Listo para operar
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor del Portafolio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">
              {holdings.length} activos
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ganancia/Perdida
            </CardTitle>
            {totalValue >= 10000 ? (
              <TrendingUp className="h-4 w-4 text-[var(--success)]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[var(--danger)]" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalValue >= 10000 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {totalValue >= 10000 ? '+' : ''}{formatCurrency(totalValue - 10000)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde que empezaste
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Resumen del Mercado</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/trade">Comenzar a Operar</Link>
          </Button>
        </div>
        <MarketOverview cryptos={cryptos} />
      </div>

      {/* Holdings */}
      {holdings.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tus Activos</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/portfolio">Ver Todo</Link>
            </Button>
          </div>
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {holdings.slice(0, 5).map((holding) => {
                  const crypto = holding.cryptocurrency
                  if (!crypto) return null
                  const value = holding.quantity * crypto.current_price
                  const pnl = value - (holding.quantity * holding.average_buy_price)
                  const pnlPercent = ((crypto.current_price - holding.average_buy_price) / holding.average_buy_price) * 100

                  return (
                    <div key={holding.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {crypto.image_url && (
                          <img
                            src={crypto.image_url}
                            alt={crypto.name}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">{crypto.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {holding.quantity.toFixed(6)} unidades
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-medium">{formatCurrency(value)}</div>
                        <div className={`text-sm ${pnl >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                          {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
