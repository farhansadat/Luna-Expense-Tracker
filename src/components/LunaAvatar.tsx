import { motion } from 'framer-motion';

interface LunaAvatarProps {
  message: string;
  className?: string;
  useCharacter?: boolean;
}

export default function LunaAvatar({ message, className = '', useCharacter = false }: LunaAvatarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-4 ${className}`}
    >
      <div className="flex-shrink-0">
        <img
          src={useCharacter ? "/luna-charecter-2.png" : "/luna-avatar.svg"}
          alt="Luna AI Assistant"
          className={useCharacter ? "w-24 h-24 object-contain" : "w-12 h-12 rounded-full bg-purple-500/20 p-1"}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 bg-white/5 rounded-2xl p-4 backdrop-blur-sm"
      >
        <p className="text-white/90">{message}</p>
      </motion.div>
    </motion.div>
  );
} 