'use client'

import { useRouter } from 'next/navigation'
import type { Cryptocurrency } from '@/lib/types'

interface CryptoSelectorProps {
  cryptos: Cryptocurrency[]
  selectedSymbol: string
}

export function CryptoSelector({ cryptos, selectedSymbol }: CryptoSelectorProps) {
  const router = useRouter()
  const selectedCrypto = cryptos.find(c => c.symbol === selectedSymbol) || cryptos[0]

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

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <select
          value={selectedSymbol}
          onChange={(e) => router.push(`/dashboard/trade?symbol=${e.target.value}`)}
          className="bg-input border border-border/50 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {cryptos.map((crypto) => (
            <option key={crypto.id} value={crypto.symbol}>
              {crypto.symbol} - {crypto.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCrypto && (
        <div className="flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(selectedCrypto.current_price)}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">24h: </span>
              <span
                className={`font-medium ${
                  selectedCrypto.price_change_24h >= 0
                    ? 'text-[var(--success)]'
                    : 'text-[var(--danger)]'
                }`}
              >
                {selectedCrypto.price_change_24h >= 0 ? '+' : ''}
                {selectedCrypto.price_change_24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
