'use client'

import { useState } from 'react'
import { PriceChart } from '@/components/dashboard/price-chart'
import { OrderForm } from '@/components/dashboard/order-form'
import { CryptoSelector } from '@/components/dashboard/crypto-selector'
import type { Cryptocurrency, Holding, Order, Profile } from '@/lib/types'

interface TradingInterfaceProps {
  cryptos: Cryptocurrency[]
  selectedSymbol: string
  selectedCrypto: Cryptocurrency | null
  holding: Holding | null
  orders: Order[]
  profile: Profile | null
  userId: string
}

export function TradingInterface({
  cryptos,
  selectedSymbol,
  selectedCrypto,
  holding,
  orders,
  profile,
  userId,
}: TradingInterfaceProps) {
  const [takeProfit, setTakeProfit] = useState<number | null>(null)
  const [stopLoss, setStopLoss] = useState<number | null>(null)

  const handleTpSlChange = (tp: number | null, sl: number | null) => {
    setTakeProfit(tp)
    setStopLoss(sl)
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Main Chart Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Crypto Selector */}
        <div className="border-b border-border/50 bg-card/50 p-4">
          <CryptoSelector cryptos={cryptos} selectedSymbol={selectedSymbol} />
        </div>

        {/* Price Chart with Position Info */}
        <div className="flex-1">
          <PriceChart 
            symbol={selectedSymbol} 
            holding={holding}
            orders={orders}
            currentPrice={selectedCrypto?.current_price || 0}
            takeProfit={takeProfit}
            stopLoss={stopLoss}
            onTpSlChange={handleTpSlChange}
          />
        </div>
      </div>

      {/* Order Panel */}
      <div className="w-full border-t border-border/50 bg-card/80 lg:w-80 lg:border-l lg:border-t-0">
        <OrderForm
          crypto={selectedCrypto}
          balance={profile?.balance || 0}
          holding={holding}
          userId={userId}
        />
      </div>
    </div>
  )
}
