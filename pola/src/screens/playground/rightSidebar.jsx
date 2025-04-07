import {
  Brain,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Library,
  Menu
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ModelDropdown from './modelDropdown';
import FineTuneModal from './widgets/FineTuneModal';
import LibrariesModal from './widgets/LibrariesModal';
import NewLibraryModal from './widgets/NewLibraryModal';

const RightSidebar = ({
  darkMode,
  activeSection,
  selectedChatModel,
  setSelectedChatModel,
  selectedDocsModel,
  setSelectedDocsModel
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showLibrariesModal, setShowLibrariesModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showNewLibraryModal, setShowNewLibraryModal] = useState(false);
  const [showFineTuneModal, setShowFineTuneModal] = useState(false);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Auto-adjust sidebar on mobile
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const libraries = [
    { name: 'React Documentation', docs: 42 },
    { name: 'Python Docs', docs: 28 },
    { name: 'Company Wiki', docs: 15 },
    { name: 'JavaScript Guide', docs: 30 },
    { name: 'Design Patterns', docs: 12 }
  ];

  const handleLibraryClick = (lib) => {
    console.log(`[RightSidebar] Library clicked in modal: ${lib.name}`);
  };

  // Model Selection Modal for Chat and Docs
  const ModelSelectionModal = ({ onClose, selectedModel, onSelect }) => (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 pt-20"
      onClick={onClose}
    >
      <div
        className={`
          ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}
          rounded-xl shadow-2xl w-full max-w-md p-6
          my-4
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Select Model
          </h2>
        </div>
        <ModelDropdown
          darkMode={darkMode}
          selectedModel={selectedModel}
          onSelect={(modelName) => {
            onSelect(modelName);
            onClose();
          }}
        />
      </div>
    </div>
  );

  // Determine scrollbar class based on theme
  const scrollbarClass = darkMode ? 'scrollbar-dark' : 'scrollbar-light';

  // Render chat view with fixed model section
  const renderChatView = () => (
    <div className="flex flex-col h-full">
      {/* Fixed Model Section */}
      {isSidebarOpen && (
        <div
          className={`p-4 border-b ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            MODEL
          </div>
          <ModelDropdown
            darkMode={darkMode}
            selectedModel={selectedChatModel}
            onSelect={(modelName) => {
              console.log(`[RightSidebar] Chat model selected: ${modelName}`);
              setSelectedChatModel(modelName);
            }}
          />
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className={`overflow-y-auto flex-1 min-h-0 ${scrollbarClass}`}>
        {/* Additional chat-related content can go here */}
      </div>
    </div>
  );

  // Render docs view with fixed model section
  const renderDocsView = () => (
    <div className="flex flex-col h-full">
      {/* Fixed Model Section */}
      <div
        className={`p-4 border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
      >
        <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          MODEL
        </div>
        <ModelDropdown
          darkMode={darkMode}
          selectedModel={selectedDocsModel}
          onSelect={(modelName) => {
            console.log(`[RightSidebar] DocsGPT model selected: ${modelName}`);
            setSelectedDocsModel(modelName);
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 p-5">
        <button
          className={`w-full flex items-center gap-2 p-2 ${
            darkMode
              ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          } rounded-lg transition-colors duration-200`}
          onClick={() => setShowNewLibraryModal(true)}
        >
          <FolderPlus className="h-4 w-4" />
          <span className="text-sm">Create New Library</span>
        </button>
        <button
          className={`w-full flex items-center gap-2 p-2 ${
            darkMode
              ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
          } rounded-lg transition-colors duration-200`}
          onClick={() => setShowFineTuneModal(true)}
        >
          <Brain className="h-4 w-4" />
          <span className="text-sm">Fine-tune Agent</span>
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className={`overflow-y-auto flex-1 min-h-0 p-4 space-y-6 ${scrollbarClass}`}>
        {/* Document Libraries (show only three) */}
        <div className="space-y-3">
          <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            RECENT LIBRARIES
          </div>
          <div className="space-y-2">
            {libraries.slice(0, 3).map((lib, index) => (
              <button
                key={index}
                className={`w-full flex items-center justify-between p-3 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } rounded-lg transition-colors duration-200`}
                onClick={() => console.log(`[RightSidebar] Library clicked: ${lib.name}`)}
              >
                <div className="flex items-center gap-2">
                  <Library className="h-4 w-4" />
                  <span className="text-sm">{lib.name}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {lib.docs} docs
                </span>
              </button>
            ))}

            {/* View More Button */}
            <button
              className={`w-full text-center p-3 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-blue-400'
                  : 'bg-white hover:bg-gray-50 text-blue-600'
              }`}
              onClick={() => setShowLibrariesModal(true)}
            >
              View More
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Menu Toggle
  const MobileMenuToggle = () => (
    <button
      className={`
        fixed top-4 right-4 z-50 
        ${darkMode ? 'text-white' : 'text-black'}
        ${isSidebarOpen ? 'hidden' : 'block'}
      `}
      onClick={() => setIsSidebarOpen(true)}
    >
      <Menu className="h-6 w-6" />
    </button>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => {
    const isDocsMode = activeSection === 'docs';
  
    return (
      <aside className={`
        fixed top-20 bottom-20 right-6
        ${isSidebarOpen ? 'w-80' : 'w-12'}
        ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'}
        backdrop-blur-sm
        border-l
        ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        hidden md:block
        rounded-lg
        flex flex-col
        overflow-hidden
      `}>
        {isSidebarOpen ? (
          <div className="flex-1 flex flex-col">
            {/* Model Section */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                MODEL
              </div>
              <ModelDropdown
                darkMode={darkMode}
                selectedModel={activeSection === 'chat' ? selectedChatModel : selectedDocsModel}
                onSelect={(modelName) => {
                  if (activeSection === 'chat') {
                    setSelectedChatModel(modelName);
                  } else {
                    setSelectedDocsModel(modelName);
                  }
                }}
              />
            </div>
  
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              {activeSection === 'chat' ? (
                <div className={scrollbarClass}>
                  {/* Chat content */}
                </div>
              ) : (
                <div className={`p-4 space-y-4 ${scrollbarClass}`}>
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
                        darkMode 
                          ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                      onClick={() => setShowNewLibraryModal(true)}
                    >
                      <FolderPlus className="h-4 w-4" />
                      <span className="text-sm">Create New Library</span>
                    </button>
                  </div>
  
                  {/* Libraries List */}
                  {libraries.slice(0, 3).map((lib, index) => (
                    <button
                      key={index}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        darkMode 
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-50/50'
                      }`}
                    >
                      {/* Library content */}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2">
            {/* Collapsed view buttons */}
          </div>
        )}
  
        <button
          className={`
            absolute top-1/3 -left-8 transform -translate-y-1/2 
            ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
            p-1 rounded-l-lg shadow-md transition-all duration-300 ease-in-out
          `}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </aside>
    );
  };

  // Mobile Sidebar
  const MobileSidebar = () => (
    <div
      className={`
        fixed inset-0 z-50 
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        transition-transform duration-300 ease-in-out
        md:hidden block
      `}
    >
      <div
        className={`
          w-80 h-full ml-auto 
          ${darkMode ? 'bg-gray-900' : 'bg-white'}
          border-l shadow-lg
          ${darkMode ? 'border-gray-800' : 'border-gray-200'}
          relative
        `}
      >
        <button
          className="absolute top-4 left-4 z-10"
          onClick={() => setIsSidebarOpen(false)}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {activeSection === 'chat' ? renderChatView() : renderDocsView()}
      </div>
    </div>
  );

  return (
    <>
      <MobileMenuToggle />
      <DesktopSidebar />
      <MobileSidebar />

      {showLibrariesModal && (
        <LibrariesModal
          darkMode={darkMode}
          libraries={libraries}
          onClose={() => setShowLibrariesModal(false)}
          onLibraryClick={handleLibraryClick}
          onCreateNewLibrary={() => {
            setShowLibrariesModal(false);
            setShowNewLibraryModal(true);
          }}
        />
      )}

      {showModelModal && (
        <ModelSelectionModal
          onClose={() => setShowModelModal(false)}
          selectedModel={activeSection === 'chat' ? selectedChatModel : selectedDocsModel}
          onSelect={activeSection === 'chat' ? setSelectedChatModel : setSelectedDocsModel}
        />
      )}

      {showNewLibraryModal && (
        <NewLibraryModal
          darkMode={darkMode}
          onClose={() => setShowNewLibraryModal(false)}
          onSubmit={(libraryData) => {
            console.log('[RightSidebar] New library submitted:', libraryData);
            setShowNewLibraryModal(false);
          }}
        />
      )}

      {showFineTuneModal && (
        <FineTuneModal
          darkMode={darkMode}
          libraries={libraries}
          selectedModel={selectedDocsModel}
          onClose={() => setShowFineTuneModal(false)}
          onSubmit={(data) => {
            console.log('[RightSidebar] Fine-tune started:', data);
            // Here you would typically call your API to start the fine-tuning process
          }}
        />
      )}

      <style jsx global>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        .scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
};

export default RightSidebar;
