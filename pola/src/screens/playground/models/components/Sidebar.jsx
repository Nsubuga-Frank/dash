import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Layout,
  Sparkles
} from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ComingSoonModal from '../../../playground/widgets/ComingSoonModal';

function Sidebar({
  darkMode,
  isExpanded,
  setIsExpanded,
  activeSection,
  setActiveSection,
  setActiveSubSection
}) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [comingSoonDescription, setComingSoonDescription] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsExpanded(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsExpanded]);

  const handleComingSoonFeature = (feature, description) => {
    setComingSoonFeature(feature);
    setComingSoonDescription(description);
    setShowComingSoonModal(true);
  };

  const navItems = [
    { name: 'Model Catalogue', icon: Layout, isComingSoon: false },
    { name: 'Playground', icon: Sparkles, isComingSoon: false },
    { 
      name: 'AI Assistants', 
      icon: props => (
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          {...props}
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21v-2a7 7 0 0 0-4-6.3" />
          <path d="M4 21v-2a7 7 0 0 1 4-6.3" />
          <path d="M8 14h8" />
          <path d="M8 17h5" />
        </svg>
      ),
      isComingSoon: true, 
      description: "Create and customize AI assistants with different personalities, knowledge bases, and capabilities. Your AI assistants can help with specific tasks, domains, or provide specialized expertise."
    },
    { 
      name: 'Polaris Agents', 
      icon: props => (
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          {...props}
        >
          <circle cx="12" cy="12" r="3" />
          <circle cx="5" cy="8" r="2" />
          <circle cx="19" cy="8" r="2" />
          <circle cx="5" cy="16" r="2" />
          <circle cx="19" cy="16" r="2" />
          <path d="M10 12L7 10" />
          <path d="M14 12L17 10" />
          <path d="M10 12L7 14" />
          <path d="M14 12L17 14" />
        </svg>
      ),
      isComingSoon: true, 
      description: "Our Polaris Agent technology allows for autonomous problem-solving through a chain of thought process. Agents can reason through complex tasks, use tools, and accomplish goals with minimal human supervision."
    }
  ];

  const NavButton = ({ id, icon, label, isComingSoon, description }) => {
    const isActive = activeSection === id;
    
    const handleClick = () => {
      if (isComingSoon) {
        handleComingSoonFeature(label, description);
      } else {
        setActiveSection(id);
        if (id === 'Playground') {
          setActiveSubSection('chat');
        }
      }
    };
    
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transition-colors duration-200
          ${isActive
            ? darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'
            : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
      >
        <div className="flex items-center gap-2">
          {React.createElement(icon, { className: 'h-4 w-4' })}
          {isExpanded && <span>{label}</span>}
        </div>
        
        {isExpanded && isComingSoon && (
          <span className={`text-xs px-2 py-0.5 rounded-full
            ${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'}`}
          >
            Soon
          </span>
        )}
      </button>
    );
  };

  NavButton.propTypes = {
    id: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    isComingSoon: PropTypes.bool,
    description: PropTypes.string
  };

  NavButton.defaultProps = {
    isComingSoon: false,
    description: ''
  };

  return (
    <>
      <aside className={`
        ${isExpanded ? 'w-56' : 'w-16'}
        md:flex top-[4rem]
        transition-all duration-300 ease-in-out
        fixed left-2 bottom-16
        flex-col shadow-lg
        ${darkMode ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700' : 'bg-white/95 backdrop-blur-sm border-gray-200'}
        rounded-lg overflow-hidden
      `}>
        <div className={`px-4 py-2 flex items-center gap-2 mb-2 border-b bg-gradient-to-r from-blue-900/20 to-purple-900/20 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <Blocks className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          {isExpanded && (
            <span className={`font-semibold text-xs ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              POLARIS AI STUDIO
            </span>
          )}
        </div>

        <div className="p-2 space-y-1">
          {navItems.map((item) => (
            <NavButton
              key={item.name}
              id={item.name}
              icon={item.icon}
              label={item.name}
              isComingSoon={item.isComingSoon}
              description={item.description}
            />
          ))}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            absolute top-24 -right-3
            ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
            p-1.5 rounded-full shadow-md border
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            transition-colors duration-200
          `}
        >
          {isExpanded ? (
            <ChevronLeft className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          ) : (
            <ChevronRight className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </button>

        {isExpanded && (
          <>
            <hr className="border-t border-gray-200 dark:border-gray-700 my-2" />
            <div className={`p-3 mx-3 mb-3 rounded-lg mt-auto 
              ${darkMode
                ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/50'
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Pro Features
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full 
                  ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}
                >
                  Upgrade
                </span>
              </div>
            </div>
          </>
        )}
      </aside>
      
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        feature={comingSoonFeature}
        description={comingSoonDescription}
        darkMode={darkMode}
      />
    </>
  );
}

Sidebar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  setIsExpanded: PropTypes.func.isRequired,
  activeSection: PropTypes.string.isRequired,
  setActiveSection: PropTypes.func.isRequired,
  setActiveSubSection: PropTypes.func.isRequired
};

export default Sidebar;