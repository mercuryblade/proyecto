import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, holdingsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('holdings').select('*, cryptocurrency:cryptocurrencies(*)').eq('user_id', user?.id),
  ])

  const profile = profileResult.data
  const holdings = holdingsResult.data || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Calculate portfolio stats
  const portfolioValue = holdings.reduce((total, holding) => {
    const crypto = holding.cryptocurrency
    if (crypto) {
      return total + (holding.quantity * crypto.current_price)
    }
    return total
  }, 0)

  const totalInvested = holdings.reduce((total, holding) => {
    return total + (holding.quantity * holding.average_buy_price)
  }, 0)

  const totalPnL = portfolioValue - totalInvested
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">Manage your cryptocurrency holdings</p>
      </div>

      {/* Portfolio Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 text-2xl font-bold ${totalPnL >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
              <span className="text-sm font-normal">
                ({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings */}
      {holdings.length > 0 ? (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Asset</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Avg. Buy Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Current Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Value</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">P&L</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {holdings.map((holding) => {
                    const crypto = holding.cryptocurrency
                    if (!crypto) return null
                    
                    const value = holding.quantity * crypto.current_price
                    const invested = holding.quantity * holding.average_buy_price
                    const pnl = value - invested
                    const pnlPercent = ((crypto.current_price - holding.average_buy_price) / holding.average_buy_price) * 100

                    return (
                      <tr key={holding.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
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
                              <div className="text-sm text-muted-foreground">{crypto.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono">
                          {holding.quantity.toFixed(6)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono">
                          {formatCurrency(holding.average_buy_price)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono">
                          {formatCurrency(crypto.current_price)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-medium">
                          {formatCurrency(value)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className={`font-medium ${pnl >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                          </div>
                          <div className={`text-sm ${pnlPercent >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/trade?symbol=${crypto.symbol}`}>
                              Trade
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">You don{"'"}t have any holdings yet</p>
            <Button asChild>
              <Link href="/dashboard/trade">Start Trading</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
