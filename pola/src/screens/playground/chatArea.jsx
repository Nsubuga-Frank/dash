// ParentChatContainer.jsx

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import useChatApi from './hooks/useChatApi';
import ChatArea from './widgets/ChatArea';
import DocsGPTArea from './widgets/DocsGPTArea';
import HistoryModal from './widgets/HistoryModal';

const createEmptySession = () => ({
  id: null,
  name: 'New Chat',
  messages: [],
});

export default function ParentChatContainer({
  darkMode,
  activeSubSection,
  selectedChatModel,
  selectedDocsModel,
  isExpanded,
  setIsExpanded,
  isRightSidebarOpen,
}) {
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(createEmptySession());
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();

  const {
    isLoading,
    error: apiError,
    createNewChat,
    loadChatHistory,
    loadChatMessages,
    sendMessage,
    sendQuery, // Destructure the new sendQuery method
    renameChat,
    deleteChat,
    clearError,
  } = useChatApi(selectedChatModel);

  // Load chat history when component mounts or auth changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await loadChatHistory();
        setChatSessions(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Failed to load chat history');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchHistory();
      } else {
        setChatSessions([]);
        setCurrentSession(createEmptySession());
      }
    });

    return () => unsubscribe();
  }, [auth, loadChatHistory]);

  // Clear errors when model or subsection changes
  useEffect(() => {
    setError(null);
    clearError();
  }, [selectedChatModel, activeSubSection, clearError]);

  const handleNewChat = async () => {
    try {
      if (!selectedChatModel) {
        throw new Error('Please select a chat model');
      }

      // Create new chat with selected model
      const newChat = await createNewChat('New Chat');
      console.log('New chat created:', newChat);

      if (!newChat || !newChat.id) {
        throw new Error('Failed to create new chat');
      }

      // Set the current session with the new chat data
      setCurrentSession({
        id: newChat.id,
        name: newChat.name,
        messages: [], // Initialize with empty messages array
        model: selectedChatModel.model_id?.toLowerCase(),
      });

      // Refresh chat history
      const history = await loadChatHistory();
      setChatSessions(history);

      setError(null);
      return true; // Indicate success
    } catch (err) {
      console.error('Failed to create new chat:', err);
      setError(err.message);
      return false; // Indicate failure
    }
  };

  const handleClearChat = () => {
    setCurrentSession(createEmptySession());
    setError(null);
  };

  const handleLoadSession = async (session) => {
    try {
      if (!session.id) {
        throw new Error('Invalid session selected');
      }

      const chatData = await loadChatMessages(session.id);
      setCurrentSession({
        id: chatData.id,
        name: chatData.name,
        messages: chatData.messages || [],
        model: chatData.model,
      });
      setShowHistory(false);
      setError(null);
    } catch (err) {
      console.error('Failed to load chat session:', err);
      setError('Failed to load chat session');
    }
  };

  const handleSendMessage = async (message) => {
    console.log(`ParentChatContainer: handleSendMessage called with message: "${message}"`);
    try {
      if (!selectedChatModel) {
        throw new Error('Please select a chat model');
      }

      // Create new chat if this is the first message
      if (!currentSession.id) {
        console.log('ParentChatContainer: No current session, creating new chat');
        const newChat = await createNewChat();
        if (!newChat || !newChat.id) {
          throw new Error('Failed to create new chat');
        }
        const chatData = await loadChatMessages(newChat.id);
        setCurrentSession({
          id: chatData.id,
          name: chatData.name,
          messages: [],
          model: selectedChatModel.model_id?.toLowerCase(),
        });
      }

      // Add user message immediately
      const newMessage = {
        type: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setCurrentSession((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      console.log(`ParentChatContainer: Sending message to chatId: ${currentSession.id}`);

      // Invoke sendMessage with only chatId and message
      await sendMessage(currentSession.id, message);
      
      console.log(`ParentChatContainer: Received response from sendMessage`);

      // Update chat with response
      const updatedChat = await loadChatMessages(currentSession.id);
      setCurrentSession(updatedChat);
      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message);
    }
  };

  const handleRenameChat = async (newName) => {
    try {
      if (!currentSession.id) {
        throw new Error('No active chat to rename');
      }

      await renameChat(currentSession.id, newName);
      const updatedChat = await loadChatMessages(currentSession.id);
      setCurrentSession(updatedChat);

      // Refresh chat history
      const history = await loadChatHistory();
      setChatSessions(history);
      setError(null);
    } catch (err) {
      console.error('Failed to rename chat:', err);
      setError('Failed to rename chat');
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      if (!chatId) {
        throw new Error('Invalid chat selected for deletion');
      }

      await deleteChat(chatId);

      // Refresh chat history
      const history = await loadChatHistory();
      setChatSessions(history);

      // Reset current session if the deleted chat was active
      if (currentSession?.id === chatId) {
        setCurrentSession(createEmptySession());
      }
      setError(null);
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError('Failed to delete chat');
    }
  };

  // Handler for New Chat button click
  const handleNewChatClick = () => {
    if (!selectedChatModel) {
      // If no chat model is selected, set an error message
      setError('Please select a chat model before starting a new chat.');
    } else {
      handleNewChat();
    }
  };

  return (
    <div
      className={`
        flex-1
        ${isExpanded ? 'md:ml-60' : 'md:ml-16'}  /* Changed 'ml-50' to 'ml-60' as Tailwind doesn't have 'ml-50' */
        ${isRightSidebarOpen ? 'mr-72' : 'mr-16'}
        mt-[2.5rem]
        ml-2
        mb-20
        transition-all
        duration-300
      `}
    >
      {activeSubSection === 'chat' ? (
        <ChatArea
          darkMode={darkMode}
          currentSession={currentSession}
          setCurrentSession={setCurrentSession}
          onNewChat={handleNewChatClick} // Updated to use handleNewChatClick
          onShowHistory={() => setShowHistory(true)}
          onClearChat={handleClearChat}
          selectedChatModel={selectedChatModel}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isRightSidebarOpen={isRightSidebarOpen}
          onSendMessage={handleSendMessage}
          onRenameChat={handleRenameChat}
          isLoading={isLoading}
          error={error || apiError}
        />
      ) : activeSubSection === 'docsGPT' ? (
        <DocsGPTArea
          darkMode={darkMode}
          selectedDocsModel={selectedDocsModel} // Now an object
          onShowHistory={() => setShowHistory(true)}
          onClearChat={handleClearChat}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isRightSidebarOpen={isRightSidebarOpen}
          sendQuery={sendQuery} // Pass the sendQuery method
        />
      ) : (
        <div className="p-4 text-center text-gray-500">
          Select a section from the sidebar.
        </div>
      )}

      {showHistory && (
        <HistoryModal
          darkMode={darkMode}
          chatSessions={chatSessions}
          onClose={() => setShowHistory(false)}
          onLoadSession={handleLoadSession}
          onDeleteChat={handleDeleteChat}
        />
      )}

      {/* Optional: Display Global Error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white font-bold"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

ParentChatContainer.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  activeSubSection: PropTypes.string.isRequired,
  selectedChatModel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    model_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    provider: PropTypes.string,
    type: PropTypes.string,
  }),
  selectedDocsModel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    model_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    provider: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  setIsExpanded: PropTypes.func.isRequired,
  isRightSidebarOpen: PropTypes.bool.isRequired,
};
