import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faChartLine,
  faChartPie,
  faChartBar,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { useExpenseStore } from '../store/expenseStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { categories } from '../types';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Analytics({ isOpen, onClose }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const { expenses } = useExpenseStore();
  const { currency } = useUserSettingsStore();

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

  const calculateMetrics = () => {
    const timeframeExpenses = getTimeframeExpenses();
    const totalSpent = timeframeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expensesByCategory = timeframeExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const averageExpense = totalSpent / timeframeExpenses.length || 0;
    const maxExpense = Math.max(...timeframeExpenses.map(exp => exp.amount), 0);

    return {
      totalSpent,
      expensesByCategory,
      averageExpense,
      maxExpense,
      totalTransactions: timeframeExpenses.length
    };
  };

  if (!isOpen) return null;

  const metrics = calculateMetrics();

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
              <h3 className="text-sm font-medium text-gray-400 mb-2">Total Spent</h3>
              <p className="text-2xl font-bold text-white">
                {currency} {metrics.totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Average Expense</h3>
              <p className="text-2xl font-bold text-white">
                {currency} {metrics.averageExpense.toLocaleString()}
              </p>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Largest Expense</h3>
              <p className="text-2xl font-bold text-white">
                {currency} {metrics.maxExpense.toLocaleString()}
              </p>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Total Transactions</h3>
              <p className="text-2xl font-bold text-white">
                {metrics.totalTransactions}
              </p>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-dark-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Spending by Category</h3>
            <div className="space-y-4">
              {Object.entries(metrics.expensesByCategory).map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">{categories[category]?.name || category}</span>
                    <span className="text-white">{currency} {amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-2">
                    <div
                      className="bg-accent-primary rounded-full h-2"
                      style={{
                        width: `${(amount / metrics.totalSpent * 100).toFixed(1)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-dark-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {getTimeframeExpenses().slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0"
                >
                  <div>
                    <p className="text-white">{expense.description || categories[expense.category]?.name}</p>
                    <p className="text-sm text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-white">{currency} {expense.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 