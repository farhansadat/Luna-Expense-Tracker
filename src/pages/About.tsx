import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLightbulb,
  faUsers,
  faRocket,
  faHeart
} from '@fortawesome/free-solid-svg-icons';

export default function About() {
  const team = [
    {
      name: 'Luna AI',
      role: 'AI Financial Assistant',
      image: '/luna-charecter-2.png',
      description: 'Your intelligent companion for financial success.'
    },
    {
      name: 'Development Team',
      role: 'Engineering',
      image: '/team-dev.png',
      description: 'Building the future of financial management.'
    },
    {
      name: 'Design Team',
      role: 'UX/UI Design',
      image: '/team-design.png',
      description: 'Creating beautiful and intuitive experiences.'
    },
    {
      name: 'Support Team',
      role: 'Customer Success',
      image: '/team-support.png',
      description: 'Here to help you succeed.'
    }
  ];

  return (
    <div className="py-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About Luna
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to revolutionize personal finance management through
            the power of artificial intelligence and beautiful design.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 mb-6">
              At Luna, we believe that managing your finances should be effortless
              and intelligent. Our AI-powered platform combines cutting-edge
              technology with intuitive design to help you make better financial
              decisions.
            </p>
            <p className="text-lg text-gray-300">
              We're committed to providing you with the tools and insights you
              need to achieve your financial goals, whether that's saving for a
              dream vacation, planning for retirement, or simply getting better at
              budgeting.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-3xl" />
            <img
              src="/luna-charecter-2.png"
              alt="Luna Mission"
              className="relative z-10 w-full max-w-md mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 p-6 rounded-2xl backdrop-blur-lg border border-white/10"
          >
            <FontAwesomeIcon icon={faLightbulb} className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Innovation</h3>
            <p className="text-gray-300">
              Pushing the boundaries of what's possible in financial technology.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 p-6 rounded-2xl backdrop-blur-lg border border-white/10"
          >
            <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
            <p className="text-gray-300">
              Building a supportive community of financial success stories.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 p-6 rounded-2xl backdrop-blur-lg border border-white/10"
          >
            <FontAwesomeIcon icon={faRocket} className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Excellence</h3>
            <p className="text-gray-300">
              Striving for excellence in everything we do.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 p-6 rounded-2xl backdrop-blur-lg border border-white/10"
          >
            <FontAwesomeIcon icon={faHeart} className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Trust</h3>
            <p className="text-gray-300">
              Building lasting relationships through transparency and reliability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white/5 rounded-2xl p-6 backdrop-blur-lg border border-white/10 text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl" />
                <img
                  src={member.image}
                  alt={member.name}
                  className="relative z-10 w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-purple-400 mb-2">{member.role}</p>
              <p className="text-gray-300 text-sm">{member.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
} 