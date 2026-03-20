-- Add Take Profit and Stop Loss columns to orders table
-- These columns allow users to set automatic exit points for their trades

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS take_profit DECIMAL(18, 8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stop_loss DECIMAL(18, 8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tp_triggered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sl_triggered BOOLEAN DEFAULT FALSE;
