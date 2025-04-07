import { AlertTriangle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { auth } from '../../../firebase/config';
import LoginModal from '../../../LoginModal';
import ParentChatContainer from '../../chatArea';
import FineTuneModal from '../../widgets/FineTuneModal';
import NewLibraryModal from '../../widgets/NewLibraryModal';
import MainContent from '../components/MainContent';
import ModelSelection from '../components/ModelSelection';
import RightSidebar from '../components/RightSidebar';
import Sidebar from '../components/Sidebar';
import { useModels } from '../data/models';

// LoginOverlay Component
function LoginOverlay({ darkMode, onLoginClick }) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-16 z-50 flex items-end justify-end p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs"></div>
      <div
        className={`relative z-10 w-full max-w-xs p-4 rounded-lg shadow-lg transform transition-all duration-300 
          ${darkMode ? 'bg-gray-900/95 text-white border border-gray-700' : 'bg-white/95 text-gray-900 border border-gray-200'}
          animate-fade-in hover:scale-105`}
        style={{ marginRight: '1.5rem', marginBottom: '1.5rem' }}
      >
        <div className={`mb-2 p-2 rounded-md flex items-center gap-2 
          ${darkMode ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
          <AlertTriangle size={16} />
          <p className="text-xs">Please sign in to access advanced features</p>
        </div>
        <h2 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Polaris AI Studio
        </h2>
        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Unlock the full potential of Polaris AI Studio.
        </p>
        <button
          onClick={onLoginClick}
          className="w-full py-2 rounded-md text-white font-semibold transition-all duration-300
            bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
            hover:from-blue-600 hover:via-purple-600 hover:to-pink-600
            shadow-md hover:shadow-lg"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// Loading Component
function LoadingState({ darkMode }) {
  return (
    <div className={`flex items-center justify-center h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <p className="text-lg font-medium">Loading models...</p>
      </div>
    </div>
  );
}

