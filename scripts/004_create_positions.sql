-- Create positions table for LONG/SHORT trading
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES cryptocurrencies(id),
  position_type TEXT NOT NULL CHECK (position_type IN ('long', 'short')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
  entry_price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  margin NUMERIC NOT NULL, -- USD used as collateral
  leverage INTEGER NOT NULL DEFAULT 1,
  take_profit NUMERIC,
  stop_loss NUMERIC,
  realized_pnl NUMERIC DEFAULT 0,
  close_price NUMERIC,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own positions" ON positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own positions" ON positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own positions" ON positions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own positions" ON positions
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_cryptocurrency_id ON positions(cryptocurrency_id);
