-- Add Take Profit and Stop Loss columns to orders table

-- Add take_profit column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'take_profit') THEN
        ALTER TABLE public.orders ADD COLUMN take_profit DECIMAL(18, 8) DEFAULT NULL;
    END IF;
END $$;

-- Add stop_loss column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'stop_loss') THEN
        ALTER TABLE public.orders ADD COLUMN stop_loss DECIMAL(18, 8) DEFAULT NULL;
    END IF;
END $$;

-- Add tp_triggered column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'tp_triggered') THEN
        ALTER TABLE public.orders ADD COLUMN tp_triggered BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add sl_triggered column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'orders' 
                   AND column_name = 'sl_triggered') THEN
        ALTER TABLE public.orders ADD COLUMN sl_triggered BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index for efficient querying of active TP/SL orders
CREATE INDEX IF NOT EXISTS idx_orders_active_tpsl 
ON public.orders (user_id, cryptocurrency_id) 
WHERE order_status = 'executed' AND (take_profit IS NOT NULL OR stop_loss IS NOT NULL);
