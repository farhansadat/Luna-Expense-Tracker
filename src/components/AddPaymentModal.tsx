import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { formatCurrency } from '../lib/currency';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payment: {
    description: string;
    amount: number;
    dueDate: string;
    type: 'incoming' | 'outgoing';
    notes?: string;
  }) => void;
}

export default function AddPaymentModal({ isOpen, onClose, onAdd }: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    type: 'outgoing' as 'incoming' | 'outgoing',
    notes: ''
  });
  const { currency } = useUserSettingsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add Upcoming Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              placeholder="Enter payment description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {currency}
              </span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'incoming' | 'outgoing' }))}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
            >
              <option value="outgoing">Outgoing Payment</option>
              <option value="incoming">Incoming Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 