import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSpinner,
  faPlus,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { categories } from '../data/categories';
import type { CategoryKey } from '../data/categories';
import { supabase } from '../lib/supabase';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: {
    amount: string;
    description: string;
    category: CategoryKey;
    date: string;
    isRecurring: boolean;
    recurringFrequency?: string;
    billUrl?: string;
    type: 'income' | 'expense';
  }) => Promise<void>;
}

export default function ExpenseFormModal({ isOpen, onClose, onSubmit }: ExpenseFormModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '' as CategoryKey,
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringFrequency: 'monthly',
    billUrl: '',
    type: 'expense' as 'income' | 'expense'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBillFile(file);
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `bills/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bills')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bills')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        billUrl: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload bill. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      setFormData({
        amount: '',
        description: '',
        category: '' as CategoryKey,
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurringFrequency: 'monthly',
        billUrl: '',
        type: 'expense'
      });
      setBillFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-dark-800 rounded-xl p-6 w-full max-w-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">Add New Transaction</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-accent-primary text-white'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-accent-primary text-white'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryKey })}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            >
              <option value="">Select a category</option>
              {Object.entries(categories)
                .filter(([_, cat]) => 
                  formData.type === 'income' ? cat.isIncome : !cat.isIncome
                )
                .map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.name}
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-200">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="form-checkbox bg-dark-700 border-dark-600 rounded text-accent-primary focus:ring-accent-primary"
              />
              <span>Is this a recurring transaction?</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Recurring Frequency
              </label>
              <select
                value={formData.recurringFrequency}
                onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          {formData.type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Upload Bill (optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bill-upload"
                  accept="image/*,.pdf"
                />
                <label
                  htmlFor="bill-upload"
                  className="flex items-center justify-center w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer"
                >
                  {isUploading ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  ) : (
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  )}
                  {billFile ? billFile.name : 'Choose a file'}
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-700 text-gray-400 rounded-lg hover:bg-dark-600 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Add Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 