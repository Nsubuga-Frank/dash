// DeployedModel.js
import { ArrowLeft, Copy, Key } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '../../../../../lib/utils';
import { getSavedToken, saveToken } from '../../../hooks/firebaseTokens';
import ModelPlayground from './ModelPlayground';

//
// EndpointSection Component
//
const EndpointSection = ({
    title,
    description,
    endpoint,
    method,
    bodyExample,
    darkMode,
    baseUrl,    // Dynamic base API URL (e.g. tunnel URL)
    userId,     // Logged-in user ID
    modelId     // The model ID (or name)
}) => {
    const [selectedTab, setSelectedTab] = useState('curl');
    const tokenPlaceholder = "YOUR_API_TOKEN";
    const fullEndpoint = `${baseUrl}${endpoint}`;

    // Replace placeholders in the body example with dynamic values.
    const processedBodyExample = bodyExample
        ? bodyExample
            .replace("your_user_id", userId)
            .replace("your_model_id", modelId)
        : null;

    let codeSample = '';
    if (selectedTab === 'curl') {
        codeSample = `curl -X ${method} "${fullEndpoint}" \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json"${processedBodyExample ? ` \\
  -d '${processedBodyExample}'` : ''}`;
    } else if (selectedTab === 'python') {
        codeSample = `import requests

url = "${fullEndpoint}"
headers = {
    "Authorization": "Bearer ${tokenPlaceholder}",
    "Content-Type": "application/json"
}
data = ${processedBodyExample ? processedBodyExample : '{}'}
response = requests.${method.toLowerCase()}(url, json=data, headers=headers)
print(response.json())`;
    } else if (selectedTab === 'javascript') {
        codeSample = `fetch("${fullEndpoint}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer ${tokenPlaceholder}",
    "Content-Type": "application/json"
  }${processedBodyExample ? `,
  body: JSON.stringify(${processedBodyExample})` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data));`;
    }

    return (
        <div className="border rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-blue-500">{title}</h3>
            <p className="text-xs text-gray-300">{description}</p>
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">Endpoint:</span>
                <code className={cn("text-xs px-2 py-1 rounded flex-1", darkMode ? "bg-gray-900" : "bg-gray-100")}>
                    {fullEndpoint}
                </code>
            </div>
            <div className="flex mb-2">
                <button
                    onClick={() => setSelectedTab('curl')}
                    className={cn("flex-1 text-xs p-2 text-center",
                        selectedTab === 'curl'
                            ? "bg-blue-600 text-white"
                            : darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                    )}
                >
                    cURL
                </button>
                <button
                    onClick={() => setSelectedTab('python')}
                    className={cn("flex-1 text-xs p-2 text-center",
                        selectedTab === 'python'
                            ? "bg-blue-600 text-white"
                            : darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                    )}
                >
                    Python
                </button>
                <button
                    onClick={() => setSelectedTab('javascript')}
                    className={cn("flex-1 text-xs p-2 text-center",
                        selectedTab === 'javascript'
                            ? "bg-blue-600 text-white"
                            : darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                    )}
                >
                    JavaScript
                </button>
            </div>
            <div className="p-2 bg-gray-900 text-gray-100 font-mono text-xs rounded">
                <pre>{codeSample}</pre>
            </div>
            <p className="text-xs text-gray-300">
                Replace <code>{tokenPlaceholder}</code> with your API token.
            </p>
        </div>
    );
};

//
// InfoRow Component
//
const InfoRow = ({ label, children, darkMode }) => (
    <div className="flex px-2 py-1">
        <span className={cn("w-20 text-xs", darkMode ? "text-gray-300" : "text-gray-500")}>{label}</span>
        <div className="flex-1 text-xs">{children}</div>
    </div>
);

//
// RequirementCol Component
//
const RequirementCol = ({ label, value, icon, darkMode }) => (
    <div className="p-2 text-center">
        {icon && <div className="text-base mb-1">{icon}</div>}
        <div className={cn("text-xs mb-0.5", darkMode ? "text-gray-300" : "text-gray-400")}>{label}</div>
        <div className="font-medium text-xs">{value}</div>
    </div>
);

