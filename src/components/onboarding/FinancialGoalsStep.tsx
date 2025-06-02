import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye,
  faHouse,
  faCar,
  faGraduationCap,
  faPiggyBank,
  faUmbrella,
  faPlane,
  faSpinner,
  faPlus,
  faTrash,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../lib/supabase';

interface FinancialGoal {
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  description?: string;
}

interface FinancialGoalsStepProps {
  onNext: (goals: FinancialGoal[]) => void;
  onBack: () => void;
}

const SUGGESTED_GOALS = [
  {
    title: 'Emergency Fund',
    icon: faUmbrella,
    description: 'Save 3-6 months of living expenses for unexpected costs',
    category: 'emergency',
    suggestedAmount: 10000
  },
  {
    title: 'Down Payment',
    icon: faHouse,
    description: 'Save for a house down payment',
    category: 'purchase',
    suggestedAmount: 50000
  },
  {
    title: 'New Car',
    icon: faCar,
    description: 'Save for a new vehicle purchase or down payment',
    category: 'purchase',
    suggestedAmount: 20000
  },
  {
    title: 'Education',
    icon: faGraduationCap,
    description: 'Save for education or professional development',
    category: 'education',
    suggestedAmount: 15000
  },
  {
    title: 'Retirement',
    icon: faPiggyBank,
    description: 'Start building your retirement nest egg',
    category: 'savings',
    suggestedAmount: 100000
  },
  {
    title: 'Travel Fund',
    icon: faPlane,
    description: 'Save for your dream vacation',
    category: 'travel',
    suggestedAmount: 5000
  }
];

export default function FinancialGoalsStep({ onNext, onBack }: FinancialGoalsStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<FinancialGoal[]>([]);
  const [customGoal, setCustomGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    category: 'other',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoalSelect = (goal: typeof SUGGESTED_GOALS[0]) => {
    const isSelected = selectedGoals.some(g => g.title === goal.title);
    
    if (isSelected) {
      setSelectedGoals(selectedGoals.filter(g => g.title !== goal.title));
    } else {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      setSelectedGoals([...selectedGoals, {
        title: goal.title,
        target_amount: goal.suggestedAmount,
        current_amount: 0,
        deadline: oneYearFromNow.toISOString().split('T')[0],
        category: goal.category,
        description: goal.description
      }]);
    }
  };

  const handleCustomGoalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.title || !customGoal.target_amount || !customGoal.deadline) {
      setError('Please fill in all required fields for the custom goal');
      return;
    }

    setSelectedGoals([...selectedGoals, {
      title: customGoal.title,
      target_amount: parseFloat(customGoal.target_amount),
      current_amount: 0,
      deadline: customGoal.deadline,
      category: customGoal.category,
      description: customGoal.description
    }]);

    setCustomGoal({
      title: '',
      target_amount: '',
      deadline: '',
      category: 'other',
      description: ''
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedGoals.length === 0) {
      setError('Please select at least one financial goal');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      // Save goals to database
      const { error } = await supabase
        .from('goals')
        .insert(
          selectedGoals.map(goal => ({
            ...goal,
            user_id: session.user.id
          }))
        );

      if (error) throw error;

      // Continue with onboarding
      onNext(selectedGoals);
    } catch (error: any) {
      console.error('Error processing goals:', error);
      setError(error.message || 'Failed to process goals');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full mb-4"
        >
          <FontAwesomeIcon icon={faBullseye} className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Set Your Financial Goals</h2>
        <p className="text-gray-400">Choose from our suggested goals or create your own custom goals</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SUGGESTED_GOALS.map((goal) => {
          const isSelected = selectedGoals.some(g => g.title === goal.title);
          return (
            <motion.button
              key={goal.title}
              onClick={() => handleGoalSelect(goal)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-gray-700 hover:border-gray-600 text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                  <FontAwesomeIcon icon={goal.icon} className="w-7 h-7" />
                </div>
                <h3 className="font-medium text-lg">{goal.title}</h3>
                <p className="text-sm text-gray-400">{goal.description}</p>
                <p className="text-lg font-medium">
                  ${goal.suggestedAmount.toLocaleString()}
                </p>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-purple-400"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl p-6 mb-8 backdrop-blur-sm border border-gray-700"
      >
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <FontAwesomeIcon icon={faPlus} className="w-5 h-5 mr-2 text-purple-400" />
          Add Custom Goal
        </h3>
        <form onSubmit={handleCustomGoalAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Goal Title
              </label>
              <input
                type="text"
                value={customGoal.title}
                onChange={(e) => setCustomGoal({ ...customGoal, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                placeholder="Enter goal title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Amount
              </label>
              <input
                type="number"
                value={customGoal.target_amount}
                onChange={(e) => setCustomGoal({ ...customGoal, target_amount: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                placeholder="Enter target amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={customGoal.deadline}
              onChange={(e) => setCustomGoal({ ...customGoal, deadline: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={customGoal.description}
              onChange={(e) => setCustomGoal({ ...customGoal, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              rows={3}
              placeholder="Enter goal description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={customGoal.category}
              onChange={(e) => setCustomGoal({ ...customGoal, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            >
              <option value="emergency">Emergency Fund</option>
              <option value="purchase">Major Purchase</option>
              <option value="education">Education</option>
              <option value="savings">Savings</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              <span>Add Custom Goal</span>
            </button>
          </div>
        </form>
      </motion.div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              <span>Processing Goals...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </button>
      </div>

      {selectedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h3 className="text-lg font-medium text-white mb-4">Selected Goals</h3>
          <div className="space-y-3">
            {selectedGoals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-white">{goal.title}</h4>
                  <p className="text-sm text-gray-400">
                    Target: ${goal.target_amount.toLocaleString()} by {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGoals(goals => goals.filter((_, i) => i !== index))}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 