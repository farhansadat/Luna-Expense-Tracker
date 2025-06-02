import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import GoalsTracker from '../components/GoalsTracker';
import SpendingOverview from '../components/SpendingOverview';
import ExpenseList from '../components/ExpenseList';
import YourAccounts from '../components/YourAccounts';
import FinancialMetrics from '../components/FinancialMetrics';
import { useExpenseStore } from '../store/expenseStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useGoalsStore } from '../store/goalsStore';
import { categories } from '../data/categories';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCurrency } from '../lib/currency';
import { supabase } from '../lib/supabase';
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
  faFileInvoiceDollar,
  faSignOutAlt,
  faCog,
  faPiggyBank,
  faSpinner,
  faMagic
} from '@fortawesome/free-solid-svg-icons';
import ExpenseFormModal from '../components/ExpenseFormModal';
import SubscriptionsModal from '../components/SubscriptionsModal';
import AIInsightsModal from '../components/AIInsightsModal';
import InvestmentModal from '../components/InvestmentModal';
import ReceiptScannerModal from '../components/ReceiptScannerModal';
import AIAssistant from '../components/AIAssistant';
import Analytics from '../components/Analytics';
import AddPaymentModal from '../components/AddPaymentModal';
import SubscriptionCard from '../components/SubscriptionCard';
import InvestmentOverview from '../components/InvestmentOverview';
import QuickActionCard from '../components/QuickActionCard';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { usePaymentsStore } from '../store/paymentsStore';
import { useAccountStore } from '../store/accountStore';
import { seedDashboardData } from '../utils/seedData';
import { toast } from 'react-hot-toast';
import { useDemoStore } from '../store/demoStore';
import { useInvestmentStore } from '../store/investmentStore';

interface Payment {
  id?: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  recurring: boolean;
  user_id?: string;
}

