import { Loader2, RefreshCw, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../../../../lib/utils';

const Message = ({ content, role, darkMode }) => (
  <div
    className={cn(
      'py-2 px-3 rounded-lg max-w-[85%] text-sm',
      role === 'user'
        ? 'ml-auto bg-blue-500 text-white'
        : darkMode
        ? 'bg-gray-800 text-gray-200'
        : 'bg-gray-100 text-gray-800'
    )}
  >
    {content}
  </div>
);

const ModelPlayground = ({ darkMode, apiEndpoint, token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = async () => {
    try {
      console.log('Using token:', token);

      // Make sure there's exactly one space after 'Bearer'
      const authHeader = `Bearer ${token.trim()}`;
      console.log('Auth header:', authHeader);

      // Send token in X-API-Key header as expected by the server
      const response = await fetch(`${apiEndpoint}/chats`, {
        method: 'POST',
        headers: {
          'X-API-Key': token.trim(), // Use the token directly in X-API-Key header
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'bypass-tunnel-reminder': 'true'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to create chat: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Chat created successfully:', data);
      setChatId(data.chat_id);
      setMessages([]);
      setError(null);
    } catch (err) {
      setError('Failed to create new chat session');
      console.error('Error creating chat:', err);
    }
  };

  useEffect(() => {
    if (token) {
      console.log('Token received, creating new chat');
      createNewChat();
    }
  }, [token]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !chatId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // Encode the prompt in the URL
      const url = new URL(`${apiEndpoint}/chat/${chatId}/message`);
      url.searchParams.append('prompt', userMessage);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'X-API-Key': token.trim(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'bypass-tunnel-reminder': 'true'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url.toString() // Log the full URL for debugging
        });
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantMessage += data.text;
                // Update messages with partial response
                setMessages((prev) => {
                  const newMessages = [...prev];
                  // Update or add assistant message
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  } else {
                    newMessages.push({ role: 'assistant', content: assistantMessage });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.warn('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to get model response');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'text-sm font-medium',
                darkMode ? 'text-gray-200' : 'text-gray-700'
              )}
            >
              Model Playground
            </h3>
            
            {/* Beta indicator */}
            <div className="relative group">
              <div className={cn(
                "inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
                "text-white shadow-sm hover:shadow-md transition-all duration-300"
              )}
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease infinite'
              }}>
                BETA
              </div>
              
              <div className={cn(
                "absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 rounded z-50",
                "bg-gray-800 text-white text-[10px] whitespace-nowrap",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "pointer-events-none shadow-lg"
              )}>
                This playground is in beta testing
              </div>
            </div>
          </div>
          <button
            onClick={createNewChat}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              darkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-700'
            )}
            title="New chat"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <p
          className={cn(
            'text-xs mt-1',
            darkMode ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          Test your deployed model with interactive chat
        </p>
      </div>

      {/* Messages Area */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <Message key={idx} content={msg.content} role={msg.role} darkMode={darkMode} />
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        )}
        {error && (
          <div
            className={cn(
              'text-xs text-center p-2 rounded',
              darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50'
            )}
          >
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={cn(
              'flex-1 text-sm rounded-md p-2 outline-none transition-colors',
              darkMode
                ? 'bg-gray-900 text-gray-200 placeholder:text-gray-500'
                : 'bg-white text-gray-900 placeholder:text-gray-400'
            )}
            disabled={!token || isLoading}
          />
          <button
            type="submit"
            disabled={!token || !input.trim() || isLoading}
            className={cn(
              'p-2 rounded-md transition-colors',
              token && input.trim() && !isLoading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : darkMode
                ? 'bg-gray-800 text-gray-600'
                : 'bg-gray-200 text-gray-400'
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
    

      {/* Scrollbar Styles */}
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

      {/* Add gradient animation styles */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export default ModelPlayground;
