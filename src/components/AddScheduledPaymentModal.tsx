import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAccountStore } from '../store/accountStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { categories } from '../data/categories';
import type { CategoryKey } from '../data/categories';
import type { ScheduledPayment } from '../types';

interface AddScheduledPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPayment?: ScheduledPayment | null;
}

export default function AddScheduledPaymentModal({
  isOpen,
  onClose,
  editingPayment,
}: AddScheduledPaymentModalProps) {
  const { addScheduledPayment, updateScheduledPayment } = useAccountStore();
  const { currency } = useUserSettingsStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryKey>('other');
  const [frequency, setFrequency] = useState<ScheduledPayment['frequency']>('monthly');
  const [nextDate, setNextDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPayment) {
      setDescription(editingPayment.description);
      setAmount(editingPayment.amount.toString());
      setCategory(editingPayment.category);
      setFrequency(editingPayment.frequency);
      setNextDate(new Date(editingPayment.next_date));
      setEndDate(editingPayment.end_date ? new Date(editingPayment.end_date) : null);
      setPaymentMethod(editingPayment.payment_method || '');
      setRecipient(editingPayment.recipient || '');
    } else {
      resetForm();
    }
  }, [editingPayment]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('other');
    setFrequency('monthly');
    setNextDate(new Date());
    setEndDate(null);
    setPaymentMethod('');
    setRecipient('');
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (!description || !amount || !category || !frequency || !nextDate) {
        setError('Please fill in all required fields');
        return;
      }

      const paymentData = {
        description,
        amount: parseFloat(amount),
        category,
        frequency,
        next_date: nextDate.toISOString(),
        end_date: endDate?.toISOString(),
        payment_method: paymentMethod || undefined,
        recipient: recipient || undefined,
        status: 'active' as const,
      };

      if (editingPayment) {
        await updateScheduledPayment(editingPayment.id, paymentData);
      } else {
        await addScheduledPayment(paymentData);
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to save scheduled payment:', error);
      setError('Failed to save scheduled payment. Please try again.');
    }
  };

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
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPayment ? 'Edit Scheduled Payment' : 'Add Scheduled Payment'}
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
              />

              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder={`Amount in ${currency}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryKey)}
                    className="input-field"
                  >
                    {Object.entries(categories).map(([key, { name }]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ScheduledPayment['frequency'])}
                    className="input-field"
                  >
                    <option value="one_time">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="flex-1">
                  <DatePicker
                    selected={nextDate}
                    onChange={(date) => setNextDate(date || new Date())}
                    minDate={new Date()}
                    customInput={
                      <button className="input-field flex items-center justify-between w-full">
                        <span>{nextDate.toLocaleDateString()}</span>
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                      </button>
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Payment Method (optional)"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Recipient (optional)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {frequency !== 'one_time' && (
                <div className="flex items-center space-x-4">
                  <label className="text-gray-400">End Date (optional)</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    minDate={nextDate}
                    isClearable
                    customInput={
                      <button className="input-field flex items-center justify-between">
                        <span>{endDate ? endDate.toLocaleDateString() : 'No end date'}</span>
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                      </button>
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                {editingPayment ? 'Save Changes' : 'Add Payment'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 