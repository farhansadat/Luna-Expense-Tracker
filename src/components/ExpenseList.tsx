import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../utils/formatters';
import { categories } from '../types';
import type { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
}

export default function ExpenseList({ expenses, loading }: ExpenseListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No expenses yet. Add your first expense!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {expenses.map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: categories[expense.category].color + '20' }}
              >
                <FontAwesomeIcon
                  icon={categories[expense.category].icon}
                  className="w-5 h-5"
                  style={{ color: categories[expense.category].color }}
                />
              </div>
              <div>
                <p className="font-medium text-white">
                  {expense.description || categories[expense.category].name}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <p className={`font-medium ${expense.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {expense.amount < 0 ? '-' : '+'}
              {formatCurrency(Math.abs(expense.amount), expense.currency)}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 