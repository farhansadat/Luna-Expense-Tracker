import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye,
  faHouse,
  faCar,
  faGraduationCap,
  faPiggyBank,
  faUmbrella,
  faPlane
} from '@fortawesome/free-solid-svg-icons';

interface FinancialGoal {
  title: string;
  targetAmount: number;
  deadline: string;
  category: string;
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
    targetAmount: '',
    deadline: '',
    category: 'other'
  });

  const handleGoalSelect = (goal: typeof SUGGESTED_GOALS[0]) => {
    const isSelected = selectedGoals.some(g => g.title === goal.title);
    
    if (isSelected) {
      setSelectedGoals(selectedGoals.filter(g => g.title !== goal.title));
    } else {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      setSelectedGoals([...selectedGoals, {
        title: goal.title,
        targetAmount: goal.suggestedAmount,
        deadline: oneYearFromNow.toISOString().split('T')[0],
        category: goal.category
      }]);
    }
  };

  const handleCustomGoalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGoal.title && customGoal.targetAmount && customGoal.deadline) {
      setSelectedGoals([...selectedGoals, {
        ...customGoal,
        targetAmount: parseFloat(customGoal.targetAmount)
      }]);
      setCustomGoal({
        title: '',
        targetAmount: '',
        deadline: '',
        category: 'other'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-dark-50 mb-2">Set Your Financial Goals</h2>
        <p className="text-dark-400">Choose from our suggested goals or create your own custom goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SUGGESTED_GOALS.map((goal) => {
          const isSelected = selectedGoals.some(g => g.title === goal.title);
          return (
            <button
              key={goal.title}
              onClick={() => handleGoalSelect(goal)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-accent-primary bg-accent-primary/10 text-dark-50'
                  : 'border-dark-700 hover:border-dark-600 text-dark-300'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-accent-primary text-white' : 'bg-dark-800 text-dark-400'
                }`}>
                  <FontAwesomeIcon icon={goal.icon} className="w-6 h-6" />
                </div>
                <h3 className="font-medium">{goal.title}</h3>
                <p className="text-sm text-dark-400">{goal.description}</p>
                <p className="text-sm font-medium">
                  Target: ${goal.suggestedAmount.toLocaleString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-dark-800/50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-dark-50 mb-4">Add Custom Goal</h3>
        <form onSubmit={handleCustomGoalAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Goal Title
              </label>
              <input
                type="text"
                value={customGoal.title}
                onChange={(e) => setCustomGoal({ ...customGoal, title: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
                placeholder="Enter goal title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Target Amount
              </label>
              <input
                type="number"
                value={customGoal.targetAmount}
                onChange={(e) => setCustomGoal({ ...customGoal, targetAmount: e.target.value })}
                className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
                placeholder="Enter target amount"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={customGoal.deadline}
              onChange={(e) => setCustomGoal({ ...customGoal, deadline: e.target.value })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            Add Custom Goal
          </button>
        </form>
      </div>
    </div>
  );
} 