import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Card from '../components/Card';
import GoalsTracker from '../components/GoalsTracker';
import SpendingOverview from '../components/SpendingOverview';
import ExpenseList from '../components/ExpenseList';
import YourAccounts from '../components/YourAccounts';
import FinancialMetrics from '../components/FinancialMetrics';
import { useExpenseStore } from '../store/expenseStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { categories } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faRobot,
  faReceipt,
  faChartPie,
  faLightbulb,
  faMoneyBillTransfer,
  faChartLine,
  faCoins,
  faCalendarAlt,
  faWallet,
  faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons';
import ExpenseFormModal from '../components/ExpenseFormModal';
import SubscriptionsModal from '../components/SubscriptionsModal';
import AIInsightsModal from '../components/AIInsightsModal';
import InvestmentModal from '../components/InvestmentModal';
import ReceiptScannerModal from '../components/ReceiptScannerModal';
import AIAssistant from '../components/AIAssistant';
import Analytics from '../components/Analytics';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenses, isLoading: expensesLoading } = useExpenseStore();
  const { monthlyIncome, monthlyBudget, totalBalance, currency } = useUserSettingsStore();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showInvestment, setShowInvestment] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Calculate financial metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const isCurrentMonth = expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      const isExpense = expense.type === 'expense' || !categories[expense.category]?.isIncome;
      return isCurrentMonth && isExpense;
    })
    .reduce((acc, expense) => acc + expense.amount, 0);

  const budgetRemaining = monthlyBudget - currentMonthExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - currentMonthExpenses) / monthlyIncome) * 100 : 0;

  const quickActions = [
    {
      name: 'AI Assistant',
      icon: faRobot,
      color: 'from-violet-600 to-purple-600',
      onClick: () => setShowAIAssistant(true)
    },
    {
      name: 'Scan Receipt',
      icon: faFileInvoiceDollar,
      color: 'from-blue-600 to-cyan-600',
      onClick: () => setShowReceiptScanner(true)
    },
    {
      name: 'Analytics',
      icon: faChartPie,
      color: 'from-emerald-600 to-teal-600',
      onClick: () => setShowAnalytics(true)
    },
    {
      name: 'Insights',
      icon: faLightbulb,
      color: 'from-amber-600 to-orange-600',
      onClick: () => setShowAIInsights(true)
    },
    {
      name: 'Subscriptions',
      icon: faCalendarAlt,
      color: 'from-rose-600 to-pink-600',
      onClick: () => setShowSubscriptions(true)
    },
    {
      name: 'Investments',
      icon: faChartLine,
      color: 'from-indigo-600 to-blue-600',
      onClick: () => setShowInvestment(true)
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-dark-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Add Expense Button - Prominent */}
        <button
          onClick={() => setShowAddExpense(true)}
          className="mb-8 py-3 px-4 bg-accent-primary rounded-lg text-white font-medium hover:bg-accent-primary/90 transition-colors flex items-center justify-center space-x-2"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        {/* Accounts Section */}
        <section className="mb-8">
          <YourAccounts />
        </section>

        {/* Financial Metrics */}
        <section className="mb-8">
          <FinancialMetrics 
            monthlyIncome={monthlyIncome || 0}
            monthlyExpenses={currentMonthExpenses || 0}
            budgetRemaining={budgetRemaining || 0}
            totalBalance={totalBalance || 0}
            savingsRate={savingsRate || 0}
            currency={currency}
          />
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={action.onClick}
                className={`p-4 rounded-xl bg-gradient-to-br ${action.color} hover:shadow-lg hover:scale-105 transition-all duration-200 relative group`}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors"></div>
                <div className="flex flex-col items-center text-white relative">
                  <FontAwesomeIcon icon={action.icon} className="w-6 h-6 mb-2 transform group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{action.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            <Card title="Spending Overview" className="p-6">
              <SpendingOverview />
            </Card>

            <Card title="Recent Transactions" className="p-6">
              <ExpenseList expenses={expenses} loading={expensesLoading} />
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            <Card title="Financial Goals" className="p-6">
              <GoalsTracker />
            </Card>

            <Card 
              title="Investment Overview" 
              className="p-6 cursor-pointer hover:bg-dark-800/50 transition-colors"
              onClick={() => setShowInvestment(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-dark-200">Total Portfolio</h3>
                <span className="text-dark-50 font-semibold">Click to manage investments</span>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
      />

      <SubscriptionsModal
        isOpen={showSubscriptions}
        onClose={() => setShowSubscriptions(false)}
      />

      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      <Analytics
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      <InvestmentModal
        isOpen={showInvestment}
        onClose={() => setShowInvestment(false)}
      />

      <ReceiptScannerModal
        isOpen={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
      />

      <AIInsightsModal
        isOpen={showAIInsights}
        onClose={() => setShowAIInsights(false)}
      />
    </div>
  );
} 