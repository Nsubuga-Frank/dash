import PropTypes from 'prop-types';

const APIReference = ({ 
  darkMode, 
  selectedDeployedModel,
  chatLang,
  setChatLang,
  completionLang,
  setCompletionLang,
  embeddingLang,
  setEmbeddingLang
}) => {
  if (!selectedDeployedModel) {
    return (
      <div className={`flex items-center justify-center h-full ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <div className="text-center p-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 6.1H3"></path>
              <path d="M21 12.1H3"></path>
              <path d="M15.1 18H3"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Model Selected</h3>
          <p className="text-sm mb-6 max-w-md">
            Please select a deployed model from the list to view its API documentation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-xl font-bold mb-6">API Reference</h2>
      
      <div className="space-y-8">
        {/* Endpoint Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Base URL</h3>
          <div className={`p-3 rounded-lg font-mono text-sm ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            https://api.polaris.ai/v1/deployments/{selectedDeployedModel.id}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            All API requests should be made to this base URL with your specific deployment ID.
          </p>
        </div>
        
        {/* Authentication */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Authentication</h3>
          <p className="mb-2 text-sm">
            All API requests require authentication using your API key in the Authorization header:
          </p>
          <div className={`p-3 rounded-lg font-mono text-sm ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            Authorization: Bearer YOUR_API_KEY
          </div>
        </div>
        
        {/* Chat Completions Endpoint */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className={`mr-2 px-2 py-0.5 text-xs font-medium rounded ${
              darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
            }`}>POST</div>
            <h4 className="text-sm font-medium">Chat Completions</h4>
          </div>
          <p className="mb-3 text-sm text-gray-500">
            Generate a response from a conversation history.
          </p>
          
          {/* Language tabs for Chat Completions */}
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <div className="flex border-b border-gray-700">
              {['python', 'curl', 'javascript', 'go'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setChatLang(lang)}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    chatLang === lang
                      ? darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-white text-gray-900'
                      : darkMode 
                        ? 'hover:bg-gray-800 border-r border-gray-700 last:border-r-0'
                        : 'hover:bg-gray-100 border-r border-gray-200 last:border-r-0'
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <div className={`p-3 text-xs font-mono whitespace-pre overflow-x-auto ${
              darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'
            }`}>
{chatLang === 'python' ? 
`import polaris

polaris.api_key = "YOUR_API_KEY"

response = polaris.ChatCompletion.create(
    deployment_id="${selectedDeployedModel.id}",
    model="${selectedDeployedModel.modelName}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, how are you?"}
    ]
)

print(response.choices[0].message.content)`
: chatLang === 'curl' ?
`curl https://api.polaris.ai/v1/deployments/${selectedDeployedModel.id}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${selectedDeployedModel.modelName}",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'`
: chatLang === 'javascript' ?
`import { PolarisChatAPI } from 'polaris-ai';

const polaris = new PolarisChatAPI({
  apiKey: 'YOUR_API_KEY',
});

async function main() {
  const response = await polaris.chat.completions.create({
    deployment_id: "${selectedDeployedModel.id}",
    model: "${selectedDeployedModel.modelName}",
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' }
    ],
  });
  
  console.log(response.choices[0].message.content);
}

main();`
:
`package main

import (
	"context"
	"fmt"
	"github.com/polaris-ai/polaris-go"
)

func main() {
	client := polaris.NewClient("YOUR_API_KEY")
	
	resp, err := client.CreateChatCompletion(
		context.Background(),
		polaris.ChatCompletionRequest{
			DeploymentID: "${selectedDeployedModel.id}",
			Model:        "${selectedDeployedModel.modelName}",
			Messages: []polaris.ChatCompletionMessage{
				{
					Role:    "system",
					Content: "You are a helpful assistant.",
				},
				{
					Role:    "user",
					Content: "Hello, how are you?",
				},
			},
		},
	)
	
	if err != nil {
		fmt.Printf("ChatCompletion error: %v\\n", err)
		return
	}
	
	fmt.Println(resp.Choices[0].Message.Content)
}`}
            </div>
          </div>
        </div>
        
        {/* Text Completions Endpoint */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className={`mr-2 px-2 py-0.5 text-xs font-medium rounded ${
              darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
            }`}>POST</div>
            <h4 className="text-xs font-medium">Text Completions</h4>
          </div>
          <p className="mb-3 text-sm text-gray-500">
            Generate text completions based on a prompt.
          </p>
          
          {/* Language tabs for Text Completions */}
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <div className="flex border-b border-gray-700">
              {['python', 'curl', 'javascript', 'go'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setCompletionLang(lang)}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    completionLang === lang
                      ? darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-white text-gray-900'
                      : darkMode 
                        ? 'hover:bg-gray-800 border-r border-gray-700 last:border-r-0'
                        : 'hover:bg-gray-100 border-r border-gray-200 last:border-r-0'
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <div className={`p-3 text-xs font-mono whitespace-pre overflow-x-auto ${
              darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'
            }`}>
{completionLang === 'python' ? 
`import polaris

polaris.api_key = "YOUR_API_KEY"

response = polaris.Completion.create(
    deployment_id="${selectedDeployedModel.id}",
    model="${selectedDeployedModel.modelName}",
    prompt="Once upon a time in a land far away,",
    max_tokens=150,
    temperature=0.7
)

print(response.choices[0].text)`
: completionLang === 'curl' ?
`curl https://api.polaris.ai/v1/deployments/${selectedDeployedModel.id}/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${selectedDeployedModel.modelName}",
    "prompt": "Once upon a time in a land far away,",
    "max_tokens": 150,
    "temperature": 0.7
  }'`
: completionLang === 'javascript' ?
`import { PolarisAPI } from 'polaris-ai';

const polaris = new PolarisAPI({
  apiKey: 'YOUR_API_KEY',
});

async function main() {
  const response = await polaris.completions.create({
    deployment_id: "${selectedDeployedModel.id}",
    model: "${selectedDeployedModel.modelName}",
    prompt: "Once upon a time in a land far away,",
    max_tokens: 150,
    temperature: 0.7
  });
  
  console.log(response.choices[0].text);
}

main();`
:
`package main

import (
	"context"
	"fmt"
	"github.com/polaris-ai/polaris-go"
)

func main() {
	client := polaris.NewClient("YOUR_API_KEY")
	
	resp, err := client.CreateCompletion(
		context.Background(),
		polaris.CompletionRequest{
			DeploymentID: "${selectedDeployedModel.id}",
			Model:        "${selectedDeployedModel.modelName}",
			Prompt:       "Once upon a time in a land far away,",
			MaxTokens:    150,
			Temperature:  0.7,
		},
	)
	
	if err != nil {
		fmt.Printf("Completion error: %v\\n", err)
		return
	}
	
	fmt.Println(resp.Choices[0].Text)
}`}
            </div>
          </div>
        </div>
        
        {/* Embeddings Endpoint */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className={`mr-2 px-2 py-0.5 text-xs font-medium rounded ${
              darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
            }`}>POST</div>
            <h4 className="text-xs font-medium">Embeddings</h4>
          </div>
          <p className="mb-3 text-sm text-gray-500">
            Generate vector embeddings for text inputs.
          </p>
          
          {/* Language tabs for Embeddings */}
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <div className="flex border-b border-gray-700">
              {['python', 'curl', 'javascript', 'go'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setEmbeddingLang(lang)}
                  className={`px-3 py-1.5 text-xs font-medium ${
                    embeddingLang === lang
                      ? darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-white text-gray-900'
                      : darkMode 
                        ? 'hover:bg-gray-800 border-r border-gray-700 last:border-r-0'
                        : 'hover:bg-gray-100 border-r border-gray-200 last:border-r-0'
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <div className={`p-3 text-xs font-mono whitespace-pre overflow-x-auto ${
              darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'
            }`}>
{embeddingLang === 'python' ? 
`import polaris

polaris.api_key = "YOUR_API_KEY"

response = polaris.Embedding.create(
    deployment_id="${selectedDeployedModel.id}",
    model="${selectedDeployedModel.modelName}",
    input="The food was delicious and the service was excellent."
)

print(response.data[0].embedding)`
: embeddingLang === 'curl' ?
`curl https://api.polaris.ai/v1/deployments/${selectedDeployedModel.id}/embeddings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${selectedDeployedModel.modelName}",
    "input": "The food was delicious and the service was excellent."
  }'`
: embeddingLang === 'javascript' ?
`import { PolarisAPI } from 'polaris-ai';

const polaris = new PolarisAPI({
  apiKey: 'YOUR_API_KEY',
});

async function main() {
  const response = await polaris.embeddings.create({
    deployment_id: "${selectedDeployedModel.id}",
    model: "${selectedDeployedModel.modelName}",
    input: "The food was delicious and the service was excellent."
  });
  
  console.log(response.data[0].embedding);
}

main();`
:
`package main

import (
	"context"
	"fmt"
	"github.com/polaris-ai/polaris-go"
)

func main() {
	client := polaris.NewClient("YOUR_API_KEY")
	
	resp, err := client.CreateEmbedding(
		context.Background(),
		polaris.EmbeddingRequest{
			DeploymentID: "${selectedDeployedModel.id}",
			Model:        "${selectedDeployedModel.modelName}",
			Input:        "The food was delicious and the service was excellent.",
		},
	)
	
	if err != nil {
		fmt.Printf("Embedding error: %v\\n", err)
		return
	}
	
	fmt.Println(resp.Data[0].Embedding)
}`}
            </div>
          </div>
        </div>
        
        {/* Response Formats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Response Formats</h3>
          <p className="mb-3 text-sm">
            All API responses follow a standard JSON format with the following structure:
          </p>
          
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <div className={`p-3 text-xs font-mono whitespace-pre overflow-x-auto ${
              darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'
            }`}>
{`// Chat Completion Response
{
  "id": "chatcmpl-123456789",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "${selectedDeployedModel.modelName}",
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 7,
    "total_tokens": 20
  },
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking!"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ]
}`}
            </div>
          </div>
        </div>
        
        {/* Error Handling */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
          <p className="mb-3 text-sm">
            Errors are returned as JSON objects with an error field:
          </p>
          
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <div className={`p-3 text-xs font-mono whitespace-pre overflow-x-auto ${
              darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'
            }`}>
{`{
  "error": {
    "message": "You exceeded your current quota, please check your plan and billing details.",
    "type": "insufficient_quota",
    "param": null,
    "code": 429
  }
}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

APIReference.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  selectedDeployedModel: PropTypes.object,
  chatLang: PropTypes.string.isRequired,
  setChatLang: PropTypes.func.isRequired,
  completionLang: PropTypes.string.isRequired,
  setCompletionLang: PropTypes.func.isRequired,
  embeddingLang: PropTypes.string.isRequired,
  setEmbeddingLang: PropTypes.func.isRequired
};

export default APIReference; 