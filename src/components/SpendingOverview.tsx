import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useExpenseStore } from '../store/expenseStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { formatCurrency } from '../lib/currency';
import Card from './Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  income: number[];
  expenses: number[];
}

export default function SpendingOverview() {
  const { expenses } = useExpenseStore();
  const { currency } = useUserSettingsStore();
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    income: [],
    expenses: []
  });

  useEffect(() => {
    // Get the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    const monthLabels = months.map(date => 
      date.toLocaleString('default', { month: 'short' })
    );

    // Calculate income and expenses for each month
    const monthlyData = months.map(date => {
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === date.getMonth() &&
               expenseDate.getFullYear() === date.getFullYear();
      });

      const income = monthExpenses
        .filter(expense => expense.type === 'income' || expense.category === 'Income')
        .reduce((sum, expense) => sum + expense.amount, 0);

      const expenseTotal = monthExpenses
        .filter(expense => expense.type === 'expense' && expense.category !== 'Income')
        .reduce((sum, expense) => sum + expense.amount, 0);

      return { income, expenses: expenseTotal };
    });

    setChartData({
      labels: monthLabels,
      income: monthlyData.map(d => d.income),
      expenses: monthlyData.map(d => d.expenses)
    });
  }, [expenses]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Income',
        data: chartData.income,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Expenses',
        data: chartData.expenses,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y, currency);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: any) => formatCurrency(value, currency)
        }
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Income vs Expenses</h2>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </Card>
  );
} 