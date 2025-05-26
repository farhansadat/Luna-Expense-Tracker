import Card from './Card';
import { formatCurrency } from '../lib/currency';

interface SummaryCardProps {
  title: string;
  amount: number;
  trend: number;
  icon: React.ReactNode;
  trendLabel?: string;
}

function SummaryCard({ title, amount, trend, icon, trendLabel }: SummaryCardProps) {
  const isPositive = trend >= 0;
  
  return (
    <Card className="flex-1">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-dark-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-dark-50">{formatCurrency(amount)}</p>
        </div>
        <div className="p-3 rounded-lg bg-dark-700/50">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center space-x-2">
        <span className={`text-sm ${isPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        {trendLabel && <span className="text-dark-400 text-sm">vs {trendLabel}</span>}
      </div>
    </Card>
  );
}

export default function FinancialSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Balance"
        amount={24500.80}
        trend={12.5}
        trendLabel="last month"
        icon={
          <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      
      <SummaryCard
        title="Monthly Income"
        amount={8250.00}
        trend={5.2}
        trendLabel="last month"
        icon={
          <svg className="w-6 h-6 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        }
      />
      
      <SummaryCard
        title="Monthly Expenses"
        amount={4320.50}
        trend={-2.8}
        trendLabel="last month"
        icon={
          <svg className="w-6 h-6 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        }
      />
      
      <SummaryCard
        title="Savings Rate"
        amount={3929.50}
        trend={8.1}
        trendLabel="last month"
        icon={
          <svg className="w-6 h-6 text-accent-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
      />
    </div>
  );
} 