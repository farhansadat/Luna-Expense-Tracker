import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faChartLine, 
  faLightbulb, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency } from '../lib/currency';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { categories } from '../data/categories';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Insight {
  id: string;
  type: 'trend' | 'alert' | 'suggestion';
  title: string;
  description: string;
  icon: typeof faChartLine | typeof faLightbulb | typeof faExclamationTriangle;
  color: string;
}

export default function AIInsightsModal({ isOpen, onClose }: AIInsightsModalProps) {
  const { expenses } = useExpenseStore();
  const { currency } = useUserSettingsStore();

  // Generate insights based on expense data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    if (!expenses || expenses.length === 0) {
      return insights;
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categorySums = expenses.reduce((acc, exp) => {
      if (exp.type === 'expense' && exp.category && categories[exp.category]) {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Find highest spending category
    const sortedCategories = Object.entries(categorySums).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [categoryKey, amount] = sortedCategories[0];
      const category = categories[categoryKey];
      if (category) {
        insights.push({
          id: '1',
          type: 'trend',
          title: 'Highest Spending Category',
          description: `Your highest spending is in ${category.name} at ${formatCurrency(amount, currency)}`,
          icon: faChartLine,
          color: 'text-blue-500',
        });
      }
    }

    // Check for unusual spending patterns
    const expenseOnlyAmounts = expenses
      .filter(exp => exp.type === 'expense')
      .map(exp => exp.amount);
    
    if (expenseOnlyAmounts.length > 0) {
      const avgExpense = expenseOnlyAmounts.reduce((sum, amount) => sum + amount, 0) / expenseOnlyAmounts.length;
      const highExpenses = expenses.filter((exp) => exp.type === 'expense' && exp.amount > avgExpense * 2);
      
      if (highExpenses.length > 0) {
        insights.push({
          id: '2',
          type: 'alert',
          title: 'Unusual Spending Detected',
          description: `Found ${
            highExpenses.length
          } transactions that are significantly higher than your average spending of ${formatCurrency(
            avgExpense,
            currency
          )}`,
          icon: faExclamationTriangle,
          color: 'text-yellow-500',
        });
      }
    }

    // Suggest savings opportunities
    const recurringExpenses = expenses.filter((exp) => exp.is_recurring && exp.type === 'expense');
    if (recurringExpenses.length > 0) {
      insights.push({
        id: '3',
        type: 'suggestion',
        title: 'Potential Savings',
        description: `You have ${
          recurringExpenses.length
        } recurring subscriptions totaling ${formatCurrency(
          recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          currency
        )} monthly. Consider reviewing them for savings opportunities.`,
        icon: faLightbulb,
        color: 'text-green-500',
      });
    }

    return insights;
  };

  const [insights] = useState<Insight[]>(generateInsights());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faRobot} className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-white">AI Insights</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-white/5 rounded-xl p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-opacity-20 ${insight.color}`}>
                      <FontAwesomeIcon icon={insight.icon} className={`w-6 h-6 ${insight.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-gray-400">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {insights.length === 0 && (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faRobot} className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">
                    Add more transactions to receive personalized insights
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Luna analyzes your spending patterns to provide personalized insights and
                recommendations
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 