import { AlertCircle, X } from 'lucide-react';
import React from 'react';

const ModelSelectModal = ({ darkMode, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`
          relative w-full max-w-sm transform rounded-2xl
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${darkMode 
            ? 'bg-slate-800 shadow-lg shadow-black/20' 
            : 'bg-white shadow-xl shadow-black/10'}
        `}>
          {/* Close button */}
          <button 
            onClick={onClose}
            className={`
              absolute right-4 top-4 p-1 rounded-full
              transition-colors duration-200
              ${darkMode 
                ? 'hover:bg-white/10 text-gray-400' 
                : 'hover:bg-black/5 text-gray-500'}
            `}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`
                p-3 rounded-full
                ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}
              `}>
                <AlertCircle className={`
                  w-6 h-6
                  ${darkMode ? 'text-red-400' : 'text-red-500'}
                `} />
              </div>
              
              <div className="space-y-2">
                <h3 className={`
                  text-lg font-medium
                  ${darkMode ? 'text-white' : 'text-gray-900'}
                `}>
                  Select a Model First
                </h3>
                
                <p className={`
                  text-sm
                  ${darkMode ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  Please choose an AI model from the sidebar before starting a new chat
                </p>
              </div>

              <button
                onClick={onClose}
                className={`
                  mt-4 w-full py-2 px-4 rounded-lg
                  transition-colors duration-200
                  text-sm font-medium
                  ${darkMode 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'}
                `}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectModal;