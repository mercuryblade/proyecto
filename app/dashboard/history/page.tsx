import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View your past trades and transactions</p>
      </div>

      {transactions && transactions.length > 0 ? (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Asset</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={tx.transaction_type === 'buy' ? 'default' : 'secondary'}
                          className={
                            tx.transaction_type === 'buy'
                              ? 'bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30'
                              : 'bg-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger)]/30'
                          }
                        >
                          {tx.transaction_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        {tx.cryptocurrency_symbol || '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono">
                        {tx.quantity ? tx.quantity.toFixed(6) : '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono">
                        {tx.price ? formatCurrency(tx.price) : '-'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-medium">
                        <span className={tx.transaction_type === 'buy' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}>
                          {tx.transaction_type === 'buy' ? '-' : '+'}
                          {formatCurrency(tx.total_value)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-muted-foreground">
                        {formatCurrency(tx.balance_after)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No transactions yet. Start trading to see your history.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