// Add these variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const greetingVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      duration: 0.6
    }
  }
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      delay: 0.2
    }
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, isDemo } = useAuth();
  const { isDemoMode, accounts, expenses, goals, investments, scheduledPayments } = useDemoStore();
  const { expenses: dbExpenses, isLoading: expensesLoading, fetchExpenses } = useExpenseStore();
  const { monthlyIncome, monthlyBudget, totalBalance, currency, updateSettings, name } = useUserSettingsStore();
  const { payments: dbPayments, isLoading: paymentsLoading, fetchPayments } = usePaymentsStore();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showInvestment, setShowInvestment] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const { subscriptions, fetchSubscriptions } = useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const { accounts: dbAccounts, fetchAccounts } = useAccountStore();
  const { fetchInvestments } = useInvestmentStore();

  // Use demo data if in demo mode
  const displayAccounts = isDemo ? accounts : dbAccounts;
  const displayExpenses = isDemo ? expenses : dbExpenses;
  const displayGoals = isDemo ? goals : useGoalsStore(state => state.goals);
  const displayInvestments = isDemo ? investments : useInvestmentStore(state => state.investments);
  const displayPayments = isDemo ? scheduledPayments : dbPayments;

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchSubscriptions();
      useGoalsStore.getState().fetchGoals();
      fetchPayments();
      useInvestmentStore.getState().fetchInvestments();
      
      const fetchInitialBalance = async () => {
        if (isDemo) {
          // Use demo data for profile in demo mode
          updateSettings({
            totalBalance: 250000,
            monthlyIncome: 25000,
            monthlyBudget: 15000,
            name: 'Demo User'
          });
          return;
        }

        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('total_balance, monthly_income, monthly_budget')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          
          if (profile) {
            updateSettings({
              totalBalance: profile.total_balance || 0,
              monthlyIncome: profile.monthly_income || 0,
              monthlyBudget: profile.monthly_budget || 0
            });
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };

      fetchInitialBalance();
    }
  }, [user, isDemo]);

  // Calculate financial metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = displayExpenses
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

  // Calculate category totals for pie chart
  const categoryTotals = displayExpenses.reduce((acc, expense) => {
    if (expense.type === 'expense') {
      const category = categories[expense.category]?.name || expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      name: category,
      value: Math.abs(amount)
    }));

  const COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEEAD', // Yellow
    '#D4A5A5', // Pink
    '#9E579D'  // Purple
  ];

  const addCustomPayment = async (payment: Payment) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          name: payment.name,
          amount: payment.amount,
          due_date: payment.dueDate,
          category: payment.category,
          recurring: payment.recurring
        }]);

      if (error) throw error;

      setShowAddPayment(false);
    } catch (error) {
      console.error('Error adding custom payment:', error);
    }
  };

  const handleExpenseSubmit = async (expense: {
    amount: string;
    description: string;
    category: CategoryKey;
    date: string;
    isRecurring: boolean;
    recurringFrequency?: string;
    billUrl?: string;
    type: 'income' | 'expense';
  }) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          user_id: user.id,
          amount: parseFloat(expense.amount),
          description: expense.description,
          category: expense.category,
          date: expense.date,
          is_recurring: expense.isRecurring,
          recurring_frequency: expense.recurringFrequency,
          bill_url: expense.billUrl,
          type: expense.type
        }]);

      if (error) throw error;
      
      await fetchExpenses();
      setShowExpenseForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const handleAddDemoData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const success = await seedDashboardData(user.id);
      if (success) {
        toast.success('Demo data added successfully!');
        fetchAccounts();
      } else {
        toast.error('Failed to add demo data');
      }
    } catch (error) {
      console.error('Error adding demo data:', error);
      toast.error('Failed to add demo data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="border-b border-dark-700/50 p-4 backdrop-blur-md bg-transparent">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/luna-charecter-2.png" alt="Luna" className="h-12 w-12 object-contain" />
            <h1 className="text-xl font-bold text-white">Luna</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/settings')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faCog} className="text-xl" />
            </button>
            <button
              onClick={signOut}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
            </button>
          </div>
        </div>
      </nav>

      <motion.div
        className="p-4 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <motion.h1 variants={greetingVariants} className="text-xl font-bold text-white">
              Welcome back, {name || 'there'}! 👋
            </motion.h1>
            <motion.p variants={textVariants} className="text-sm text-gray-400">
              Here's what's happening with your finances today.
            </motion.p>
          </div>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-accent-primary hover:bg-accent-primary-dark text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Expense</span>
          </button>
        </motion.div>

        {/* Your Accounts Section */}
        <motion.div variants={itemVariants}>
          <YourAccounts />
        </motion.div>

        {/* Financial Overview */}
        <motion.div variants={itemVariants}>
          <FinancialMetrics 
            monthlyIncome={monthlyIncome}
            monthlyExpenses={currentMonthExpenses}
            budgetRemaining={budgetRemaining}
            totalBalance={totalBalance}
            savingsRate={savingsRate}
            currency={currency}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Income vs Expenses Chart */}
            <motion.div variants={itemVariants}>
              <SpendingOverview />
            </motion.div>

            {/* Recent Transactions */}
            <motion.div variants={itemVariants}>
              <Card className="p-3">
                <h2 className="text-lg font-bold mb-3 text-white">Recent Transactions</h2>
                <ExpenseList expenses={displayExpenses} loading={expensesLoading} />
              </Card>
            </motion.div>

            {/* Expense Categories */}
            <motion.div variants={itemVariants}>
              <Card className="p-3">
                <h2 className="text-lg font-bold mb-3 text-white">Expense Categories</h2>
                <div className="h-48 flex items-center">
                  {pieChartData.length > 0 ? (
                    <div className="w-full flex">
                      <div className="w-2/3">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={70}
                              fill="#8884d8"
                            >
                              {pieChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value, currency)}
                              contentStyle={{ background: '#1F2937', border: 'none' }}
                              itemStyle={{ color: '#fff' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/3 pl-2 space-y-1 text-xs">
                        {pieChartData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center space-x-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-white">{entry.name}</span>
                            <span className="text-gray-400">
                              ({formatCurrency(entry.value, currency)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No expense data available
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Monthly Expense Trends */}
            <motion.div variants={itemVariants}>
              <Card className="p-3">
                <h2 className="text-lg font-bold mb-3 text-white">Monthly Expense Trends</h2>
                <div className="h-48">
                  {displayExpenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={Object.entries(
                          displayExpenses.reduce((acc, expense) => {
                            const date = new Date(expense.date);
                            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                            if (expense.type === 'expense') {
                              acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
                            }
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([date, amount]) => ({
                          date,
                          amount
                        }))}
                        margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          tickFormatter={(value) => formatCurrency(value, currency)}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value, currency)}
                          contentStyle={{ background: '#1F2937', border: 'none' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No expense data available
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4">
            {/* Goals Tracker */}
            <motion.div variants={itemVariants}>
              <GoalsTracker />
            </motion.div>

            {/* Subscriptions */}
            <motion.div variants={itemVariants}>
              <SubscriptionCard
                subscriptions={subscriptions}
                upcomingPayments={displayPayments}
                onManageClick={() => setShowSubscriptions(true)}
              />
            </motion.div>

            {/* Investment Overview */}
            <motion.div variants={itemVariants}>
              <InvestmentOverview onManageClick={() => setShowInvestment(true)} />
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <ExpenseFormModal
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          onSubmit={handleExpenseSubmit}
        />
        <ReceiptScannerModal
          isOpen={showReceiptScanner}
          onClose={() => setShowReceiptScanner(false)}
        />
        <SubscriptionsModal
          isOpen={showSubscriptions}
          onClose={() => setShowSubscriptions(false)}
        />
        <AIInsightsModal
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
        />
        <InvestmentModal
          isOpen={showInvestment}
          onClose={() => setShowInvestment(false)}
        />
        <Analytics
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
        />
        <AIAssistant
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
        <AddPaymentModal
          isOpen={showAddPayment}
          onClose={() => setShowAddPayment(false)}
          onAdd={addCustomPayment}
        />
      </motion.div>

      <div className="flex justify-center mt-8">
        {displayAccounts.length === 0 && (
          <button
            onClick={handleAddDemoData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                <span>Adding Demo Data...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faMagic} />
                <span>Add Demo Data</span>
              </>
            )}
          </button>
        )}
      </div>

      {isDemo && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg">
          Demo Mode
        </div>
      )}
    </>
  );
} 