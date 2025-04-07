import { AlertCircle, Bot, CheckCircle2, Mail, MessageSquare, Send, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const TypewriterMessage = ({ content, darkMode, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, Math.random() * 30 + 20);
      
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, onComplete]);

  return (
    <div className={`max-w-[80%] p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
      {displayedContent}
      {currentIndex < content.length && (
        <span className="inline-block w-1 h-4 ml-1 bg-blue-500 animate-pulse" />
      )}
    </div>
  );
};

const FeedbackModal = ({ isOpen, onClose, darkMode }) => {
  // Form states
  const [rating, setRating] = useState(null);
  const [differentlyComment, setDifferentlyComment] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  
  // Chat states
  const [showingAIChat, setShowingAIChat] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today? I can assist with common questions, or connect you with our support team.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isShowing, setIsShowing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
      document.body.offsetHeight;
    } else {
      setIsShowing(false);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const resetForm = () => {
    setRating(null);
    setDifferentlyComment('');
    setEmail('');
    setErrors({});
    setIsSubmitted(false);
    setSubmissionData(null);
    setMessages([
      { role: 'assistant', content: 'Hello! How can I help you today? I can assist with common questions, or connect you with our support team.' }
    ]);
    setUserInput('');
    setShowingAIChat(true);
    setIsTyping(false);
    setCurrentResponse(null);
  };

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 300);
  };

  const getGPTResponse = async (messageHistory) => {
    try {
      const apiKey = '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'
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful customer support AI assistant. Be concise, friendly, and professional. If you cannot help with a specific issue, offer to connect the user with the support team.'
            },
            ...messageHistory
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from GPT-3');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting GPT response:', error);
      return "I apologize, but I'm having trouble connecting to the AI service. Would you like to speak with our support team instead?";
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user', content: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    
    setIsTyping(true);
    const aiResponse = await getGPTResponse(updatedMessages);
    setCurrentResponse(aiResponse);
    setIsTyping(false);
  };

  const handleTypingComplete = () => {
    if (currentResponse) {
      setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }]);
      setCurrentResponse(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className={`
          absolute inset-0 bg-black/30 backdrop-blur-sm
          transition-opacity duration-300 ease-out
          ${isShowing ? 'opacity-100' : 'opacity-0'}
        `} 
        onClick={handleClose} 
      />
      
      <div 
        className={`
          absolute top-0 right-0 bottom-0
          w-full sm:w-96 
          ${darkMode 
            ? 'bg-gray-800 text-white/90' 
            : 'bg-white text-gray-800'}
          shadow-xl
          transition-all duration-300 ease-in-out transform
          ${isShowing ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showingAIChat ? (
                <>
                  <Bot size={20} className="text-blue-500" />
                  <h2 className="font-semibold">Polaris AI Assistant</h2>
                </>
              ) : (
                <h2 className="font-semibold">Contact Support Team</h2>
              )}
            </div>
            <button
              onClick={handleClose}
              className={`
                p-1 rounded-full
                transition-colors duration-200
                ${darkMode 
                  ? 'hover:bg-white/10 text-white/70 hover:text-white/90' 
                  : 'hover:bg-black/5 text-gray-400 hover:text-gray-600'}
              `}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {showingAIChat ? (
            // AI Chat Interface
            <div className="flex flex-col h-full">
              {/* Scrollable Messages Container */}
              <div 
                className={`
                  flex-1 overflow-y-auto p-4 space-y-4 
                  ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}
                `}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${
                          message.type === 'user'
                            ? 'bg-blue-500'
                            : darkMode
                              ? 'bg-gray-700'
                              : 'bg-gray-100'
                        }
                      `}
                    >
                      {message.type === 'user' ? (
                        <User size={14} className="text-white" />
                      ) : (
                        <Bot size={14} className="text-blue-500" />
                      )}
                    </div>
                    <div
                      className={`
                        max-w-[80%] p-3 rounded-lg
                        ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : darkMode
                              ? 'bg-gray-700'
                              : 'bg-gray-100'
                        }
                      `}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Bot size={14} className="text-blue-500" />
                    </div>
                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" 
                              style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" 
                              style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" 
                              style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {currentResponse && (
                  <div className="flex items-start gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Bot size={14} className="text-blue-500" />
                    </div>
                    <TypewriterMessage 
                      content={currentResponse}
                      darkMode={darkMode}
                      onComplete={handleTypingComplete}
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Fixed Input & Button Section */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className={`
                      flex-1 p-2 rounded-lg
                      ${darkMode 
                        ? 'bg-gray-700/50 focus:bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 focus:bg-white border-gray-200'}
                      border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                      placeholder:opacity-50 text-sm
                    `}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim()}
                    className={`
                      p-2 rounded-lg transition-colors duration-200
                      ${
                        userInput.trim()
                          ? 'bg-blue-500 hover:bg-blue-400 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-500'
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <button
                  onClick={() => setShowingAIChat(false)}
                  className={`
                    w-full py-2 rounded-lg text-sm font-medium
                    transition-colors duration-200 flex items-center justify-center gap-2
                    ${darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white/90' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                  `}
                >
                  <MessageSquare size={14} />
                  <span>Contact Support Team</span>
                </button>
              </div>
            </div>
          ) : (
            // Original Feedback Form
            <div className="p-4">
              {isSubmitted && submissionData ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className={`rounded-full p-2 ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <CheckCircle2 size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Feedback Submitted!</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {submissionData.messageIntro}
                    </p>
                  </div>

                  <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className="font-medium mb-2 text-sm">Feedback Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Goal Achievement</span>
                        <p className="font-medium">{submissionData.ratingText}</p>
                      </div>
                      {submissionData.differentlyComment !== 'No suggestions provided' && (
                        <div>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Suggestions</span>
                          <p className="font-medium">{submissionData.differentlyComment}</p>
                        </div>
                      )}
                      {email && (
                        <div>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Email</span>
                          <p className="font-medium break-all">{submissionData.email}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-600/20">
                      Submitted on {submissionData.timestamp}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={() => setShowingAIChat(true)}
                    className={`
                      w-full py-2 rounded-lg text-sm font-medium
                      transition-colors duration-200 flex items-center justify-center gap-2
                      ${darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white/90' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                    `}
                  >
                    <Bot size={14} />
                    <span>Return to AI Assistant</span>
                  </button>

                  <div>
                    <p className="mb-3 text-sm font-medium">
                      Did you achieve your goal? *
                    </p>
                    <div className="flex justify-between gap-1">
                      {ratings.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            setRating(item.value);
                            setErrors({ ...errors, rating: null });
                          }}
                          className={`
                            flex flex-col items-center gap-0.5
                            p-1 rounded-lg transition-all duration-200
                            ${
                              rating === item.value 
                                ? (darkMode 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-blue-50 text-blue-500')
                                : 'hover:bg-gray-500/10'
                            }
                          `}
                        >
                          <span className="text-lg transition-transform duration-200 hover:scale-110">
                            {item.face}
                          </span>
                          <span className={`text-[10px] font-medium ${rating === item.value ? 'opacity-100' : 'opacity-70'}`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.rating}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium">What would you do differently?</p>
                    <textarea
                      value={differentlyComment}
                      onChange={(e) => setDifferentlyComment(e.target.value)}
                      placeholder="Share your suggestions..."
                      className={`
                        w-full p-3 rounded-lg resize-none h-24
                        transition-colors duration-200
                        ${
                          darkMode 
                            ? 'bg-gray-700/50 focus:bg-gray-700 border-gray-600'
                            : 'bg-gray-50 focus:bg-white border-gray-200'
                        }
                        border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        placeholder:opacity-50 text-sm
                      `}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Your email (optional)</p>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        For follow-up if needed
                      </span>
                    </div>
                    
                    <div className="relative">
                      <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={`
                          w-full pl-9 pr-3 py-2 rounded-lg
                          transition-colors duration-200
                          ${darkMode 
                            ? 'bg-gray-700/50 focus:bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 focus:bg-white border-gray-200'}
                          border focus:outline-none focus:ring-2 focus:ring-blue-500/50
                          placeholder:opacity-50 text-sm
                          ${errors.email ? 'border-red-400' : ''}
                        `}
                      />
                      
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showingAIChat && !isSubmitted && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSubmit}
              className={`
                w-full py-2 rounded-lg font-medium
                transition-all duration-200
                flex items-center justify-center gap-2
                bg-blue-500 hover:bg-blue-400 text-white text-sm
                ${errors.email ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={errors.email}
            >
              <span>Submit Feedback</span>
              <Send size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>
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
    </div>
  );
};

export default FeedbackModal;