//
// DeployedModel Component
//
const DeployedModel = ({
    model,
    tunnelUrl,
    userId,
    darkMode,
    isExpanded,
    isRightExpanded,
    onBack,
    onError // For consistency
}) => {
    const [showToken, setShowToken] = useState(false);
    const [token, setToken] = useState('');
    const [isTokenLoading, setIsTokenLoading] = useState(false);

    // Use the tunnel URL (if available) as the base URL; otherwise, fall back to a default.
    const apiEndpoint = tunnelUrl || "https://cb2e-24-83-13-62.ngrok-free.app";

    useEffect(() => {
        async function fetchToken() {
            try {
                setIsTokenLoading(true);
                const savedToken = await getSavedToken(userId, model.name);
                if (savedToken) {
                    setToken(savedToken);
                    setShowToken(true);
                }
            } catch (error) {
                console.error("Error fetching saved token:", error);
            } finally {
                setIsTokenLoading(false);
            }
        }
        fetchToken();
    }, [userId, model.name]);

    const generateToken = async () => {
        setIsTokenLoading(true);
        try {
            // Keep HTTPS but use the full URL
            const requestBody = {
                user_id: userId.toLowerCase(),
                model_id: model.name.toLowerCase()
            };
            
            console.log('Generating token:', {
                url: `${apiEndpoint}/token`,
                body: requestBody
            });

            // Try with minimal headers first
            const response = await fetch(`${apiEndpoint}/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "bypass-tunnel-reminder": "true"
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!response.ok) {
                throw new Error(`Token generation failed: ${response.status} ${responseText}`);
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response:', e);
                throw new Error('Invalid response from server');
            }

            if (!data.token) {
                throw new Error('No token in response');
            }

            console.log('Token generated successfully');
            await saveToken(userId.toLowerCase(), model.name.toLowerCase(), data.token);
            setToken(data.token);
            setShowToken(true);
        } catch (error) {
            console.error("Error generating token:", error);
            if (onError) onError(error);
        } finally {
            setIsTokenLoading(false);
        }
    };

    const handleCopyClick = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div
            className={cn(
                'fixed top-16 bottom-16 transition-all p-4 duration-300 rounded-md shadow flex flex-col overflow-hidden',
                isExpanded ? 'left-60' : 'left-20',
                isRightExpanded ? 'right-64' : 'right-14',
                darkMode ? 'bg-[#1b212c] border border-gray-800' : 'bg-white border border-gray-200'
            )}
        >
            {/* Fixed Navigation (Back Navigation only) */}
            <div className="sticky top-0 z-20 bg-inherit">
                <div
                    onClick={onBack}
                    className={cn(
                        "flex items-center gap-1 cursor-pointer group",
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                    )}
                >
                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs font-medium">Model Catalogue</span>
                </div>
                <hr className={cn('my-2', darkMode ? 'border-gray-700' : 'border-gray-200')} />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-dark space-y-4 pt-2">
                {/* Header Card (scrollable) */}
                <div className={cn("rounded p-2", darkMode ? 'bg-[#1b212c] border border-gray-800' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-1 mb-1">
                        <span className="bg-blue-600 text-blue-200 px-1 py-0.5 rounded text-xs font-medium">
                            {model.provider}
                        </span>
                        <h1 className={cn("text-base font-medium", darkMode ? "text-white" : "text-gray-800")}>
                            {model.name}
                        </h1>
                        <span className={cn("mx-1 text-xs", darkMode ? "text-gray-400" : "text-gray-600")}>•</span>
                        <div className="ml-auto flex items-center gap-1 bg-green-500/10 text-green-500 px-1 py-0.5 rounded text-xs font-semibold">
                            <div className="w-1 h-1 rounded-full bg-green-500"></div>
                            <span>Deployed</span>
                        </div>
                    </div>
                    <p className={cn("text-xs", darkMode ? "text-gray-300" : "text-gray-600")}>
                        Text generation model by {model.provider}
                    </p>
                </div>

                {/* Info and Specifications Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Model Info Card */}
                    <div className={cn("rounded overflow-hidden", darkMode ? "bg-slate-800" : "bg-gray-100")}>
                        <div className={cn("px-2 py-1", darkMode ? "bg-slate-900" : "bg-gray-200")}>
                            <h2 className={cn("text-xs", darkMode ? "text-gray-300" : "text-gray-700")}>Model info</h2>
                        </div>
                        <div className="divide-y divide-slate-700">
                            <InfoRow label="Type" darkMode={darkMode}>
                                <span className="px-1 py-0.5 rounded text-xs">
                                    {model.model_type || "text_generation"}
                                </span>
                            </InfoRow>
                            <InfoRow label="Name" darkMode={darkMode}>
                                <span className="px-1 py-0.5 rounded text-xs">{model.name}</span>
                            </InfoRow>
                            <InfoRow label="Provider" darkMode={darkMode}>
                                <span className="px-1 py-0.5 rounded text-xs">{model.provider}</span>
                            </InfoRow>
                        </div>
                    </div>
                    {/* Specifications Card */}
                    <div className={cn("rounded overflow-hidden", darkMode ? "bg-slate-800" : "bg-gray-100")}>
                        <div className={cn("px-2 py-1", darkMode ? "bg-slate-900" : "bg-gray-200")}>
                            <h2 className={cn("text-xs", darkMode ? "text-gray-300" : "text-gray-700")}>Specs</h2>
                        </div>
                        <div className="divide-y divide-slate-700">
                            <InfoRow label="Context" darkMode={darkMode}>
                                <span className="px-1 py-0.5 rounded text-xs">
                                    {model.specifications?.contextsize || "2048"}
                                </span>
                            </InfoRow>
                            <InfoRow label="Params" darkMode={darkMode}>
                                <span className="px-1 py-0.5 rounded text-xs">
                                    {model.specifications?.parameters || "270M"}
                                </span>
                            </InfoRow>
                            <InfoRow label="Prec" darkMode={darkMode}>
                                <span className="px-1 py-0.5 rounded text-xs">
                                    {model.specifications?.precision || "FP16"}
                                </span>
                            </InfoRow>
                        </div>
                    </div>
                </div>

                {/* Minimum Requirements Card */}
                <div className={cn("rounded overflow-hidden", darkMode ? "bg-slate-800" : "bg-gray-100")}>
                    <div className={cn("px-2 py-1", darkMode ? "bg-slate-900" : "bg-gray-200")}>
                        <h2 className={cn("text-xs", darkMode ? "text-gray-300" : "text-gray-700")}>Min Req</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-700">
                        <RequirementCol label="CPU" value={model.requirements?.cpu || "4"} darkMode={darkMode} />
                        <RequirementCol label="GPU" value={model.requirements?.gpu || "8 GB"} darkMode={darkMode} />
                        <RequirementCol label="RAM" value={model.requirements?.ram || "8 GB"} darkMode={darkMode} />
                        <RequirementCol label="Storage" value={model.requirements?.storage ? model.requirements.storage + " GB" : "1 GB"} darkMode={darkMode} />
                    </div>
                </div>

                {/* Model Usage Section */}
                <div className="mt-4 space-y-6">
                    <h2 className={cn("text-base font-medium", darkMode ? "text-white" : "text-gray-800")}>
                        {model.name} usage
                    </h2>
                    <p className={cn("text-xs", darkMode ? "text-gray-300" : "text-gray-600")}>
                        To use your model, you need an API token. This token secures access to your deployed model via REST API calls.
                        Generate or regenerate your token below and then use the provided endpoints to interact with your model.
                    </p>
                    {/* API Access Section */}
                    {/* API Access Section */}
                    <div className={cn(
                        "rounded-lg border p-4 space-y-4",
                        darkMode ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                    )}>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Key size={16} className="text-blue-500" />
                            API Access
                        </h3>
                        <div className="space-y-4">
                            {/* Endpoint Display */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Endpoint</label>
                                <div className="flex items-center gap-2">
                                    <code className={cn(
                                        "text-xs px-2 py-1 rounded flex-1 break-all",
                                        darkMode ? "bg-gray-900" : "bg-gray-100"
                                    )}>
                                        {apiEndpoint}
                                    </code>
                                    <button
                                        onClick={() => handleCopyClick(apiEndpoint)}
                                        className={cn(
                                            "p-1.5 rounded-md transition-colors",
                                            darkMode
                                                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                                                : "hover:bg-gray-200 text-gray-600 hover:text-gray-700"
                                        )}
                                        title="Copy endpoint"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Token Display */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-400">API Token</label>
                                    <button onClick={generateToken} className="text-xs text-blue-500 hover:text-blue-400">
                                        {showToken ? "Regenerate Token" : "Generate New Token"}
                                    </button>
                                </div>
                                {isTokenLoading ? (
                                    <div className="text-xs text-gray-500">Generating token...</div>
                                ) : showToken ? (
                                    <div className="flex items-start gap-2">
                                        <code className={cn(
                                            "text-xs px-2 py-1 rounded flex-1 break-all",
                                            darkMode ? "bg-gray-900" : "bg-gray-100"
                                        )}>
                                            {token}
                                        </code>
                                        <button
                                            onClick={() => handleCopyClick(token)}
                                            className={cn(
                                                "p-1.5 rounded-md transition-colors shrink-0",
                                                darkMode
                                                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                                                    : "hover:bg-gray-200 text-gray-600 hover:text-gray-700"
                                            )}
                                            title="Copy token"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "text-xs px-2 py-1 rounded text-gray-500",
                                        darkMode ? "bg-gray-900" : "bg-gray-100"
                                    )}>
                                        Click to generate API token
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Dedicated Endpoints Section */}
                    <div className="mt-4 space-y-6">
                        <h2 className={cn("text-base font-medium", darkMode ? "text-white" : "text-gray-800")}>
                            API Endpoints
                        </h2>

                        <EndpointSection
                            title="GET /health"
                            description="Check the overall health of the model server. This endpoint returns basic information about the server's status—including model readiness, backend details, and hardware stats (device, CUDA availability, CPU threads). Use it as a preliminary check before interacting with other endpoints."
                            endpoint="/health"
                            method="GET"
                            bodyExample={null}
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />

                        <EndpointSection
                            title="GET /model/loading-status"
                            description="Stream real-time updates on the model loading process using Server-Sent Events (SSE). It continuously provides log updates during initialization, culminating with a final status when the model is ready for inference."
                            endpoint="/model/loading-status"
                            method="GET"
                            bodyExample={null}
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />

                        <EndpointSection
                            title="POST /token"
                            description="Generate an API token to authenticate your access. Include your user_id and model_id in the request body; the generated token is stored for subsequent API calls."
                            endpoint="/token"
                            method="POST"
                            bodyExample={`{"user_id": "${userId}", "model_id": "${model.name}"}`}
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />

                        <EndpointSection
                            title="POST /chats"
                            description="Create a new chat session. This endpoint initializes a new conversation with the model and returns a unique chat ID along with a creation timestamp. Use it to start a fresh conversation."
                            endpoint="/chats"
                            method="POST"
                            bodyExample="{}"
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />

                        <EndpointSection
                            title="GET /chats"
                            description="List all active chat sessions for the user. This endpoint returns an array of chat sessions with details including chat ID, creation time, last update, and message count."
                            endpoint="/chats"
                            method="GET"
                            bodyExample={null}
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />

                        <EndpointSection
                            title="GET /chat/{chat_id}/history"
                            description="Retrieve the full history for a specific chat session. Use this endpoint to fetch previous conversation messages and reconstruct the dialogue context on the client side."
                            endpoint="/chat/{chat_id}/history"
                            method="GET"
                            bodyExample={null}
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />

                        <EndpointSection
                            title="POST /chat/{chat_id}/message"
                            description="Send a message to the model in a specific chat session. Replace {chat_id} with your chat ID and include a JSON body with a 'prompt' field. The model will process your prompt and stream back the generated response."
                            endpoint="/chat/{chat_id}/message"
                            method="POST"
                            bodyExample={`{"prompt": "Hello, world!"}`}
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />

                        <EndpointSection
                            title="DELETE /chat/{chat_id}"
                            description="Soft-delete a specific chat session. This endpoint marks the chat as inactive and records the deletion time while preserving the conversation history for auditing purposes."
                            endpoint="/chat/{chat_id}"
                            method="DELETE"
                            bodyExample={null}
                            darkMode={darkMode}
                            baseUrl={apiEndpoint}
                            userId={userId}
                            modelId={model.name}
                        />
                    </div>
                    {/* Model Playground Section */}
                    <div className="mt-4 space-y-6">
                        <h2 className={cn("text-base font-medium", darkMode ? "text-white" : "text-gray-800")}>
                            Interactive Playground
                        </h2>
                        <p className={cn("text-xs", darkMode ? "text-gray-300" : "text-gray-600")}>
                            Test your deployed model directly in this interactive playground. Messages are processed using the chat endpoint.
                        </p>

                        {token ? (
                            <ModelPlayground
                                darkMode={darkMode}
                                apiEndpoint={apiEndpoint}
                                token={token}
                            />
                        ) : (
                            <div className={cn(
                                "rounded-lg border p-4 text-center",
                                darkMode ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                            )}>
                                <p className={cn("text-sm", darkMode ? "text-gray-300" : "text-gray-600")}>
                                    Generate an API token above to use the interactive playground
                                </p>
                            </div>
                        )}
                    </div>
                </div>
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
        </div>
    );
};

export default DeployedModel;
