import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faWallet,
  faRobot,
  faArrowRight,
  faChartPie,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';

export default function Demo() {
  const features = [
    {
      icon: faRobot,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations and insights from Luna AI.'
    },
    {
      icon: faChartLine,
      title: 'Smart Analytics',
      description: 'Track your spending patterns with beautiful visualizations.'
    },
    {
      icon: faWallet,
      title: 'Budget Management',
      description: 'Set and manage budgets with automated tracking.'
    },
    {
      icon: faChartPie,
      title: 'Expense Categories',
      description: 'Automatically categorize your expenses for better tracking.'
    },
    {
      icon: faLightbulb,
      title: 'Smart Goals',
      description: 'Set and achieve your financial goals with AI guidance.'
    }
  ];

  return (
    <div className="py-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Experience Luna in Action
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Take a tour of Luna's powerful features and see how AI can transform
              your financial management experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
              >
                Start Free Trial
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-3xl" />
            <img
              src="/luna-charecter-2.png"
              alt="Luna Demo"
              className="relative z-10 w-full max-w-md mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <div className="w-full h-full bg-white/5 backdrop-blur-lg flex items-center justify-center">
              <p className="text-white text-xl">Demo Video Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white/5 p-6 rounded-2xl backdrop-blur-lg border border-white/10"
            >
              <FontAwesomeIcon
                icon={feature.icon}
                className="w-12 h-12 text-purple-400 mb-4"
              />
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl p-12 backdrop-blur-lg border border-purple-500/20 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances smarter
            with Luna. Start your free trial today!
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
          >
            Get Started Free
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
} 