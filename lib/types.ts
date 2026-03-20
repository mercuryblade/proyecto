export interface Cryptocurrency {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_24h: number
  market_cap: number
  volume_24h: number
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  balance: number
  membership_tier: 'free' | 'premium' | 'pro'
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  cryptocurrency_id: string
  order_type: 'buy' | 'sell'
  order_status: 'pending' | 'executed' | 'cancelled'
  quantity: number
  price_at_order: number
  total_value: number
  created_at: string
  executed_at: string | null
  cryptocurrency?: Cryptocurrency
}

export interface Holding {
  id: string
  user_id: string
  cryptocurrency_id: string
  quantity: number
  average_buy_price: number
  created_at: string
  updated_at: string
  cryptocurrency?: Cryptocurrency
}

export interface Transaction {
  id: string
  user_id: string
  order_id: string | null
  transaction_type: 'buy' | 'sell' | 'deposit' | 'withdrawal'
  cryptocurrency_symbol: string | null
  quantity: number | null
  price: number | null
  total_value: number
  balance_after: number
  notes: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
