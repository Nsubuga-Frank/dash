import { Bot, User } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// Typing animation component
const TypingText = ({ text, speed = 50, shouldAnimate = false }) => {
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? '' : text);
  
  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(text);
      return;
    }
    
    if (text.length > displayedText.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeoutId);
    }
  }, [text, displayedText, speed, shouldAnimate]);
  
  return <>{displayedText}</>;
};

// Thinking animation component
const ThinkingIndicator = ({ darkMode, modelName }) => {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="relative max-w-3xl mr-12">
        <div className={`rounded-2xl p-4 shadow-sm ${
          darkMode ? 'bg-[#1C2128] text-gray-300' : 'bg-gray-700 text-gray-100'
        }`}>
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
          {modelName} is thinking...
        </div>
      </div>
    </div>
  );
};

const ChatMessage = ({
  message,
  isLast,
  isLoading,
  darkMode = false,
  modelName = 'AI Assistant'
}) => {
  const isUser = message.type === 'user';
  const isRecent = Date.now() - new Date(message.timestamp).getTime() < 1000; // Message is less than 1 second old
  const isThinking = message.isThinking; // Check if message is in thinking state

  // If this message is in "thinking" state or loading and it's the last message, show thinking indicator
  if ((isThinking || (isLoading && isLast)) && !isUser) {
    return <ThinkingIndicator darkMode={darkMode} modelName={modelName} />;
  }

  return (
    <div className="flex animate-fadeIn justify-start">
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
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {isUser ? (
                  <User className="h-5 w-5 text-indigo-200" />
                ) : (
                  <Bot className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
                  <TypingText
                    text={message.content}
                    speed={isUser ? 10 : 50}
                    shouldAnimate={isRecent && isLast} // Only animate if message is recent and last
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs opacity-70">
                  <span>{isUser ? 'You' : modelName}</span>
                  <span>{new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
            {!isUser && (
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-400/10 to-transparent" />
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
          {message.type === 'user' ? 'You' : modelName}
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.oneOf(['user', 'assistant', 'system', 'bot']).isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    isThinking: PropTypes.bool,
    id: PropTypes.string
  }).isRequired,
  isLast: PropTypes.bool,
  isLoading: PropTypes.bool,
  darkMode: PropTypes.bool,
  modelName: PropTypes.string,
};

TypingText.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number,
  shouldAnimate: PropTypes.bool
};

ThinkingIndicator.propTypes = {
  darkMode: PropTypes.bool,
  modelName: PropTypes.string
};

export default ChatMessage;