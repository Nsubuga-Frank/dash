import { Client } from '@gradio/client';
import { AlertCircle, Settings, Terminal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '../../../../../lib/utils';

const GradioTab = ({ 
  baseUrl, 
  modelId, 
  darkMode,
  deploymentDetails
}) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' or 'completion'

  // Advanced parameters
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    maxTokens: 150,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  });

  useEffect(() => {
    const initGradio = async () => {
      try {
        setLoading(true);
        const app = await Client.connect(baseUrl || deploymentDetails?.tunnelUrl);
        setClient(app);
      } catch (err) {
        console.error('Gradio connection error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initGradio();
  }, [baseUrl, deploymentDetails?.tunnelUrl]);

  const handleSubmit = async () => {
    if (!input.trim() || generating) return;

    setGenerating(true);
    const currentInput = input;
    setInput('');

    try {
      const result = await client.submit(
        mode === 'chat' ? '/v1/chat/completions' : '/v1/completions',
        mode === 'chat' ? [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...messages,
          { role: 'user', content: currentInput }
        ] : {
          prompt: currentInput,
          ...parameters
        }
      );

      const newMessages = mode === 'chat' ? [
        ...messages,
        { role: 'user', content: currentInput },
        { role: 'assistant', content: result.choices[0].message.content }
      ] : [
        ...messages,
        { type: 'prompt', content: currentInput },
        { type: 'completion', content: result.choices[0].text }
      ];

      setMessages(newMessages);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "p-4 rounded-lg text-center",
        darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
      )}>
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p className="font-medium">Failed to connect to Gradio</p>
        <p className="text-sm mt-1 opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mode Toggle */}
      <div className="p-4 border-b">
        <div className={cn(
          "inline-flex rounded-lg p-1 w-full",
          darkMode ? "bg-gray-800" : "bg-gray-100"
        )}>
          <button
            onClick={() => setMode('chat')}
            className={cn(
              "flex-1 py-2 px-3 rounded text-sm font-medium transition-colors",
              mode === 'chat' 
                ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                : (darkMode ? "text-gray-400" : "text-gray-600")
            )}
          >
            <Terminal className="w-4 h-4 inline-block mr-2" />
            Chat
          </button>
          <button
            onClick={() => setMode('completion')}
            className={cn(
              "flex-1 py-2 px-3 rounded text-sm font-medium transition-colors",
              mode === 'completion'
                ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                : (darkMode ? "text-gray-400" : "text-gray-600")
            )}
          >
            <Settings className="w-4 h-4 inline-block mr-2" />
            Completion
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn(
            "p-3 rounded-lg",
            msg.role === 'user' || msg.type === 'prompt'
              ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
              : (darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900 shadow")
          )}>
            <div className="text-sm font-medium mb-1">
              {msg.role || msg.type === 'prompt' ? 'User' : 'Assistant'}
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={`Enter your ${mode === 'chat' ? 'message' : 'prompt'}...`}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg border",
              darkMode 
                ? "bg-gray-800 border-gray-700 text-white" 
                : "bg-white border-gray-200 text-gray-900"
            )}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || generating}
            className={cn(
              "px-4 py-2 rounded-lg font-medium",
              generating
                ? (darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-400")
                : (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
            )}
          >
            {generating ? "Generating..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradioTab;