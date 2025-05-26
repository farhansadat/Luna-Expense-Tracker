import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faPlus, 
  faPen, 
  faTrash,
  faSpinner,
  faEdit,
  faTimes,
  faCoins,
  faBuilding,
  faMoneyBill,
  faQuestion
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { useInvestmentStore } from '../store/investmentStore';
import { useUserSettingsStore } from '../store/userSettingsStore';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'crypto' | 'real_estate' | 'cash' | 'other';
  amount: number;
  current_value: number;
  purchase_date: string;
  notes?: string;
}

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  initialData?: Investment;
}

const INVESTMENT_TYPES = [
  { value: 'stocks', label: 'Stocks', icon: faChartLine },
  { value: 'crypto', label: 'Cryptocurrency', icon: faCoins },
  { value: 'real_estate', label: 'Real Estate', icon: faBuilding },
  { value: 'cash', label: 'Cash', icon: faMoneyBill },
  { value: 'other', label: 'Other', icon: faQuestion }
];

function AddInvestmentModal({ isOpen, onClose, onAdd, initialData }: AddInvestmentModalProps) {
  const [formData, setFormData] = useState<Omit<Investment, 'id'>>(
    initialData || {
      name: '',
      type: 'stocks',
      amount: 0,
      current_value: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
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
            className="w-full max-w-md bg-dark-800 rounded-xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-semibold text-dark-50 mb-6">
              {initialData ? 'Edit Investment' : 'Add New Investment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Investment Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Investment['type'] })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                >
                  {INVESTMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Initial Investment
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Current Value
                </label>
                <input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-dark-700 text-dark-200 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  {initialData ? 'Save Changes' : 'Add Investment'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function InvestmentModal({ isOpen, onClose }: InvestmentModalProps) {
  const { user } = useAuth();
  const { currency } = useUserSettingsStore();
  const {
    investments,
    isLoading,
    error,
    fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment
  } = useInvestmentStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stocks',
    amount: '',
    current_value: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchInvestments();
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const investment = {
      ...formData,
      amount: parseFloat(formData.amount),
      current_value: parseFloat(formData.current_value)
    };

    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment, investment);
      } else {
        await addInvestment(investment);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment.id);
    setFormData({
      name: investment.name,
      type: investment.type,
      amount: investment.amount.toString(),
      current_value: investment.current_value.toString(),
      purchase_date: investment.purchase_date,
      notes: investment.notes || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      await deleteInvestment(id);
    }
  };

  const resetForm = () => {
    setEditingInvestment(null);
    setFormData({
      name: '',
      type: 'stocks',
      amount: '',
      current_value: '',
      purchase_date: '',
      notes: ''
    });
  };

  if (!isOpen) return null;

  const totalPortfolio = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const portfolioByType = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.current_value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Investment Portfolio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Total Portfolio Value</h3>
            <p className="text-2xl font-bold text-accent-primary">
              {currency} {totalPortfolio.toLocaleString()}
            </p>
          </div>
          <div className="bg-dark-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Portfolio Distribution</h3>
            <div className="space-y-2">
              {Object.entries(portfolioByType).map(([type, value]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-400">{type}</span>
                  <span className="font-medium">
                    {((value / totalPortfolio) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add/Edit Investment Form */}
        <form onSubmit={handleSubmit} className="bg-dark-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Investment Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2"
                required
              >
                {INVESTMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Initial Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Value</label>
              <input
                type="number"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-dark-600 border border-dark-500 rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            {editingInvestment && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-dark-600 text-white rounded hover:bg-dark-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90"
            >
              {editingInvestment ? 'Update Investment' : 'Add Investment'}
            </button>
          </div>
        </form>

        {/* Investments List */}
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-400">Loading investments...</p>
          ) : error ? (
            <p className="text-center text-red-400">{error}</p>
          ) : investments.length === 0 ? (
            <p className="text-center text-gray-400">No investments added yet</p>
          ) : (
            investments.map((investment) => (
              <div
                key={investment.id}
                className="bg-dark-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium">{investment.name}</h4>
                  <p className="text-sm text-gray-400">{investment.type}</p>
                  <p className="text-sm">
                    Initial: {currency} {investment.amount.toLocaleString()} | 
                    Current: {currency} {investment.current_value.toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(investment)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(investment.id)}
                    className="p-2 text-gray-400 hover:text-red-400"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 