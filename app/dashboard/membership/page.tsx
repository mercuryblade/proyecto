import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for beginners learning to trade',
    features: [
      '$10,000 virtual balance',
      'Access to all cryptocurrencies',
      'Basic TradingView charts',
      'AI Trading Assistant (limited)',
      'Transaction history',
    ],
    tier: 'free',
    icon: Zap,
    highlight: false,
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'For serious traders who want more features',
    features: [
      '$50,000 virtual balance',
      'Priority AI Assistant',
      'Advanced chart indicators',
      'Real-time price alerts',
      'Extended transaction history',
      'Portfolio analytics',
    ],
    tier: 'premium',
    icon: Crown,
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    description: 'Professional tools for advanced traders',
    features: [
      '$100,000 virtual balance',
      'Unlimited AI Assistant',
      'All chart features',
      'Custom trading strategies',
      'API access',
      'Priority support',
      'Advanced risk management tools',
    ],
    tier: 'pro',
    icon: Shield,
    highlight: false,
  },
]

export default async function MembershipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const currentTier = profile?.membership_tier || 'free'

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Membership</h1>
        <p className="text-muted-foreground">
          Upgrade your account for more features and higher virtual balance
        </p>
      </div>

      {/* Current Plan */}
      <Card className="mb-8 border-border/50 bg-card/80">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="font-semibold capitalize">{currentTier}</p>
            </div>
          </div>
          <Badge variant={currentTier === 'pro' ? 'default' : 'secondary'} className="capitalize">
            {currentTier}
          </Badge>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentTier === plan.tier
          const Icon = plan.icon

          return (
            <Card
              key={plan.tier}
              className={`relative border-border/50 bg-card/80 ${
                plan.highlight ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : plan.highlight ? 'default' : 'secondary'}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.tier === 'free' ? 'Downgrade' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Note */}
      <Card className="mt-8 border-border/50 bg-card/80">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            This is a demo feature. In a production app, this would integrate with a payment 
            provider like Stripe to handle real subscriptions. All trading is done with 
            virtual money for educational purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
