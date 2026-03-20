import { createClient } from '@/lib/supabase/server'
import { TradingInterface } from '@/components/dashboard/trading-interface'
import type { Order } from '@/lib/types'

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileResult, cryptosResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('cryptocurrencies').select('*').order('market_cap', { ascending: false }),
  ])

  const profile = profileResult.data
  const cryptos = cryptosResult.data || []
  
  const selectedSymbol = params.symbol || 'BTC'
  const selectedCrypto = cryptos.find(c => c.symbol === selectedSymbol) || cryptos[0]

  // Get user's holding for this crypto
  const { data: holding } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', user?.id)
    .eq('cryptocurrency_id', selectedCrypto?.id)
    .single()

  // Get user's orders for this crypto (last 50)
  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user?.id)
    .eq('cryptocurrency_id', selectedCrypto?.id)
    .eq('order_status', 'executed')
    .order('created_at', { ascending: false })
    .limit(50)

  const orders: Order[] = ordersData || []

  return (
    <TradingInterface
      cryptos={cryptos}
      selectedSymbol={selectedSymbol}
      selectedCrypto={selectedCrypto}
      holding={holding}
      orders={orders}
      profile={profile}
      userId={user?.id || ''}
    />
  )
}
