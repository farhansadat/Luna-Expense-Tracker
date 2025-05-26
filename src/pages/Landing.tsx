import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faWallet,
  faRobot,
  faReceipt,
  faArrowRight,
  faShieldAlt,
  faMobileAlt,
  faCloud,
  faChartPie,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';

export default function Landing() {
  const features = [
    {
      icon: faChartLine,
      title: 'Smart Analytics',
      description: 'Get detailed insights into your spending patterns and financial health.',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-500'
    },
    {
      icon: faWallet,
      title: 'Multi-Account Management',
      description: 'Manage all your accounts in one place with real-time balance tracking.',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      icon: faRobot,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations and insights powered by AI.',
      color: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
      icon: faReceipt,
      title: 'Receipt Scanning',
      description: 'Automatically extract expense data from receipts using OCR.',
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500'
    },
    {
      icon: faShieldAlt,
      title: 'Bank-Grade Security',
      description: 'Your financial data is protected with the highest security standards.',
      color: 'bg-gradient-to-br from-red-500 to-pink-500'
    },
    {
      icon: faChartPie,
      title: 'Budget Planning',
      description: 'Set and track budgets with visual breakdowns by category.',
      color: 'bg-gradient-to-br from-violet-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6">
              Take Control of Your Finances
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Luna helps you track expenses, manage budgets, and achieve your financial goals with powerful AI-driven insights.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 rounded-xl flex items-center gap-2 group"
              >
                Get Started
                <FontAwesomeIcon 
                  icon={faArrowRight} 
                  className="transform group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/demo"
                className="btn-secondary text-lg px-8 py-4 rounded-xl"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features for Your Financial Journey
            </h2>
          <p className="text-xl text-gray-300">
            Everything you need to manage your finances in one place
            </p>
          </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <FontAwesomeIcon icon={feature.icon} className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-3xl p-12 text-center relative overflow-hidden"
          >
          <div className="absolute inset-0 bg-grid-white/5"></div>
          <h2 className="text-4xl font-bold text-white mb-4 relative z-10">
              Ready to Start Your Financial Journey?
            </h2>
          <p className="text-xl text-gray-300 mb-8 relative z-10">
            Join thousands of users who are already managing their finances smarter with Luna.
            </p>
            <Link
              to="/register"
            className="btn-primary text-lg px-8 py-4 rounded-xl inline-flex items-center gap-2 group relative z-10"
            >
            Get Started Now
              <FontAwesomeIcon 
                icon={faArrowRight} 
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>
    </div>
  );
} 