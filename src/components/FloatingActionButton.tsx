import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faReceipt,
  faCreditCard,
  faFileExport,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

interface Props {
  onAddExpense: () => void;
  onScanReceipt: () => void;
  onAddSubscription: () => void;
  onExport: () => void;
}

export default function FloatingActionButton({
  onAddExpense,
  onScanReceipt,
  onAddSubscription,
  onExport,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: faPlus,
      label: 'Add Expense',
      onClick: () => {
        onAddExpense();
        setIsOpen(false);
      },
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: faReceipt,
      label: 'Scan Receipt',
      onClick: () => {
        onScanReceipt();
        setIsOpen(false);
      },
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      icon: faCreditCard,
      label: 'Add Subscription',
      onClick: () => {
        onAddSubscription();
        setIsOpen(false);
      },
      color: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      icon: faFileExport,
      label: 'Export Data',
      onClick: () => {
        onExport();
        setIsOpen(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 right-0 space-y-2"
            >
              {actions.map((action) => (
                <motion.button
                  key={action.label}
                  onClick={action.onClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white shadow-lg ${action.color} min-w-[160px] justify-between group`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-medium">{action.label}</span>
                  <FontAwesomeIcon
                    icon={action.icon}
                    className="w-4 h-4 transform group-hover:scale-110 transition-transform"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-lg ${
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
          } text-white transition-colors`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon
            icon={isOpen ? faTimes : faPlus}
            className="w-6 h-6"
          />
        </motion.button>
      </div>
    </div>
  );
} 