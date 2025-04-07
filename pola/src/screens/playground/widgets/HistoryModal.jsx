import { formatDistanceToNow } from 'date-fns';
import { TrashIcon, XIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';

export default function HistoryModal({
  darkMode,
  chatSessions,
  onClose,
  onLoadSession,
  onDeleteChat,
  isLoading
}) {
  // Function to format the date as a readable string
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        className={`
          relative 
          w-full max-w-2xl
          max-h-[80vh]
          m-4
          rounded-lg
          shadow-lg
          ${darkMode ? 'bg-[#1b212c]' : 'bg-white'}
          ${darkMode ? 'border border-gray-800' : 'border border-gray-200'}
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between
          p-4
          border-b
          ${darkMode ? 'border-gray-800' : 'border-gray-200'}
        `}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Chat History
          </h2>
          <button
            onClick={onClose}
            className={`
              p-1 rounded-lg
              ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            `}
          >
            <XIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto max-h-[calc(80vh-8rem)]">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading chat history...
              </p>
            </div>
          ) : chatSessions && chatSessions.length > 0 ? (
            chatSessions.map((group) => (
              <div key={group.date} className="p-4">
                <h3 className={`
                  text-sm font-medium mb-2
                  ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  {formatDate(group.date)}
                </h3>
                <div className="space-y-2">
                  {group.sessions.map((chat) => (
                    <div
                      key={chat.id}
                      className={`
                        flex items-center justify-between
                        p-3 rounded-lg cursor-pointer
                        ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                      `}
                    >
                      <button
                        className="flex-1 flex items-start text-left"
                        onClick={() => onLoadSession(chat)}
                      >
                        <div className="min-w-0">
                          <p className={`
                            font-medium truncate
                            ${darkMode ? 'text-gray-200' : 'text-gray-900'}
                          `}>
                            {chat.name || 'New Chat'}
                          </p>
                          <p className={`
                            text-sm
                            ${darkMode ? 'text-gray-500' : 'text-gray-500'}
                          `}>
                            {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className={`
                          ml-2 p-2 rounded
                          ${darkMode 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                            : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}
                        `}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No chat history found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

HistoryModal.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  chatSessions: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    sessions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      created_at: PropTypes.string.isRequired,
      model: PropTypes.string,
      messages: PropTypes.array
    })).isRequired
  })).isRequired,
  onClose: PropTypes.func.isRequired,
  onLoadSession: PropTypes.func.isRequired,
  onDeleteChat: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};