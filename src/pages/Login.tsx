import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const lunaVariants = {
  hover: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      // Check if user has completed onboarding
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile not found, wait a moment for the trigger to create it
          await new Promise(resolve => setTimeout(resolve, 1000));
          navigate('/app/onboarding');
          return;
        }
        throw profileError;
      }

      if (!profile?.onboarding_completed) {
        navigate('/app/onboarding');
      } else {
        // If we have a stored location, go there, otherwise go to dashboard
        const from = location.state?.from?.pathname || '/app/dashboard';
        navigate(from);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signIn('demo@finwise.com', 'demo123');
      navigate('/app/dashboard');
    } catch (error: any) {
      toast.error('Failed to load demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
      >
          <div className="flex justify-center mb-6 relative">
            <motion.img
              src="/luna-charecter-2.png"
              alt="Luna AI Assistant"
              className="w-48 h-48 object-contain"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))' }}
            />
        </div>
          <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            Welcome to Luna
          </h1>
          <p className="text-lg text-purple-300 font-medium mb-2">
            Your AI-Powered Financial Assistant
          </p>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Let's help you manage your finances with smart analytics, intelligent budgeting, and personalized insights.
          </p>
        </motion.div>

        <motion.div
          className="bg-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-xl border border-white/20"
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
            {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm"
                >
                {error}
                </motion.div>
            )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <div className="relative">
                <motion.div
                  animate={{
                    x: focusedField === 'email' ? 5 : 0,
                    color: focusedField === 'email' ? '#A78BFA' : '#9CA3AF'
                  }}
                  className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                </motion.div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <div className="relative">
                <motion.div
                  animate={{
                    x: focusedField === 'password' ? 5 : 0,
                    color: focusedField === 'password' ? '#A78BFA' : '#9CA3AF'
                  }}
                  className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                >
                  <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
                </motion.div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
              type="submit"
              disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </motion.div>

            <motion.div className="space-y-4">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-700 text-sm font-medium rounded-md text-white hover:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
              >
                Try Demo Account
              </button>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="text-center text-sm text-gray-400 mt-4"
            >
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Sign up now
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
} 