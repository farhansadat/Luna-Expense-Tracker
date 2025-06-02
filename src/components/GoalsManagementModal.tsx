import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useGoalsStore } from '../store/goalsStore';
import { useUserSettingsStore } from '../store/userSettingsStore';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency } from '../lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AddGoalModal from './AddGoalModal';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  description?: string;
  user_id: string;
}

interface GoalsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalsManagementModal({ isOpen, onClose }: GoalsManagementModalProps) {
  const { user } = useAuth();
  const { goals, fetchGoals } = useGoalsStore();
  const { currency } = useUserSettingsStore();
  const { addExpense } = useExpenseStore();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    category: 'savings',
    progress_amount: ''
  });

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
    if (!user || !selectedGoal) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          ...goalData,
          user_id: user.id
        })
        .eq('id', selectedGoal.id);

      if (error) throw error;
      fetchGoals();
      setSelectedGoal(null);
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal');
    }
  };

  const handleAddProgress = async (goalId: string, amount: number) => {
    try {
      // First update the goal progress
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('current_amount')
        .eq('id', goalId)
        .single();

      if (goalError) throw goalError;

      const newAmount = goal.current_amount + amount;
      const { error: updateError } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId);

      if (updateError) throw updateError;

      // Add the progress as an expense
      await addExpense({
        category: selectedGoal?.category || 'savings',
        amount: amount,
        date: new Date().toISOString(),
        description: `Progress towards goal: ${selectedGoal?.title || 'Goal'}`,
        type: 'expense',
        user_id: user?.id
      });

      await fetchGoals();
      setFormData(prev => ({ ...prev, progress_amount: '' }));
    } catch (error) {
      console.error('Error updating goal progress:', error);
      alert('Failed to update goal progress');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        <div className="relative bg-dark-800 rounded-xl max-w-2xl w-full p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Manage Financial Goals</h2>
            <button
              onClick={() => {
                setSelectedGoal(null);
                setShowAddModal(true);
              }}
              className="p-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/80 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="space-y-6">
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
                          setSelectedGoal(goal);
                          setShowAddModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this goal?')) {
                            await supabase
                              .from('goals')
                              .delete()
                              .eq('id', goal.id);
                            await fetchGoals();
                          }
                        }}
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

                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={formData.progress_amount}
                      onChange={(e) => setFormData({ ...formData, progress_amount: e.target.value })}
                      className="flex-1 bg-dark-600 border border-dark-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      placeholder="Add progress amount"
                      min="0"
                      step="0.01"
                    />
                    <button
                      onClick={() => {
                        if (formData.progress_amount) {
                          handleAddProgress(goal.id, parseFloat(formData.progress_amount));
                        }
                      }}
                      className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/80 transition-colors"
                      disabled={!formData.progress_amount}
                    >
                      Add Progress
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedGoal(null);
        }}
        onAdd={selectedGoal ? handleEditGoal : handleAddGoal}
        initialData={selectedGoal || undefined}
      />
    </Dialog>
  );
} 