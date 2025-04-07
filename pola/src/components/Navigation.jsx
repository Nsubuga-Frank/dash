import { getAuth, signOut } from 'firebase/auth';
import { ChevronDown, LogOut, Moon, Shield, Sun, User } from 'lucide-react';
import React, { useState } from 'react';

const Navigation = ({ darkMode, toggleDarkMode, user, onOpenAdminPanel }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  // Close menu when clicking outside
  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Nav Links */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className={`font-bold text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Polaris</span>
              <span className="font-bold text-xl ml-1">Cloud</span>
            </div>
            
            {/* Nav Links - Only show if user is logged in */}
            {user && (
              <div className="ml-6 flex space-x-2">
                <button
                  onClick={onOpenAdminPanel}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    darkMode 
                      ? 'text-purple-300 hover:bg-gray-700' 
                      : 'text-purple-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="mr-1.5 h-4 w-4" />
                  Admin
                </button>
              </div>
            )}
          </div>
          
          {/* User and theme toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {/* User menu */}
            {user && (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={toggleUserMenu}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <div className={`p-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <span className="max-w-[150px] truncate">{user.email}</span>
                    <ChevronDown className={`h-4 w-4 ${userMenuOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={closeUserMenu}
                    ></div>
                    <div 
                      className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-20 ${
                        darkMode ? 'bg-gray-800 ring-1 ring-black ring-opacity-5' : 'bg-white ring-1 ring-black ring-opacity-5'
                      }`}
                    >
                      <div 
                        className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Signed in as
                        <div className="font-medium truncate flex items-center gap-1">
                          {user.email}
                        </div>
                      </div>
                      
                      <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                      <button
                        onClick={handleSignOut}
                        className={`w-full text-left block px-4 py-2 text-sm ${
                          darkMode 
                            ? 'text-red-400 hover:bg-gray-700' 
                            : 'text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;