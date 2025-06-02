import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {
  faUser,
  faPalette,
  faBell,
  faGlobe,
  faShieldAlt,
  faSpinner,
  faCheck,
  faSignOutAlt,
  faTrash,
  faSun,
  faMoon,
  faArrowLeft,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useUserSettingsStore } from '../store/userSettingsStore';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { currency, updateSettings } = useUserSettingsStore();
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: currency,
    notifications: {
      email: true,
      push: true,
      weekly_summary: true
    },
    language: 'en'
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          email: user.email || '',
          currency: data.currency || currency,
        }));
        
        // Set initial theme
        if (data.theme_preference) {
          setTheme(data.theme_preference);
          document.documentElement.className = data.theme_preference;
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, currency]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // First verify current password if changing password
      if (passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: passwordData.currentPassword,
        });

        if (signInError) {
          throw new Error('Current password is incorrect');
        }

        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: passwordData.newPassword
        });

        if (passwordError) throw passwordError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          currency: formData.currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update settings in store
      updateSettings({
        name: formData.name,
        currency: formData.currency
      });

      // Clear password fields after successful update
      if (passwordData.newPassword) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }

      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      setError(error.message || 'Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete all user data using our custom function
      const { error: deleteDataError } = await supabase.rpc('delete_user_account', {
        user_id: user.id
      });

      if (deleteDataError) throw deleteDataError;

      // Then delete the user's auth account
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteUserError) throw deleteUserError;

      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setSuccessMessage('Password updated successfully!');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        <motion.div
          className="bg-white/5 rounded-2xl p-8 backdrop-blur-xl shadow-xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FontAwesomeIcon icon={faUser} className="w-5 h-5 mr-2 text-purple-400" />
                Profile
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                  <div className="space-y-4">
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Current Password"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                    />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="New Password"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                    />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm New Password"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FontAwesomeIcon icon={faPalette} className="w-5 h-5 mr-2 text-purple-400" />
                Appearance
              </h2>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={theme === 'dark' ? faMoon : faSun} 
                    className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-purple-400' : 'text-yellow-400'}`} 
                  />
                  <span className="text-white">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
                </div>
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 bg-gray-700"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Currency Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <FontAwesomeIcon icon={faGlobe} className="w-5 h-5 mr-2 text-purple-400" />
                Currency
              </h2>
              <select
                name="currency"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h2 className="text-xl font-semibold text-red-400 mb-6 flex items-center">
              <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 mr-2" />
              Danger Zone
          </h2>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 