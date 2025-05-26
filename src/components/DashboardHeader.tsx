import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-dark-900 border-b border-dark-700 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center overflow-hidden">
              <img
                src="/luna-charecter-2.png"
                alt="Luna"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-dark-50">Luna</h1>
              <p className="text-sm text-dark-400">AI Finance Assistant</p>
            </div>
          </div>

          {/* Right side - Settings & Logout */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/app/settings')}
              className="p-2.5 rounded-xl bg-dark-800/50 hover:bg-dark-700 transition-all duration-200 text-dark-300 hover:text-dark-50 hover:shadow-lg group relative"
              title="Settings"
            >
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-dark-700 text-dark-50 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Settings
              </span>
              <FontAwesomeIcon icon={faCog} className="w-5 h-5 transform group-hover:rotate-90 transition-transform" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl bg-dark-800/50 hover:bg-accent-danger/10 transition-all duration-200 text-dark-300 hover:text-accent-danger hover:shadow-lg group relative"
              title="Sign Out"
            >
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-dark-700 text-dark-50 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Sign Out
              </span>
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 