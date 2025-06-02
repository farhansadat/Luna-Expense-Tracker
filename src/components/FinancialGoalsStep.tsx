import { useAuth } from '../contexts/AuthContext';
import { useDemoStore } from '../store/demoStore';

export default function FinancialGoalsStep({ onComplete }: { onComplete: () => void }) {
  const { user, isDemo } = useAuth();
  const { addGoal } = useDemoStore();
  // ... existing state ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error('No authenticated user');
      }

      if (isDemo) {
        // In demo mode, just add goals to demo store
        goals.forEach(goal => {
          if (goal.name && goal.targetAmount > 0) {
            addGoal({
              name: goal.name,
              target_amount: goal.targetAmount,
              current_amount: 0,
              deadline: goal.deadline,
              category: goal.category,
              priority: goal.priority
            });
          }
        });
        onComplete();
        return;
      }

      // Regular user flow
      const { error } = await supabase
        .from('financial_goals')
        .insert(
          goals
            .filter(goal => goal.name && goal.targetAmount > 0)
            .map(goal => ({
              user_id: user.id,
              name: goal.name,
              target_amount: goal.targetAmount,
              current_amount: 0,
              deadline: goal.deadline,
              category: goal.category,
              priority: goal.priority
            }))
        );

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error('Error processing goals:', error);
      toast.error('Failed to save financial goals');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component code ...
} 