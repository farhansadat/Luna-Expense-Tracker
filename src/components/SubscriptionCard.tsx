import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faChevronRight, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { formatCurrency } from '../lib/currency';

interface SubscriptionCardProps {
  onManageClick: () => void;
  subscriptions: any[];
  upcomingPayments: any[];
}

const SubscriptionItem = React.memo(function SubscriptionItem({ subscription, currency }: { subscription: any, currency: string }) {
  const formattedDate = useMemo(() => 
    new Date(subscription.nextBillingDate).toLocaleDateString(),
    [subscription.nextBillingDate]
  );

  const formattedAmount = useMemo(() => 
    formatCurrency(subscription.amount, currency),
    [subscription.amount, currency]
  );

  return (
    <div className="bg-dark-700 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <FontAwesomeIcon icon={faCalendarAlt} className="text-accent-primary" />
        <div>
          <p className="text-sm font-medium text-white">{subscription.name}</p>
          <p className="text-xs text-gray-400">
            Next: {formattedDate}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {formattedAmount}
        </p>
        <p className="text-xs text-gray-400">
          {subscription.billingCycle}
        </p>
      </div>
    </div>
  );
});

function SubscriptionCard({ onManageClick, subscriptions }: SubscriptionCardProps) {
  const { currency } = useUserSettingsStore();
  const [totalMonthly, setTotalMonthly] = useState(0);

  // Memoize the total monthly calculation
  const calculateTotalMonthly = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + sub.amount;
      } else if (sub.billingCycle === 'yearly') {
        return total + (sub.amount / 12);
      }
      return total;
    }, 0);
  }, [subscriptions]);

  useEffect(() => {
    setTotalMonthly(calculateTotalMonthly);
  }, [calculateTotalMonthly]);

  // Memoize the sorted subscriptions
  const sortedSubscriptions = useMemo(() => {
    if (!Array.isArray(subscriptions)) return [];
    return [...subscriptions]
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
      .slice(0, 5);
  }, [subscriptions]);

  const handleClick = useCallback(() => {
    onManageClick();
  }, [onManageClick]);

  return (
    <motion.div 
      className="bg-dark-800 rounded-xl p-6 hover:bg-dark-800/80 transition-colors cursor-pointer group"
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      layout
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faReceipt} className="text-accent-primary text-xl" />
          </div>
          <h2 className="text-lg font-semibold text-white">Subscriptions & Payments</h2>
        </div>
        <button className="text-accent-primary group-hover:translate-x-1 transition-transform">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Monthly Total</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(totalMonthly, currency)}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-400">Active Subscriptions</p>
          <div className="space-y-2">
            {sortedSubscriptions.map((subscription) => (
              <SubscriptionItem 
                key={subscription.id}
                subscription={subscription}
                currency={currency}
              />
            ))}
          </div>
          {subscriptions.length > 5 && (
            <p className="text-sm text-center text-accent-primary">
              +{subscriptions.length - 5} more subscriptions
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(SubscriptionCard); 