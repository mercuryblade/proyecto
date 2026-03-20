import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { close_price, reason } = body // reason: 'manual' | 'tp' | 'sl' | 'liquidation'

    if (!close_price) {
      return NextResponse.json({ error: 'Precio de cierre requerido' }, { status: 400 })
    }

    // Get the position
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'open')
      .single()

    if (positionError || !position) {
      return NextResponse.json({ error: 'Posicion no encontrada' }, { status: 404 })
    }

    // Calculate P&L
    let pnl = 0
    if (position.position_type === 'long') {
      // LONG: profit when price goes up
      pnl = (close_price - position.entry_price) * position.quantity
    } else {
      // SHORT: profit when price goes down
      pnl = (position.entry_price - close_price) * position.quantity
    }

    // Apply leverage to P&L
    pnl = pnl * position.leverage

    // Determine final status
    const finalStatus = reason === 'liquidation' ? 'liquidated' : 'closed'

    // Update position
    const { data: updatedPosition, error: updateError } = await supabase
      .from('positions')
      .update({
        status: finalStatus,
        close_price,
        closed_at: new Date().toISOString(),
        realized_pnl: pnl,
      })
      .eq('id', id)
      .select('*, cryptocurrency:cryptocurrencies(*)')
      .single()

    if (updateError) {
      console.error('[v0] Error closing position:', updateError)
      return NextResponse.json({ error: 'Error al cerrar posicion' }, { status: 500 })
    }

    // Return margin + P&L to user balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    if (profile) {
      const returnAmount = position.margin + pnl
      // Prevent negative balance (in case of big loss)
      const newBalance = Math.max(0, profile.balance + returnAmount)

      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id)
    }

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      transaction_type: pnl >= 0 ? 'profit' : 'loss',
      amount: Math.abs(pnl),
      description: `Posicion ${position.position_type.toUpperCase()} cerrada - ${reason || 'manual'}`,
    })

    return NextResponse.json({
      ...updatedPosition,
      pnl,
      reason: reason || 'manual',
    })
  } catch (error) {
    console.error('[v0] Close position error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
