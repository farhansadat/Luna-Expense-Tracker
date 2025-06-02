import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faPlus,
  faWallet,
  faCreditCard,
  faPiggyBank,
  faMoneyBillWave,
  faBuilding,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../utils/formatters';
import type { Account } from '../types';

interface AccountsSectionProps {
  accounts: Account[];
  onAddAccount: () => void;
}

export default function AccountsSection({ accounts, onAddAccount }: AccountsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIcon = (type: string) => {
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

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="bg-white/5 rounded-2xl backdrop-blur-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Your Accounts</h2>
            <p className="text-gray-400 text-sm">
              Total Balance: {formatCurrency(totalBalance, accounts[0]?.currency || 'USD')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onAddAccount();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            </motion.button>
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <FontAwesomeIcon
              icon={isCollapsed ? faChevronDown : faChevronUp}
              className="text-gray-400 w-5 h-5"
            />
          </motion.div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 space-y-4">
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 rounded-xl p-4 cursor-pointer transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
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
                        <h3 className="text-white font-medium">{account.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{account.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {accounts.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-400">No accounts yet. Add your first account!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 