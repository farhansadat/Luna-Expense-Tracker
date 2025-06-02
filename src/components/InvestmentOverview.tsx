import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faArrowTrendUp, 
  faArrowTrendDown,
  faChevronRight,
  faCoins,
  faBuilding,
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { useInvestmentStore } from '../store/investmentStore';
import { formatCurrency } from '../lib/currency';
import { useUserSettingsStore } from '../store/userSettingsStore';

interface InvestmentOverviewProps {
  onManageClick: () => void;
}

const INVESTMENT_TYPE_ICONS = {
  stocks: faChartLine,
  crypto: faCoins,
  real_estate: faBuilding,
  cash: faWallet,
  other: faChartLine
};

export default function InvestmentOverview({ onManageClick }: InvestmentOverviewProps) {
  const { investments } = useInvestmentStore();
  const { currency } = useUserSettingsStore();
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [gainPercentage, setGainPercentage] = useState(0);

  useEffect(() => {
    const currentTotal = investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const initialTotal = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const gain = currentTotal - initialTotal;
    const percentage = initialTotal > 0 ? (gain / initialTotal) * 100 : 0;

    setTotalValue(currentTotal);
    setTotalGain(gain);
    setGainPercentage(percentage);
  }, [investments]);

  return (
    <motion.div 
      className="bg-dark-800 rounded-xl p-6 hover:bg-dark-800/80 transition-colors cursor-pointer group"
      onClick={onManageClick}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faChartLine} className="text-accent-primary text-xl" />
          </div>
          <h2 className="text-lg font-semibold text-white">Investment Portfolio</h2>
        </div>
        <button className="text-accent-primary group-hover:translate-x-1 transition-transform">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(totalValue, currency)}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Gain/Loss</p>
            <div className={`flex items-center space-x-2 ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <FontAwesomeIcon 
                icon={totalGain >= 0 ? faArrowTrendUp : faArrowTrendDown} 
                className="w-4 h-4" 
              />
              <p className="font-semibold">
                {formatCurrency(Math.abs(totalGain), currency)}
              </p>
              <span className="text-sm">
                ({gainPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {investments.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Portfolio Breakdown</p>
            <div className="grid grid-cols-2 gap-4">
              {investments.slice(0, 4).map((investment) => (
                <motion.div
                  key={investment.id}
                  className="bg-dark-700 rounded-lg p-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <FontAwesomeIcon 
                      icon={INVESTMENT_TYPE_ICONS[investment.type as keyof typeof INVESTMENT_TYPE_ICONS] || faChartLine}
                      className="text-accent-primary w-4 h-4"
                    />
                    <p className="text-sm font-medium text-white truncate">
                      {investment.name}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">Current Value</p>
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(investment.current_value, currency)}
                    </p>
                  </div>
                  {investment.current_value !== investment.amount && (
                    <div className="text-xs mt-1">
                      <span className={investment.current_value > investment.amount ? 'text-green-500' : 'text-red-500'}>
                        {((investment.current_value - investment.amount) / investment.amount * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            {investments.length > 4 && (
              <p className="text-sm text-center text-accent-primary">
                +{investments.length - 4} more investments
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">
              Click to start managing your investments
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 