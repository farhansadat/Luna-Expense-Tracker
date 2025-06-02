import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye, 
  faPlus, 
  faPen, 
  faTrash,
  faCheck,
  faTimes,
  faSpinner,
  faPencilAlt,
  faChartLine,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { useGoalsStore } from '../store/goalsStore';
import GoalsManagementModal from './GoalsManagementModal';
import AddGoalModal from './AddGoalModal';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  description?: string;
}

export default function GoalsTracker() {
  const { user } = useAuth();
  const { goals, isLoading, error, fetchGoals } = useGoalsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showCongrats, setShowCongrats] = useState<string | null>(null);
  const { currency } = useUserSettingsStore();
  const [showManagement, setShowManagement] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user, fetchGoals]);

  const handleAddGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...goalData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      fetchGoals();
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal');
    }
  };

  const handleEditGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (!user || !editingGoal) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          ...goalData,
          user_id: user.id
        })
        .eq('id', editingGoal.id);

      if (error) throw error;
      fetchGoals();
      setEditingGoal(null);
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      fetchGoals();
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
    }
  };

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: goal.current_amount + newAmount })
        .eq('id', goalId);

      if (error) throw error;

      // Check if goal is completed
      if (goal.current_amount + newAmount >= goal.target_amount) {
        setShowCongrats(goalId);
      }

      fetchGoals();
    } catch (error: any) {
      console.error('Error updating goal progress:', error);
      alert('Failed to update goal progress');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-dark-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-800 rounded-xl p-6">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faBullseye} className="text-accent-primary text-xl" />
          </div>
          <h2 className="text-lg font-semibold text-white">Financial Goals</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowManagement(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/80 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No goals yet. Start by adding a goal!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const timeLeft = new Date(goal.deadline).getTime() - new Date().getTime();
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            return (
              <div
                key={goal.id}
                className="bg-dark-700 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">{goal.title}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setShowAddModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-white"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Target Amount</p>
                    <p className="text-white">{formatCurrency(goal.target_amount, currency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Amount</p>
                    <p className="text-white">{formatCurrency(goal.current_amount, currency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Progress</p>
                    <p className="text-white">{progress.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Time Left</p>
                    <p className="text-white">{daysLeft} days</p>
                  </div>
                </div>

                <div className="w-full bg-dark-600 rounded-full h-2">
                  <div
                    className="bg-accent-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GoalsManagementModal
        isOpen={showManagement}
        onClose={() => setShowManagement(false)}
      />

      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={editingGoal ? handleEditGoal : handleAddGoal}
        initialData={editingGoal || undefined}
      />

      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              className="bg-dark-800 rounded-xl p-6 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheck} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Congratulations!</h3>
              <p className="text-gray-400 mb-6">
                You've reached your goal! Keep up the great work!
              </p>
              <button
                onClick={() => setShowCongrats(null)}
                className="px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/80 transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 