'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Cryptocurrency, Holding } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface OrderFormProps {
  crypto: Cryptocurrency | null
  balance: number
  holding: Holding | null
  userId: string
}

export function OrderForm({ crypto, balance, holding, userId }: OrderFormProps) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  if (!crypto) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">Select a cryptocurrency to trade</p>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const numericAmount = parseFloat(amount) || 0
  const totalCost = numericAmount * crypto.current_price
  const holdingQuantity = holding?.quantity || 0
  const holdingValue = holdingQuantity * crypto.current_price

  const handleBuy = async () => {
    if (!amount || numericAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (totalCost > balance) {
      setError('Insufficient balance')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cryptocurrencyId: crypto.id,
          orderType: 'buy',
          quantity: numericAmount,
          price: crypto.current_price,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute order')
      }

      setSuccess(`Successfully bought ${numericAmount} ${crypto.symbol}`)
      setAmount('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSell = async () => {
    if (!amount || numericAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (numericAmount > holdingQuantity) {
      setError('Insufficient holdings')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cryptocurrencyId: crypto.id,
          orderType: 'sell',
          quantity: numericAmount,
          price: crypto.current_price,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute order')
      }

      setSuccess(`Successfully sold ${numericAmount} ${crypto.symbol}`)
      setAmount('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const setPercentage = (percent: number, isBuy: boolean) => {
    if (isBuy) {
      const maxAmount = (balance * percent) / 100 / crypto.current_price
      setAmount(maxAmount.toFixed(6))
    } else {
      const maxAmount = (holdingQuantity * percent) / 100
      setAmount(maxAmount.toFixed(6))
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/50 p-4">
        <h2 className="font-semibold">Place Order</h2>
        <div className="mt-2 flex items-center gap-2">
          {crypto.image_url && (
            <img src={crypto.image_url} alt={crypto.name} className="h-6 w-6 rounded-full" />
          )}
          <span className="font-medium">{crypto.symbol}/USD</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="data-[state=active]:bg-[var(--success)] data-[state=active]:text-[var(--background)]">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-[var(--danger)] data-[state=active]:text-[var(--foreground)]">
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="buy-amount">Amount ({crypto.symbol})</Label>
                <span className="text-xs text-muted-foreground">
                  Available: {formatCurrency(balance)}
                </span>
              </div>
              <Input
                id="buy-amount"
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input/50 font-mono"
              />
              <div className="mt-2 flex gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setPercentage(percent, true)}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-mono">{formatCurrency(crypto.current_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-medium">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            <Button
              onClick={handleBuy}
              disabled={isLoading || totalCost > balance || numericAmount <= 0}
              className="w-full bg-[var(--success)] text-[var(--background)] hover:bg-[var(--success)]/90"
            >
              {isLoading ? 'Processing...' : `Buy ${crypto.symbol}`}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="sell-amount">Amount ({crypto.symbol})</Label>
                <span className="text-xs text-muted-foreground">
                  Holdings: {holdingQuantity.toFixed(6)}
                </span>
              </div>
              <Input
                id="sell-amount"
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input/50 font-mono"
              />
              <div className="mt-2 flex gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setPercentage(percent, false)}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-mono">{formatCurrency(crypto.current_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-medium">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holdings Value</span>
                <span className="font-mono">{formatCurrency(holdingValue)}</span>
              </div>
            </div>

            <Button
              onClick={handleSell}
              disabled={isLoading || numericAmount > holdingQuantity || numericAmount <= 0}
              className="w-full bg-[var(--danger)] text-[var(--foreground)] hover:bg-[var(--danger)]/90"
            >
              {isLoading ? 'Processing...' : `Sell ${crypto.symbol}`}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}
        {success && (
          <p className="mt-4 text-sm text-[var(--success)]">{success}</p>
        )}
      </div>
    </div>
  )
}
