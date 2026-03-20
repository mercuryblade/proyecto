-- Add Take Profit and Stop Loss columns to orders table
-- Run this after 001_create_tables.sql

-- Add TP/SL columns to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS take_profit DECIMAL(18, 8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(18, 8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tp_triggered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sl_triggered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS closed_reason TEXT DEFAULT NULL;

-- Add daily AI message count to profiles for membership limits
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS daily_ai_messages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_ai_message_date DATE DEFAULT NULL;

-- Create index for faster TP/SL checks
CREATE INDEX IF NOT EXISTS idx_orders_tpsl ON public.orders (user_id, order_status) 
WHERE take_profit IS NOT NULL OR stop_loss IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.orders.take_profit IS 'Take profit price in USD';
COMMENT ON COLUMN public.orders.stop_loss IS 'Stop loss price in USD';
COMMENT ON COLUMN public.orders.tp_triggered IS 'Whether take profit was triggered';
COMMENT ON COLUMN public.orders.sl_triggered IS 'Whether stop loss was triggered';
COMMENT ON COLUMN public.orders.closed_reason IS 'How the order was closed: manual, take_profit, stop_loss';
