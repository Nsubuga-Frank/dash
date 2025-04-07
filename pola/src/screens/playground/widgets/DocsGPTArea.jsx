import { Brush, ChevronDown, Library, Loader, Maximize, Minimize } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import LibrariesModal from './LibrariesModal';
import LibraryDetails from './LibraryDetails';
import NewLibraryModal from './NewLibraryModal';

// Document name cleaning utility
const cleanDocumentName = (filename) => {
  if (!filename) return '';
  let cleaned = filename.replace(/^[a-f0-9-]{20,}_?/, '');
  cleaned = decodeURIComponent(cleaned);
  cleaned = cleaned
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '')
    .replace(/^[-_\s]+/, '')
    .replace(/[-_\s]+$/, '');
  return cleaned;
};

// Format response utility
const formatResponse = (content, darkMode) => {
  try {
    const result = JSON.parse(content);
    return (
      <div className="space-y-4">
        <div className="prose max-w-none">
          {result.answer.split('\n').map((paragraph, i) => (
            paragraph.trim() && (
              <p key={i} className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {paragraph}
              </p>
            )
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3 border-t border-opacity-10 pt-3">
          {result.document_names?.length > 0 && (
            <div className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full
              ${darkMode 
                ? 'bg-gray-800/40 text-gray-300 ring-1 ring-gray-700' 
                : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
              <span className="mr-1">📚</span>
              {result.document_names.map(doc => cleanDocumentName(doc)).join(', ')}
            </div>
          )}
          {result.model_used && (
            <div className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full
              ${darkMode 
                ? 'bg-gray-800/40 text-gray-300 ring-1 ring-gray-700' 
                : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
              <span className="mr-1">🤖</span>
              {result.model_used.name}
            </div>
          )}
        </div>
      </div>
    );
  } catch (e) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }
};

export default function DocsGPTArea({
  darkMode,
  selectedDocsModel,
  onShowHistory,
  onClearChat,
  isExpanded,
  isSidebarOpen,
  isRightSidebarOpen,
  setIsExpanded,
  sendQuery,
}) {
  const messagesRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Library states
  const [showLibrariesModal, setShowLibrariesModal] = useState(false);
  const [showNewLibraryModal, setShowNewLibraryModal] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleScroll = () => {
    if (messagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const scrollToBottom = () => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleLibrarySelect = (lib) => {
    setSelectedLibrary(lib);
    setSelectedDocument(null);
    setShowLibrariesModal(false);
  };

  const handleCreateNewLibrary = () => {
    setShowLibrariesModal(false);
    setShowNewLibraryModal(true);
  };

  const handleSendQuery = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check if a model is selected
    if (!selectedDocsModel) {
      setQueryResults(prev => [...prev, {
        type: 'bot',
        content: JSON.stringify({
          answer: 'Please select a model to proceed.',
          document_names: [],
          model_used: { name: 'Error' }
        })
      }]);
      return;
    }

    setIsLoading(true);
    const userQuery = inputValue.trim();
    setQueryResults(prev => [...prev, { type: 'user', content: userQuery }]);
    setInputValue('');

    let document_ids = [];
    if (selectedLibrary) {
      if (selectedDocument) {
        document_ids.push(selectedDocument.id);
      } else if (selectedLibrary.documents) {
        document_ids = selectedLibrary.documents.map((doc) => doc.id);
      }
    }

    try {
      const payload = {
        query: userQuery,
        document_ids,
        model_id: selectedDocsModel?.model_id || null,
      };

      const result = await sendQuery(payload);
      setQueryResults(prev => [...prev, { type: 'bot', content: JSON.stringify(result) }]);
    } catch (error) {
      console.error('Query failed', error);
      setQueryResults(prev => [...prev, {
        type: 'bot',
        content: JSON.stringify({
          answer: `Error: ${error.message}`,
          document_names: [],
          model_used: { name: 'Error' }
        })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [queryResults]);

  return (
    <div
      className={`
        fixed inset-0 flex flex-col
        top-[4rem] bottom-16
        ${darkMode ? 'bg-[#1b212c]' : 'bg-white'}
        transition-all duration-300
        ${isExpanded ? 'ml-60' : 'ml-20'}
        ${isRightSidebarOpen ? 'mr-64' : 'mr-16'}
        rounded-xl
        shadow-lg
        ${darkMode ? 'border border-gray-800' : 'border border-gray-200'}
      `}
    >
      {/* Top Bar */}
      <div className={`
        sticky top-0 z-10 flex-none flex items-center justify-between p-4 pb-0 py-2 border-b 
        ${darkMode ? 'bg-[#1b212c] border-gray-800/60' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${darkMode ? 'bg-gray-800/40' : 'bg-gray-100'}`}>
            <Library className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <div className="flex flex-col">
            <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              DocsGPT
              {selectedDocsModel && (
                <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  using {selectedDocsModel.name}
                </span>
              )}
            </h1>
            {selectedLibrary && (
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                📚 {selectedLibrary.libraryName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLibrariesModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
          >
            <Library className="h-4 w-4" />
            <span>Libraries</span>
          </button>
          <button
            onClick={() => {
              onClearChat();
              setQueryResults([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
          >
            <Brush className="h-4 w-4" />
            <span>Clear</span>
          </button>
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
          >
            {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span>{isExpanded ? 'Minimize' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Library Details Section */}
      {selectedLibrary && (
        <div className="flex-none p-1">
          <LibraryDetails
            darkMode={darkMode}
            library={selectedLibrary}
            selectedDocument={selectedDocument}
            onDocumentSelect={setSelectedDocument}
            isRightSidebarOpen={isRightSidebarOpen}
          />
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        className={`
          flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar 
          ${darkMode ? 'bg-[#0D1117]' : 'bg-white'}
        `}
      >
        {queryResults.map((message, index) => (
          <div
            key={index}
            className="flex animate-fadeIn justify-start"
          >
            <div className="relative w-[95%] mr-8">
              <div className={`rounded-2xl p-5 shadow-lg ${
                message.type === 'user'
                  ? darkMode
                    ? 'bg-gradient-to-r from-indigo-500/90 to-purple-600/90 text-white shadow-indigo-500/10 border border-indigo-400/20'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white shadow-purple-500/10'
                  : darkMode
                    ? 'bg-[#1C2128] text-gray-300 shadow-black/5'
                    : 'bg-slate-300/95 text-gray-700 shadow-slate-200 backdrop-blur-sm border border-slate-200/50'
              }`}>
                <div className={message.type === 'user' ? 'space-y-2' : 'space-y-3'}>
                  {message.type === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm font-medium">
                      {message.content}
                    </div>
                  ) : (
                    <>
                      {formatResponse(message.content, darkMode)}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-400/10 to-transparent" />
                    </>
                  )}
                </div>
              </div>
              <div className={`text-xs mt-1.5 mx-2 font-medium ${
                darkMode 
                  ? 'text-gray-500' 
                  : message.type === 'user' 
                    ? 'text-gray-500' 
                    : 'text-slate-500'
              }`}>
                {message.type === 'user' ? 'You' : 'DocsGPT'}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="relative max-w-3xl mr-12">
              <div className={`rounded-2xl p-4 shadow-sm ${darkMode ? 'bg-[#1C2128] text-gray-300' : 'bg-gray-700 text-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="animate-bounce">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                  <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                </div>
              </div>
              <div className={`text-xs mt-1 mx-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                DocsGPT is thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`
        sticky bottom-0 z-10 p-4 border-t 
        ${darkMode ? 'bg-[#3a4558] border-gray-800' : 'bg-white border-gray-200'}
      `}>
        <div className={`rounded-lg p-2 flex items-center gap-2 ${darkMode ? 'bg-[#1C2128]' : 'bg-gray-100'}`}>
          <input
            type="text"
            placeholder="Ask me anything about the documents..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading && selectedDocsModel) {
                handleSendQuery();
              }
            }}
            disabled={isLoading}
            className={`flex-1 bg-transparent border-none outline-none ${
              darkMode
                ? 'text-gray-300 placeholder-gray-500'
                : 'text-gray-900 placeholder-gray-400'
            } ${isLoading ? 'opacity-50' : ''}`}
          />
          <button
            onClick={handleSendQuery}
            disabled={isLoading || !selectedDocsModel}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-white ${
              isLoading || !selectedDocsModel
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Submit
                <span className="text-sm opacity-50">Enter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-8 p-2 bg-blue-500 hover:bg-blue-600 
            rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 
            text-white ring-4 ring-white dark:ring-[#0D1117]"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}

      {/* Modals */}
      {showLibrariesModal && (
        <LibrariesModal
          darkMode={darkMode}
          onClose={() => setShowLibrariesModal(false)}
          onLibraryClick={handleLibrarySelect}
          onCreateNewLibrary={handleCreateNewLibrary}
        />
      )}

      {showNewLibraryModal && (
        <NewLibraryModal
          darkMode={darkMode}
          onClose={() => setShowNewLibraryModal(false)}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1C2128' : '#f8fafc'};
          border-radius: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#374151' : '#cbd5e1'};
          border-radius: 8px;
          cursor: pointer;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#4b5563' : '#94a3b8'};
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

DocsGPTArea.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  selectedDocsModel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    model_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    provider: PropTypes.string,
    type: PropTypes.string,
  }),
  onShowHistory: PropTypes.func.isRequired,
  onClearChat: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  isRightSidebarOpen: PropTypes.bool.isRequired,
  setIsExpanded: PropTypes.func.isRequired,
  sendQuery: PropTypes.func.isRequired,
};