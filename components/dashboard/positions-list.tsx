'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TrendingUp, TrendingDown, X, Target, Shield } from 'lucide-react'
import type { Position } from '@/lib/types'

interface PositionsListProps {
  currentPrices: Record<string, number>
  onPositionClosed?: () => void
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function PositionsList({ currentPrices, onPositionClosed }: PositionsListProps) {
  const { data: positions, error, mutate } = useSWR<Position[]>('/api/positions', fetcher, {
    refreshInterval: 5000,
  })
  const [closingPosition, setClosingPosition] = useState<Position | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const calculatePnL = (position: Position) => {
    const currentPrice = currentPrices[position.cryptocurrency?.symbol || ''] || position.entry_price
    let pnl = 0

    if (position.position_type === 'long') {
      pnl = (currentPrice - position.entry_price) * position.quantity
    } else {
      pnl = (position.entry_price - currentPrice) * position.quantity
    }

    return pnl * position.leverage
  }

  const calculatePnLPercent = (position: Position) => {
    const pnl = calculatePnL(position)
    return (pnl / position.margin) * 100
  }

  const handleClosePosition = async () => {
    if (!closingPosition) return

    setIsClosing(true)
    try {
      const currentPrice = currentPrices[closingPosition.cryptocurrency?.symbol || ''] || closingPosition.entry_price

      const response = await fetch(`/api/positions/${closingPosition.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ close_price: currentPrice, reason: 'manual' }),
      })

      if (response.ok) {
        mutate()
        onPositionClosed?.()
      }
    } catch (error) {
      console.error('Error closing position:', error)
    } finally {
      setIsClosing(false)
      setClosingPosition(null)
    }
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center text-muted-foreground">
          Error al cargar posiciones
        </CardContent>
      </Card>
    )
  }

  if (!positions || positions.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Posiciones Abiertas</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          No tienes posiciones abiertas
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Posiciones Abiertas
            <Badge variant="secondary" className="text-xs">
              {positions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Par</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs text-right">Entrada</TableHead>
                <TableHead className="text-xs text-right">Actual</TableHead>
                <TableHead className="text-xs text-right">Cantidad</TableHead>
                <TableHead className="text-xs text-right">Margen</TableHead>
                <TableHead className="text-xs text-right">P&L</TableHead>
                <TableHead className="text-xs text-center">TP/SL</TableHead>
                <TableHead className="text-xs text-center">Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => {
                const currentPrice = currentPrices[position.cryptocurrency?.symbol || ''] || position.entry_price
                const pnl = calculatePnL(position)
                const pnlPercent = calculatePnLPercent(position)
                const isProfitable = pnl >= 0

                return (
                  <TableRow key={position.id} className="text-xs">
                    <TableCell className="font-medium">
                      {position.cryptocurrency?.symbol || 'N/A'}/USD
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={position.position_type === 'long' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {position.position_type === 'long' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {position.position_type.toUpperCase()}
                        {position.leverage > 1 && ` ${position.leverage}x`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${position.entry_price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${currentPrice.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {position.quantity.toLocaleString('es-MX', { maximumFractionDigits: 6 })}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${position.margin.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-medium ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                      {isProfitable ? '+' : ''}{pnl.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <br />
                      <span className="text-[10px] opacity-70">
                        ({isProfitable ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-0.5">
                        {position.take_profit && (
                          <span className="flex items-center justify-center gap-1 text-green-500">
                            <Target className="h-3 w-3" />
                            ${position.take_profit.toLocaleString()}
                          </span>
                        )}
                        {position.stop_loss && (
                          <span className="flex items-center justify-center gap-1 text-red-500">
                            <Shield className="h-3 w-3" />
                            ${position.stop_loss.toLocaleString()}
                          </span>
                        )}
                        {!position.take_profit && !position.stop_loss && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => setClosingPosition(position)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cerrar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!closingPosition} onOpenChange={() => setClosingPosition(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar Posicion</AlertDialogTitle>
            <AlertDialogDescription>
              {closingPosition && (
                <>
                  ¿Estas seguro que deseas cerrar tu posicion{' '}
                  <strong>{closingPosition.position_type.toUpperCase()}</strong> de{' '}
                  <strong>{closingPosition.cryptocurrency?.symbol}</strong>?
                  <br />
                  <br />
                  P&L estimado:{' '}
                  <span className={calculatePnL(closingPosition) >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${calculatePnL(closingPosition).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClosePosition}
              disabled={isClosing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isClosing ? 'Cerrando...' : 'Cerrar Posicion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
