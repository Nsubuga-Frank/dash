import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BetaWarningModal from '../../screens/widgets/BetaWarningModal';
import Header from './Header';
import ModelDetails from './ModelDetails';
import ModelsList from './ModelsList';
import Sidebar from './Sidebar';

/**
 * Main AIStudio component that serves as the container for all AIStudio elements
 */
const AIStudio = ({ darkMode, modelsData }) => {
  // Beta warning modal state
  const [showBetaWarning, setShowBetaWarning] = useState(true);
  
  // Active main section
  const [activeSection, setActiveSection] = useState('catalogue');
  // Active sidebar section for each main tab
  const [activeSidebarItem, setActiveSidebarItem] = useState('catalogue');
  
  // Active compute section
  const [activeComputeSection, setActiveComputeSection] = useState('instances');

  // Active nodes section
  const [activeNodesSection, setActiveNodesSection] = useState('verified');

  // Model selection
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedModelType, setSelectedModelType] = useState('All');

  // Expand/minimize & fullscreen
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resource selection
  const [selectedResource, setSelectedResource] = useState('standard');
  
  // Filter models by brand
  const filteredModels =
    selectedModelType === 'All'
      ? (modelsData || [])
      : (modelsData || []).filter((model) => model.brand === selectedModelType);

  // Effect to set selected model if none is selected
  useEffect(() => {
    if (!selectedModel && filteredModels.length > 0) {
      setSelectedModel(filteredModels[0]);
    }
  }, [selectedModel, filteredModels]);
  
  // Handler to handle model deployment click
  const handleDeployModelClick = (model) => {
    console.log('Deploying model:', model);
    toast.info(`Preparing to deploy ${model.name}...`);
  };

  // Beta warning handlers
  const handleCloseBetaWarning = () => {
    setShowBetaWarning(false);
  };

  const handleProceedBeta = () => {
    setShowBetaWarning(false);
  };

  // Handler functions
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSectionClick = (section) => {
    if (section.comingSoon) {
      toast.info(`${section.label} is coming soon!\n\n${section.description}`);
    } else {
      if (activeSection === 'compute') {
        setActiveComputeSection(section.id);
      } else if (activeSection === 'nodes') {
        // Handle nodes section clicks
        setActiveNodesSection(section.id);
      } else if (activeSection === 'catalogue' || activeSection === 'studio') {
        // Only update the sidebar item, not the main tab
        setActiveSidebarItem(section.id);
      } else {
        // For other tabs, update both (maintaining existing behavior)
        setActiveSidebarItem(section.id);
      }
    }
  };

  const handleTabSwitch = (tabId) => {
    if (tabId === 'compute') {
      setActiveSection('compute');
      // Reset compute section to default when switching to compute tab
      setActiveComputeSection('instances');
    } else if (tabId === 'nodes') {
      setActiveSection('nodes');
    } else if (tabId === 'settings') {
      setActiveSection('settings');
    } else {
      setActiveSection('catalogue');
      // When switching to AI Studio, set the sidebar item to match
      setActiveSidebarItem('catalogue');
    }
  };

  // Main container styles for consistent layout
  const containerStyles = {
    height: isFullscreen
      ? 'calc(100vh - 0.75rem)'
      : isExpanded
      ? 'calc(100vh - 140px)'
      : 'calc(90vh - 140px)',
    width: isFullscreen
      ? 'calc(100% - 0.75rem)'
      : isExpanded
      ? 'calc(100% - 32px)'
      : '90%',
    position: isFullscreen ? 'fixed' : 'absolute',
    top: isFullscreen ? '0.375rem' : '50%',
    left: isFullscreen ? '0.375rem' : '50%',
    right: isFullscreen ? '0.375rem' : 'auto',
    bottom: isFullscreen ? '0.375rem' : 'auto',
    transform: isFullscreen ? 'none' : 'translate(-50%, -50%)',
    margin: isFullscreen ? '0' : '0 auto',
    maxHeight: isFullscreen ? 'calc(100vh - 0.75rem)' : 'calc(100vh - 140px)',
    padding: '0',
    boxShadow: isFullscreen
      ? '0 0 20px rgba(0, 0, 0, 0.1)'
      : isExpanded
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    transitionProperty: 'all',
    transformOrigin: 'center',
    transitionTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
  };

  return (
    <div>
      {/* Beta Warning Modal */}
      <BetaWarningModal
        isOpen={showBetaWarning}
        onClose={handleCloseBetaWarning}
        onProceed={handleProceedBeta}
        darkMode={darkMode}
      />
      
      {/* CSS for animations */}
      <style>
        {`
          @keyframes pulse-subtle {
            0% { opacity: 1; }
            50% { opacity: 0.8; }
            100% { opacity: 1; }
          }
          @keyframes glow-subtle {
            0% { box-shadow: 0 0 0px rgba(59, 130, 246, 0.1); }
            50% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
            100% { box-shadow: 0 0 0px rgba(59, 130, 246, 0.1); }
          }
          .animate-pulse-subtle {
            animation: pulse-subtle 2s ease-in-out infinite;
          }
          .animate-glow-subtle {
            animation: glow-subtle 2s ease-in-out infinite;
          }
        `}
      </style>
      
      {/* Fullscreen backdrop */}
      {isFullscreen && <div className="fixed inset-0 backdrop-blur-sm bg-black/10 z-40"></div>}

      <div
        className={`flex flex-col overflow-hidden rounded-lg ${
          darkMode
            ? 'bg-gray-900 text-white border-gray-600 shadow-xl shadow-blue-900/10'
            : 'bg-white text-gray-900 border-gray-300 shadow-xl shadow-blue-500/10'
        } transition-all duration-500 ease-in-out border-2 ${
          isFullscreen ? 'fixed z-50 rounded-none border-0' : ''
        }`}
        style={containerStyles}
      >
        {/* Header component */}
        <Header 
          darkMode={darkMode}
          activeSection={activeSection}
          selectedResource={selectedResource}
          isExpanded={isExpanded}
          isFullscreen={isFullscreen}
          onTabSwitch={handleTabSwitch}
          onResourceSelect={setSelectedResource}
          onToggleExpand={toggleExpand}
          onToggleFullscreen={toggleFullscreen}
        />
        
        {/* Main layout: Sidebar + Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar component */}
          <Sidebar 
            darkMode={darkMode}
            activeSection={activeSection}
            activeComputeSection={activeComputeSection}
            activeNodesSection={activeNodesSection}
            activeSidebarItem={activeSidebarItem}
            onSectionClick={handleSectionClick}
          />
          
          {/* Conditionally render the middle column for catalogue section */}
          {activeSection === 'catalogue' && (
            <div
              className={`w-72 flex-shrink-0 border-r-2 flex flex-col ${
                darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <ModelsList 
                darkMode={darkMode}
                models={modelsData || []}
                selectedModel={selectedModel}
                selectedModelType={selectedModelType}
                onModelSelect={setSelectedModel}
                onModelTypeChange={setSelectedModelType}
              />
            </div>
          )}
          
          {/* Main content area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Catalogue section */}
            {activeSection === 'catalogue' && (
              <ModelDetails 
                darkMode={darkMode}
                selectedModel={selectedModel}
                onDeployClick={handleDeployModelClick}
              />
            )}
            
            {/* Other sections */}
            {activeSection !== 'catalogue' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {activeSection === 'compute' ? 'Compute Resources' :
                   activeSection === 'nodes' ? 'Node Management' :
                   'Settings'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  This component has been refactored. Additional content components will be added here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AIStudio.propTypes = {
  darkMode: PropTypes.bool,
  modelsData: PropTypes.array
};

export default AIStudio; 