import React, { useEffect } from 'react';
import { BsGear, BsTrophy } from 'react-icons/bs';

const Navbar = ({
  darkMode,
  navigationItems,
  footerLinks,
  activeNav,
  handleNavClick,
  handleHomeClick,
  user,
  onLogout,
  setIsLoginModalOpen,
}) => {
  // Add custom animation styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50
      ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}
      backdrop-blur-md backdrop-saturate-150 border-b
      ${darkMode ? 'border-gray-800' : 'border-gray-200'}
    `}>
      {/* Minimal Header - just logo and login */}
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div onClick={handleHomeClick} className="flex items-center cursor-pointer">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-purple-600
          `}>
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <div className="ml-2 font-semibold">
            <div className="text-lg">
              POLARIS
            </div>
            <div className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Intelligence Network
            </div>
          </div>
        </div>

        {/* User controls (leaderboard, settings, login/logout) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavClick('Leaderboard')}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${activeNav === 'Leaderboard'
                ? darkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-900'
                : darkMode
                  ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
            title="Leaderboard"
          >
            <BsTrophy className="w-5 h-5" />
          </button>
          
          {user && (
            <button
              onClick={() => handleNavClick('Settings')}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${activeNav === 'Settings'
                  ? darkMode
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-200 text-gray-900'
                  : darkMode
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
              title="Settings"
            >
              <BsGear className="w-5 h-5" />
            </button>
          )}
          {user ? (
            <button
              onClick={onLogout}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${darkMode
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200'
                  : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${darkMode
                  ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200'
                  : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'}`}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
