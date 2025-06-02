import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../lib/currency';
import { categories } from '../data/categories';

interface ExpenseListProps {
  expenses: any[];
  loading?: boolean;
}

export default function ExpenseList({ expenses, loading }: ExpenseListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-gray-400" />
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center p-4 text-gray-400">
        No expenses to display
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.id || `expense-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-dark-800 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="text-white font-medium">{expense.description}</h3>
              <p className="text-sm text-gray-400">{expense.category}</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-medium ${expense.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 