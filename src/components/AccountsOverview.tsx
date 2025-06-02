import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faWallet,
  faCreditCard,
  faPiggyBank,
  faChartLine,
  faMoneyBill,
  faCalendarAlt,
  faEllipsisV,
  faEdit,
  faTrash,
  faMagic,
  faBuilding,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAccountStore } from '../store/accountStore';
import { formatCurrency } from '../lib/currency';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { useAuth } from '../contexts/AuthContext';
import { seedDashboardData } from '../utils/seedData';
import type { Account } from '../types';
import AddAccountModal from './AddAccountModal';
import { toast } from 'react-hot-toast';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

const AccountCard = ({ account, onEdit, onDelete }: AccountCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const { currency } = useUserSettingsStore();

  const getIcon = (type: Account['type']) => {
    switch (type) {
      case 'personal':
        return faWallet;
      case 'business':
        return faBuilding;
      case 'family':
        return faUsers;
      default:
        return faWallet;
    }
  };

  return (
    <motion.div
      className="bg-white/5 rounded-xl p-4 relative"
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: account.color + '20' }}
          >
            <FontAwesomeIcon
              icon={getIcon(account.type)}
              className="w-5 h-5"
              style={{ color: account.color }}
            />
          </div>
          <div>
            <h3 className="font-medium text-white">{account.name}</h3>
            <p className="text-sm text-gray-400">{account.type}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faEllipsisV} className="text-gray-400" />
          </button>
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[150px] z-10"
              >
                <button
                  onClick={() => onEdit(account)}
                  className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(account.id)}
                  className="w-full px-4 py-2 text-left hover:bg-white/5 text-red-400 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">
          {formatCurrency(account.balance, currency)}
        </p>
      </div>
    </motion.div>
  );
};

export default function AccountsOverview() {
  const {
    accounts,
    scheduledPayments,
    isLoading,
    error,
    fetchAccounts,
    fetchScheduledPayments,
    deleteAccount,
  } = useAccountStore();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { currency } = useUserSettingsStore();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Fetching accounts and payments...');
    fetchAccounts();
    fetchScheduledPayments();
  }, [fetchAccounts, fetchScheduledPayments]);

  useEffect(() => {
    console.log('Current accounts:', accounts);
  }, [accounts]);

  const handleSeedData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const success = await seedDashboardData(user.id);
      if (success) {
        toast.success('Demo data added successfully!');
        fetchAccounts();
        fetchScheduledPayments();
      } else {
        toast.error('Failed to add demo data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to add demo data');
    } finally {
      setSeeding(false);
    }
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowAddAccount(true);
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      await deleteAccount(id);
    }
  };

  if (isLoading || seeding) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
        {error}
        <button 
          onClick={() => fetchAccounts()}
          className="mt-2 text-sm underline hover:text-red-400"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Welcome to FinWise!</h3>
        <p className="text-gray-400 mb-6">Get started by adding your accounts or use demo data to explore the features.</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowAddAccount(true)}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Account</span>
          </button>
          <button
            onClick={handleSeedData}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faMagic} />
            <span>Add Demo Data</span>
          </button>
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const upcomingPayments = scheduledPayments
    .filter((payment) => payment.status === 'active')
    .sort((a, b) => new Date(a.next_date).getTime() - new Date(b.next_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Total Balance */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-6">
        <p className="text-white/80 mb-2">Total Balance</p>
        <h2 className="text-3xl font-bold text-white">
          {formatCurrency(totalBalance, currency)}
        </h2>
      </div>

      {/* Account List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Your Accounts</h2>
          <button
            onClick={() => {
              setSelectedAccount(null);
              setShowAddAccount(true);
            }}
            className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Scheduled Payments */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Upcoming Payments</h2>
        <div className="space-y-4">
          {upcomingPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-white">{payment.description}</p>
                  <p className="text-sm text-gray-400">
                    Next payment on {new Date(payment.next_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="font-medium text-red-400">
                -{formatCurrency(payment.amount, currency)}
              </p>
            </div>
          ))}
          {upcomingPayments.length === 0 && (
            <p className="text-gray-400 text-center py-4">No upcoming payments</p>
          )}
        </div>
      </div>

      <AddAccountModal
        isOpen={showAddAccount}
        onClose={() => {
          setShowAddAccount(false);
          setSelectedAccount(null);
        }}
        editingAccount={selectedAccount}
      />
    </div>
  );
} 