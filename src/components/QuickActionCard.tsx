import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface QuickActionCardProps {
  name: string;
  icon: IconDefinition;
  color: string;
  onClick: () => void;
}

export default function QuickActionCard({ name, icon, color, onClick }: QuickActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`p-4 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 hover:bg-opacity-20 transition-all flex flex-col items-center justify-center space-y-2`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FontAwesomeIcon icon={icon} className="text-2xl" />
      <span className="text-sm text-white">{name}</span>
    </motion.button>
  );
} 