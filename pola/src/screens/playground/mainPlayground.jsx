// PlaygroundApp.jsx
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import ParentChatContainer from './chatArea';
import LeftSidebar from './leftSidebar';
import RightSidebar from './rightSidebar';

const PlaygroundApp = ({ darkMode }) => {
  const [activeSection, setActiveSection] = useState('AI Studio');
  const [activeSubSection, setActiveSubSection] = useState('chat');
  const [selectedChatModel, setSelectedChatModel] = useState(null);
  const [selectedDocsModel, setSelectedDocsModel] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isRightExpanded, setIsRightExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNewLibraryModal, setShowNewLibraryModal] = useState(false);
  const [showFineTuneModal, setShowFineTuneModal] = useState(false);
  
  const auth = getAuth();

  return (
    <div
      className={`h-[calc(100vh-80px)] ${
        darkMode ? 'bg-[#0D1117] text-slate-300' : 'bg-slate-100 text-gray-900'
      } relative`}
    >
      {!isExpanded && (
        <>
          <LeftSidebar
            darkMode={darkMode}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <RightSidebar
            darkMode={darkMode}
            activeSection={activeSection}
            selectedChatModel={selectedChatModel}
            selectedDocsModel={selectedDocsModel}
            setSelectedChatModel={setSelectedChatModel}
            setSelectedDocsModel={setSelectedDocsModel}
            isRightExpanded={isRightExpanded}
            setIsRightExpanded={setIsRightExpanded}
            activeSubSection={activeSubSection}
            setActiveSubSection={setActiveSubSection}
            userId={auth.currentUser?.uid}
            setIsModalOpen={setIsModalOpen}
            setShowNewLibraryModal={setShowNewLibraryModal}
            setShowFineTuneModal={setShowFineTuneModal}
            selectedTasks={[]}
            toggleTask={() => {}}
            selectedHardware="ALL"
            setSelectedHardware={() => {}}
          />
        </>
      )}

      <ParentChatContainer
        darkMode={darkMode}
        activeSection={activeSection}
        activeSubSection={activeSubSection}
        selectedChatModel={selectedChatModel}
        selectedDocsModel={selectedDocsModel}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isRightSidebarOpen={isRightSidebarOpen}
      />
    </div>
  );
};

export default PlaygroundApp;