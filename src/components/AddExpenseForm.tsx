import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faCalendar, 
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { categories } from '../types';
import type { CategoryKey } from '../types';
import { useExpenseStore } from '../store/expenseStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { formatCurrency } from '../utils/formatters';

interface AddExpenseFormProps {
  onSubmit: (expense: {
    amount: number;
    description: string;
    category: CategoryKey;
    date: string;
    account_id?: string;
    currency: string;
  }) => void;
  selectedAccount?: any;
}

export default function AddExpenseForm({ onSubmit, selectedAccount }: AddExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addExpense, isLoading } = useExpenseStore();
  const { currency } = useUserSettingsStore();

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      setError('Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const expenseData = {
        amount: numAmount,
        description: description.trim(),
        category: category as CategoryKey,
        date: new Date(date).toISOString(),
        account_id: selectedAccount?.id,
        currency
      };

      await addExpense(expenseData);
      onSubmit(expenseData);
      resetForm();
    } catch (error) {
      console.error('Failed to add expense:', error);
      setError('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {currency}
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.00"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="What did you spend on?"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(categories).map(([key, categoryData]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as CategoryKey)}
              className={`p-3 rounded-lg border-2 transition-all ${
                category === key
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
              disabled={isSubmitting}
            >
              <div className="flex flex-col items-center space-y-1">
                <FontAwesomeIcon icon={categoryData.icon} className="w-5 h-5" />
                <span className="text-xs font-medium">{categoryData.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <FontAwesomeIcon 
            icon={faCalendar} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" 
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !amount || !description || !category}
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Expense'
          )}
        </button>
      </div>
    </form>
  );
} 