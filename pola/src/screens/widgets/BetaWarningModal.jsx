import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const BetaWarningModal = ({ isOpen, onClose, onProceed, darkMode }) => {
  const [shouldShow, setShouldShow] = useState(isOpen);
  
  // Check if user has already seen the beta warning
  useEffect(() => {
    const hasSeenBetaWarning = localStorage.getItem('hasSeenBetaWarning');
    if (hasSeenBetaWarning === 'true' && isOpen) {
      // If user has seen warning before, auto-proceed
      onProceed();
      setShouldShow(false);
    } else {
      setShouldShow(isOpen);
    }
  }, [isOpen, onProceed]);

  // Add animation styles when component mounts
  useEffect(() => {
    if (shouldShow) {
      // Create and inject styles for gradient animation
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `;
      document.head.appendChild(styleElement);
      
      // Clean up when component unmounts
      return () => {
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      };
    }
  }, [shouldShow]);
  
  // Handle user proceeding to beta
  const handleProceed = () => {
    // Save to localStorage that user has seen warning
    localStorage.setItem('hasSeenBetaWarning', 'true');
    onProceed();
  };
  
  if (!shouldShow) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={`
          relative max-w-lg w-full mx-4 p-5 rounded-xl shadow-2xl overflow-hidden
          ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
          border-2 ${darkMode ? 'border-indigo-500/30' : 'border-indigo-500/20'}
        `}
      >
        {/* Prominent beta ribbon in the top right corner */}
        <div className="absolute -top-1 -right-1 z-20">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white 
                         text-sm font-bold py-1.5 px-8 transform rotate-45 translate-x-5 -translate-y-0.5
                         uppercase tracking-wider shadow-md">
            Beta
          </div>
        </div>
        
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            style={{
              backgroundSize: '200% 200%',
              animation: 'gradientMove 8s ease infinite',
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-9 h-9 rounded-full flex items-center justify-center mr-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Studio Beta</h3>
            </div>
            
            <button 
              onClick={onClose} 
              className={`rounded-full p-1 hover:bg-gray-200/20 transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              You&apos;re about to enter the Studio which is currently in <span className="font-semibold text-purple-500">beta</span>. This means:
            </p>
            
            <ul className="space-y-1">
              {[
                "Some features may be incomplete or change without notice",
                "You might encounter occasional bugs or performance issues",
                "Your feedback is incredibly valuable to us at this stage"
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <motion.div 
            className="flex flex-row gap-3 justify-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={onClose}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                ${darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
              `}
            >
              Cancel
            </button>
            
            <button
              onClick={handleProceed}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                text-white shadow-md hover:shadow-lg
              `}
            >
              Proceed to Beta
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Add prop validation
BetaWarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired
};

export default BetaWarningModal; 