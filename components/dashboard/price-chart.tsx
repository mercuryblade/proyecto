'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Holding, Order } from '@/lib/types'

interface PriceChartProps {
  symbol: string
  holding: Holding | null
  orders: Order[]
  currentPrice: number
}

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export function PriceChart({ symbol, holding, orders, currentPrice }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const [livePrice, setLivePrice] = useState(currentPrice)
  const [priceData, setPriceData] = useState<CandleData[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // Calculate P&L
  const pnl = holding 
    ? (livePrice - holding.average_buy_price) * holding.quantity 
    : 0
  const pnlPercent = holding && holding.average_buy_price > 0
    ? ((livePrice - holding.average_buy_price) / holding.average_buy_price) * 100
    : 0

  // Load historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1m&limit=200`
        )
        const data = await response.json()
        
        const candles: CandleData[] = data.map((d: any[]) => ({
          time: Math.floor(d[0] / 1000),
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }))
        
        setPriceData(candles)
        if (candles.length > 0) {
          setLivePrice(candles[candles.length - 1].close)
        }
      } catch (error) {
        console.error('Failed to fetch historical data:', error)
      }
    }

    fetchHistoricalData()
  }, [symbol])

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || priceData.length === 0) return

    const loadChart = async () => {
      const { createChart, CrosshairMode } = await import('lightweight-charts')
      
      // Clear existing chart
      if (chartRef.current) {
        chartRef.current.remove()
      }

      const chart = createChart(chartContainerRef.current!, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: 'rgba(42, 42, 58, 0.5)' },
          horzLines: { color: 'rgba(42, 42, 58, 0.5)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(42, 42, 58, 0.5)',
        },
        timeScale: {
          borderColor: 'rgba(42, 42, 58, 0.5)',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: {
          vertTouchDrag: false,
        },
      })

      chartRef.current = chart

      // Add candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      })

      candleSeriesRef.current = candleSeries
      candleSeries.setData(priceData)

      // Add entry line if user has a holding
      if (holding && holding.average_buy_price > 0) {
        candleSeries.createPriceLine({
          price: holding.average_buy_price,
          color: '#f59e0b',
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `Entry: $${holding.average_buy_price.toFixed(2)}`,
        })
      }

      // Add markers for buy orders
      const buyOrders = orders.filter(o => o.order_type === 'buy' && o.order_status === 'executed')
      const sellOrders = orders.filter(o => o.order_type === 'sell' && o.order_status === 'executed')

      const markers = [
        ...buyOrders.map(order => ({
          time: Math.floor(new Date(order.executed_at || order.created_at).getTime() / 1000) as any,
          position: 'belowBar' as const,
          color: '#22c55e',
          shape: 'arrowUp' as const,
          text: `BUY ${order.quantity.toFixed(4)} @ $${order.price_at_order.toFixed(2)}`,
        })),
        ...sellOrders.map(order => ({
          time: Math.floor(new Date(order.executed_at || order.created_at).getTime() / 1000) as any,
          position: 'aboveBar' as const,
          color: '#ef4444',
          shape: 'arrowDown' as const,
          text: `SELL ${order.quantity.toFixed(4)} @ $${order.price_at_order.toFixed(2)}`,
        })),
      ].sort((a, b) => a.time - b.time)

      if (markers.length > 0) {
        candleSeries.setMarkers(markers)
      }

      chart.timeScale().fitContent()

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          })
        }
      }

      window.addEventListener('resize', handleResize)
      handleResize()

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }

    loadChart()

    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [priceData, holding, orders])

  // WebSocket for real-time price updates
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_1m`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.k) {
        const candle = data.k
        const newCandle: CandleData = {
          time: Math.floor(candle.t / 1000),
          open: parseFloat(candle.o),
          high: parseFloat(candle.h),
          low: parseFloat(candle.l),
          close: parseFloat(candle.c),
        }
        
        setLivePrice(newCandle.close)
        
        if (candleSeriesRef.current) {
          candleSeriesRef.current.update(newCandle)
        }
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Position & P&L Panel */}
      {holding && holding.quantity > 0 && (
        <div className="border-b border-border/50 bg-card/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Position</p>
                <p className="font-mono font-medium">
                  {holding.quantity.toFixed(6)} {symbol}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entry Price</p>
                <p className="font-mono font-medium text-amber-500">
                  {formatCurrency(holding.average_buy_price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="font-mono font-medium">
                  {formatCurrency(livePrice)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Unrealized P&L</p>
                <p className={`font-mono text-lg font-bold ${pnl >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                  {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                </p>
              </div>
              <div className={`rounded-lg px-3 py-1 ${pnl >= 0 ? 'bg-[var(--success)]/20' : 'bg-[var(--danger)]/20'}`}>
                <p className={`font-mono text-lg font-bold ${pnl >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                  {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-[400px] p-4">
        <div 
          ref={chartContainerRef} 
          className="h-full w-full rounded-lg border border-border/50"
        />
      </div>

      {/* Legend */}
      <div className="border-t border-border/50 p-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Entry Price Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[var(--success)]" />
            <span>Buy Order</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-[var(--danger)]" />
            <span>Sell Order</span>
          </div>
        </div>
      </div>
    </div>
  )
}
