import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faCalendarAlt,
  faEdit,
  faTrash,
  faCheck,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { useAccountStore } from '../store/accountStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { formatCurrency } from '../lib/currency';
import { categories } from '../data/categories';
import type { ScheduledPayment } from '../types';
import AddScheduledPaymentModal from './AddScheduledPaymentModal';

interface ScheduledPaymentCardProps {
  payment: ScheduledPayment;
  onEdit: (payment: ScheduledPayment) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'active' | 'paused') => void;
}

const ScheduledPaymentCard = ({
  payment,
  onEdit,
  onDelete,
  onToggleStatus,
}: ScheduledPaymentCardProps) => {
  const { currency } = useUserSettingsStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-4">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: categories[payment.category].color + '20' }}
        >
          <FontAwesomeIcon
            icon={categories[payment.category].icon}
            className="w-5 h-5"
            style={{ color: categories[payment.category].color }}
          />
        </div>
        <div>
          <p className="font-medium text-white">{payment.description}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
            <span>Next: {new Date(payment.next_date).toLocaleDateString()}</span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
              {payment.frequency}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <p className="font-medium text-red-400">
          -{formatCurrency(payment.amount, currency)}
        </p>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleStatus(payment.id, payment.status === 'active' ? 'paused' : 'active')}
            className={`p-2 rounded-lg transition-colors ${
              payment.status === 'active'
                ? 'text-green-400 hover:bg-green-400/10'
                : 'text-yellow-400 hover:bg-yellow-400/10'
            }`}
          >
            <FontAwesomeIcon icon={payment.status === 'active' ? faPause : faPlay} />
          </button>
          <button
            onClick={() => onEdit(payment)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => onDelete(payment.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ScheduledPayments() {
  const {
    scheduledPayments,
    deleteScheduledPayment,
    updateScheduledPayment,
  } = useAccountStore();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ScheduledPayment | null>(null);

  const handleEditPayment = (payment: ScheduledPayment) => {
    setSelectedPayment(payment);
    setShowAddPayment(true);
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this scheduled payment?')) {
      await deleteScheduledPayment(id);
    }
  };

  const handleToggleStatus = async (id: string, status: 'active' | 'paused') => {
    await updateScheduledPayment(id, { status });
  };

  const activePayments = scheduledPayments.filter(
    (payment) => payment.status !== 'completed'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Scheduled Payments</h2>
        <button
          onClick={() => {
            setSelectedPayment(null);
            setShowAddPayment(true);
          }}
          className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {activePayments.map((payment) => (
            <ScheduledPaymentCard
              key={payment.id}
              payment={payment}
              onEdit={handleEditPayment}
              onDelete={handleDeletePayment}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </AnimatePresence>
        {activePayments.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            No scheduled payments
          </p>
        )}
      </div>

      <AddScheduledPaymentModal
        isOpen={showAddPayment}
        onClose={() => {
          setShowAddPayment(false);
          setSelectedPayment(null);
        }}
        editingPayment={selectedPayment}
      />
    </div>
  );
} 