import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

const ComingSoonModal = ({ isOpen, onClose, feature, description, darkMode }) => {
  // Add gradient and particle animation styles
  useEffect(() => {
    if (!isOpen) return;
    
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0) translateX(0);
          opacity: 0;
        }
        25% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
        75% {
          opacity: 0.4;
        }
        100% {
          transform: translateY(-150px) translateX(30px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`
          relative w-full max-w-xl mx-4 rounded-xl overflow-hidden
          ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
          shadow-xl border border-purple-500/20
        `}
        style={{ position: 'fixed', zIndex: 10000 }}
      >
        {/* Animated gradient header - reduced height */}
        <div className="h-24 overflow-hidden relative">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
            style={{
              backgroundSize: '200% 200%',
              animation: 'gradientMove 8s ease infinite',
            }}
          />
          
          {/* Floating particles effect */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/30"
                style={{
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
          
          {/* Content for the header - more compact */}
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <h3 className="text-xl font-bold text-white drop-shadow-md">
              Coming Soon
            </h3>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-1 bg-white/70 mt-1 rounded-full"
            />
          </div>
          
          {/* Close button */}
          <button 
            className="absolute top-3 right-3 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-all text-white"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Content - more compact */}
        <div className="p-4 flex flex-col">
          <div className="flex flex-row gap-6">
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {feature}
              </h4>
              
              <p className={`mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {description}
              </p>
            </div>
          </div>
          
          {/* Excitement indicator */}
          <div className={`
            p-3 rounded-lg text-xs mb-3
            ${darkMode ? 'bg-purple-900/20 text-purple-300' : 'bg-purple-50 text-purple-700'}
          `}>
            <p>We&apos;re working hard to bring this feature to you soon! Your patience will be rewarded with a powerful AI experience.</p>
          </div>
          
          {/* Call to action */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5
              `}
            >
              I&apos;m Excited!
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

ComingSoonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  feature: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired
};

export default ComingSoonModal; 