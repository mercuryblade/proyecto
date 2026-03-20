'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Holding, Order } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RefreshCw, Target, ShieldAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface PriceChartProps {
  symbol: string
  holding: Holding | null
  orders: Order[]
  currentPrice: number
  takeProfit?: number | null
  stopLoss?: number | null
  onTpSlChange?: (tp: number | null, sl: number | null) => void
  onQuickOrder?: (type: 'buy' | 'sell', price: number) => void
}

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function PriceChart({ 
  symbol, 
  holding, 
  orders, 
  currentPrice,
  takeProfit,
  stopLoss,
  onTpSlChange,
  onQuickOrder
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candleSeriesRef = useRef<any>(null)
  const volumeSeriesRef = useRef<any>(null)
  const tpLineRef = useRef<any>(null)
  const slLineRef = useRef<any>(null)
  const [livePrice, setLivePrice] = useState(currentPrice)
  const [priceData, setPriceData] = useState<CandleData[]>([])
  const [volumeData, setVolumeData] = useState<{ time: number; value: number; color: string }[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const [timeframe, setTimeframe] = useState('1m')
  const [isLoading, setIsLoading] = useState(true)
  const [showTpSlPopover, setShowTpSlPopover] = useState(false)
  const [tempTp, setTempTp] = useState<string>(takeProfit?.toString() || '')
  const [tempSl, setTempSl] = useState<string>(stopLoss?.toString() || '')
  const [clickedPrice, setClickedPrice] = useState<number | null>(null)

  // Calculate P&L
  const pnl = holding 
    ? (livePrice - holding.average_buy_price) * holding.quantity 
    : 0
  const pnlPercent = holding && holding.average_buy_price > 0
    ? ((livePrice - holding.average_buy_price) / holding.average_buy_price) * 100
    : 0

  // Load historical data
  const fetchHistoricalData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${timeframe}&limit=200`
      )
      const data = await response.json()
      
      const candles: CandleData[] = data.map((d: any[]) => ({
        time: Math.floor(d[0] / 1000),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }))
      
      const volumes = candles.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      }))
      
      setPriceData(candles)
      setVolumeData(volumes)
      if (candles.length > 0) {
        setLivePrice(candles[candles.length - 1].close)
      }
    } catch (error) {
      console.error('Error al cargar datos historicos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [symbol, timeframe])

  useEffect(() => {
    fetchHistoricalData()
  }, [fetchHistoricalData])

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || priceData.length === 0) return

    const loadChart = async () => {
      const { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } = await import('lightweight-charts')
      
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
          vertLine: {
            color: 'rgba(255, 255, 255, 0.3)',
            labelBackgroundColor: 'rgba(42, 42, 58, 0.9)',
          },
          horzLine: {
            color: 'rgba(255, 255, 255, 0.3)',
            labelBackgroundColor: 'rgba(42, 42, 58, 0.9)',
          },
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

      // Add click handler for placing orders on chart
      chart.subscribeClick((param) => {
        if (param.point && param.seriesData.size > 0) {
          const price = candleSeriesRef.current?.coordinateToPrice(param.point.y)
          if (price && price > 0) {
            setClickedPrice(price)
          }
        }
      })

      // Add candlestick series (v5 API uses addSeries with series type)
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      })

      candleSeriesRef.current = candleSeries
      candleSeries.setData(priceData)

      // Add volume series (v5 API uses addSeries with series type)
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      })
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })
      volumeSeriesRef.current = volumeSeries
      volumeSeries.setData(volumeData)

      // Add entry line if user has a holding
      if (holding && holding.average_buy_price > 0) {
        candleSeries.createPriceLine({
          price: holding.average_buy_price,
          color: '#f59e0b',
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `Entrada: $${holding.average_buy_price.toFixed(2)}`,
        })
      }

      // Add Take Profit line
      if (takeProfit && takeProfit > 0) {
        tpLineRef.current = candleSeries.createPriceLine({
          price: takeProfit,
          color: '#22c55e',
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `TP: $${takeProfit.toFixed(2)}`,
        })
      }

      // Add Stop Loss line
      if (stopLoss && stopLoss > 0) {
        slLineRef.current = candleSeries.createPriceLine({
          price: stopLoss,
          color: '#ef4444',
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `SL: $${stopLoss.toFixed(2)}`,
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
          text: `COMPRA ${order.quantity.toFixed(4)} @ $${order.price_at_order.toFixed(2)}`,
        })),
        ...sellOrders.map(order => ({
          time: Math.floor(new Date(order.executed_at || order.created_at).getTime() / 1000) as any,
          position: 'aboveBar' as const,
          color: '#ef4444',
          shape: 'arrowDown' as const,
          text: `VENTA ${order.quantity.toFixed(4)} @ $${order.price_at_order.toFixed(2)}`,
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
  }, [priceData, volumeData, holding, orders, takeProfit, stopLoss])

  // WebSocket for real-time price updates
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_${timeframe}`)
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
          volume: parseFloat(candle.v),
        }
        
        setLivePrice(newCandle.close)
        
        if (candleSeriesRef.current) {
          candleSeriesRef.current.update(newCandle)
        }
        
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.update({
            time: newCandle.time,
            value: newCandle.volume,
            color: newCandle.close >= newCandle.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
          })
        }
      }
    }

    ws.onerror = (error) => {
      console.error('Error de WebSocket:', error)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol, timeframe])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleZoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale()
      const visibleRange = timeScale.getVisibleLogicalRange()
      if (visibleRange) {
        const newRange = {
          from: visibleRange.from + (visibleRange.to - visibleRange.from) * 0.1,
          to: visibleRange.to - (visibleRange.to - visibleRange.from) * 0.1,
        }
        timeScale.setVisibleLogicalRange(newRange)
      }
    }
  }

  const handleZoomOut = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale()
      const visibleRange = timeScale.getVisibleLogicalRange()
      if (visibleRange) {
        const newRange = {
          from: visibleRange.from - (visibleRange.to - visibleRange.from) * 0.2,
          to: visibleRange.to + (visibleRange.to - visibleRange.from) * 0.2,
        }
        timeScale.setVisibleLogicalRange(newRange)
      }
    }
  }

  const handleReset = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }

  const handleApplyTpSl = () => {
    const tp = tempTp ? parseFloat(tempTp) : null
    const sl = tempSl ? parseFloat(tempSl) : null
    onTpSlChange?.(tp, sl)
    setShowTpSlPopover(false)
  }

  const setTpFromChart = () => {
    if (clickedPrice) {
      setTempTp(clickedPrice.toFixed(2))
    }
  }

  const setSlFromChart = () => {
    if (clickedPrice) {
      setTempSl(clickedPrice.toFixed(2))
    }
  }

  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1D', value: '1d' },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Position & P&L Panel */}
      {holding && holding.quantity > 0 && (
        <div className="border-b border-border/50 bg-card/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Posicion</p>
                <p className="font-mono font-medium">
                  {holding.quantity.toFixed(6)} {symbol}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio de Entrada</p>
                <p className="font-mono font-medium text-amber-500">
                  {formatCurrency(holding.average_buy_price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio Actual</p>
                <p className="font-mono font-medium">
                  {formatCurrency(livePrice)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">P&L No Realizado</p>
                <p className={`font-mono text-lg font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                </p>
              </div>
              <div className={`rounded-lg px-3 py-1 ${pnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <p className={`font-mono text-lg font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-4 py-2">
        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setTimeframe(tf.value)}
            >
              {tf.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {/* TP/SL Quick Setup */}
          <Popover open={showTpSlPopover} onOpenChange={setShowTpSlPopover}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">TP/SL</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Configurar TP/SL desde Grafico</h4>
                  <p className="text-xs text-muted-foreground">
                    Haz clic en el grafico para seleccionar un precio, luego usa los botones para establecerlo como TP o SL.
                  </p>
                </div>
                
                {clickedPrice && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Precio seleccionado:</p>
                    <p className="font-mono font-medium text-lg">${clickedPrice.toFixed(2)}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-green-500" onClick={setTpFromChart}>
                        <Target className="h-3 w-3 mr-1" /> Usar como TP
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-500" onClick={setSlFromChart}>
                        <ShieldAlert className="h-3 w-3 mr-1" /> Usar como SL
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tp" className="text-green-500 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Take Profit (USD)
                    </Label>
                    <Input
                      id="tp"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 70000"
                      value={tempTp}
                      onChange={(e) => setTempTp(e.target.value)}
                      className="border-green-500/30 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sl" className="text-red-500 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" /> Stop Loss (USD)
                    </Label>
                    <Input
                      id="sl"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 60000"
                      value={tempSl}
                      onChange={(e) => setTempSl(e.target.value)}
                      className="border-red-500/30 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowTpSlPopover(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleApplyTpSl}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Order Buttons when price is clicked */}
      {clickedPrice && onQuickOrder && (
        <div className="flex items-center justify-center gap-2 border-b border-border/50 bg-card/30 px-4 py-2">
          <span className="text-xs text-muted-foreground">
            Precio: <span className="font-mono font-medium">${clickedPrice.toFixed(2)}</span>
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 text-xs text-green-500 border-green-500/30"
            onClick={() => onQuickOrder('buy', clickedPrice)}
          >
            Comprar aqui
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 text-xs text-red-500 border-red-500/30"
            onClick={() => onQuickOrder('sell', clickedPrice)}
          >
            Vender aqui
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 text-xs"
            onClick={() => setClickedPrice(null)}
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-[400px] p-2 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Cargando grafico...</span>
            </div>
          </div>
        )}
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
            <span>Linea de Entrada</span>
          </div>
          {takeProfit && takeProfit > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Take Profit (TP)</span>
            </div>
          )}
          {stopLoss && stopLoss > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Stop Loss (SL)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-green-500" />
            <span>Orden de Compra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-red-500" />
            <span>Orden de Venta</span>
          </div>
          <div className="ml-auto text-xs">
            <span className="text-muted-foreground">Haz clic en el grafico para configurar TP/SL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
