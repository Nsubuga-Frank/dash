import React, { useEffect } from 'react';
import { BsGear } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const TabNavbar = ({
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
    <div className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Logo and user controls */}
      <header
        className={`
          ${darkMode ? 'bg-gray-800/30' : 'bg-white/30'}
          shadow-sm backdrop-blur-md backdrop-saturate-150
          py-2 px-6 sm:px-8
          flex items-center justify-between
          fixed top-0 left-0 right-0 z-10
          border-b border-gray-200/20
          transition-all duration-300
        `}
      >
        <Link
          to="/"
          onClick={handleHomeClick}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={darkMode ? '/assets/logo2.png' : '/assets/logo.png'}
            alt="Polaris Logo"
            className="h-8 w-auto object-contain"
          />
        </Link>
        
        {/* User controls (settings, login/logout) */}
        <div className="flex items-center gap-2">
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
      </header>

      {/* Adjust content padding to account for header */}
      <div className="h-[64px]"></div>
    </div>
  );
};

export default TabNavbar; 