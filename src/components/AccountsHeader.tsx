import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faWallet,
  faBuilding,
  faUsers,
  faPencilAlt,
  faTrash,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import { useAccountStore } from '../store/accountStore';
import { formatCurrency } from '../lib/currency';
import AddAccountModal from './AddAccountModal';

export default function AccountsHeader() {
  const { accounts, selectedAccount, setSelectedAccount } = useAccountStore();
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowAddAccount(true);
    setShowDropdown(null);
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Your Accounts</h2>
            <motion.button
              onClick={() => setShowAddAccount(true)}
              className="btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Account
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                className={`bg-white/5 backdrop-blur-xl rounded-xl p-4 cursor-pointer border transition-all ${
                  selectedAccount?.id === account.id
                    ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <FontAwesomeIcon
                        icon={
                          account.type === 'personal'
                            ? faWallet
                            : account.type === 'business'
                            ? faBuilding
                            : faUsers
                        }
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(account.id);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={faEllipsisH}
                        className="w-5 h-5 text-white/60"
                      />
                    </button>
                    <AnimatePresence>
                      {showDropdown === account.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAccount(account);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} className="w-4 h-4" />
                            <span>Edit Account</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  <p className="text-sm text-gray-400">Current Balance</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddAccount && (
          <AddAccountModal
            isOpen={showAddAccount}
            onClose={() => {
              setShowAddAccount(false);
              setEditingAccount(null);
            }}
            editingAccount={editingAccount}
          />
        )}
      </AnimatePresence>
    </>
  );
} 