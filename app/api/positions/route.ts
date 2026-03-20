import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Position } from '@/lib/types'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: positions, error } = await supabase
      .from('positions')
      .select('*, cryptocurrency:cryptocurrencies(*)')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching positions:', error)
      return NextResponse.json({ error: 'Error al obtener posiciones' }, { status: 500 })
    }

    return NextResponse.json(positions || [])
  } catch (error) {
    console.error('[v0] Positions GET error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const {
      cryptocurrency_id,
      position_type,
      quantity,
      entry_price,
      margin,
      leverage = 1,
      take_profit,
      stop_loss,
    } = body

    // Validate inputs
    if (!cryptocurrency_id || !position_type || !quantity || !entry_price || !margin) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!['long', 'short'].includes(position_type)) {
      return NextResponse.json({ error: 'Tipo de posicion invalido' }, { status: 400 })
    }

    // Get user profile to check balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single()

    if (!profile || profile.balance < margin) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Validate TP/SL based on position type
    if (position_type === 'long') {
      if (take_profit && take_profit <= entry_price) {
        return NextResponse.json({ error: 'Take Profit debe ser mayor al precio de entrada para LONG' }, { status: 400 })
      }
      if (stop_loss && stop_loss >= entry_price) {
        return NextResponse.json({ error: 'Stop Loss debe ser menor al precio de entrada para LONG' }, { status: 400 })
      }
    } else {
      if (take_profit && take_profit >= entry_price) {
        return NextResponse.json({ error: 'Take Profit debe ser menor al precio de entrada para SHORT' }, { status: 400 })
      }
      if (stop_loss && stop_loss <= entry_price) {
        return NextResponse.json({ error: 'Stop Loss debe ser mayor al precio de entrada para SHORT' }, { status: 400 })
      }
    }

    // Create the position
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .insert({
        user_id: user.id,
        cryptocurrency_id,
        position_type,
        status: 'open',
        entry_price,
        quantity,
        margin,
        leverage,
        take_profit,
        stop_loss,
        realized_pnl: 0,
      })
      .select('*, cryptocurrency:cryptocurrencies(*)')
      .single()

    if (positionError) {
      console.error('[v0] Error creating position:', positionError)
      return NextResponse.json({ error: 'Error al crear posicion' }, { status: 500 })
    }

    // Deduct margin from balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - margin })
      .eq('id', user.id)

    if (balanceError) {
      console.error('[v0] Error updating balance:', balanceError)
    }

    return NextResponse.json(position)
  } catch (error) {
    console.error('[v0] Position POST error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
