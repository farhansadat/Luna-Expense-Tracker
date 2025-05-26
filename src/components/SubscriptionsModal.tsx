import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus,
  faTrash,
  faEdit,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useUserSettingsStore } from '../store/userSettingsStore';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: string;
  notes?: string;
}

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SERVICES = [
  { name: 'Netflix', category: 'entertainment', defaultAmount: 15.99 },
  { name: 'Spotify', category: 'entertainment', defaultAmount: 9.99 },
  { name: 'Amazon Prime', category: 'shopping', defaultAmount: 14.99 },
  { name: 'Disney+', category: 'entertainment', defaultAmount: 7.99 },
  { name: 'YouTube Premium', category: 'entertainment', defaultAmount: 11.99 },
  { name: 'Apple Music', category: 'entertainment', defaultAmount: 9.99 },
  { name: 'HBO Max', category: 'entertainment', defaultAmount: 14.99 },
  { name: 'Hulu', category: 'entertainment', defaultAmount: 7.99 }
];

export default function SubscriptionsModal({ isOpen, onClose }: SubscriptionsModalProps) {
  const { currency } = useUserSettingsStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    nextBillingDate: new Date().toISOString().split('T')[0],
    category: 'entertainment',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subscription = {
      id: editingId || Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount)
    };

    if (editingId) {
      setSubscriptions(subs => subs.map(s => s.id === editingId ? subscription : s));
      setEditingId(null);
    } else {
      setSubscriptions(subs => [...subs, subscription]);
    }

    setFormData({
      name: '',
      amount: '',
      billingCycle: 'monthly',
      nextBillingDate: new Date().toISOString().split('T')[0],
      category: 'entertainment',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (subscription: Subscription) => {
    setFormData({
      name: subscription.name,
      amount: subscription.amount.toString(),
      billingCycle: subscription.billingCycle,
      nextBillingDate: subscription.nextBillingDate,
      category: subscription.category,
      notes: subscription.notes || ''
    });
    setEditingId(subscription.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      setSubscriptions(subs => subs.filter(s => s.id !== id));
    }
  };

  const calculateTotalMonthly = () => {
    return subscriptions.reduce((total, sub) => {
      const amount = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
      return total + amount;
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-6 h-6 text-accent-primary" />
            <h2 className="text-xl font-semibold text-white">Manage Subscriptions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Monthly Total */}
          <div className="bg-dark-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Monthly Total</h3>
            <p className="text-2xl font-bold text-white">
              {currency} {calculateTotalMonthly().toLocaleString()}
            </p>
          </div>

          {/* Add Subscription Form */}
          {showAddForm ? (
            <form onSubmit={handleSubmit} className="bg-dark-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingId ? 'Edit Subscription' : 'Add New Subscription'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2 text-white"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                    className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2 text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Next Billing Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextBillingDate}
                    onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 bg-dark-600 text-white rounded hover:bg-dark-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90"
                >
                  {editingId ? 'Update Subscription' : 'Add Subscription'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Your Subscriptions</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Subscription
              </button>
            </div>
          )}

          {/* Popular Services */}
          {!showAddForm && subscriptions.length === 0 && (
            <div className="bg-dark-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">Popular Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {POPULAR_SERVICES.map((service) => (
                  <button
                    key={service.name}
                    onClick={() => {
                      setFormData({
                        name: service.name,
                        amount: service.defaultAmount.toString(),
                        billingCycle: 'monthly',
                        nextBillingDate: new Date().toISOString().split('T')[0],
                        category: service.category,
                        notes: ''
                      });
                      setShowAddForm(true);
                    }}
                    className="p-4 bg-dark-600 rounded-lg hover:bg-dark-500 transition-colors text-center"
                  >
                    <p className="font-medium text-white">{service.name}</p>
                    <p className="text-sm text-gray-400">
                      {currency} {service.defaultAmount}/mo
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions List */}
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-dark-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-white">{subscription.name}</h4>
                  <p className="text-sm text-gray-400">
                    {currency} {subscription.amount.toLocaleString()}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="p-2 text-gray-400 hover:text-red-400"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 