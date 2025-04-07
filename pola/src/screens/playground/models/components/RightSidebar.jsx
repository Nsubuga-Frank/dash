import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  GridIcon,
  Info,
  MessageSquare,
  Server
} from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ModelDropdown from './ModelDropdown';

function RightSidebar({
  darkMode,
  activeSection,
  setActiveSection, // to update the parent
  toggleTask,
  selectedHardware,
  setSelectedHardware,
  setIsModalOpen,
  selectedChatModel,
  selectedDocsModel,
  setShowNewLibraryModal,
  setShowFineTuneModal,
  isRightExpanded = true,
  setIsRightExpanded,
  activeSubSection,
  setActiveSubSection,
  userId,
  setSelectedChatModel,
  setSelectedDocsModel,
  catalogueView,
  setCatalogueView = () => {} // default fallback
}) {
  const hardwareOptions = ['ALL', 'CPU', 'GPU', 'TPU', 'INF2'];
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  useEffect(() => {
    console.log("RightSidebar: catalogueView =", catalogueView);
  }, [catalogueView]);

  const getTitleAndDescription = () => {
    if (activeSection === 'Model Catalogue') {
      return {
        title: 'Model Catalogue',
        description: 'Browse, filter and deploy your desired AI models on Polaris infrastructure.'
      };
    }
    return {
      title: 'Playground',
      description: 'Create and interact with AI assistants. Use ReadBuddy to analyze documents with AI.'
    };
  };

  if (!['Playground', 'Model Catalogue'].includes(activeSection)) {
    return null;
  }

  // Force update activeSection to "Model Catalogue" unconditionally when clicking a view button.
  const handleCatalogueViewChange = (view, event) => {
    if (event && event.stopPropagation) event.stopPropagation();
    console.log(`handleCatalogueViewChange called with view: ${view}`);
    if (typeof setActiveSection === 'function') {
      setActiveSection('Model Catalogue'); // unconditionally update the active section
    } else {
      console.error("setActiveSection is not a function");
    }
    setCatalogueView(view);
  };

  return (
    <aside className={`
      fixed right-2 top-[4rem] bottom-16 
      ${isRightExpanded ? 'w-60' : 'w-10'}
      transition-all duration-300 ease-in-out shadow-lg z-10
      ${darkMode ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'}
    `}>
      <div className={`px-4 py-2 flex flex-col gap-1 mb-2 border-b bg-gradient-to-r from-blue-900/20 to-purple-900/20 
        ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Info className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          {isRightExpanded && (
            <span className={`font-semibold text-xs ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {getTitleAndDescription().title}
            </span>
          )}
        </div>
        {isRightExpanded && (
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {getTitleAndDescription().description}
          </p>
        )}
      </div>

      <button
        onClick={() => setIsRightExpanded(!isRightExpanded)}
        className={`
          absolute top-24 -left-3
          ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
          p-1.5 rounded-full shadow-md border
          ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          transition-colors duration-200
        `}
      >
        {isRightExpanded ? (
          <ChevronRight className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        ) : (
          <ChevronLeft className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        )}
      </button>

      {activeSection === 'Model Catalogue' && isRightExpanded && (
        <div className="p-4">
          <div className="space-y-5">
            {/* View Mode toggle */}
            <div>
              <h3 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                View Mode
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    console.log("Setting view to catalogue");
                    handleCatalogueViewChange('catalogue', e);
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs transition-all
                    ${catalogueView === 'catalogue'
                      ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                    } hover:opacity-80 flex-1`}
                >
                  <GridIcon size={14} />
                  <span>Catalogue</span>
                </button>
                <button
                  onClick={(e) => {
                    console.log("Setting view to deployments");
                    handleCatalogueViewChange('deployments', e);
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs transition-all
                    ${catalogueView === 'deployments'
                      ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                    } hover:opacity-80 flex-1`}
                >
                  <Server size={14} />
                  <span>Deployments</span>
                </button>
              </div>
            </div>

            {/* Only show hardware filter in catalogue view */}
            {catalogueView === 'catalogue' && (
              <div>
                <h3 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Filter by Hardware
                </h3>
                <div className="flex flex-wrap gap-1">
                  {hardwareOptions.map((hw) => (
                    <button
                      key={hw}
                      onClick={() => setSelectedHardware(hw)}
                      className={`px-1.5 py-0.5 rounded-full text-xs transition-all
                        ${selectedHardware === hw
                          ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                          : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        } hover:opacity-80`}
                    >
                      {hw}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'Playground' && isRightExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              CHAT & ASSISTANTS
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveSubSection('chat')}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                  ${activeSubSection === 'chat'
                    ? darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveSubSection('docsGPT')}
                className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                  ${activeSubSection === 'docsGPT'
                    ? darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>ReadBuddy</span>
              </button>
            </div>
          </div>

          <hr className="border-t border-gray-200 dark:border-gray-700" />

          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              MODEL
            </div>
            <ModelDropdown
              darkMode={darkMode}
              selectedModel={activeSubSection === 'chat' ? selectedChatModel : selectedDocsModel}
              onOpenModal={() => setIsModalOpen(true)}
            />
          </div>

          <button
            className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors duration-200
              ${darkMode
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            onClick={() => setShowNewLibraryModal(true)}
          >
            <FolderPlus className="h-4 w-4" />
            {isRightExpanded && <span className="text-sm">Create New Library</span>}
          </button>

          <button
            className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors duration-200
              ${darkMode
                ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            onClick={() => setShowFineTuneModal(true)}
          >
            <Brain className="h-4 w-4" />
            {isRightExpanded && <span className="text-sm">Fine-tune Agent</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

RightSidebar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  activeSection: PropTypes.string.isRequired,
  setActiveSection: PropTypes.func.isRequired,
  toggleTask: PropTypes.func,
  selectedHardware: PropTypes.string,
  setSelectedHardware: PropTypes.func,
  setIsModalOpen: PropTypes.func.isRequired,
  selectedChatModel: PropTypes.object,
  selectedDocsModel: PropTypes.object,
  setShowNewLibraryModal: PropTypes.func.isRequired,
  setShowFineTuneModal: PropTypes.func.isRequired,
  isRightExpanded: PropTypes.bool,
  setIsRightExpanded: PropTypes.func.isRequired,
  activeSubSection: PropTypes.string.isRequired,
  setActiveSubSection: PropTypes.func.isRequired,
  userId: PropTypes.string,
  setSelectedChatModel: PropTypes.func.isRequired,
  setSelectedDocsModel: PropTypes.func.isRequired,
  catalogueView: PropTypes.string.isRequired,
  setCatalogueView: PropTypes.func.isRequired
};

export default RightSidebar;
