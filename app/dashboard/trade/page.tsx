import { createClient } from '@/lib/supabase/server'
import { PriceChart } from '@/components/dashboard/price-chart'
import { OrderForm } from '@/components/dashboard/order-form'
import { CryptoSelector } from '@/components/dashboard/crypto-selector'
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
          />
        </div>
      </div>

      {/* Order Panel */}
      <div className="w-full border-t border-border/50 bg-card/80 lg:w-80 lg:border-l lg:border-t-0">
        <OrderForm
          crypto={selectedCrypto}
          balance={profile?.balance || 0}
          holding={holding}
          userId={user?.id || ''}
        />
      </div>
    </div>
  )
}
