import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faBuilding,
  faUsers,
  faSpinner,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useUserSettingsStore } from '../store/userSettingsStore';

const accountTypes = [
  { id: 'personal', name: 'Personal', icon: faWallet },
  { id: 'business', name: 'Business', icon: faBuilding },
  { id: 'family', name: 'Family', icon: faUsers }
];

const accountColors = [
  { id: 'purple', value: 'bg-gradient-to-br from-purple-500 to-indigo-500' },
  { id: 'blue', value: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { id: 'green', value: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  { id: 'red', value: 'bg-gradient-to-br from-red-500 to-pink-500' },
  { id: 'orange', value: 'bg-gradient-to-br from-orange-500 to-yellow-500' }
];

export default function CreateAccount() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useUserSettingsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'personal',
    color: accountColors[0].value
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data: accountId, error: createError } = await supabase.rpc(
        'create_new_account',
        {
          p_user_id: user.id,
          p_name: formData.name,
          p_type: formData.type,
          p_currency: currency,
          p_color: formData.color
        }
      );

      if (createError) throw createError;

      navigate('/app/dashboard');
    } catch (error) {
      console.error('Error creating account:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/app/dashboard')}
          className="mb-8 text-gray-400 hover:text-white transition-colors flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Account</h1>
          <p className="text-gray-400">Set up a new account to manage your finances</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <motion.div
          className="bg-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Account Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                placeholder="e.g., Main Account, Business Account"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    className={`p-4 rounded-lg border transition-all ${
                      formData.type === type.id
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={type.icon}
                      className={`w-6 h-6 mb-2 ${
                        formData.type === type.id ? 'text-purple-400' : 'text-gray-400'
                      }`}
                    />
                    <p className={`text-sm ${
                      formData.type === type.id ? 'text-white' : 'text-gray-400'
                    }`}>
                      {type.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Account Color
              </label>
              <div className="flex space-x-4">
                {accountColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-10 h-10 rounded-full ${color.value} ${
                      formData.color === color.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 