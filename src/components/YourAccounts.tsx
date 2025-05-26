import { useState } from 'react';
import Card from './Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCreditCard, 
  faBuilding,
  faUsers,
  faUser,
  faPlus,
  faPen,
  faTrash,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../lib/currency';
import { useAccountStore } from '../store/accountStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import AddAccountModal from './AddAccountModal';

interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'personal' | 'business' | 'family';
  isMain?: boolean;
  color?: string;
  monthlyBudget: number;
}

const sampleAccounts: Account[] = [
  {
    id: '1',
    name: 'Personal Account',
    balance: 5420.50,
    type: 'personal',
    isMain: true,
    color: '#3B82F6',
    monthlyBudget: 2000
  }
];

const getAccountIcon = (type: Account['type']) => {
  switch (type) {
    case 'personal':
      return faUser;
    case 'business':
      return faBuilding;
    case 'family':
      return faUsers;
    default:
      return faUser;
  }
};

export default function YourAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(sampleAccounts);
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0].id);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { deleteAccount } = useAccountStore();
  const { currency } = useUserSettingsStore();

  const handleAddAccount = (newAccount: Omit<Account, 'id'>) => {
    const account = {
      ...newAccount,
      id: Date.now().toString(),
    };
    setAccounts([...accounts, account]);
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map(account => (
          <Card 
            key={account.id} 
            className={`p-6 transition-all duration-300 cursor-pointer group
              ${selectedAccount === account.id 
                ? 'ring-2 ring-accent-primary shadow-xl' 
                : 'hover:shadow-xl'}`}
            onClick={() => setSelectedAccount(account.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${account.color}20` }}
                >
                  <FontAwesomeIcon 
                    icon={getAccountIcon(account.type)} 
                    className="w-6 h-6"
                    style={{ color: account.color }}
                  />
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-dark-200 font-medium">{account.name}</h3>
                  {account.isMain && (
                    <span className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full">
                      Main
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-dark-50">
                  {formatCurrency(account.balance)}
                </p>
                <p className="text-sm text-dark-400 mt-1">
                  Budget: {formatCurrency(account.monthlyBudget)}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="text-dark-400 hover:text-dark-200 p-1"
                  title="Edit Account"
                >
                  <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        
        <Card 
          className="p-6 border-2 border-dashed border-dark-700 hover:border-dark-500 transition-all duration-300 flex items-center justify-center cursor-pointer group"
          onClick={() => setShowAddAccount(true)}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-primary transition-colors duration-300">
              <FontAwesomeIcon 
                icon={faPlus} 
                className="w-6 h-6 text-dark-400 group-hover:text-white"
              />
            </div>
            <h3 className="text-dark-400 group-hover:text-dark-200">Add Account</h3>
          </div>
        </Card>
      </div>

      <AddAccountModal
        isOpen={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onAdd={handleAddAccount}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Delete Account</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this account? This action cannot be undone and all associated data (expenses, transactions, etc.) will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-dark-600 text-white rounded-lg hover:bg-dark-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAccount(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 