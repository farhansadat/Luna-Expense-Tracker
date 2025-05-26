import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faBriefcase,
  faUsers,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useAccountStore, type Account } from '../store/accountStore';

const accountTypes = [
  { id: 'personal', name: 'Personal', icon: faWallet },
  { id: 'business', name: 'Business', icon: faBriefcase },
  { id: 'family', name: 'Family', icon: faUsers },
];

const colorSchemes = [
  { id: 'purple', name: 'Purple', value: 'from-purple-500 to-indigo-500' },
  { id: 'blue', name: 'Blue', value: 'from-blue-500 to-cyan-500' },
  { id: 'green', name: 'Green', value: 'from-green-500 to-emerald-500' },
  { id: 'yellow', name: 'Yellow', value: 'from-yellow-500 to-amber-500' },
  { id: 'red', name: 'Red', value: 'from-red-500 to-pink-500' },
  { id: 'pink', name: 'Pink', value: 'from-pink-500 to-rose-500' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  account?: Account | null;
}

export default function AddEditAccountModal({ isOpen, onClose, account }: Props) {
  const { createAccount, updateAccount } = useAccountStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'personal',
    currency: 'EUR',
    color: 'from-purple-500 to-indigo-500',
    icon: 'wallet',
    is_default: false,
    monthly_budget: '',
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        currency: account.currency,
        color: account.color,
        icon: account.icon,
        is_default: account.is_default,
        monthly_budget: account.monthly_budget?.toString() || '',
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accountData = {
        ...formData,
        monthly_budget: formData.monthly_budget ? parseFloat(formData.monthly_budget) : null,
      };

      if (account) {
        await updateAccount(account.id, accountData);
      } else {
        await createAccount(accountData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl bg-gray-900 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {account ? 'Edit Account' : 'Add Account'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="input-field"
                    placeholder="e.g., Personal Checking"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {accountTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, type: type.id as any }))
                        }
                        className={`flex flex-col items-center p-4 rounded-lg border ${
                          formData.type === type.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={type.icon}
                          className={`w-6 h-6 mb-2 ${
                            formData.type === type.id
                              ? 'text-purple-500'
                              : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={
                            formData.type === type.id
                              ? 'text-purple-500'
                              : 'text-gray-400'
                          }
                        >
                          {type.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, currency: e.target.value }))
                    }
                    className="input-field"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, color: scheme.value }))
                        }
                        className={`h-12 rounded-lg bg-gradient-to-r ${
                          scheme.value
                        } ${
                          formData.color === scheme.value
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {!account && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_default: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 bg-gray-700"
                    />
                    <label
                      htmlFor="is_default"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Set as default account
                    </label>
                  </div>
                )}

                {!account && !formData.is_default && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Monthly Budget
                    </label>
                    <input
                      type="number"
                      value={formData.monthly_budget}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          monthly_budget: e.target.value,
                        }))
                      }
                      placeholder="Enter monthly budget"
                      className="input-field"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {account ? 'Save Changes' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 