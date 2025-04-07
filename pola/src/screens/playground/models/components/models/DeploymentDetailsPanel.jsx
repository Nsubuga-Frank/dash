import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Clock, Code, Copy, ExternalLink, Globe, Server, Terminal, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { cn } from '../../../../../lib/utils';
import db from '../../../../firebase/config';

const DeploymentDetailsPanel = ({
  deployment,
  darkMode,
  onClose,
  onPlaygroundOpen
}) => {
  // State declarations
  const [deploymentDetails, setDeploymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(null);

  // Chat tab states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Language selection states for endpoint examples
  const [chatLang, setChatLang] = useState("python");
  const [completionsLang, setCompletionsLang] = useState("python");
  const [embeddingsLang, setEmbeddingsLang] = useState("python");

  // Advanced chat parameters states
  const [chatMaxTokens, setChatMaxTokens] = useState(150);
  const [chatTemperature, setChatTemperature] = useState(0.9);
  const [chatTopP, setChatTopP] = useState(0.95);
  const [chatFrequencyPenalty, setChatFrequencyPenalty] = useState(0.1);
  const [chatPresencePenalty, setChatPresencePenalty] = useState(0.1);

  // New state for panel expansion (width toggle)
  const [isExpanded, setIsExpanded] = useState(false);
  const togglePanelWidth = () => {
    setIsExpanded(prev => !prev);
  };

  useEffect(() => {
    const fetchDeploymentDetails = async () => {
      try {
        setLoading(true);
        const deploymentId = deployment.deploymentId;
        const deploymentRef = doc(db, 'deployments', deploymentId);
        const deploymentSnapshot = await getDoc(deploymentRef);

        if (deploymentSnapshot.exists()) {
          setDeploymentDetails(deploymentSnapshot.data());
          console.log("Deployments fetched: 1");
        } else {
          console.warn(`No deployment found with ID: ${deploymentId}`);
          setDeploymentDetails(deployment);
          console.log("Deployments fetched: 0 (using fallback deployment)");
        }
      } catch (err) {
        console.error('Error fetching deployment details:', err);
        setError(err.message);
        console.log("Error fetching deployment details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (deployment) {
      fetchDeploymentDetails();
    }
  }, [deployment]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // For toggling between chat and text completion modes
  const [activeCompletionMode, setActiveCompletionMode] = useState('chat');

  // States for text completions
  const [textPrompt, setTextPrompt] = useState('');
  const [textCompletions, setTextCompletions] = useState([]);
  const [textCompletionLoading, setTextCompletionLoading] = useState(false);
  const [textCompletionError, setTextCompletionError] = useState(null);

  // States for text completion parameters (separate from chat parameters)
  const [textMaxTokens, setTextMaxTokens] = useState(150);
  const [textTemperature, setTextTemperature] = useState(0.9);
  const [textTopP, setTextTopP] = useState(0.95);
  const [textFrequencyPenalty, setTextFrequencyPenalty] = useState(0.1);
  const [textPresencePenalty, setTextPresencePenalty] = useState(0.1);

  // Function to handle text completion
  const handleTextCompletion = async () => {
    if (!textPrompt.trim()) return;

    setTextCompletionLoading(true);
    setTextCompletionError(null);

    const url = deploymentDetails?.endpoints?.completions ||
      `${deploymentDetails?.tunnelUrl || deploymentDetails?.endpoints?.base_url || ''}/v1/completions`;
    console.log("Sending text completion request to " + url);

    try {
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'bypass-tunnel-reminder': 'true'
          },
          body: JSON.stringify({
            model: deploymentDetails?.modelId || deploymentDetails?.apiName,
            prompt: textPrompt,
            max_tokens: textMaxTokens,
            temperature: textTemperature,
            top_p: textTopP,
            frequency_penalty: textFrequencyPenalty,
            presence_penalty: textPresencePenalty
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      try {
        const data = JSON.parse(responseText);
        console.log("Parsed JSON response:", data);

        if (data.choices && data.choices[0] && data.choices[0].text) {
          const completionText = data.choices[0].text;
          console.log("Completion text:", completionText);

          // Add the new completion to the list
          setTextCompletions(prev => [
            ...prev,
            {
              prompt: textPrompt,
              completion: completionText,
              timestamp: new Date().toISOString()
            }
          ]);

          // Clear the prompt input
          setTextPrompt('');
        } else {
          console.error("Unexpected response structure:", data);
          setTextCompletionError("Received unexpected response format from the model.");
        }
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError, "Raw text:", responseText);
        setTextCompletionError("Error parsing response from the model. See console for details.");
      }
    } catch (err) {
      console.error("Request error:", err);
      setTextCompletionError(err.message);
    } finally {
      setTextCompletionLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = { role: 'user', content: chatInput.trim() };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    const url = deploymentDetails?.endpoints?.chat ||
      `${deploymentDetails?.tunnelUrl || deploymentDetails?.endpoints?.base_url || ''}/v1/chat/completions`;
    console.log("Sending chat request to " + url);

    try {
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'bypass-tunnel-reminder': 'true'
          },
          body: JSON.stringify({
            model: deploymentDetails?.modelId || deploymentDetails?.apiName,
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              ...updatedMessages
            ],
            max_tokens: chatMaxTokens,
            temperature: chatTemperature,
            top_p: chatTopP,
            frequency_penalty: chatFrequencyPenalty,
            presence_penalty: chatPresencePenalty,
            chat_template: "System: {system}\nUser: {user}\nAssistant: {assistant}",
            stop: ["\nUser:", "\nAssistant:"]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      try {
        const data = JSON.parse(responseText);
        console.log("Parsed JSON response:", data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
          const assistantMessage = data.choices[0].message;
          console.log("Assistant message:", assistantMessage);
          setChatMessages(prev => [...prev, assistantMessage]);
        } else {
          console.error("Unexpected response structure:", data);
          setChatError("Received unexpected response format from the model.");
        }
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError, "Raw text:", responseText);
        setChatError("Error parsing response from the model. See console for details.");
      }
    } catch (err) {
      console.error("Request error:", err);
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const [gradioUrl, setGradioUrl] = useState(null);
  const [gradioError, setGradioError] = useState(null);
  const [gradioLoading, setGradioLoading] = useState(false);  // NEW loading state

  // Function to handle Gradio interface creation remains the same:
  const createGradioInterface = async () => {
    const baseUrl = deploymentDetails?.tunnelUrl || deploymentDetails?.endpoints?.base_url;
    if (!baseUrl) {
      setGradioError("No base URL available for deployment");
      return null;
    }

    try {
      setGradioLoading(true);

      const payload = {
        deployment_id: deployment.deploymentId,
        base_url: baseUrl,
        model_id: deploymentDetails.modelId || deploymentDetails.apiName,
      };

      console.log('====================================');
      console.log('Creating gradio interface with payload: ', payload);
      console.log('====================================');

      // Create interface and wait for response
      const response = await fetch("https://gradio-server.onrender.com/interfaces/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create Gradio interface: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Gradio interface response:", data);

      if (!data.share_url) {
        // If no share_url immediately, poll for it
        let retries = 0;
        const maxRetries = 30;

        while (retries < maxRetries) {
          const statusResponse = await fetch(`https://gradio-server.onrender.com/interfaces/${deployment.deploymentId}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.share_url) {
              console.log("Got share URL:", statusData.share_url);
              setGradioUrl(statusData.share_url);
              setGradioError(null);
              return statusData.share_url;
            }
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
        }
        throw new Error("Could not get public URL after maximum retries");
      }

      // If we got the share_url immediately
      console.log("Opening Gradio interface at:", data.share_url);
      setGradioUrl(data.share_url);
      setGradioError(null);
      return data.share_url;

    } catch (err) {
      console.error("Error creating Gradio interface:", err);
      setGradioError(err.message);
      return null;
    } finally {
      setGradioLoading(false);
    }
  };

  // Wrapper to render content with a blurred background that dismisses the panel on click
  const renderWrapper = (content) => (
    <div
      className="fixed inset-0 z-20 bg-black/20 backdrop-blur-none"
      onClick={onClose}
    >
      {content}
    </div>
  );

  // Loading state
  if (loading) {
    return renderWrapper(
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className={cn(
          "fixed top-16 right-0 bottom-16 shadow-xl z-30 flex flex-col transition-all duration-300",
          isExpanded ? "w-[60rem]" : "w-[40rem]",
          darkMode ? "bg-[#141824] border-l border-gray-800" : "bg-white border-l border-gray-200"
        )}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </motion.div>
    );
  } else if (error) {
    return renderWrapper(
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className={cn(
          "fixed top-16 right-0 bottom-16 shadow-xl z-30 flex flex-col p-4 transition-all duration-300",
          isExpanded ? "w-[60rem]" : "w-[32rem]",
          darkMode ? "bg-[#141824] border-l border-gray-800" : "bg-white border-l border-gray-200"
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={cn("font-semibold", darkMode ? "text-white" : "text-gray-800")}>
            Error
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded-full hover:bg-opacity-10",
              darkMode ? "hover:bg-gray-300 text-gray-400" : "hover:bg-gray-200 text-gray-600"
            )}
          >
            <X size={18} />
          </button>
        </div>
        <div className={cn(
          "flex-1 flex flex-col items-center justify-center text-center p-4 rounded-lg",
          darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
        )}>
          <AlertCircle size={48} className="mb-4 opacity-80" />
          <p className="mb-2 font-medium">Failed to load deployment details</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </motion.div>
    );
  } else if (!deploymentDetails) {
    return null;
  }

  const {
    modelId,
    status,
    createdAt,
    tunnelUrl,
    containerDetails = {},
    apiName,
    endpoints = {},
    deploymentCompleted,
    deploymentDuration
  } = deploymentDetails;

  const baseUrl = tunnelUrl || endpoints?.base_url || '';

  // Code examples for Chat Completions
  const pythonChatExample = `import requests

url = "${endpoints?.chat || `${baseUrl}/v1/chat/completions`}"
headers = {"Content-Type": "application/json"}

payload = {
    "model": "${modelId || apiName}",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, what can you do?"}
    ],
    "chat_template": "System: {system}\\nUser: {user}\\nAssistant: {assistant}",
    "max_tokens": 150,
    "temperature": 0.9,
    "top_p": 0.95,
    "frequency_penalty": 0.1,
    "presence_penalty": 0.1,
    "stop": ["\\nUser:", "\\nAssistant:"]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;

  const curlChatExample = `curl -X POST \\
  "${endpoints?.chat || `${baseUrl}/v1/chat/completions`}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId || apiName}",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello, what can you do?"}
    ],
    "chat_template": "System: {system}\\nUser: {user}\\nAssistant: {assistant}",
    "max_tokens": 150,
    "temperature": 0.9,
    "top_p": 0.95,
    "frequency_penalty": 0.1,
    "presence_penalty": 0.1,
    "stop": ["\\nUser:", "\\nAssistant:"]
  }'`;

  const javascriptChatExample = `const response = await fetch("${endpoints?.chat || `${baseUrl}/v1/chat/completions`}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "${modelId || apiName}",
    messages: [
      {role: "system", content: "You are a helpful assistant."},
      {role: "user", content: "Hello, what can you do?"}
    ],
    chat_template: "System: {system}\\nUser: {user}\\nAssistant: {assistant}",
    max_tokens: 150,
    temperature: 0.9,
    top_p: 0.95,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    stop: ["\\nUser:", "\\nAssistant:"]
  })
});
const data = await response.json();
console.log(data);`;

  // Code examples for Completions
  const pythonCompletionExample = `import requests

url = "${endpoints?.completions || `${baseUrl}/v1/completions`}"
headers = {"Content-Type": "application/json"}

payload = {
    "model": "${modelId || apiName}",
    "prompt": "Once upon a time,",
    "max_tokens": 150,
    "temperature": 0.9,
    "top_p": 0.95,
    "frequency_penalty": 0.1,
    "presence_penalty": 0.1
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;

  const curlCompletionExample = `curl -X POST \\
  "${endpoints?.completions || `${baseUrl}/v1/completions`}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId || apiName}",
    "prompt": "Once upon a time,",
    "max_tokens": 150,
    "temperature": 0.9,
    "top_p": 0.95,
    "frequency_penalty": 0.1,
    "presence_penalty": 0.1
  }'`;

  const javascriptCompletionExample = `const response = await fetch("${endpoints?.completions || `${baseUrl}/v1/completions`}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "${modelId || apiName}",
    prompt: "Once upon a time,",
    max_tokens: 150,
    temperature: 0.9,
    top_p: 0.95,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  })
});
const data = await response.json();
console.log(data);`;

  // Code examples for Embeddings
  const pythonEmbeddingsExample = `import requests

url = "${endpoints?.embeddings || `${baseUrl}/v1/embeddings`}"
headers = {"Content-Type": "application/json"}

payload = {
    "model": "${modelId || apiName}",
    "input": "Your text here"
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;

  const curlEmbeddingsExample = `curl -X POST \\
  "${endpoints?.embeddings || `${baseUrl}/v1/embeddings`}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId || apiName}",
    "input": "Your text here"
  }'`;

  const javascriptEmbeddingsExample = `const response = await fetch("${endpoints?.embeddings || `${baseUrl}/v1/embeddings`}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "${modelId || apiName}",
    input: "Your text here"
  })
});
const data = await response.json();
console.log(data);`;

  return renderWrapper(
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        "fixed top-16 right-0 bottom-16 shadow-xl z-30 flex flex-col transition-all duration-300",
        isExpanded ? "w-[60rem]" : "w-[40rem]",
        darkMode ? "bg-[#141824] border-l border-gray-800" : "bg-white border-l border-gray-200"
      )}
    >
      {/* Header with toggle button */}
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-900/10 to-purple-900/10">
        <div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center",
              status === 'active'
                ? (darkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-600")
                : (darkMode ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-600")
            )}>
              {status === 'active' ? <CheckCircle size={14} /> : <Clock size={14} />}
            </div>
            <h2 className={cn("font-semibold", darkMode ? "text-white" : "text-gray-800")}>
              {apiName || modelId}
            </h2>
          </div>
          <div className={cn("text-xs mt-0.5", darkMode ? "text-gray-400" : "text-gray-500")}>
            {deploymentDetails.modelId}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePanelWidth}
            className={cn(
              "p-1 rounded-full hover:bg-opacity-10",
              darkMode ? "hover:bg-gray-300 text-gray-400" : "hover:bg-gray-200 text-gray-600"
            )}
          >
            {isExpanded ?
              <ArrowRight size={18} /> :
              <ArrowLeft size={18} />
            }
          </button>
          <button
            onClick={onClose}
            className={cn(
              "p-1 rounded-full hover:bg-opacity-10",
              darkMode ? "hover:bg-gray-300 text-gray-400" : "hover:bg-gray-200 text-gray-600"
            )}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={cn(
        "flex border-b",
        darkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <button
          className={cn(
            "flex-1 py-2 text-xs font-medium border-b-2 transition-colors",
            activeTab === 'overview'
              ? (darkMode ? "border-blue-500 text-blue-400" : "border-blue-500 text-blue-600")
              : (darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700")
          )}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={cn(
            "flex-1 py-2 text-xs font-medium border-b-2 transition-colors",
            activeTab === 'endpoints'
              ? (darkMode ? "border-blue-500 text-blue-400" : "border-blue-500 text-blue-600")
              : (darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700")
          )}
          onClick={() => setActiveTab('endpoints')}
        >
          Endpoints
        </button>
        <button
          className={cn(
            "flex-1 py-2 text-xs font-medium border-b-2 transition-colors",
            activeTab === 'examples'
              ? (darkMode ? "border-blue-500 text-blue-400" : "border-blue-500 text-blue-600")
              : (darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700")
          )}
          onClick={() => setActiveTab('examples')}
        >
          Examples
        </button>
        <button
          className={cn(
            "flex-1 py-2 text-xs font-medium border-b-2 transition-colors",
            activeTab === 'chat'
              ? (darkMode ? "border-blue-500 text-blue-400" : "border-blue-500 text-blue-600")
              : (darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700")
          )}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-4 space-y-6">
            <div className={cn(
              "rounded-lg p-3 text-sm",
              status === 'active'
                ? (darkMode ? "bg-green-900/10 border border-green-900/30" : "bg-green-50 border border-green-100")
                : (darkMode ? "bg-yellow-900/10 border border-yellow-900/30" : "bg-yellow-50 border border-yellow-100")
            )}>
              <div className="flex items-center gap-2 mb-2">
                {status === 'active'
                  ? <CheckCircle className={darkMode ? "text-green-400" : "text-green-500"} size={16} />
                  : <Clock className={darkMode ? "text-yellow-400" : "text-yellow-500"} size={16} />
                }
                <span className={cn(
                  "font-medium",
                  status === 'active'
                    ? (darkMode ? "text-green-400" : "text-green-600")
                    : (darkMode ? "text-yellow-400" : "text-yellow-600")
                )}>
                  {status === 'active' ? 'Active' : status}
                </span>
              </div>
              <div className={cn("text-xs", darkMode ? "text-gray-300" : "text-gray-600")}>
                {status === 'active'
                  ? `Model has been successfully deployed and is ready to accept requests.`
                  : `Model is currently in ${status} status. Please wait while it completes deployment.`}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                Deployment Information
              </h3>
              <div className={cn(
                "rounded-lg border overflow-hidden",
                darkMode ? "border-gray-800" : "border-gray-200"
              )}>
                <table className="w-full">
                  <tbody className={cn(
                    "divide-y text-sm",
                    darkMode ? "divide-gray-800" : "divide-gray-200"
                  )}>
                    <tr>
                      <td className={cn("px-3 py-2 font-medium", darkMode ? "text-gray-400" : "text-gray-500")}>
                        ID
                      </td>
                      <td className={cn("px-3 py-2 font-mono text-xs break-all", darkMode ? "text-gray-300" : "text-gray-700")}>
                        {deployment.deploymentId}
                      </td>
                    </tr>
                    <tr>
                      <td className={cn("px-3 py-2 font-medium", darkMode ? "text-gray-400" : "text-gray-500")}>
                        Model
                      </td>
                      <td className={cn("px-3 py-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                        {modelId}
                      </td>
                    </tr>
                    <tr>
                      <td className={cn("px-3 py-2 font-medium", darkMode ? "text-gray-400" : "text-gray-500")}>
                        Created
                      </td>
                      <td className={cn("px-3 py-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                        {formatTimestamp(createdAt)}
                      </td>
                    </tr>
                    {deploymentCompleted && (
                      <tr>
                        <td className={cn("px-3 py-2 font-medium", darkMode ? "text-gray-400" : "text-gray-500")}>
                          Completed
                        </td>
                        <td className={cn("px-3 py-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                          {formatTimestamp(deploymentCompleted)}
                        </td>
                      </tr>
                    )}
                    {deploymentDuration !== undefined && (
                      <tr>
                        <td className={cn("px-3 py-2 font-medium", darkMode ? "text-gray-400" : "text-gray-500")}>
                          Duration
                        </td>
                        <td className={cn("px-3 py-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                          {deploymentDuration.toFixed(1)}s
                        </td>
                      </tr>
                    )}
                    {containerDetails?.id && (
                      <tr>
                        <td className={cn("px-3 py-2 font-medium", darkMode ? "text-gray-400" : "text-gray-500")}>
                          Container
                        </td>
                        <td className={cn("px-3 py-2 font-mono text-xs", darkMode ? "text-gray-300" : "text-gray-700")}>
                          {containerDetails.id.substring(0, 12)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={cn(
                    "py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-colors",
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={async () => {
                    setGradioLoading(true);
                    const url = await createGradioInterface();
                    if (url) {
                      // Only open the window after we have the public URL
                      window.open(url, '_blank');
                    }
                    setGradioLoading(false);
                  }}
                  disabled={gradioLoading}
                >
                  {gradioLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span className="text-xs font-medium">Creating UI...</span>
                    </>
                  ) : (
                    <>
                      <Globe size={14} />
                      <span className="text-xs font-medium">Open UI</span>
                    </>
                  )}
                </button>

                {gradioError && (
                  <div className={cn(
                    "mt-2 p-2 rounded text-sm",
                    darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
                  )}>
                    {gradioError}
                  </div>
                )}
                {gradioError && (
                  <div className={cn(
                    "mt-2 p-2 rounded text-sm",
                    darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
                  )}>
                    {gradioError}
                  </div>
                )}
                <button
                  className={cn(
                    "py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors",
                    darkMode
                      ? "bg-blue-900/20 text-blue-400 hover:bg-blue-900/30"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  )}
                  onClick={onPlaygroundOpen}
                >
                  <Terminal size={14} />
                  <span className="text-xs font-medium">Try in Playground</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <h3 className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                Base URL
              </h3>
              <div className={cn(
                "p-2 rounded font-mono text-xs break-all",
                darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
              )}>
                {baseUrl || 'Not available'}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                API Endpoints Details
              </h3>

              <div className="p-4 border rounded-lg space-y-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Chat Completions</div>
                  <button onClick={() => copyToClipboard(endpoints?.chat || `${baseUrl}/v1/chat/completions`, 'chat')}>
                    {copied === 'chat' ? 'Copied!' : <Copy size={14} />}
                  </button>
                </div>
                <div className="text-xs font-mono break-all">
                  {endpoints?.chat || `${baseUrl}/v1/chat/completions`}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  This endpoint handles interactive chat completions. It accepts a conversation (with system, user, and prior assistant messages) and returns a generated reply.
                </p>
                <div className="flex border-b mb-2">
                  <button
                    className={cn("px-2 py-1 text-xs", chatLang === "python" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                    onClick={() => setChatLang("python")}
                  >
                    Python
                  </button>
                  <button
                    className={cn("px-2 py-1 text-xs", chatLang === "curl" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                    onClick={() => setChatLang("curl")}
                  >
                    cURL
                  </button>
                  <button
                    className={cn("px-2 py-1 text-xs", chatLang === "javascript" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                    onClick={() => setChatLang("javascript")}
                  >
                    JavaScript
                  </button>
                </div>
                <SyntaxHighlighter
                  language={chatLang === "curl" ? "bash" : chatLang === "python" ? "python" : "javascript"}
                  style={darkMode ? atomOneDark : atomOneLight}
                  customStyle={{ fontSize: '0.75rem', padding: '1rem', borderRadius: '0.375rem' }}
                >
                  {chatLang === "python"
                    ? pythonChatExample
                    : chatLang === "curl"
                      ? curlChatExample
                      : javascriptChatExample}
                </SyntaxHighlighter>
              </div>

              <div className="p-4 border rounded-lg space-y-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Completions</div>
                  <button onClick={() => copyToClipboard(endpoints?.completions || `${baseUrl}/v1/completions`, 'completions')}>
                    {copied === 'completions' ? 'Copied!' : <Copy size={14} />}
                  </button>
                </div>
                <div className="text-xs font-mono break-all">
                  {endpoints?.completions || `${baseUrl}/v1/completions`}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Use this endpoint to generate text based on a prompt. It’s ideal for tasks like summarization, story generation, or any text generation scenario.
                </p>
                <div className="flex border-b mb-2">
                  <button
                    className={cn("px-2 py-1 text-xs", completionsLang === "python" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                    onClick={() => setCompletionsLang("python")}
                  >
                    Python
                  </button>
                  <button
                    className={cn("px-2 py-1 text-xs", completionsLang === "curl" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                    onClick={() => setCompletionsLang("curl")}
                  >
                    cURL
                  </button>
                  <button
                    className={cn("px-2 py-1 text-xs", completionsLang === "javascript" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                    onClick={() => setCompletionsLang("javascript")}
                  >
                    JavaScript
                  </button>
                </div>
                <SyntaxHighlighter
                  language={completionsLang === "curl" ? "bash" : completionsLang === "python" ? "python" : "javascript"}
                  style={darkMode ? atomOneDark : atomOneLight}
                  customStyle={{ fontSize: '0.75rem', padding: '1rem', borderRadius: '0.375rem' }}
                >
                  {completionsLang === "python"
                    ? pythonCompletionExample
                    : completionsLang === "curl"
                      ? curlCompletionExample
                      : javascriptCompletionExample}
                </SyntaxHighlighter>
              </div>

              {(endpoints?.embeddings || baseUrl) && (
                <div className="p-4 border rounded-lg space-y-2 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Embeddings</div>
                    <button onClick={() => copyToClipboard(endpoints?.embeddings || `${baseUrl}/v1/embeddings`, 'embeddings')}>
                      {copied === 'embeddings' ? 'Copied!' : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-xs font-mono break-all">
                    {endpoints?.embeddings || `${baseUrl}/v1/embeddings`}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Retrieve vector embeddings for your input text. These embeddings can be used for tasks like semantic search and clustering.
                  </p>
                  <div className="flex border-b mb-2">
                    <button
                      className={cn("px-2 py-1 text-xs", embeddingsLang === "python" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                      onClick={() => setEmbeddingsLang("python")}
                    >
                      Python
                    </button>
                    <button
                      className={cn("px-2 py-1 text-xs", embeddingsLang === "curl" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                      onClick={() => setEmbeddingsLang("curl")}
                    >
                      cURL
                    </button>
                    <button
                      className={cn("px-2 py-1 text-xs", embeddingsLang === "javascript" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500")}
                      onClick={() => setEmbeddingsLang("javascript")}
                    >
                      JavaScript
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={embeddingsLang === "curl" ? "bash" : embeddingsLang === "python" ? "python" : "javascript"}
                    style={darkMode ? atomOneDark : atomOneLight}
                    customStyle={{ fontSize: '0.75rem', padding: '1rem', borderRadius: '0.375rem' }}
                  >
                    {embeddingsLang === "python"
                      ? pythonEmbeddingsExample
                      : embeddingsLang === "curl"
                        ? curlEmbeddingsExample
                        : javascriptEmbeddingsExample}
                  </SyntaxHighlighter>
                </div>
              )}

              {(endpoints?.docs || baseUrl) && (
                <div className="p-4 border rounded-lg space-y-2 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">API Documentation</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyToClipboard(endpoints?.docs || `${baseUrl}/redoc`, 'docs')}>
                        {copied === 'docs' ? 'Copied!' : <Copy size={14} />}
                      </button>
                      <a
                        href={endpoints?.docs || `${baseUrl}/redoc`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <div className="text-xs font-mono break-all">
                    {endpoints?.docs || `${baseUrl}/redoc`}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Access the full API documentation for detailed information on parameters, responses, and usage examples.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <h3 className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                Sample API Usage
              </h3>
              <p className={cn("text-xs", darkMode ? "text-gray-400" : "text-gray-600")}>
                Below are examples of how to interact with your deployed model using different programming languages.
              </p>
            </div>

            <div className={cn("flex border-b", darkMode ? "border-gray-800" : "border-gray-200")}>
              <button
                className={cn(
                  "py-1.5 px-3 text-xs font-medium border-b-2 transition-colors",
                  activeTab === 'examples' && copied === 'python'
                    ? (darkMode ? "border-blue-500 text-blue-400" : "border-blue-500 text-blue-600")
                    : (darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700")
                )}
                onClick={() => setCopied('python')}
              >
                Python
              </button>
              <button
                className={cn(
                  "py-1.5 px-3 text-xs font-medium border-b-2 transition-colors",
                  activeTab === 'examples' && copied === 'curl'
                    ? (darkMode ? "border-blue-500 text-blue-400" : "border-blue-500 text-blue-600")
                    : (darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700")
                )}
                onClick={() => setCopied('curl')}
              >
                cURL
              </button>
              <button
                className={cn(
                  "py-1.5 px-3 text-xs font-medium border-b-2 transition-colors",
                  activeTab === 'examples' && copied === 'javascript'
                    ? (darkMode ? "border-blue-500 text-blue-400" : "border-blue-500 text-blue-600")
                    : (darkMode ? "border-transparent text-gray-500 hover:text-gray-300" : "border-transparent text-gray-500 hover:text-gray-700")
                )}
                onClick={() => setCopied('javascript')}
              >
                JavaScript
              </button>
            </div>

            <div className="mt-3 relative">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => {
                    const code = copied === 'python'
                      ? pythonChatExample
                      : copied === 'curl'
                        ? curlChatExample
                        : javascriptChatExample;
                    copyToClipboard(code, `copy_${copied}`);
                  }}
                  className={cn(
                    "p-1.5 rounded text-xs flex items-center gap-1 transition-colors",
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                      : "bg-white/90 hover:bg-gray-100 text-gray-700 border border-gray-200"
                  )}
                >
                  {copied === `copy_${copied === 'python' ? 'python' : copied === 'curl' ? 'curl' : 'javascript'}`
                    ? 'Copied!'
                    : <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  }
                </button>
              </div>

              <SyntaxHighlighter
                language={copied === 'curl' ? 'bash' : copied === 'python' ? 'python' : 'javascript'}
                style={darkMode ? atomOneDark : atomOneLight}
                customStyle={{
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '1rem',
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                {copied === 'python'
                  ? pythonChatExample
                  : copied === 'curl'
                    ? curlChatExample
                    : javascriptChatExample}
              </SyntaxHighlighter>
            </div>

            <div className="mt-4">
              <button
                onClick={onPlaygroundOpen}
                className={cn(
                  "w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors",
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                <Terminal size={16} />
                <span className="font-medium">Try in Playground</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-1">
                <h3 className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                  Additional Endpoints
                </h3>
                <p className={cn("text-xs", darkMode ? "text-gray-400" : "text-gray-600")}>
                  This model supports the following API endpoints. Click to see examples.
                </p>
              </div>

              <div className={cn(
                "rounded-lg border divide-y",
                darkMode ? "border-gray-800 divide-gray-800" : "border-gray-200 divide-gray-200"
              )}>
                <button
                  className={cn(
                    "w-full p-3 flex justify-between items-center transition-colors",
                    darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                  )}
                  onClick={() => setCopied('python')}
                >
                  <div className="flex items-center">
                    <Server size={16} className={cn(
                      "mr-2",
                      darkMode ? "text-blue-400" : "text-blue-500"
                    )} />
                    <div className="text-left">
                      <div className={cn("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                        Chat Completions
                      </div>
                      <div className={cn("text-xs", darkMode ? "text-gray-500" : "text-gray-500")}>
                        /v1/chat/completions
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className={cn(
                    darkMode ? "text-gray-600" : "text-gray-400"
                  )} />
                </button>

                <button
                  className={cn(
                    "w-full p-3 flex justify-between items-center transition-colors",
                    darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center">
                    <Terminal size={16} className={cn(
                      "mr-2",
                      darkMode ? "text-indigo-400" : "text-indigo-500"
                    )} />
                    <div className="text-left">
                      <div className={cn("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                        Text Completions
                      </div>
                      <div className={cn("text-xs", darkMode ? "text-gray-500" : "text-gray-500")}>
                        /v1/completions
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className={cn(
                    darkMode ? "text-gray-600" : "text-gray-400"
                  )} />
                </button>

                {(endpoints?.embeddings || baseUrl) && (
                  <button
                    className={cn(
                      "w-full p-3 flex justify-between items-center transition-colors",
                      darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center">
                      <Code size={16} className={cn(
                        "mr-2",
                        darkMode ? "text-purple-400" : "text-purple-500"
                      )} />
                      <div className="text-left">
                        <div className={cn("text-sm font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                          Embeddings
                        </div>
                        <div className={cn("text-xs", darkMode ? "text-gray-500" : "text-gray-500")}>
                          /v1/embeddings
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} className={cn(
                      darkMode ? "text-gray-600" : "text-gray-400"
                    )} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="p-4 flex flex-col h-full">
            {/* Mode Toggle */}
            <div className="mb-4">
              <div className={cn(
                "inline-flex rounded-lg p-1 w-full",
                darkMode ? "bg-gray-800" : "bg-gray-100"
              )}>
                <button
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                    activeCompletionMode === 'chat'
                      ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                      : (darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800")
                  )}
                  onClick={() => setActiveCompletionMode('chat')}
                >
                  Chat Completions
                </button>
                <button
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                    activeCompletionMode === 'completion'
                      ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                      : (darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800")
                  )}
                  onClick={() => setActiveCompletionMode('completion')}
                >
                  Text Completions
                </button>
              </div>
            </div>

            {activeCompletionMode === 'chat' ? (
              // Chat Completions UI
              <>
                <div className={cn(
                  "flex-1 overflow-y-auto mb-4 space-y-2 rounded-lg p-3",
                  darkMode ? "bg-gray-900/50 border border-gray-800" : "bg-gray-50 border border-gray-200"
                )}>
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className={cn(
                        "h-12 w-12 rounded-full grid place-items-center mb-3",
                        darkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-100 text-blue-600"
                      )}>
                        <Terminal size={20} />
                      </div>
                      <p className={cn(
                        "text-sm font-medium mb-1",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Chat with {deploymentDetails?.apiName || deploymentDetails?.modelId}
                      </p>
                      <p className={cn(
                        "text-xs max-w-md",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Start a conversation to test your deployed model's chat completions API in real-time.
                      </p>
                    </div>
                  )}

                  {chatMessages.map((msg, index) => (
                    <div key={index} className={cn(
                      "mb-3 last:mb-0 flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}>
                      <div className={cn(
                        "max-w-[80%] px-4 py-2.5 rounded-2xl",
                        msg.role === 'user'
                          ? (darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                          : (darkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-800 border border-gray-200 shadow-sm")
                      )}>
                        <div className={cn(
                          "text-xs font-medium mb-1",
                          msg.role === 'user' ? "text-blue-200" : (darkMode ? "text-gray-400" : "text-gray-500")
                        )}>
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start mb-2">
                      <div className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-2xl",
                        darkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                      )}>
                        <div className="flex space-x-1">
                          <div className={cn("h-2 w-2 rounded-full animate-pulse", darkMode ? "bg-blue-400" : "bg-blue-600")}></div>
                          <div className={cn("h-2 w-2 rounded-full animate-pulse delay-75", darkMode ? "bg-blue-400" : "bg-blue-600")}></div>
                          <div className={cn("h-2 w-2 rounded-full animate-pulse delay-150", darkMode ? "bg-blue-400" : "bg-blue-600")}></div>
                        </div>
                        <span className="text-xs opacity-70">Thinking...</span>
                      </div>
                    </div>
                  )}

                  {chatError && (
                    <div className={cn(
                      "text-center p-3 rounded-lg mb-2 mt-2 border",
                      darkMode ? "bg-red-900/20 text-red-300 border-red-900/30" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {chatError.includes("Network authentication required") ? (
                        <>
                          <p className="mb-2 font-medium">Authentication Required</p>
                          <p className="text-sm mb-2">The network requires authentication to access the API.</p>
                          <button
                            onClick={() => window.open(deploymentDetails?.tunnelUrl || baseUrl, '_blank')}
                            className={cn(
                              "px-3 py-1 mt-1 rounded text-sm",
                              darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                            )}
                          >
                            Open in Browser to Authenticate
                          </button>
                        </>
                      ) : (
                        <p className="text-sm">{chatError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Advanced Options Panel */}
                <div className="mb-4">
                  <details className={cn(
                    "group rounded-lg border overflow-hidden transition-colors",
                    darkMode ? "bg-gray-800/60 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"
                  )}>
                    <summary className="flex items-center justify-between px-4 py-2 cursor-pointer">
                      <span className="text-xs font-medium">Advanced Parameters</span>
                      <div className="text-xs opacity-70 group-open:rotate-180 transition-transform">▼</div>
                    </summary>
                    <div className="px-4 py-3 border-t grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          value={chatMaxTokens}
                          onChange={(e) => setChatMaxTokens(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Temperature
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={chatTemperature}
                          onChange={(e) => setChatTemperature(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Top P
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          value={chatTopP}
                          onChange={(e) => setChatTopP(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Frequency Penalty
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={chatFrequencyPenalty}
                          onChange={(e) => setChatFrequencyPenalty(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Presence Penalty
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={chatPresencePenalty}
                          onChange={(e) => setChatPresencePenalty(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                    </div>
                  </details>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <div className={cn("relative flex-1", chatLoading && "opacity-75")}>
                    <input
                      type="text"
                      className={cn(
                        "w-full pl-4 pr-10 py-3 rounded-full border transition-colors",
                        darkMode ? "bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" : "bg-white text-gray-800 border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      )}
                      placeholder={chatLoading ? "Waiting for response..." : "Type your message..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                      disabled={chatLoading}
                    />
                    <button
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors",
                        chatInput.trim().length > 0
                          ? (darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white")
                          : (darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"),
                        "disabled:opacity-50"
                      )}
                      onClick={handleSendChat}
                      disabled={!chatInput.trim().length || chatLoading}
                    >
                      {chatLoading ?
                        <Clock className="h-4 w-4 animate-spin" /> :
                        <ArrowRight className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Text Completions UI
              <>
                <div className={cn(
                  "flex-1 overflow-y-auto mb-4 space-y-4 rounded-lg p-3",
                  darkMode ? "bg-gray-900/50 border border-gray-800" : "bg-gray-50 border border-gray-200"
                )}>
                  {textCompletions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className={cn(
                        "h-12 w-12 rounded-full grid place-items-center mb-3",
                        darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
                      )}>
                        <Code size={20} />
                      </div>
                      <p className={cn(
                        "text-sm font-medium mb-1",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Text Completions
                      </p>
                      <p className={cn(
                        "text-xs max-w-md",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}>
                        Enter a prompt below to generate text using the model's completions API.
                      </p>
                    </div>
                  ) : (
                    <>
                      {textCompletions.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className={cn(
                            "p-3 rounded-lg text-sm",
                            darkMode ? "bg-indigo-900/20 border border-indigo-900/30" : "bg-indigo-50 border border-indigo-100"
                          )}>
                            <div className={cn(
                              "text-xs font-medium mb-1",
                              darkMode ? "text-indigo-400" : "text-indigo-700"
                            )}>
                              Prompt:
                            </div>
                            <div className="whitespace-pre-wrap">{item.prompt}</div>
                          </div>

                          <div className={cn(
                            "p-3 rounded-lg text-sm",
                            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                          )}>
                            <div className="flex justify-between items-center mb-1">
                              <div className={cn(
                                "text-xs font-medium",
                                darkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                Completion:
                              </div>
                              <button
                                onClick={() => copyToClipboard(item.completion, `completion_${index}`)}
                                className={cn(
                                  "p-1 rounded text-xs flex items-center gap-1 transition-colors",
                                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                                )}
                              >
                                {copied === `completion_${index}` ? 'Copied!' : <Copy size={12} />}
                              </button>
                            </div>
                            <div className="whitespace-pre-wrap">{item.completion}</div>
                          </div>

                          <hr className={cn(
                            "border-t",
                            darkMode ? "border-gray-800" : "border-gray-200"
                          )} />
                        </div>
                      ))}
                    </>
                  )}

                  {textCompletionLoading && (
                    <div className={cn(
                      "p-4 flex items-center justify-center",
                      darkMode ? "text-blue-400" : "text-blue-600"
                    )}>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                      <span className="ml-2 text-sm">Generating completion...</span>
                    </div>
                  )}

                  {textCompletionError && (
                    <div className={cn(
                      "text-center p-3 rounded-lg mb-2 mt-2 border",
                      darkMode ? "bg-red-900/20 text-red-300 border-red-900/30" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                      <p className="text-sm">{textCompletionError}</p>
                    </div>
                  )}
                </div>

                {/* Advanced Options Panel for Text Completions */}
                <div className="mb-4">
                  <details className={cn(
                    "group rounded-lg border overflow-hidden transition-colors",
                    darkMode ? "bg-gray-800/60 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"
                  )}>
                    <summary className="flex items-center justify-between px-4 py-2 cursor-pointer">
                      <span className="text-xs font-medium">Advanced Parameters</span>
                      <div className="text-xs opacity-70 group-open:rotate-180 transition-transform">▼</div>
                    </summary>
                    <div className="px-4 py-3 border-t grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          value={textMaxTokens}
                          onChange={(e) => setTextMaxTokens(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Temperature
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={textTemperature}
                          onChange={(e) => setTextTemperature(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Top P
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          value={textTopP}
                          onChange={(e) => setTextTopP(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Frequency Penalty
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={textFrequencyPenalty}
                          onChange={(e) => setTextFrequencyPenalty(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                      <div>
                        <label className={cn("block mb-1", darkMode ? "text-gray-400" : "text-gray-600")}>
                          Presence Penalty
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          value={textPresencePenalty}
                          onChange={(e) => setTextPresencePenalty(Number(e.target.value))}
                          className={cn("w-full px-2 py-1 rounded border", darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-400")}
                        />
                      </div>
                    </div>
                  </details>
                </div>

                <div className="mt-auto">
                  <div className={cn(
                    "rounded-lg border p-3 mb-3",
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  )}>
                    <label className={cn(
                      "block mb-1 text-xs font-medium",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}>
                      Prompt
                    </label>
                    <textarea
                      className={cn(
                        "w-full p-2 rounded border text-sm min-h-[5px]",
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:border-blue-400"
                      )}
                      placeholder="Enter a prompt to generate text..."
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      disabled={textCompletionLoading}
                    />
                  </div>

                  <button
                    className={cn(
                      "w-full py-2.5 px-4 rounded-md text-sm font-medium transition-colors",
                      !textPrompt.trim() || textCompletionLoading
                        ? (darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400")
                        : (darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white")
                    )}
                    onClick={handleTextCompletion}
                    disabled={!textPrompt.trim() || textCompletionLoading}
                  >
                    {textCompletionLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      "Generate Completion"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DeploymentDetailsPanel;
