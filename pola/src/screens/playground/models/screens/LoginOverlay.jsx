// LoginOverlay.js
import { AlertTriangle } from 'lucide-react';
import React from 'react';

function LoginOverlay({ darkMode, onLoginClick }) {
  return (
    <div className="fixed right-32 top-32 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div
        className={`relative w-80 p-4 rounded-xl shadow-2xl transform transition-all duration-500 
          ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} 
          border-2 border-blue-500/30 animate-fade-in hover:scale-105`}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20"></div>

        <div className="relative z-10">
          <div
            className={`mb-3 p-2 rounded-lg flex items-center gap-2 
              ${darkMode ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}
          >
            <AlertTriangle size={16} />
            <p className="text-xs">Please sign in to access advanced features</p>
          </div>

          <h2
            className={`text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
              bg-clip-text text-transparent`}
          >
            Polaris AI Studio
          </h2>

          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Unlock the full potential of Polaris AI Studio.
          </p>

          <button
            onClick={onLoginClick} // Use the callback instead of redirecting
            className="w-full py-2 rounded-lg text-white text-sm font-semibold transition-all duration-300
              bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
              hover:from-blue-600 hover:via-purple-600 hover:to-pink-600
              hover:shadow-lg hover:shadow-blue-500/30"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginOverlay;
