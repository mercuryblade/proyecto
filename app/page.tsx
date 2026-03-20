import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Bot,
  Wallet,
  ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: Wallet,
    title: '$10,000 Virtual Balance',
    description: 'Start trading immediately with virtual money. No risk involved.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Charts',
    description: 'Professional TradingView charts with live market data.',
  },
  {
    icon: Bot,
    title: 'AI Trading Assistant',
    description: 'Get guidance from our AI chatbot to improve your trading skills.',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    description: 'Practice buy and sell orders with instant market execution.',
  },
  {
    icon: Shield,
    title: 'Risk-Free Learning',
    description: 'Learn trading strategies without risking real money.',
  },
  {
    icon: TrendingUp,
    title: 'Track Performance',
    description: 'Monitor your portfolio and analyze your trading history.',
  },
]

const cryptos = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,500', change: '+2.35%', positive: true },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,450', change: '+1.85%', positive: true },
  { symbol: 'SOL', name: 'Solana', price: '$145.00', change: '+4.12%', positive: true },
  { symbol: 'BNB', name: 'BNB', price: '$585.00', change: '-0.42%', positive: false },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">CryptoSim</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-4 w-4" />
            Risk-free crypto trading simulator
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Master Crypto Trading
            <span className="text-primary"> Without the Risk</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-pretty">
            Practice trading Bitcoin, Ethereum, and more with $10,000 in virtual
            money. Learn strategies, test your skills, and build confidence
            before trading with real funds.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up" className="gap-2">
                Start Trading Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Prices Preview */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cryptos.map((crypto) => (
              <div
                key={crypto.symbol}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4"
              >
                <div>
                  <div className="font-semibold">{crypto.symbol}</div>
                  <div className="text-sm text-muted-foreground">{crypto.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium">{crypto.price}</div>
                  <div
                    className={`text-sm font-medium ${
                      crypto.positive ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                    }`}
                  >
                    {crypto.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Everything you need to learn trading</h2>
          <p className="text-muted-foreground">
            Professional tools and features to help you become a better trader
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to start trading?</h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of traders learning to trade crypto with our simulator.
              No credit card required.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/sign-up" className="gap-2">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">CryptoSim</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Practice trading with virtual money. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
