// Main ChatArea Component
import {
    Bot,
    Brush,
    ChevronDown,
    History,
    Loader2,
    Maximize,
    Mic,
    Minimize,
    PlusIcon,
    Send,
    Sparkles
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ModelSelectModal from './ModelSelectionError';

export default function ChatArea({
  darkMode,
  currentSession,
  setCurrentSession,
  onNewChat,
  onShowHistory,
  onClearChat,
  selectedChatModel,
  isExpanded,
  setIsExpanded,
  isRightSidebarOpen,
  onSendMessage,
  isLoading,
  error
}) {
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    } else {
      setShowScrollButton(true);
    }
  }, [currentSession?.messages, isNearBottom]);

  const handleScroll = () => {
    if (messagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
      const scrollFromBottom = scrollHeight - scrollTop - clientHeight;
      // More sensitive threshold (50px instead of 100px)
      const isNearBottom = scrollFromBottom < 50;
      setShowScrollButton(!isNearBottom);
      setIsNearBottom(isNearBottom);
    }
  };

  const scrollToBottom = (behavior = 'smooth') => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior
    });
  };

  // Helper function to detect GPT-2 model variants
  const detectModelVariant = (model) => {
    const modelId = (model.model_id || '').toLowerCase();
    const modelName = (model.name || '').toLowerCase();
    
    // Check for various GPT-2 patterns
    const isGpt2Base = modelId === 'gpt2' || modelName === 'gpt2' || modelId.includes('gpt2-small');
    const isGpt2Medium = modelId.includes('gpt2-medium') || modelName.includes('gpt2-medium');
    const isGpt2Large = modelId.includes('gpt2-large') || modelName.includes('gpt2-large');
    const isGpt2XL = modelId.includes('gpt2-xl') || modelName.includes('gpt2-xl');
    
    return {
      isGpt2: isGpt2Base || isGpt2Medium || isGpt2Large || isGpt2XL,
      isGpt2Base,
      isGpt2Medium,
      isGpt2Large,
      isGpt2XL,
      needsTextCompletion: isGpt2Medium || isGpt2Large || isGpt2XL
    };
  };

  // Gets the appropriate chat endpoint from the selected model
  const getChatEndpoint = (model) => {
    if (!model) return null;
    
    console.log('Getting chat endpoint for model:', model);

    // Detect model variant
    const modelVariant = detectModelVariant(model);
    console.log('Detected model variant:', modelVariant);

    // For private models with direct tunnelUrl
    if (model.type === 'private') {
      // Determine which endpoint to use
      const baseUrl = model.tunnelUrl || model.deployment?.tunnelUrl || '';
      
      // For GPT-2 Medium/Large/XL, use completions endpoint
      if (modelVariant.needsTextCompletion) {
        const completionsEndpoint = `${baseUrl}/v1/completions`;
        console.log('Using completions endpoint for GPT-2 variant:', completionsEndpoint);
        return completionsEndpoint;
      }
      
      // For regular models, use chat completions
      // First try direct tunnelUrl property
      if (model.tunnelUrl) {
        const chatEndpoint = `${model.tunnelUrl}/v1/chat/completions`;
        console.log('Using model.tunnelUrl for chat endpoint:', chatEndpoint);
        return chatEndpoint;
      }
      
      // Then try deployment.tunnelUrl
      if (model.deployment?.tunnelUrl) {
        const chatEndpoint = `${model.deployment.tunnelUrl}/v1/chat/completions`;
        console.log('Using model.deployment.tunnelUrl for chat endpoint:', chatEndpoint);
        return chatEndpoint;
      }
      
      // Then try endpoints.chat if available
      if (model.deployment?.endpoints?.chat) {
        console.log('Using model.deployment.endpoints.chat:', model.deployment.endpoints.chat);
        return model.deployment.endpoints.chat;
      }
      
      // For container models
      if (model.modelType === 'container' && model.containerUrl) {
        return `${model.containerUrl}/v1/chat/completions`;
      }
    }
    
    return null;
  };

  // Prepares request body based on the model
  const prepareRequestBody = (message, model, messageHistory = []) => {
    // Detect model variant
    const modelVariant = detectModelVariant(model);
    
    // For GPT-2 Medium/Large/XL, use text completion API instead of chat
    if (modelVariant.needsTextCompletion) {
      console.log('Using text completion format for GPT-2 variant:', modelVariant);
      
      // Format conversation history into a single text prompt
      let textPrompt = "System: You are a helpful assistant.\n";
      
      // Add conversation history
      messageHistory.forEach(msg => {
        if (msg.type === 'user') {
          textPrompt += `User: ${msg.content}\n`;
        } else if (msg.type === 'assistant') {
          textPrompt += `Assistant: ${msg.content}\n`;
        }
      });
      
      // Add current message
      textPrompt += `User: ${message}\nAssistant:`;
      
      // Estimate token count - rough approximation (4 chars ~= 1 token)
      const estimatedPromptTokens = Math.ceil(textPrompt.length / 4);
      
      // GPT-2 variants have different context lengths
      let contextLength = 1024; // Default for GPT-2 Large
      if (modelVariant.isGpt2XL) {
        contextLength = 1024; // XL also has 1024 token limit
      }
      
      // Calculate max tokens available for completion (with buffer)
      const maxCompletionTokens = Math.max(100, contextLength - estimatedPromptTokens - 10); // 10 token buffer
      console.log(`Estimated prompt tokens: ${estimatedPromptTokens}, Max completion tokens: ${maxCompletionTokens}`);
      
      // Return text completion format with model ID
      const requestBody = {
        model: model.model_id || model.deployment?.modelId || 'gpt2',  // Include model ID
        prompt: textPrompt,
        max_tokens: maxCompletionTokens,
        temperature: 0.9,
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stop: ["\nUser:", "\nAssistant:"]
      };
      
      console.log('GPT-2 variant request body:', requestBody);
      return requestBody;
    }
    
    // Standard OpenAI-compatible chat format for other models
    let formattedMessages = [];
    
    // Add system message if not already present
    if (!messageHistory.some(msg => msg.type === 'system')) {
      formattedMessages.push({
        role: 'system',
        content: 'You are a helpful assistant.'
      });
    }
    
    // Add conversation history
    formattedMessages = formattedMessages.concat(messageHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : (msg.type === 'system' ? 'system' : 'assistant'),
      content: msg.content
    })));
    
    // Add current message
    formattedMessages.push({
      role: 'user',
      content: message
    });
    
    // Basic OpenAI-compatible request body with enhanced parameters
    const requestBody = {
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.9,
      top_p: 0.95,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stop: ["\nUser:", "\nAssistant:"]
    };
    
    // Add model identifier if needed
    if (model.model_id) {
      requestBody.model = model.model_id;
    }
    
    // Add chat template for certain models (like the GPT-2 model in the example)
    if (model.model_id && (model.model_id.includes('gpt2') || model.name?.toLowerCase().includes('gpt2'))) {
      requestBody.chat_template = "System: {system}\nUser: {user}\nAssistant: {assistant}";
    }
    
    console.log('Prepared request body for model:', model);
    return requestBody;
  };

  // Function to send message to a private model
  const sendToPrivateModel = async (message) => {
    const endpoint = getChatEndpoint(selectedChatModel);
    
    if (!endpoint) {
      throw new Error(`No valid endpoint found for model: ${selectedChatModel.name}. Make sure the model has a valid tunnelUrl.`);
    }
    
    // Detect model variant
    const modelVariant = detectModelVariant(selectedChatModel);
    
    // Get previous messages for context
    const messageHistory = currentSession?.messages || [];
    
    // Prepare request body
    const requestBody = prepareRequestBody(message, selectedChatModel, messageHistory);
    
    console.log(`Sending to private model: ${selectedChatModel.name} (${selectedChatModel.model_id})`);
    console.log(`Endpoint: ${endpoint}`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Model variant:', modelVariant);
    console.log('Model details:', selectedChatModel);
    
    try {
      // Make the API call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'bypass-tunnel-reminder': 'true' // Add this header to bypass tunnel authentication
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response Status:', response.status);
        console.error('API Error Response Headers:', Object.fromEntries([...response.headers.entries()]));
        console.error('API Error Response Body:', errorData);
        
        try {
          // Try to parse error as JSON to get more details
          const errorJson = JSON.parse(errorData);
          console.error('Parsed Error:', errorJson);
          throw new Error(`API request failed with status ${response.status}: ${errorJson.message || JSON.stringify(errorJson)}`);
        } catch (e) {
          // If parsing fails, use the raw error text
          throw new Error(`API request failed with status ${response.status}: ${errorData.substring(0, 200)}${errorData.length > 200 ? '...' : ''}`);
        }
      }
      
      // Log raw response for debugging
      const responseText = await response.text();
      console.log('Raw API Response:', responseText);
      
      // Parse JSON response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response from private model:', data);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        throw new Error(`Failed to parse response from model: ${e.message}. Raw response: ${responseText.substring(0, 100)}...`);
      }
      
      // Extract response based on API format
      let assistantMessage = '';
      
      if (modelVariant.needsTextCompletion) {
        // Handle text completion response
        if (data.choices && data.choices.length > 0) {
          assistantMessage = data.choices[0].text || '';
          console.log('Extracted text from completion:', assistantMessage);
        } else if (data.text) {
          assistantMessage = data.text;
        }
      } else {
        // Handle chat completion response
        if (data.choices && data.choices.length > 0) {
          if (data.choices[0].message && data.choices[0].message.content) {
            // Standard chat completion format
            assistantMessage = data.choices[0].message.content;
          } else if (data.choices[0].text) {
            // Text completion format
            assistantMessage = data.choices[0].text;
          } else if (typeof data.choices[0] === 'string') {
            // Direct string response
            assistantMessage = data.choices[0];
          }
        } else if (data.response) {
          // Some APIs may use a direct response field
          assistantMessage = data.response;
        } else if (data.output) {
          // Some APIs may use an output field
          assistantMessage = data.output;
        }
      }
      
      if (!assistantMessage) {
        console.warn('Could not extract assistant message from response:', data);
        assistantMessage = 'The model returned an empty or invalid response. Please check the console logs for details.';
      }
      
      return assistantMessage;
    } catch (error) {
      console.error('Error sending to private model:', error);
      throw new Error(`Failed to communicate with private model (${selectedChatModel.name}): ${error.message}`);
    }
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setLocalError(null);
    
    try {
      // Add user message immediately
      const newMessage = {
        type: 'user',
        content: trimmed,
        timestamp: new Date().toISOString()
      };

      setCurrentSession(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), newMessage],
      }));
      
      setInputValue('');
      scrollToBottom();

      // Handle private models with direct API calls
      if (selectedChatModel?.type === 'private') {
        try {
          console.log('Using private model:', selectedChatModel);
          
          // Show a temporary "thinking" message
          const tempThinkingId = `thinking-${Date.now()}`;
          setCurrentSession(prev => ({
            ...prev,
            messages: [...prev.messages, {
              id: tempThinkingId,
              type: 'assistant',
              content: '...',
              timestamp: new Date().toISOString(),
              model: selectedChatModel.name,
              isThinking: true
            }],
          }));
          
          // Get response from private model
          const assistantResponse = await sendToPrivateModel(trimmed);
          
          // Replace the temporary message with the actual response
          setCurrentSession(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === tempThinkingId 
                ? {
                    type: 'assistant',
                    content: assistantResponse,
                    timestamp: new Date().toISOString(),
                    model: selectedChatModel.name
                  }
                : msg
            ),
          }));
          
        } catch (privateModelError) {
          console.error('Private model error:', privateModelError);
          
          // Remove the thinking message if it exists
          setCurrentSession(prev => ({
            ...prev,
            messages: prev.messages.filter(msg => !msg.isThinking),
          }));
          
          // Show error message
          setLocalError(`Error with private model: ${privateModelError.message}`);
        }
      } else {
        // For public models, use the parent component's handler
        await onSendMessage(trimmed);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setLocalError(err.message);
      
      // Remove any "thinking" messages and keep the user message
      setCurrentSession(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.type === 'user' || !msg.isThinking),
      }));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // Handler for New Chat button click
  const handleNewChatClick = () => {
    if (!selectedChatModel) {
      setIsModalOpen(true);
    } else {
      onNewChat();
    }
  };

  // Main chat interface
  return (
    <div className={`
      fixed 
      inset-0 
      flex flex-col
      top-[4rem] 
      bottom-16
      ${darkMode ? 'bg-[#1b212c]' : 'bg-white'}
      transition-all duration-300
      ${isExpanded ? 'ml-60' : 'ml-20'}
      ${isRightSidebarOpen ? 'mr-64' : 'mr-16'}
      rounded-xl
      shadow-lg
      ${darkMode ? 'border border-gray-800' : 'border border-gray-200'}
    `}>
      {/* Chat Header */}
      <div className={`
        flex-none flex items-center justify-between 
        p-4 border-b
        ${darkMode ? 'border-gray-800' : 'border-gray-200'}
      `}>
        <div className="flex items-center gap-4">
          <h1 className={`
            text-xl font-semibold px-3 rounded-lg
            ${darkMode ? 'text-white bg-slate-800' : 'text-gray-900 bg-slate-100'}
          `}>
            {currentSession?.name || 'New Chat'}
          </h1>
          {selectedChatModel && (
            <div className={`
              px-3 py-1 rounded-lg flex items-center gap-2
              ${darkMode 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-blue-50 text-blue-600 border border-blue-100'
              }
            `}>
              <Bot className="w-4 h-4" />
              <span className="text-sm font-medium">{selectedChatModel.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChatClick}
            className={`
              p-2 rounded-lg transition-colors
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'}
            `}
            aria-label="Start New Chat"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onShowHistory}
            className={`
              p-2 rounded-lg transition-colors
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'}
            `}
            aria-label="Show History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onClearChat}
            className={`
              p-2 rounded-lg transition-colors
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'}
            `}
            aria-label="Clear Chat"
          >
            <Brush className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className={`
              p-2 rounded-lg transition-colors
              ${darkMode 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-700'}
            `}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Minimize Chat Area' : 'Fullscreen Chat Area'}
          >
            {isExpanded ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages Section */}
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        className={`
          relative flex-1 overflow-y-auto
          ${darkMode 
            ? 'bg-gradient-to-b from-[#1b212c] to-[#1b212c]/95' 
            : 'bg-gradient-to-b from-white to-gray-50'}
        `}
      >
        <div className="absolute inset-0 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {!selectedChatModel && (
            <div className={`
              flex flex-col items-center justify-center h-full space-y-4
              ${darkMode ? 'text-gray-300' : 'text-gray-600'}
            `}>
              <div className={`
                p-4 rounded-full mx-auto w-fit
                ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}
              `}>
                <Sparkles className={`
                  w-8 h-8
                  ${darkMode ? 'text-blue-400' : 'text-blue-500'}
                `} />
              </div>
              <p className="text-lg font-medium text-center">Please select a model to start chatting</p>
            </div>
          )}

          {currentSession?.messages?.length > 0 && 
            currentSession.messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isLast={index === currentSession.messages.length - 1}
                isLoading={isLoading && index === currentSession.messages.length - 1}
                darkMode={darkMode}
                modelName={selectedChatModel?.name || 'AI Assistant'}
              />
            ))
          }

          {(error || localError) && (
            <div className={`
              p-4 rounded-lg text-center transform transition-all duration-300
              ${darkMode 
                ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                : 'bg-red-50 border border-red-100 text-red-600'}
            `}>
              {error || localError}
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className={`
            fixed bottom-28 right-8 
            p-2.5
            bg-blue-500 hover:bg-blue-600 
            rounded-full 
            shadow-lg 
            transition-all duration-200 
            transform hover:scale-105
            z-50
            flex items-center justify-center
            text-white
            border border-blue-400/20
            ${darkMode ? 'shadow-blue-500/20' : 'shadow-blue-500/30'}
          `}
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}

      {/* Input Bar */}
      <div className={`
        flex-none p-4 border-t
        ${darkMode ? 'border-gray-800' : 'border-gray-200'}
      `}>
        <div className={`
          rounded-xl p-2 flex items-center gap-2
          ${darkMode ? 'bg-[#3a4558]' : 'bg-gray-100'}
          transition-colors duration-200
        `}>
          <button 
            className={`
              p-2 rounded-lg transition-colors
              ${darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-200 text-gray-700'}
              ${!selectedChatModel ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={!selectedChatModel}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder={selectedChatModel ? "Type a message..." : "Select a model to start chatting..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && selectedChatModel) {
                handleSend();
              }
            }}
            disabled={isSending || !selectedChatModel}
            className={`
              flex-1 bg-transparent border-none outline-none
              ${darkMode ? 'text-gray-200' : 'text-gray-900'}
              ${darkMode ? 'placeholder-gray-500' : 'placeholder-gray-400'}
              disabled:opacity-50
            `}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending || !selectedChatModel}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${inputValue.trim() && !isSending && selectedChatModel
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="text-sm opacity-75">⌘↵</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ModelSelectModal
        darkMode={darkMode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f3f4f6'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#d1d5db'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6b7280' : '#9ca3af'};
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

ChatArea.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  currentSession: PropTypes.object,
  setCurrentSession: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
  onShowHistory: PropTypes.func.isRequired,
  onClearChat: PropTypes.func.isRequired,
  selectedChatModel: PropTypes.shape({
    id: PropTypes.string,
    model_id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    provider: PropTypes.string,
    type: PropTypes.string,
    modelType: PropTypes.string,
    deployment: PropTypes.object,
    tunnelUrl: PropTypes.string
  }),
  isExpanded: PropTypes.bool.isRequired,
  setIsExpanded: PropTypes.func.isRequired,
  isRightSidebarOpen: PropTypes.bool.isRequired,
  onSendMessage: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};