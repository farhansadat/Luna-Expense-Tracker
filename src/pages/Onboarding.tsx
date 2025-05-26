import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faDollarSign,
  faChartLine,
  faCheck,
  faRocket,
  faWallet,
  faChartPie,
  faLightbulb,
  faBullseye,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useUserSettingsStore } from '../store/userSettingsStore';
import FinancialGoalsStep from '../components/onboarding/FinancialGoalsStep';

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const lunaVariants = {
  wave: {
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, checkOnboardingStatus } = useAuth();
  const { updateSettings } = useUserSettingsStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currency: 'USD',
    monthlyIncome: '',
    monthlyBudget: '',
    totalBalance: '',
    categories: [] as string[],
    goals: [] as { title: string; targetAmount: number; deadline: string; category: string }[]
  });

  const getLunaMessage = (step: number) => {
    switch (step) {
      case 1:
        return "Hi there! 👋 I'm Luna, your personal finance AI assistant. I'm here to help you manage your finances and achieve your financial goals. Let's start by getting to know you better!";
      case 2:
        return `Nice to meet you, ${formData.name || 'there'}! 🌟 Now, let's talk about your finances. This information helps me provide personalized insights and recommendations.`;
      case 3:
        return "Excellent! Now let's set some financial goals to help you stay motivated and track your progress. 🎯";
      case 4:
        return "Great! You're all set to start your financial journey. I'll be here to help you track expenses, set budgets, and reach your savings goals. Let's get started! 🚀";
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // First, verify the session and user exists
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('No active session');

      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          monthly_income: parseFloat(formData.monthlyIncome),
          monthly_budget: parseFloat(formData.monthlyBudget),
          currency: formData.currency,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error('Failed to update profile: ' + profileError.message);
      }

      let accountId: string | null = null;

      // Try to create account using RPC function first
      try {
        const { data: rpcAccountId, error: accountError } = await supabase.rpc(
          'create_new_account',
          {
            p_user_id: session.user.id,
            p_name: 'Main Account',
            p_type: 'personal',
            p_currency: formData.currency,
            p_color: 'bg-gradient-to-br from-purple-500 to-indigo-500',
            p_icon: 'wallet'
          }
        );

        if (!accountError) {
          accountId = rpcAccountId;
        }
      } catch (rpcError) {
        console.warn('RPC account creation failed, falling back to direct insert:', rpcError);
      }

      // If RPC failed, try direct insert
      if (!accountId) {
        const { data: insertedAccount, error: insertError } = await supabase
          .from('accounts')
          .insert({
            user_id: session.user.id,
            name: 'Main Account',
            type: 'personal',
            currency: formData.currency,
            color: 'bg-gradient-to-br from-purple-500 to-indigo-500',
            icon: 'wallet',
            balance: parseFloat(formData.totalBalance) || 0,
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Account creation error:', insertError);
          throw new Error('Failed to create account: ' + insertError.message);
        }

        accountId = insertedAccount.id;
      }

      // Set the account as default and update its balance
      if (accountId) {
        const { error: updateError } = await supabase
          .from('accounts')
          .update({
            is_default: true,
            balance: parseFloat(formData.totalBalance) || 0
          })
          .eq('id', accountId);

        if (updateError) {
          console.error('Account update error:', updateError);
          throw new Error('Failed to update account: ' + updateError.message);
        }
      }

      // Save financial goals
      if (formData.goals && formData.goals.length > 0) {
        const { error: goalsError } = await supabase
          .from('goals')
          .insert(
            formData.goals.map(goal => ({
              user_id: session.user.id,
              title: goal.title,
              target_amount: goal.targetAmount,
              current_amount: 0,
              deadline: goal.deadline,
              category: goal.category,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          );

        if (goalsError) {
          console.error('Goals creation error:', goalsError);
          throw new Error('Failed to create goals: ' + goalsError.message);
        }
      }

      // Update global settings
      updateSettings({
        name: formData.name,
        currency: formData.currency,
        monthlyIncome: parseFloat(formData.monthlyIncome)
      });

      // Make sure onboarding status is updated in the auth context
      await checkOnboardingStatus();
      
      // Navigate to dashboard
      navigate('/app/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      alert(error.message || 'There was an error completing the onboarding process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.img
                src="/luna-charecter-2.png"
                alt="Luna"
                className="w-32 h-32 object-contain"
                animate={{
                  scale: [1, 1.05, 1],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">What's your name?</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Preferred Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.img
                src="/luna-charecter-2.png"
                alt="Luna"
                className="w-32 h-32 object-contain"
                animate={{
                  scale: [1, 1.05, 1],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                  }
                }}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Monthly Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {formData.currency === 'USD' ? '$' :
                     formData.currency === 'EUR' ? '€' :
                     formData.currency === 'GBP' ? '£' :
                     formData.currency === 'JPY' ? '¥' :
                     formData.currency === 'CAD' ? 'CAD $ ' :
                     formData.currency === 'AUD' ? 'AUD $ ' :
                     formData.currency}
                  </span>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {formData.currency === 'USD' ? '$' :
                     formData.currency === 'EUR' ? '€' :
                     formData.currency === 'GBP' ? '£' :
                     formData.currency === 'JPY' ? '¥' :
                     formData.currency === 'CAD' ? 'CAD $ ' :
                     formData.currency === 'AUD' ? 'AUD $ ' :
                     formData.currency}
                  </span>
                  <input
                    type="number"
                    name="monthlyBudget"
                    value={formData.monthlyBudget}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-purple-300">Current Total Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {formData.currency === 'USD' ? '$' :
                     formData.currency === 'EUR' ? '€' :
                     formData.currency === 'GBP' ? '£' :
                     formData.currency === 'JPY' ? '¥' :
                     formData.currency === 'CAD' ? 'CAD $ ' :
                     formData.currency === 'AUD' ? 'AUD $ ' :
                     formData.currency}
                  </span>
                  <input
                    type="number"
                    name="totalBalance"
                    value={formData.totalBalance}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <FinancialGoalsStep
              onNext={(goals) => {
                setFormData(prev => ({ ...prev, goals }));
                setStep(4);
              }}
              onBack={() => setStep(2)}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <FontAwesomeIcon icon={faRocket} className="w-12 h-12 text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-gray-400 mb-8">
                Let's start managing your finances and achieving your goals together.
              </p>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3 px-4 font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Setting Up Your Account...
                  </span>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s <= step ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s < step ? (
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                ) : (
                  <span>{s}</span>
                )}
              </div>
            ))}
          </div>

          {/* Luna's Message */}
          <div className="bg-white/5 rounded-xl p-4 mb-8">
            <p className="text-gray-300">{getLunaMessage(step)}</p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && step !== 4 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 bg-dark-700 text-dark-200 rounded-lg hover:bg-dark-600 transition-colors"
              >
                Back
              </button>
            )}
            {step < 4 && (
              <button
                onClick={() => {
                  if (step === 1 && !formData.name) {
                    alert('Please enter your name');
                    return;
                  }
                  if (step === 2 && (!formData.monthlyIncome || !formData.monthlyBudget)) {
                    alert('Please enter your monthly income and budget');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors ml-auto"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 