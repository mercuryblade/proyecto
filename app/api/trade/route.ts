import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, cryptocurrencyId, orderType, quantity, price } = body

    // Verify user is the authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get cryptocurrency
    const { data: crypto, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .eq('id', cryptocurrencyId)
      .single()

    if (cryptoError || !crypto) {
      return NextResponse.json({ error: 'Cryptocurrency not found' }, { status: 404 })
    }

    const totalValue = quantity * price

    if (orderType === 'buy') {
      // Check if user has enough balance
      if (profile.balance < totalValue) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          cryptocurrency_id: cryptocurrencyId,
          order_type: 'buy',
          order_status: 'executed',
          quantity,
          price_at_order: price,
          total_value: totalValue,
          executed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order error:', orderError)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }

      // Update user balance
      const newBalance = Number(profile.balance) - totalValue
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (balanceError) {
        console.error('Balance error:', balanceError)
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
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
          console.error('Holding error:', holdingError)
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
          console.error('Holding error:', holdingError)
        }
      }

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userId,
        order_id: order.id,
        transaction_type: 'buy',
        cryptocurrency_symbol: crypto.symbol,
        quantity,
        price,
        total_value: totalValue,
        balance_after: newBalance,
        notes: `Bought ${quantity} ${crypto.symbol} at $${price}`,
      })

      return NextResponse.json({ success: true, order })
    } else if (orderType === 'sell') {
      // Get user's holding
      const { data: holding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('cryptocurrency_id', cryptocurrencyId)
        .single()

      if (holdingError || !holding || Number(holding.quantity) < quantity) {
        return NextResponse.json({ error: 'Insufficient holdings' }, { status: 400 })
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          cryptocurrency_id: cryptocurrencyId,
          order_type: 'sell',
          order_status: 'executed',
          quantity,
          price_at_order: price,
          total_value: totalValue,
          executed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order error:', orderError)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
      }

      // Update user balance
      const newBalance = Number(profile.balance) + totalValue
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (balanceError) {
        console.error('Balance error:', balanceError)
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
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

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userId,
        order_id: order.id,
        transaction_type: 'sell',
        cryptocurrency_symbol: crypto.symbol,
        quantity,
        price,
        total_value: totalValue,
        balance_after: newBalance,
        notes: `Sold ${quantity} ${crypto.symbol} at $${price}`,
      })

      return NextResponse.json({ success: true, order })
    }

    return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
  } catch (error) {
    console.error('Trade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
