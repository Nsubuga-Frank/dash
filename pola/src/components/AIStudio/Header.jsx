import {
    Brain,
    Command,
    Maximize,
    Maximize2,
    Minimize,
    Minimize2,
    ServerCog,
    Settings
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Header component for AIStudio
 */
const Header = ({ 
  darkMode, 
  activeSection,
  selectedResource,
  isExpanded,
  isFullscreen,
  onTabSwitch,
  onResourceSelect,
  onToggleExpand,
  onToggleFullscreen
}) => {
  return (
    <div
      className={`flex items-center justify-between py-1 border-b-2 ${
        darkMode
          ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900'
          : 'border-gray-200 bg-gradient-to-r from-white to-gray-50'
      }`}
    >
      {/* Title on the far left */}
      <div className="flex items-center ml-4">
        <div className="flex items-center">
          <Brain className={`h-3.5 w-3.5 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className="font-medium text-xs">Polaris Cloud</span>
        </div>
        <div
          className={`ml-2 px-1.5 py-0.5 text-[7px] font-medium rounded-full ${
            darkMode 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-700/30' 
              : 'bg-purple-100 text-purple-600 border border-purple-200'
          }`}
        >
          BETA
        </div>
        
        {/* Resource selector buttons */}
        <div className={`ml-4 flex rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => onResourceSelect('standard')}
            className={`px-2 py-0.5 text-xs transition-all ${
              selectedResource === 'standard'
                ? darkMode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-50'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => onResourceSelect('premium')}
            className={`px-2 py-0.5 text-xs transition-all ${
              selectedResource === 'premium'
                ? darkMode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-50'
            }`}
          >
            Premium
          </button>
          <button
            onClick={() => onResourceSelect('enterprise')}
            className={`px-2 py-0.5 text-xs transition-all ${
              selectedResource === 'enterprise'
                ? darkMode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : darkMode
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-50'
            }`}
          >
            Enterprise
          </button>
        </div>
      </div>
      
      {/* Centered tabs */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className={`h-7 flex ${darkMode ? 'shadow-lg shadow-blue-900/20' : 'shadow-md shadow-blue-500/10'}`}>
          <button
            className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center 
              ${
                activeSection === 'studio' || activeSection === 'catalogue'
                  ? darkMode 
                    ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                    : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 hover:text-blue-600'
              }`}
            onClick={() => onTabSwitch('catalogue')}
          >
            <div className="flex items-center justify-center w-full">
              <Command className={`h-3 w-3 mr-1.5 ${
                activeSection === 'studio' || activeSection === 'catalogue'
                  ? darkMode ? 'text-purple-300' : 'text-purple-500'
                  : darkMode ? 'text-blue-400' : 'text-blue-500'
              }`} />
              <span className="relative z-10">AI Studio</span>
            </div>
            {/* Vertical separator */}
            <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${(activeSection === 'studio' || activeSection === 'catalogue') ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </button>
          
          <button
            className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
              ${
                activeSection === 'compute' 
                  ? darkMode 
                    ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                    : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 hover:text-blue-600'
              }`}
            onClick={() => onTabSwitch('compute')}
          >
            <div className="flex items-center justify-center w-full">
              <ServerCog 
                className={`h-3 w-3 mr-1.5 ${
                  activeSection === 'compute'
                    ? darkMode ? 'text-purple-300' : 'text-purple-500'
                    : darkMode ? 'text-blue-400' : 'text-blue-500'
                }`} 
              />
              <span className="relative z-10">Compute</span>
            </div>
            {/* Vertical separator */}
            <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'compute' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </button>

          <button
            className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
              ${
                activeSection === 'settings' 
                  ? darkMode 
                    ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                    : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                    : 'bg-gray-100 text-gray-600 hover:text-blue-600'
              }`}
            onClick={() => onTabSwitch('settings')}
          >
            <div className="flex items-center justify-center w-full">
              <Settings
                className={`h-3 w-3 mr-1.5 ${
                  activeSection === 'settings'
                    ? darkMode ? 'text-purple-300' : 'text-purple-500'
                    : darkMode ? 'text-blue-400' : 'text-blue-500'
                }`}
              />
              <span className="relative z-10">Settings</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Controls on the right */}
      <div className="flex items-center space-x-2 pr-4">
        <button
          className={`p-1 rounded-full transition-colors duration-200 ${
            darkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
          }`}
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
        </button>
        <button
          className={`p-1 rounded-full transition-colors duration-200 ${
            darkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
          }`}
          onClick={onToggleExpand}
          title={isExpanded ? 'Minimize' : 'Expand'}
        >
          {isExpanded ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

Header.propTypes = {
  darkMode: PropTypes.bool,
  activeSection: PropTypes.string.isRequired,
  selectedResource: PropTypes.string.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  onTabSwitch: PropTypes.func.isRequired,
  onResourceSelect: PropTypes.func.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onToggleFullscreen: PropTypes.func.isRequired
};

export default Header; 