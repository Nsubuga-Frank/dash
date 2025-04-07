import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Client } from '@gradio/client';
import { AlertCircle, Code, SendHorizontal, Terminal, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const GradioInterface = ({ baseUrl, modelId, onClose }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('chat'); // 'chat' or 'completion'
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setLoading(true);
        const app = await Client.connect(baseUrl);
        setClient(app);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeClient();
  }, [baseUrl]);

  const handleSubmit = async () => {
    if (!input.trim() || generating) return;

    setGenerating(true);
    const currentInput = input;
    setInput('');

    try {
      if (mode === 'chat') {
        setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
        
        const submission = client.submit("/v1/chat/completions", {
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...messages,
            { role: "user", content: currentInput }
          ]
        });

        for await (const update of submission) {
          if (update.type === 'data') {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: update.data?.choices?.[0]?.message?.content || 'No response generated.'
            }]);
          }
        }
      } else {
        const submission = client.submit("/v1/completions", {
          prompt: currentInput
        });

        setMessages(prev => [...prev, { 
          role: 'user', 
          content: currentInput,
          type: 'completion'
        }]);

        for await (const update of submission) {
          if (update.type === 'data') {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: update.data?.choices?.[0]?.text || 'No completion generated.',
              type: 'completion'
            }]);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{modelId}</h1>
          <p className="text-sm text-gray-500">Model Playground</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border p-1">
            <button
              onClick={() => setMode('chat')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                mode === 'chat' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Terminal className="w-4 h-4 inline-block mr-2" />
              Chat
            </button>
            <button
              onClick={() => setMode('completion')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                mode === 'completion' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-4 h-4 inline-block mr-2" />
              Completion
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-900'
              }`}
            >
              <div className="text-sm mb-1 opacity-70">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {generating && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={mode === 'chat' ? "Send a message..." : "Enter text to complete..."}
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={generating}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradioInterface;