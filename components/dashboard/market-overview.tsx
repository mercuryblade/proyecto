'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { Cryptocurrency } from '@/lib/types'
import Link from 'next/link'

interface MarketOverviewProps {
  cryptos: Cryptocurrency[]
}

export function MarketOverview({ cryptos }: MarketOverviewProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value)
  }

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return formatCurrency(value)
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Asset</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">24h Change</th>
                <th className="hidden px-4 py-3 text-right text-sm font-medium text-muted-foreground md:table-cell">Market Cap</th>
                <th className="hidden px-4 py-3 text-right text-sm font-medium text-muted-foreground lg:table-cell">Volume (24h)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {cryptos.map((crypto) => (
                <tr key={crypto.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrency(crypto.current_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${
                        crypto.price_change_24h >= 0
                          ? 'text-[var(--success)]'
                          : 'text-[var(--danger)]'
                      }`}
                    >
                      {crypto.price_change_24h >= 0 ? '+' : ''}
                      {crypto.price_change_24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-muted-foreground md:table-cell">
                    {formatLargeNumber(crypto.market_cap)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">
                    {formatLargeNumber(crypto.volume_24h)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/trade?symbol=${crypto.symbol}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
