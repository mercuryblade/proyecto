import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap, Shield, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    description: 'Perfecto para principiantes aprendiendo a operar',
    features: [
      'Saldo virtual de $10,000',
      'Acceso a todas las criptomonedas',
      'Graficos basicos de velas',
      'Asistente IA (limitado a 10 msgs/dia)',
      'Historial de transacciones',
      'Take Profit / Stop Loss basico',
    ],
    limitations: [
      'Sin alertas de precio',
      'Sin analisis de portafolio',
      'Sin indicadores avanzados',
    ],
    tier: 'free',
    icon: Zap,
    highlight: false,
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/mes',
    description: 'Para traders serios que quieren mas funciones',
    features: [
      'Saldo virtual de $50,000',
      'Asistente IA prioritario (ilimitado)',
      'Indicadores avanzados (RSI, MACD)',
      'Alertas de precio en tiempo real',
      'Historial extendido de transacciones',
      'Analisis de portafolio',
      'Soporte por email',
    ],
    limitations: [],
    tier: 'premium',
    icon: Crown,
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/mes',
    description: 'Herramientas profesionales para traders avanzados',
    features: [
      'Saldo virtual de $100,000',
      'Asistente IA ilimitado con analisis',
      'Todas las funciones de graficos',
      'Estrategias de trading personalizadas',
      'Acceso a API',
      'Soporte prioritario 24/7',
      'Herramientas avanzadas de gestion de riesgo',
      'Backtesting de estrategias',
      'IA predictiva (beta)',
    ],
    limitations: [],
    tier: 'pro',
    icon: Shield,
    highlight: false,
  },
]

// Funciones restringidas por nivel de membresia
export const membershipFeatures = {
  free: {
    maxDailyAIMessages: 10,
    maxBalance: 10000,
    hasAlerts: false,
    hasAdvancedIndicators: false,
    hasPortfolioAnalytics: false,
    hasBacktesting: false,
    hasPredictiveAI: false,
  },
  premium: {
    maxDailyAIMessages: Infinity,
    maxBalance: 50000,
    hasAlerts: true,
    hasAdvancedIndicators: true,
    hasPortfolioAnalytics: true,
    hasBacktesting: false,
    hasPredictiveAI: false,
  },
  pro: {
    maxDailyAIMessages: Infinity,
    maxBalance: 100000,
    hasAlerts: true,
    hasAdvancedIndicators: true,
    hasPortfolioAnalytics: true,
    hasBacktesting: true,
    hasPredictiveAI: true,
  },
}

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
        <h1 className="text-2xl font-bold">Membresia</h1>
        <p className="text-muted-foreground">
          Mejora tu cuenta para obtener mas funciones y mayor saldo virtual
        </p>
      </div>

      {/* Plan Actual */}
      <Card className="mb-8 border-border/50 bg-card/80">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan Actual</p>
              <p className="font-semibold capitalize">
                {currentTier === 'free' ? 'Gratis' : currentTier === 'premium' ? 'Premium' : 'Pro'}
              </p>
            </div>
          </div>
          <Badge variant={currentTier === 'pro' ? 'default' : 'secondary'} className="capitalize">
            {currentTier === 'free' ? 'Gratis' : currentTier}
          </Badge>
        </CardContent>
      </Card>

      {/* Tarjetas de Planes */}
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
                  <Badge className="bg-primary text-primary-foreground">Mas Popular</Badge>
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
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <li key={`limit-${index}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : plan.highlight ? 'default' : 'secondary'}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan 
                    ? 'Plan Actual' 
                    : plan.tier === 'free' 
                      ? 'Cambiar a Gratis' 
                      : 'Mejorar Plan'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Comparacion de Funciones */}
      <Card className="mt-8 border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Comparacion de Funciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">Funcion</th>
                  <th className="text-center py-3 px-2">Gratis</th>
                  <th className="text-center py-3 px-2">Premium</th>
                  <th className="text-center py-3 px-2">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2">Saldo Virtual</td>
                  <td className="text-center py-3 px-2">$10,000</td>
                  <td className="text-center py-3 px-2">$50,000</td>
                  <td className="text-center py-3 px-2">$100,000</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2">Mensajes IA / dia</td>
                  <td className="text-center py-3 px-2">10</td>
                  <td className="text-center py-3 px-2">Ilimitado</td>
                  <td className="text-center py-3 px-2">Ilimitado</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2">Alertas de Precio</td>
                  <td className="text-center py-3 px-2"><Lock className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2">Indicadores Avanzados</td>
                  <td className="text-center py-3 px-2"><Lock className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2">Analisis de Portafolio</td>
                  <td className="text-center py-3 px-2"><Lock className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-2">Backtesting</td>
                  <td className="text-center py-3 px-2"><Lock className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Lock className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-2">IA Predictiva (Beta)</td>
                  <td className="text-center py-3 px-2"><Lock className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Lock className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                  <td className="text-center py-3 px-2"><Check className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nota */}
      <Card className="mt-8 border-border/50 bg-card/80">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Esta es una funcion de demostracion. En una aplicacion de produccion, esto se integraria con un 
            proveedor de pagos como Stripe para manejar suscripciones reales. Todo el trading se realiza con 
            dinero virtual para fines educativos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
