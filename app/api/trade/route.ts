import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, cryptocurrencyId, orderType, quantity, price, takeProfit, stopLoss } = body

    // Verify user is the authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Get cryptocurrency
    const { data: crypto, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .eq('id', cryptocurrencyId)
      .single()

    if (cryptoError || !crypto) {
      return NextResponse.json({ error: 'Criptomoneda no encontrada' }, { status: 404 })
    }

    const totalValue = quantity * price

    // Validate TP/SL values
    if (orderType === 'buy') {
      if (takeProfit && takeProfit <= price) {
        return NextResponse.json({ error: 'Take Profit debe ser mayor al precio de entrada para compras' }, { status: 400 })
      }
      if (stopLoss && stopLoss >= price) {
        return NextResponse.json({ error: 'Stop Loss debe ser menor al precio de entrada para compras' }, { status: 400 })
      }
    } else if (orderType === 'sell') {
      if (takeProfit && takeProfit >= price) {
        return NextResponse.json({ error: 'Take Profit debe ser menor al precio de entrada para ventas' }, { status: 400 })
      }
      if (stopLoss && stopLoss <= price) {
        return NextResponse.json({ error: 'Stop Loss debe ser mayor al precio de entrada para ventas' }, { status: 400 })
      }
    }

    if (orderType === 'buy') {
      // Check if user has enough balance
      if (profile.balance < totalValue) {
        return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
      }

      // Create order with TP/SL
      const orderData: Record<string, unknown> = {
        user_id: userId,
        cryptocurrency_id: cryptocurrencyId,
        order_type: 'buy',
        order_status: 'executed',
        quantity,
        price_at_order: price,
        total_value: totalValue,
        executed_at: new Date().toISOString(),
      }

      // Add TP/SL if provided (these columns may not exist yet)
      if (takeProfit) orderData.take_profit = takeProfit
      if (stopLoss) orderData.stop_loss = stopLoss

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error('Error de orden:', orderError)
        return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
      }

      // Update user balance
      const newBalance = Number(profile.balance) - totalValue
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (balanceError) {
        console.error('Error de saldo:', balanceError)
        return NextResponse.json({ error: 'Error al actualizar saldo' }, { status: 500 })
      }

      // Update or create holding
      const { data: existingHolding } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('cryptocurrency_id', cryptocurrencyId)
        .single()

      if (existingHolding) {
        // Update existing holding with weighted average price
        const newQuantity = Number(existingHolding.quantity) + quantity
        const newAveragePrice = 
          ((Number(existingHolding.quantity) * Number(existingHolding.average_buy_price)) + (quantity * price)) / newQuantity

        const { error: holdingError } = await supabase
          .from('holdings')
          .update({
            quantity: newQuantity,
            average_buy_price: newAveragePrice,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingHolding.id)

        if (holdingError) {
          console.error('Error de holding:', holdingError)
        }
      } else {
        // Create new holding
        const { error: holdingError } = await supabase
          .from('holdings')
          .insert({
            user_id: userId,
            cryptocurrency_id: cryptocurrencyId,
            quantity,
            average_buy_price: price,
          })

        if (holdingError) {
          console.error('Error de holding:', holdingError)
        }
      }

      // Create transaction record with TP/SL info
      let notes = `Compra de ${quantity} ${crypto.symbol} a $${price.toFixed(2)}`
      if (takeProfit) notes += ` | TP: $${takeProfit.toFixed(2)}`
      if (stopLoss) notes += ` | SL: $${stopLoss.toFixed(2)}`

      await supabase.from('transactions').insert({
        user_id: userId,
        order_id: order.id,
        transaction_type: 'buy',
        cryptocurrency_symbol: crypto.symbol,
        quantity,
        price,
        total_value: totalValue,
        balance_after: newBalance,
        notes,
      })

      return NextResponse.json({ 
        success: true, 
        order,
        message: `Compra ejecutada: ${quantity} ${crypto.symbol}${takeProfit ? ` con TP a $${takeProfit}` : ''}${stopLoss ? ` y SL a $${stopLoss}` : ''}`
      })
    } else if (orderType === 'sell') {
      // Get user's holding
      const { data: holding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('cryptocurrency_id', cryptocurrencyId)
        .single()

      if (holdingError || !holding || Number(holding.quantity) < quantity) {
        return NextResponse.json({ error: 'Holdings insuficientes' }, { status: 400 })
      }

      // Create order with TP/SL
      const orderData: Record<string, unknown> = {
        user_id: userId,
        cryptocurrency_id: cryptocurrencyId,
        order_type: 'sell',
        order_status: 'executed',
        quantity,
        price_at_order: price,
        total_value: totalValue,
        executed_at: new Date().toISOString(),
      }

      if (takeProfit) orderData.take_profit = takeProfit
      if (stopLoss) orderData.stop_loss = stopLoss

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error('Error de orden:', orderError)
        return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
      }

      // Update user balance
      const newBalance = Number(profile.balance) + totalValue
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (balanceError) {
        console.error('Error de saldo:', balanceError)
        return NextResponse.json({ error: 'Error al actualizar saldo' }, { status: 500 })
      }

      // Update holding
      const newQuantity = Number(holding.quantity) - quantity
      if (newQuantity <= 0) {
        // Delete holding if quantity is 0
        await supabase.from('holdings').delete().eq('id', holding.id)
      } else {
        await supabase
          .from('holdings')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', holding.id)
      }

      // Create transaction record with TP/SL info
      let notes = `Venta de ${quantity} ${crypto.symbol} a $${price.toFixed(2)}`
      if (takeProfit) notes += ` | TP: $${takeProfit.toFixed(2)}`
      if (stopLoss) notes += ` | SL: $${stopLoss.toFixed(2)}`

      await supabase.from('transactions').insert({
        user_id: userId,
        order_id: order.id,
        transaction_type: 'sell',
        cryptocurrency_symbol: crypto.symbol,
        quantity,
        price,
        total_value: totalValue,
        balance_after: newBalance,
        notes,
      })

      return NextResponse.json({ 
        success: true, 
        order,
        message: `Venta ejecutada: ${quantity} ${crypto.symbol}${takeProfit ? ` con TP a $${takeProfit}` : ''}${stopLoss ? ` y SL a $${stopLoss}` : ''}`
      })
    }

    return NextResponse.json({ error: 'Tipo de orden inválido' }, { status: 400 })
  } catch (error) {
    console.error('Error de operación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
