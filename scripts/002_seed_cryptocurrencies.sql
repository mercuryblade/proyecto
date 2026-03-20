-- Seed cryptocurrencies data
INSERT INTO public.cryptocurrencies (name, symbol, current_price, price_change_24h, market_cap, volume_24h, image_url)
VALUES 
  ('Bitcoin', 'BTC', 67234.50, 2.45, 1320000000000, 28500000000, 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'),
  ('Ethereum', 'ETH', 3456.78, -1.23, 415000000000, 14200000000, 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'),
  ('Solana', 'SOL', 178.90, 5.67, 82000000000, 3200000000, 'https://assets.coingecko.com/coins/images/4128/large/solana.png'),
  ('BNB', 'BNB', 598.45, 0.89, 89000000000, 1500000000, 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'),
  ('XRP', 'XRP', 0.5234, 3.21, 28000000000, 1200000000, 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'),
  ('Cardano', 'ADA', 0.4567, -2.34, 16000000000, 450000000, 'https://assets.coingecko.com/coins/images/975/large/cardano.png'),
  ('Avalanche', 'AVAX', 35.67, 4.12, 14000000000, 520000000, 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png'),
  ('Dogecoin', 'DOGE', 0.1234, 1.56, 17000000000, 890000000, 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'),
  ('Polkadot', 'DOT', 7.89, -0.45, 10000000000, 320000000, 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png'),
  ('Chainlink', 'LINK', 14.56, 2.89, 8500000000, 410000000, 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png')
ON CONFLICT (symbol) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  price_change_24h = EXCLUDED.price_change_24h,
  market_cap = EXCLUDED.market_cap,
  volume_24h = EXCLUDED.volume_24h,
  updated_at = NOW();
