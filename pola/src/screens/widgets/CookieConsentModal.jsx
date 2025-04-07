import { motion } from 'framer-motion';
import { Cookie, Settings, Shield, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

// Create a reusable Toggle component for consistency
const Toggle = ({ isEnabled, onChange, disabled = false }) => {
  return (
    <button 
      onClick={onChange}
      disabled={disabled}
      className={`
        w-10 h-5 rounded-full relative transition-all duration-200 ease-in-out
        ${isEnabled 
          ? 'bg-blue-500' 
          : 'bg-gray-400 dark:bg-gray-600'}
        ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div 
        className={`
          absolute h-4 w-4 bg-white rounded-full top-0.5
          transform transition-transform duration-200 ease-in-out
          ${isEnabled ? 'translate-x-5' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
};

Toggle.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

const CookieConsentModal = ({ isOpen, onAcceptAll, onCustomize, onDecline, darkMode }) => {
  const [activeTab, setActiveTab] = useState('main');
  const [preferences, setPreferences] = useState({
    necessary: true, // Always enabled
    analytics: true,
    marketing: false,
    preferences: true
  });

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleTogglePreference = (key) => {
    if (key === 'necessary') return; // Can't toggle necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = () => {
    onCustomize(preferences);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDecline}
      />
      
      {/* Modal - reduce max width */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`
          relative max-w-2xl mx-auto rounded-lg overflow-hidden shadow-2xl border
          ${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}
        `}
      >
        {/* Cookie accent line at top - make thinner */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Main content - reduce padding */}
        <div className="p-4">
          {activeTab === 'main' && (
            <div className="space-y-3">
              {/* Header - smaller icon and text */}
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Cookie className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-bold">Cookie Preferences</h2>
              </div>
              
              {/* Description - smaller text */}
              <p className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
              </p>
              
              {/* Highlights - more compact */}
              <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <div className="flex items-start gap-1.5 flex-1">
                    <Shield className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5 flex-shrink-0`} />
                    <div>
                      <h3 className="font-medium text-xs">Privacy Focused</h3>
                      <p className="text-[10px] mt-0.5 text-gray-500 dark:text-gray-400">We respect your privacy and comply with relevant regulations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 flex-1">
                    <Settings className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5 flex-shrink-0`} />
                    <div>
                      <h3 className="font-medium text-xs">Customizable</h3>
                      <p className="text-[10px] mt-0.5 text-gray-500 dark:text-gray-400">You can customize which cookies you want to accept</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'customize' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold">Cookie Settings</h2>
                <button 
                  onClick={() => handleTabChange('main')}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <p className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Customize your cookie preferences below. Some cookies are necessary for the website to function properly.
              </p>
              
              <div className="space-y-2">
                {/* Necessary cookies - more compact */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} relative`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-xs">Necessary Cookies</h3>
                      <p className="text-[10px] mt-0.5 text-gray-500 dark:text-gray-400">
                        These cookies are required for the website to function and cannot be disabled.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Toggle isEnabled={true} onChange={() => {}} disabled={true} />
                    </div>
                  </div>
                </div>
                
                {/* Analytics cookies */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} relative`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-xs">Analytics Cookies</h3>
                      <p className="text-[10px] mt-0.5 text-gray-500 dark:text-gray-400">
                        These cookies help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Toggle 
                        isEnabled={preferences.analytics} 
                        onChange={() => handleTogglePreference('analytics')} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Marketing cookies */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} relative`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-xs">Marketing Cookies</h3>
                      <p className="text-[10px] mt-0.5 text-gray-500 dark:text-gray-400">
                        These cookies are used to track visitors across websites to display relevant advertisements.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Toggle 
                        isEnabled={preferences.marketing} 
                        onChange={() => handleTogglePreference('marketing')} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Preferences cookies */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} relative`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-xs">Preferences Cookies</h3>
                      <p className="text-[10px] mt-0.5 text-gray-500 dark:text-gray-400">
                        These cookies enable personalized features and functionality.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Toggle 
                        isEnabled={preferences.preferences} 
                        onChange={() => handleTogglePreference('preferences')} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                    shadow-md hover:shadow-lg transition-all duration-300
                  `}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
          
          {/* Action buttons - smaller */}
          {activeTab === 'main' && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={onDecline}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium flex-1
                  ${darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                  transition-all duration-300
                `}
              >
                Decline
              </button>
              <button
                onClick={() => handleTabChange('customize')}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium flex-1
                  ${darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'}
                  transition-all duration-300
                `}
              >
                Customize
              </button>
              <button
                onClick={onAcceptAll}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium flex-1
                  bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                  shadow-md hover:shadow-lg transition-all duration-300
                `}
              >
                Accept All
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

CookieConsentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onAcceptAll: PropTypes.func.isRequired,
  onCustomize: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired
};

export default CookieConsentModal; 