// Error Component
function ErrorState({ darkMode, error }) {
  return (
    <div className={`flex items-center justify-center h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex flex-col items-center space-y-4 max-w-md text-center px-4">
        <AlertTriangle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold">Error Loading Models</h2>
        <p className="text-sm opacity-75">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function PolarisCatalog({ darkMode }) {
  // Get models using the custom hook
  const { models, loading, error } = useModels();

  // State management
  const [user, setUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRightExpanded, setIsRightExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('Model Catalogue');
  const [activeSubSection, setActiveSubSection] = useState('chat');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedHardware, setSelectedHardware] = useState('ALL');
  const [selectedChatModel, setSelectedChatModel] = useState('');
  const [selectedDocsModel, setSelectedDocsModel] = useState('');
  const [showNewLibraryModal, setShowNewLibraryModal] = useState(false);
  const [showFineTuneModal, setShowFineTuneModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [viewingDeployedModel, setViewingDeployedModel] = useState(false);
  // NEW: State for the catalogue view (e.g., 'catalogue' or 'deployments')
  const [catalogueView, setCatalogueView] = useState('catalogue');

  // Auth state management
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Responsive sidebar management
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
        setIsRightExpanded(false);
      } else {
        setIsExpanded(true);
        setIsRightExpanded(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Task and model filtering
  const toggleTask = (modelType) => {
    setSelectedTasks((prev) =>
      prev.includes(modelType)
        ? prev.filter((t) => t !== modelType)
        : [...prev, modelType]
    );
  };

  const filteredModels = useMemo(() => {
    if (!models) return [];

    return Object.values(models).filter((model) => {
      const matchesTask =
        selectedTasks.length === 0 ||
        selectedTasks.includes(model.model_type);

      const hardwareRequirements = {
        CPU: model.requirements?.cpu_cores,
        GPU: model.requirements?.gpu_memory_gb,
        TPU: false,
        INF2: false
      };

      const matchesHardware =
        selectedHardware === 'ALL' || hardwareRequirements[selectedHardware];

      return matchesTask && matchesHardware;
    });
  }, [models, selectedTasks, selectedHardware]);

  // Modal and navigation handlers
  const handleGoToCatalogue = () => {
    setActiveSection('Model Catalogue');
    setIsModalOpen(false);
  };

  const handleModelSelect = (model) => {
    if (activeSubSection === 'chat') {
      setSelectedChatModel(model);
    } else {
      setSelectedDocsModel(model);
    }
    setIsModalOpen(false);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Loading and error states
  if (loading) return <LoadingState darkMode={darkMode} />;
  if (error) return <ErrorState darkMode={darkMode} error={error} />;

  return (
    <div className="flex min-h-screen relative">
      {/* Login overlay for non-authenticated users */}
      {!user && <LoginOverlay darkMode={darkMode} onLoginClick={openLoginModal} />}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        darkMode={darkMode}
      />

      {showNewLibraryModal && (
        <NewLibraryModal
          darkMode={darkMode}
          onClose={() => setShowNewLibraryModal(false)}
          onSubmit={(libraryData) => {
            console.log('[NewLibrary] Submitted:', libraryData);
            setShowNewLibraryModal(false);
          }}
        />
      )}

      {showFineTuneModal && (
        <FineTuneModal
          darkMode={darkMode}
          libraries={[]}
          selectedModel={selectedDocsModel}
          onClose={() => setShowFineTuneModal(false)}
          onSubmit={(data) => {
            console.log('[FineTune] Started:', data);
            setShowFineTuneModal(false);
          }}
        />
      )}

      {isModalOpen && (
        <ModelSelection
          isModalOpen={isModalOpen}
          handleCloseModal={() => setIsModalOpen(false)}
          darkMode={darkMode}
          onModelSelect={handleModelSelect}
          onDeployClick={handleGoToCatalogue}
          userId={user?.uid}
        />
      )}

      {/* Main layout */}
      <Sidebar
        darkMode={darkMode}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        setActiveSubSection={setActiveSubSection}
      />

      <div className={`
  flex-1 
  ${isExpanded ? 'ml-20' : 'ml-16'} 
  ${!viewingDeployedModel && isRightExpanded ? 'mr-72' : 'mr-16'}
  transition-all duration-300 ease-in-out
`}>
        {activeSection === 'Model Catalogue' ? (
          <MainContent
            darkMode={darkMode}
            isExpanded={isExpanded}
            activeSection={activeSection}
            catalogueView={catalogueView}
            isRightExpanded={!viewingDeployedModel && isRightExpanded}
            models={filteredModels}
            onDeployedModelView={setViewingDeployedModel}
            setActiveSection={setActiveSection}
          />
        ) : activeSection === 'Playground' ? (
          <ParentChatContainer
            darkMode={darkMode}
            activeSection={activeSection}
            activeSubSection={activeSubSection}
            selectedChatModel={selectedChatModel}
            selectedDocsModel={selectedDocsModel}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            isRightSidebarOpen={isRightExpanded}
          />
        ) : (
          // Default fallback content
          <div className="flex items-center justify-center h-full">
            <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Select a section from the sidebar
            </p>
          </div>
        )}
      </div>

      {/* Conditional right sidebar */}
      {!viewingDeployedModel && (
        <RightSidebar
          darkMode={darkMode}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          selectedTasks={selectedTasks}
          toggleTask={toggleTask}
          selectedHardware={selectedHardware}
          setSelectedHardware={setSelectedHardware}
          setIsModalOpen={setIsModalOpen}
          selectedChatModel={selectedChatModel}
          selectedDocsModel={selectedDocsModel}
          setSelectedChatModel={setSelectedChatModel}
          setSelectedDocsModel={setSelectedDocsModel}
          setShowNewLibraryModal={setShowNewLibraryModal}
          setShowFineTuneModal={setShowFineTuneModal}
          isRightExpanded={isRightExpanded}
          setIsRightExpanded={setIsRightExpanded}
          activeSubSection={activeSubSection}
          setActiveSubSection={setActiveSubSection}
          userId={user?.uid}
          catalogueView={catalogueView}          // Passing the view state to RightSidebar
          setCatalogueView={setCatalogueView}    // Passing the view setter to RightSidebar
        />
      )}
    </div>
  );
}

export default PolarisCatalog;
