import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye, 
  faPlus, 
  faPen, 
  faTrash,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: string;
  description?: string;
}

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id'>) => void;
  initialData?: Goal;
}

function AddGoalModal({ isOpen, onClose, onAdd, initialData }: AddGoalModalProps) {
  const [formData, setFormData] = useState<Omit<Goal, 'id'>>(
    initialData || {
      title: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
      category: '',
      description: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            className="w-full max-w-md bg-dark-800 rounded-xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-semibold text-dark-50 mb-6">
              {initialData ? 'Edit Goal' : 'Add New Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Current Amount
                </label>
                <input
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="">Select a category</option>
                  <option value="savings">Savings</option>
                  <option value="investment">Investment</option>
                  <option value="purchase">Major Purchase</option>
                  <option value="debt">Debt Repayment</option>
                  <option value="emergency">Emergency Fund</option>
                  <option value="education">Education</option>
                  <option value="travel">Travel</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-dark-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-dark-700 text-dark-200 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  {initialData ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function GoalsTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

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
      setGoals([...goals, data]);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleEditGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (!user || !editingGoal) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', editingGoal.id)
        .select()
        .single();

      if (error) throw error;
      setGoals(goals.map(g => g.id === editingGoal.id ? data : g));
      setEditingGoal(null);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div key={goal.id} className="p-4 bg-dark-700/50 rounded-lg group">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-medium text-dark-50">{goal.title}</h3>
              {goal.description && (
                <p className="text-sm text-dark-400 mt-1">{goal.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingGoal(goal)}
                className="p-1.5 text-dark-400 hover:text-dark-200 transition-colors"
                title="Edit Goal"
              >
                <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteGoal(goal.id)}
                className="p-1.5 text-dark-400 hover:text-accent-danger transition-colors"
                title="Delete Goal"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-200">${goal.currentAmount.toLocaleString()}</span>
              <span className="text-dark-200">${goal.targetAmount.toLocaleString()}</span>
            </div>
            
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-500"
                style={{
                  width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%`
                }}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-dark-400">
                Due {new Date(goal.deadline).toLocaleDateString()}
              </span>
              <span className="text-dark-400">
                {calculateProgress(goal.currentAmount, goal.targetAmount).toFixed(1)}% Complete
              </span>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full py-3 bg-dark-700/50 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
        <span>Add New Goal</span>
      </button>

      <AddGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGoal}
      />

      {editingGoal && (
        <AddGoalModal
          isOpen={true}
          onClose={() => setEditingGoal(null)}
          onAdd={handleEditGoal}
          initialData={editingGoal}
        />
      )}
    </div>
  );
} 