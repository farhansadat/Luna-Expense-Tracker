import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFingerprint, 
  faLock, 
  faEye, 
  faShieldAlt, 
  faKey 
} from '@fortawesome/free-solid-svg-icons';
import { useUserSettingsStore } from '../store/userSettingsStore';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecuritySettingsModal({ isOpen, onClose }: SecuritySettingsModalProps) {
  const {
    biometricEnabled,
    twoFactorEnabled,
    autoLogoutTime,
    dataLockdownEnabled,
    exportEncryptionEnabled,
    updateSettings,
  } = useUserSettingsStore();

  const securityFeatures = [
    {
      icon: faFingerprint,
      title: 'Biometric Login',
      description: 'Use Face ID or fingerprint for secure access',
      enabled: biometricEnabled,
      setEnabled: (value: boolean) => updateSettings({ biometricEnabled: value }),
    },
    {
      icon: faKey,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      enabled: twoFactorEnabled,
      setEnabled: (value: boolean) => updateSettings({ twoFactorEnabled: value }),
    },
    {
      icon: faEye,
      title: 'Data Lockdown Mode',
      description: 'Temporarily hide all numbers for privacy',
      enabled: dataLockdownEnabled,
      setEnabled: (value: boolean) => updateSettings({ dataLockdownEnabled: value }),
    },
    {
      icon: faShieldAlt,
      title: 'Export Encryption',
      description: 'Secure CSV/PDF exports with encryption',
      enabled: exportEncryptionEnabled,
      setEnabled: (value: boolean) => updateSettings({ exportEncryptionEnabled: value }),
    },
  ];

  const handleSave = () => {
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
            className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faLock} className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-white">Security Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {securityFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <FontAwesomeIcon icon={feature.icon} className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={feature.enabled}
                      onChange={() => feature.setEnabled(!feature.enabled)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              ))}

              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="text-lg font-medium text-white mb-2">Auto Logout Timer</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Automatically log out after period of inactivity
                </p>
                <select
                  value={autoLogoutTime}
                  onChange={(e) => updateSettings({ autoLogoutTime: Number(e.target.value) })}
                  className="input-field"
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 