import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faChartLine,
  faChartPie,
  faChartBar,
  faCalendar,
  faArrowUp,
  faArrowDown,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { useExpenseStore } from '../store/expenseStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { categories } from '../data/categories';
import { formatCurrency } from '../lib/currency';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Analytics({ isOpen, onClose }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const { expenses } = useExpenseStore();
  const { currency, monthlyIncome } = useUserSettingsStore();

  const getTimeframeExpenses = () => {
    const now = new Date();
    const timeframeStart = new Date();

    switch (timeframe) {
      case 'week':
        timeframeStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeframeStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        timeframeStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    return expenses.filter(expense => new Date(expense.date) >= timeframeStart);
  };

  const metrics = useMemo(() => {
    const timeframeExpenses = getTimeframeExpenses();
    const totalSpent = timeframeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate expenses by category
    const expensesByCategory = timeframeExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate daily expenses
    const dailyExpenses = timeframeExpenses.reduce((acc, exp) => {
      const date = new Date(exp.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate spending trends
    const sortedDailyExpenses = Object.entries(dailyExpenses)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
    
    const spendingTrend = sortedDailyExpenses.length > 1
      ? ((sortedDailyExpenses[sortedDailyExpenses.length - 1][1] - sortedDailyExpenses[0][1]) / sortedDailyExpenses[0][1]) * 100
      : 0;

    // Calculate average daily spending
    const averageDailySpending = totalSpent / Object.keys(dailyExpenses).length || 0;

    // Find peak spending days
    const peakSpendingDay = Object.entries(dailyExpenses)
      .sort(([, a], [, b]) => b - a)[0];

    // Calculate savings rate
    const timeframeIncome = monthlyIncome * (timeframe === 'week' ? 0.25 : timeframe === 'month' ? 1 : 12);
    const savingsRate = timeframeIncome > 0 ? ((timeframeIncome - totalSpent) / timeframeIncome) * 100 : 0;

    return {
      totalSpent,
      expensesByCategory,
      dailyExpenses: sortedDailyExpenses,
      averageDailySpending,
      peakSpendingDay,
      spendingTrend,
      savingsRate,
      totalTransactions: timeframeExpenses.length,
      timeframeIncome
    };
  }, [timeframe, expenses, monthlyIncome]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faChartLine} className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">Financial Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Timeframe Selection */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex space-x-4">
            {(['week', 'month', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-2 rounded-lg ${
                  timeframe === t
                    ? 'bg-accent-primary text-white'
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                } transition-colors`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Total Spent</h3>
                <FontAwesomeIcon 
                  icon={metrics.spendingTrend >= 0 ? faArrowUp : faArrowDown} 
                  className={metrics.spendingTrend >= 0 ? 'text-red-400' : 'text-green-400'}
                />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {formatCurrency(metrics.totalSpent, currency)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {Math.abs(metrics.spendingTrend).toFixed(1)}% {metrics.spendingTrend >= 0 ? 'increase' : 'decrease'}
              </p>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Savings Rate</h3>
                <FontAwesomeIcon icon={faPiggyBank} className="text-accent-primary" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {metrics.savingsRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                of {formatCurrency(metrics.timeframeIncome, currency)} income
              </p>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Daily Average</h3>
                <FontAwesomeIcon icon={faClock} className="text-accent-primary" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {formatCurrency(metrics.averageDailySpending, currency)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                per day this {timeframe}
              </p>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-400">Peak Spending</h3>
                <FontAwesomeIcon icon={faChartBar} className="text-accent-primary" />
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {metrics.peakSpendingDay ? formatCurrency(metrics.peakSpendingDay[1], currency) : '0'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                on {metrics.peakSpendingDay ? new Date(metrics.peakSpendingDay[0]).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-dark-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faChartPie} className="mr-2" />
              Spending by Category
            </h3>
            <div className="space-y-4">
              {Object.entries(metrics.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <FontAwesomeIcon 
                          icon={categories[category]?.icon || faChartBar} 
                          className="mr-2 text-accent-primary"
                        />
                        <span className="text-gray-300">{categories[category]?.name || category}</span>
                      </div>
                      <span className="text-white">{formatCurrency(amount, currency)}</span>
                    </div>
                    <div className="w-full bg-dark-600 rounded-full h-2">
                      <div
                        className="bg-accent-primary rounded-full h-2"
                        style={{
                          width: `${(amount / metrics.totalSpent * 100).toFixed(1)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {(amount / metrics.totalSpent * 100).toFixed(1)}% of total spending
                    </p>
                  </div>
              ))}
            </div>
          </div>

          {/* Daily Spending Trend */}
          <div className="bg-dark-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Daily Spending Trend
            </h3>
            <div className="h-64 flex items-end space-x-2">
              {metrics.dailyExpenses.map(([date, amount]) => {
                const height = `${(amount / Math.max(...metrics.dailyExpenses.map(([, a]) => a)) * 100)}%`;
                return (
                  <div
                    key={date}
                    className="flex-1 flex flex-col items-center group"
                    style={{ minWidth: '20px' }}
                  >
                    <div className="relative w-full">
                      <div
                        className="w-full bg-accent-primary rounded-t"
                        style={{ height }}
                      />
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        {formatCurrency(amount, currency)}
                        <br />
                        {new Date(date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-dark-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faCalendar} className="mr-2" />
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {getTimeframeExpenses()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0"
                  >
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={categories[expense.category]?.icon || faChartBar}
                        className="mr-3 text-accent-primary"
                      />
                      <div>
                        <p className="text-white">{expense.description || categories[expense.category]?.name}</p>
                        <p className="text-sm text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-white">{formatCurrency(expense.amount, currency)}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 