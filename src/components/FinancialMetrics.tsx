import Card from './Card';
import { formatCurrency } from '../lib/currency';

interface FinancialMetricsProps {
  monthlyIncome?: number;
  monthlyExpenses?: number;
  budgetRemaining?: number;
  totalBalance?: number;
  savingsRate?: number;
  currency?: string;
}

export default function FinancialMetrics({
  monthlyIncome = 0,
  monthlyExpenses = 0,
  budgetRemaining = 0,
  totalBalance = 0,
  savingsRate = 0,
  currency = 'USD'
}: FinancialMetricsProps) {
  const metrics = [
    {
      title: 'Monthly Income',
      value: monthlyIncome || 0,
      trend: '+5.2%',
      isPositive: true,
    },
    {
      title: 'Monthly Expenses',
      value: monthlyExpenses || 0,
      trend: '-2.8%',
      isPositive: false,
    },
    {
      title: 'Budget Remaining',
      value: budgetRemaining || 0,
      trend: '+12.5%',
      isPositive: true,
    },
    {
      title: 'Total Balance',
      value: totalBalance || 0,
      trend: '+8.1%',
      isPositive: true,
    },
    {
      title: 'Savings Rate',
      value: savingsRate || 0,
      trend: '+3.4%',
      isPositive: true,
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="p-4">
          <div className="space-y-2">
            <h3 className="text-dark-400 text-sm font-medium">{metric.title}</h3>
            <p className="text-2xl font-bold text-dark-50">
              {metric.isPercentage
                ? `${(metric.value || 0).toFixed(1)}%`
                : formatCurrency(metric.value || 0, currency)}
            </p>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm ${
                  metric.isPositive ? 'text-accent-success' : 'text-accent-danger'
                }`}
              >
                {metric.trend}
              </span>
              <span className="text-dark-400 text-sm">vs last month</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 