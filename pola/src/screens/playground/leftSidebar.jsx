import {
    Blocks,
    BookOpen,
    BrainCircuit,
    ChevronLeft,
    ChevronRight,
    Cpu,
    FileQuestion,
    MessageSquare,
    MessagesSquare,
    Sparkles,
    UserCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ComingSoonModal from './widgets/ComingSoonModal';

const LeftSidebar = ({ darkMode, activeSection, setActiveSection }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [comingSoonDescription, setComingSoonDescription] = useState("");

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleComingSoonFeature = (feature, description) => {
    setComingSoonFeature(feature);
    setComingSoonDescription(description);
    setShowComingSoonModal(true);
  };

  const NavButton = ({ id, icon, label, badge, isComingSoon, comingSoonDescription }) => {
    const isActive = activeSection === id;

    const handleClick = () => {
      if (isComingSoon) {
        handleComingSoonFeature(label, comingSoonDescription);
      } else {
        setActiveSection(id);
        if (isMobile) setIsSidebarOpen(false);
      }
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-medium transition-all duration-200
          ${
            isActive
              ? darkMode
                ? 'bg-blue-600/20 text-blue-400'
                : 'bg-blue-50 text-blue-600'
              : darkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
      >
        <div className="flex items-center gap-3">
          {React.cloneElement(icon, {
            className: 'h-4 w-4',
            strokeWidth: isActive ? 2.5 : 2,
          })}
          {isSidebarOpen && <span>{label}</span>}
        </div>
        {badge && isSidebarOpen && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isActive 
              ? darkMode
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-blue-100 text-blue-600'
              : darkMode
              ? 'bg-gray-800 text-gray-400'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`p-4 flex items-center gap-2 border-b ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <Blocks className={`h-5 w-5 ${
          darkMode ? 'text-blue-400' : 'text-blue-600'
        }`} />
        {isSidebarOpen && (
          <span className={`font-semibold text-sm ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            POLARIS AI STUDIO
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Chat Section */}
        <div className="p-3 space-y-1">
          {isSidebarOpen && (
            <div className={`text-xs font-medium mb-2 px-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              CHAT & ASSISTANTS
            </div>
          )}
          <NavButton id="chat" icon={<MessageSquare />} label="Chat" badge="New" />
          <NavButton id="docsGPT" icon={<BookOpen />} label="DocsGPT" />
          <NavButton 
            id="aiassistants" 
            icon={<UserCircle />} 
            label="AI Assistants" 
            badge="Soon"
            isComingSoon={true}
            comingSoonDescription="Create and customize AI assistants with different personalities, knowledge bases, and capabilities. Your AI assistants can help with specific tasks, domains, or provide specialized expertise."
          />
          <NavButton 
            id="aiagent" 
            icon={<Cpu />} 
            label="AI Agent" 
            badge="Soon"
            isComingSoon={true}
            comingSoonDescription="Our AI Agent technology allows for autonomous problem-solving through a chain of thought process. Agents can reason through complex tasks, use tools, and accomplish goals with minimal human supervision."
          />
        </div>

        {/* AI Tools */}
        <div className="p-3 space-y-1">
          {isSidebarOpen && (
            <div className={`text-xs font-medium mb-2 px-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              AI TOOLS
            </div>
          )}
          <NavButton id="messages" icon={<MessagesSquare />} label="Messages" />
          <NavButton id="completion" icon={<Sparkles />} label="Completion" />
          <NavButton id="intelligence" icon={<BrainCircuit />} label="Intelligence" />
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t p-3 space-y-1 ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <NavButton id="help" icon={<FileQuestion />} label="Documentation" />
      </div>

      {/* Pro Features */}
      {isSidebarOpen && (
        <div className={`p-3 mx-3 mb-8 rounded-lg ${
          darkMode
            ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/50'
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Pro Features
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              darkMode
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-blue-100 text-blue-600'
            }`}>
              Upgrade
            </span>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        feature={comingSoonFeature}
        description={comingSoonDescription}
        darkMode={darkMode}
      />
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Blocks className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
      </button>

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex ${isSidebarOpen ? 'w-64' : 'w-16'} fixed left-2 top-20 bottom-20 flex-col shadow-lg ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } transition-all duration-300 rounded-lg overflow-hidden`}
        style={{ zIndex: 1 }}
      >
        {sidebarContent}
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`
            absolute top-24 -right-3
            ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
            p-1.5 rounded-full shadow-md border
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}
            transition-colors duration-200
          `}
        >
          {isSidebarOpen ? (
            <ChevronLeft className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          ) : (
            <ChevronRight className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div className={`relative w-64 h-full shadow-xl ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;