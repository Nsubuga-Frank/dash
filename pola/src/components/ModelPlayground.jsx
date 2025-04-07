import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import {
  AlertTriangle,
  ChevronDown,
  Folder,
  Plus,
  PlusIcon,
  Save,
  Sliders,
  Trash2,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { db } from '../data/firebase.js';
import LoginModal from '../screens/LoginModal';
import Markdown from './Markdown';
import ModelDeployPanel from './ModelDeployPanel';

// Cookie utility functions
const setCookie = (name, value, days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/`;
};

const getCookie = (name) => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      try {
        return JSON.parse(cookie.substring(cookieName.length, cookie.length));
      } catch (e) {
        console.error('Error parsing cookie:', e);
        return null;
      }
    }
  }
  return null;
};

// Add this helper function near the top of the file
// Helper function to find the last index of an element in an array that matches the predicate
const findLastIndex = (array, predicate) => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
};

// Replace getChatTemplate function with getModelConfig
const getModelConfig = (modelId) => {
  // Convert to lowercase for case-insensitive matching
  const modelIdLower = modelId.toLowerCase();
  
  if (modelIdLower.includes('deepseek')) {
    return {
      endpoint: 'completions', // Use completions endpoint instead of chat/completions
      stopSequences: ["\n\n", "<|endoftext|>"]
    };
  }
  
  if (modelIdLower.includes('llama')) {
    return {
      endpoint: 'chat/completions',
      chat_template: "<s>{% for message in messages %}{% if message['role'] == 'user' %}{{ bos_token }}[INST] {{ message['content'] }} [/INST]{% elif message['role'] == 'assistant' %}{{ message['content'] }}{{ eos_token }}{% elif message['role'] == 'system' %}{{ bos_token }}[INST] <<SYS>>\n{{ message['content'] }}\n<</SYS>>\n\n{% endif %}{% endfor %}",
      stopSequences: ["</s>"]
    };
  }
  
  if (modelIdLower.includes('gemma')) {
    return {
      endpoint: 'chat/completions',
      chat_template: "{% for message in messages %}{% if message['role'] == 'user' %}<start_of_turn>user\n{{ message['content'] }}<end_of_turn>\n{% elif message['role'] == 'assistant' %}<start_of_turn>model\n{{ message['content'] }}<end_of_turn>\n{% elif message['role'] == 'system' %}<start_of_turn>system\n{{ message['content'] }}<end_of_turn>\n{% endif %}{% endfor %}{% if add_generation_prompt %}<start_of_turn>model\n{% endif %}",
      stopSequences: ["<end_of_turn>"]
    };
  }
  
  if (modelIdLower.includes('qwen')) {
    return {
      endpoint: 'chat/completions',
      stopSequences: ["\n\n", "system", "user", "assistant"]
    };
  }
  
  // Default is chat/completions for most models
  return { endpoint: 'chat/completions' };
};

// Function to prepare requests based on model type
const prepareModelRequest = (modelId, messages, temperature, maxTokens) => {
  const modelConfig = getModelConfig(modelId);
  
  // For DeepSeek and other completion-based models
  if (modelConfig.endpoint === 'completions') {
    // Convert messages to a prompt for completions API
    let prompt = '';
    
    // Extract system prompt if exists
    const systemMessage = messages.find(msg => msg.role === 'system');
    if (systemMessage) {
      prompt += `${systemMessage.content}\n\n`;
    }
    
    // Add conversation history
    for (const msg of messages) {
      if (msg.role !== 'system') {
        prompt += `${msg.role === 'user' ? 'User: ' : 'Assistant: '}${msg.content}\n`;
      }
    }
    
    // Add final prompt for completion
    if (!prompt.endsWith('Assistant: ')) {
      prompt += 'Assistant: ';
    }
    
    return {
      endpoint: modelConfig.endpoint,
      payload: {
        model: modelId,
        prompt: prompt,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: true,
        stop: modelConfig.stopSequences
      }
    };
  }
  
  // For chat-based models (default)
  return {
    endpoint: modelConfig.endpoint,
    payload: {
      model: modelId,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: true,
      stop: modelConfig.stopSequences,
      ...(modelConfig.chat_template && { chat_template: modelConfig.chat_template })
    }
  };
};

// Add this function after getModelConfig
const cleanModelResponse = (response, modelId) => {
  if (!response) return response;
  
  const modelIdLower = modelId?.toLowerCase() || '';
  
  // Clean DeepSeek tags
  if (modelIdLower.includes('deepseek')) {
    return response
      .replace(/<\|im_start\|>(user|assistant|system)(\n)?/g, '')
      .replace(/<\|im_end\|>/g, '')
      .trim();
  }
  
  // Clean LLaMA tags
  if (modelIdLower.includes('llama')) {
    return response
      .replace(/\[INST\]/g, '')
      .replace(/\[\/INST\]/g, '')
      .replace(/<<SYS>>/g, '')
      .replace(/<\/SYS>>/g, '')
      .trim();
  }
  
  // Clean Gemma tags
  if (modelIdLower.includes('gemma')) {
    return response
      .replace(/<start_of_turn>(user|model|system)(\n)?/g, '')
      .replace(/<end_of_turn>/g, '')
      .trim();
  }
  
  // Clean Qwen tags
  if (modelIdLower.includes('qwen')) {
    return response
      .replace(/<\|im_start\|>(user|assistant|system)(\n)?/g, '')
      .replace(/<\|im_end\|>/g, '')
      .trim();
  }
  
  return response;
};

/**
 * ModelPlayground
 * 
 * This version defines its own local states for chat messages,
 * projects, user input, etc., so you don't need to pass them
 * from the parent.
 */
const ModelPlayground = ({
  darkMode
}) => {
  //
  // 1) Local states for chat + playground
  //
  const [projects, setProjects] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Firebase auth
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Example chat messages: each message has {role, content}
  const [chatMessages, setChatMessages] = useState([]);
  // Message cache to store messages for each chat
  const [messageCache, setMessageCache] = useState({});
  // Current chat ID to track which chat we're viewing
  const [currentChatId, setCurrentChatId] = useState(null);

  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [abortController, setAbortController] = useState(null);

  // Example model settings - initialize with null to require selection
  const [playgroundModel, setPlaygroundModel] = useState(null);
  // Add state for model endpoint
  const [modelEndpoint, setModelEndpoint] = useState(null);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [limitContextWindow, setLimitContextWindow] = useState(false); // New state for limiting context
  const [systemPromptExpanded, setSystemPromptExpanded] = useState(true);
  const [configExpanded, setConfigExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(true);
  // Add state for right panel collapse
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);
  
  // Add state for model selection dropdown
  const [modelDropdownVisible, setModelDropdownVisible] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [modelTypeFilter, setModelTypeFilter] = useState('all');
  const [showModelTypeDropdown, setShowModelTypeDropdown] = useState(false);
  
  // Model deployment state
  const [showDeployPanel, setShowDeployPanel] = useState(false);
  const [selectedModelToDeploy, setSelectedModelToDeploy] = useState(null);
  const [modelDeploymentStatus, setModelDeploymentStatus] = useState({});
  const [checkingDeploymentStatus, setCheckingDeploymentStatus] = useState({});
  
  // Load models from Firebase 'huggingface_models' collection
  const [availableModels, setAvailableModels] = useState([]);
  
  const [clearingChat, setClearingChat] = useState(false);
  const [clearingProgress, setClearingProgress] = useState(0);
  
  // Add this to track system prompt
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant. Answer questions accurately and concisely."
  );
  
  useEffect(() => {
    const fetchModels = async () => {
      console.log('Fetching models from Firebase huggingface_models collection...');
      try {
        const modelsCollection = collection(db, 'huggingface_models');
        const modelsSnapshot = await getDocs(modelsCollection);
        
        console.log('Firebase response:', modelsSnapshot.docs.length, 'models found');
        
        const models = modelsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Model data from Firebase:', doc.id, data);
          return {
            id: doc.id,
            name: data.name,
            type: data.brand?.toLowerCase() || 'unknown',
            status: 'available',
            parameters: data.parameters,
            requirements: data.requirements,
            size: data.size,
            huggingface_id: data.huggingface_id
          };
        });
        
        console.log('Processed models for UI:', models);
        setAvailableModels(models);
      } catch (error) {
        console.error('Error fetching models from Firebase:', error);
        toast.error('Failed to load models');
      }
    };
    
    fetchModels();
  }, []);
  
  // Model type options
  const modelTypes = [
    { id: 'all', name: 'All Models' },
    { id: 'llama', name: 'Llama' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'gemma', name: 'Gemma' },
    { id: 'qwen', name: 'Qwen' }
  ];
  
  // Ref for model dropdown and model type dropdown
  const modelDropdownRef = useRef(null);
  const modelTypeDropdownRef = useRef(null);
  
  // Function to toggle model dropdown
  const toggleModelDropdown = () => {
    setModelDropdownVisible(!modelDropdownVisible);
    setShowModelTypeDropdown(false);
  };
  
  // Function to toggle model type dropdown
  const toggleModelTypeDropdown = (e) => {
    e.stopPropagation();
    setShowModelTypeDropdown(!showModelTypeDropdown);
  };
  
  // Function to select a model type
  const selectModelType = (type) => {
    setModelTypeFilter(type);
    setShowModelTypeDropdown(false);
  };
  
  // Function to select a model
  const selectModel = async (model) => {
    setPlaygroundModel(model);
    setModelDropdownVisible(false);
    
    try {
      // Find the chat endpoint for this model
      const endpoint = await findModelEndpoint(model.id);
      setModelEndpoint(endpoint);
      
      if (!endpoint) {
        toast.warn('Model selected, but no chat endpoint found. Generation might not work.');
      }
    } catch (error) {
      console.error('Failed to set model endpoint:', error);
    }
  };
  
  // Function to handle model deployment
  const handleDeployModel = (model) => {
    setSelectedModelToDeploy(model);
    setShowDeployPanel(true);
    setModelDropdownVisible(false);
  };
  
  // Function to handle deployment completion
  const handleModelDeployed = (result) => {
    if (result && result.success) {
      // Add the newly deployed model to modelDeploymentStatus
      setModelDeploymentStatus(prev => ({
        ...prev,
        [selectedModelToDeploy.id]: 'running'
      }));
      
      toast.success(`Model ${selectedModelToDeploy.name} deployed successfully!`);
    }
    return { success: true };
  };
  
  // Function to check a model's deployment status
  const fetchModelDeploymentStatus = async (modelId) => {
    try {
      setCheckingDeploymentStatus(prev => ({...prev, [modelId]: true}));
      
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in to check deployment status');
        setCheckingDeploymentStatus(prev => ({...prev, [modelId]: false}));
        return null;
      }
      
      // Get the model details to find its huggingface_id
      const model = availableModels.find(m => m.id === modelId);
      if (!model || !model.huggingface_id) {
        console.log(`Model ${modelId} not found or has no huggingface_id`);
        setCheckingDeploymentStatus(prev => ({...prev, [modelId]: false}));
        return null;
      }
      
      const huggingfaceId = model.huggingface_id.toLowerCase();
      console.log(`COMPARISON CHECK - Model: ${modelId} with huggingface_id: ${huggingfaceId}`);
      
      // Check deployments collection
      const deploymentsRef = collection(db, 'deployments');
      const deploymentsQuery = query(
        deploymentsRef,
        where('userId', '==', user.uid)
      );
      
      const deploymentsSnapshot = await getDocs(deploymentsQuery);
      
      console.log(`DEPLOYMENTS DATA - Found ${deploymentsSnapshot.docs.length} deployments for user ${user.uid}`);
      
      if (deploymentsSnapshot.empty) {
        console.log(`No deployments found for user ${user.uid}`);
        setModelDeploymentStatus(prev => ({
          ...prev,
          [modelId]: null
        }));
        setCheckingDeploymentStatus(prev => ({...prev, [modelId]: false}));
        return null;
      }
      
      // Find a deployment that matches this model's huggingface_id
      let matchingDeployment = null;
      
      // Log all deployments for debugging
      deploymentsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`DEPLOYMENT ${index + 1} - FULL DATA:`, {
          id: doc.id,
          ...data
        });
      });
      
      for (const doc of deploymentsSnapshot.docs) {
        const data = doc.data();
        // Prioritize modelId as it's the field name in your deployment documents
        const deploymentModelId = data.modelId ? data.modelId.toLowerCase() : '';
        
        console.log(`COMPARISON - Comparing huggingface_id: "${huggingfaceId}" with deployment modelId: "${deploymentModelId}"`);
        
        // Check if the deployment's modelId matches the huggingface_id
        if (deploymentModelId === huggingfaceId) {
          matchingDeployment = { 
            id: doc.id, 
            // Extract specific fields we need rather than the entire data object
            status: data.status || '',
            modelId: data.modelId || '',
            userId: data.userId || '',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            // Store status as a string, not an object
            statusText: typeof data.status === 'string' ? data.status : 
                        (data.status && typeof data.status === 'object') ? 'active' : ''
          };
          console.log(`MATCH FOUND - Deployment ${doc.id} matches model ${modelId}:`, matchingDeployment);
          break;
        }
      }
      
      if (!matchingDeployment) {
        console.log(`NO MATCH - No matching deployment found for model ${modelId} with huggingface_id ${huggingfaceId}`);
        setModelDeploymentStatus(prev => ({
          ...prev,
          [modelId]: null
        }));
        setCheckingDeploymentStatus(prev => ({...prev, [modelId]: false}));
        return null;
      }
      
      // Update state with the deployment status
      setModelDeploymentStatus(prev => ({
        ...prev,
        [modelId]: matchingDeployment
      }));
      
      setCheckingDeploymentStatus(prev => ({...prev, [modelId]: false}));
      return matchingDeployment;
    } catch (error) {
      console.error('Error checking model deployment status:', error);
      setCheckingDeploymentStatus(prev => ({...prev, [modelId]: false}));
      return null;
    }
  };

  // Helper function to determine what action button to show for a model
  const getModelAction = (model) => {
    // Show loading indicator while checking deployment status
    if (checkingDeploymentStatus[model.id]) {
      return {
        action: 'loading',
        text: 'Checking...'
      };
    }
    
    const deploymentStatus = modelDeploymentStatus[model.id];
    console.log(`UI STATUS CHECK - Model ${model.id} (${model.name}) deployment status:`, deploymentStatus);
    
    // If no deployment exists, show Deploy button
    if (!deploymentStatus) {
      console.log(`UI ACTION - No deployment for model ${model.id}, showing Deploy button`);
      return {
        action: 'deploy',
        text: 'Deploy'
      };
    }
    
    // Safeguard: handle if deploymentStatus is directly an object that would cause rendering issues
    if (typeof deploymentStatus === 'object' && !deploymentStatus.status && !deploymentStatus.statusText) {
      console.log(`UI ACTION - Model ${model.id} has unexpected deployment status format, defaulting to 'Select'`);
      return {
        action: 'select',
        text: 'Select'
      };
    }
    
    // Get actual status from the deployment object
    const status = typeof deploymentStatus.status === 'string' ? deploymentStatus.status.toLowerCase() :
                   typeof deploymentStatus.statusText === 'string' ? deploymentStatus.statusText.toLowerCase() :
                   // If status is an object or complex structure, default to 'active'
                   (deploymentStatus.status && typeof deploymentStatus.status === 'object') ? 'active' : '';
    
    console.log(`UI STATUS EXTRACT - Model ${model.id} extracted status: "${status}" from:`, deploymentStatus);
    
    // If the model is already deployed and active
    const activeStatuses = ['active', 'running', 'completed'];
    if (activeStatuses.includes(status)) {
      console.log(`UI ACTION - Model ${model.id} status "${status}" is active, showing Select button`);
      return {
        action: 'select',
        text: 'Select'
      };
    }
    
    // For non-active deployments, show status (with safeguard for object status)
    const displayText = typeof status === 'string' ? 
                        (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending') : 
                        'Pending';
    
    console.log(`UI ACTION - Model ${model.id} status "${status}" is not active, showing status: ${displayText}`);
    return {
      action: 'monitor',
      text: displayText
    };
  };

  // Refetch deployment statuses periodically
  useEffect(() => {
    // Only run if we have a user ID and models to check
    if (!userId || availableModels.length === 0) return;
    
    console.log('Setting up deployment status checking for Playground models');
    
    // Initial fetch of deployment statuses
    availableModels.forEach(model => {
      if (model.id) {
        fetchModelDeploymentStatus(model.id);
      }
    });
    
    // Set up interval for real-time status checking (every 15 seconds)
    const intervalId = setInterval(() => {
      console.log('Refreshing model deployment statuses');
      availableModels.forEach(model => {
        if (model.id) {
          fetchModelDeploymentStatus(model.id);
        }
      });
    }, 15000);
    
    // Clean up interval on component unmount
    return () => {
      console.log('Cleaning up deployment status interval');
      clearInterval(intervalId);
    };
    
  }, [availableModels, userId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setModelDropdownVisible(false);
      }
      if (
        modelTypeDropdownRef.current && 
        !modelTypeDropdownRef.current.contains(event.target) &&
        event.target.id !== 'model-type-button'
      ) {
        setShowModelTypeDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtered models based on search, model type, and deployment status
  const filteredModels = availableModels.filter(model => {
    // Type filter check
    const typeMatch = modelTypeFilter === 'all' || model.type === modelTypeFilter;
    
    // Search filter check
    const searchMatch = modelSearchQuery.trim() === '' || 
      model.name.toLowerCase().includes(modelSearchQuery.toLowerCase());
    
    return typeMatch && searchMatch;
  });

  // Ref to scroll chat into view
  const messagesEndRef = useRef(null);
  const newProjectInputRef = useRef(null);
  // Add state for confirmation dialog
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null, // 'project' or 'chat'
    itemId: null,
    itemName: '',
    isDeleting: false
  });

  // Add state for panel sizes
  const [panelSizes, setPanelSizes] = useState({
    left: 192, // w-48 is 12rem or 192px
    right: rightPanelExpanded ? 288 : 40 // w-72 is 18rem or 288px, collapsed is 40px
  });

  // Add refs for resize handling
  const leftPanelRef = useRef(null);
  const middlePanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const leftResizeRef = useRef(null);
  const rightResizeRef = useRef(null);

  //
  // 2) Firebase integration
  //
  
  // Check auth state changes to load projects when user signs in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, load their projects
        await fetchProjects(user.uid);
      } else {
        // User is signed out
        setProjects([]);
        setChatHistory([]);
        setChatMessages([]);
        setMessageCache({});
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  // Fetch projects and chat history on component mount
  const fetchProjects = async (userIdParam) => {
    const currentUserId = userIdParam || userId;
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const projectsRef = collection(db, 'playground_projects');
      const q = query(
        projectsRef,
        where('userId', '==', currentUserId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expanded: false
      }));
      
      // Default expand the first project if there is one
      if (fetchedProjects.length > 0) {
        fetchedProjects[0].expanded = true;
        setProjects(fetchedProjects);
        
        // Fetch chats for this project
        await fetchChats(fetchedProjects[0].id, currentUserId);
      } else {
        setProjects([]);
        setChatHistory([]);
      }
      
      // If no projects, show create project input
      if (fetchedProjects.length === 0) {
        setShowNewProjectInput(true);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch chats for a specific project
  const fetchChats = async (projectId, userIdParam) => {
    const currentUserId = userIdParam || userId;
    if (!currentUserId || !projectId) return;
    
    try {
      // Clear chat history before fetching new chats to avoid duplicates
      setChatHistory([]);
      setChatMessages([]);
      
      const chatsRef = collection(db, 'playground_chats');
      const q = query(
        chatsRef,
        where('userId', '==', currentUserId),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedChats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        projectId: projectId, // Explicitly store projectId in the chat object
        selected: false
      }));
      
      // Select the first chat if available
      if (fetchedChats.length > 0) {
        fetchedChats[0].selected = true;
        setChatHistory(fetchedChats);
        
        // Set current chat ID
        setCurrentChatId(fetchedChats[0].id);
        
        // Fetch messages for this chat
        await fetchMessages(fetchedChats[0].id, currentUserId);
      } else {
        setChatHistory([]);
        setChatMessages([]);
        
        // Create a default chat if there are no chats
        if (projects.find(p => p.id === projectId)) {
          await handleCreateChat(projectId, "New Chat");
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    }
  };
  
  // Fetch messages for a specific chat
  const fetchMessages = async (chatId, userIdParam) => {
    const currentUserId = userIdParam || userId;
    if (!currentUserId || !chatId) {
      console.error("Cannot fetch messages: missing user ID or chat ID", { userId: currentUserId, chatId });
      return;
    }
    
    try {
      console.log(`Fetching messages for chat ${chatId}`);
      
      // Check if we already have messages in the cache
      if (messageCache[chatId] && messageCache[chatId].length > 0) {
        console.log(`Using cached messages for chat ${chatId}`, { count: messageCache[chatId].length });
        // Use cached messages first for instant display
        setChatMessages(messageCache[chatId]);
        
        // Still show loading but with existing messages
        setIsProcessing(true);
      } else {
        // No cached messages, show loading state and clear messages
        console.log(`No cached messages for chat ${chatId}, fetching from Firebase`);
        setIsProcessing(true);
        setChatMessages([]);
      }
      
      // Fetch from Firebase
      const messagesRef = collection(db, 'playground_messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc')
      );
      
      console.log(`Executing Firebase query for chat ${chatId}`);
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.docs.length} messages for chat ${chatId}`);
      
      // Log detailed info about messages
      if (querySnapshot.docs.length === 0) {
        console.warn(`No messages found for chat ${chatId}. This might indicate a problem.`);
      } else {
        // Log detailed info about the first few messages
        querySnapshot.docs.slice(0, 3).forEach((doc, i) => {
          const data = doc.data();
          console.log(`Message ${i+1} details:`, {
            id: doc.id,
            role: data.role,
            contentPreview: data.content ? data.content.substring(0, 30) + '...' : 'No content',
            timestamp: data.createdAt,
            hasRequiredFields: Boolean(data.chatId && data.role && data.content)
          });
        });
      }
      
      const fetchedMessages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Check and handle serverTimestamp conversions 
        const createdAt = data.createdAt ? 
          (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : data.createdAt) 
          : new Date();
          
        return {
          id: doc.id,
          ...data,
          createdAt
        };
      });
      
      // Sort messages by timestamp in case order wasn't preserved
      fetchedMessages.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      // Count messages by role for debugging
      const userMsgCount = fetchedMessages.filter(msg => msg.role === 'user').length;
      const assistantMsgCount = fetchedMessages.filter(msg => msg.role === 'assistant').length;
      console.log(`Message counts: ${userMsgCount} user, ${assistantMsgCount} assistant messages`);
      
      // Update cache with new messages
      setMessageCache(prev => ({
        ...prev,
        [chatId]: fetchedMessages
      }));
      
      // Update chat messages
      setChatMessages(fetchedMessages);
      setIsProcessing(false);
    } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      toast.error("Failed to load chat messages");
      setIsProcessing(false);
    }
  };
  
  // Create a new project
  const handleCreateProject = async () => {
    if (!userId || !newProjectName.trim()) return;
    
    setLoadingProject(true);
    try {
      const projectData = {
        userId,
        name: newProjectName.trim(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'playground_projects'), projectData);
      
      // Add to local state
      const newProject = {
        id: docRef.id,
        ...projectData,
        createdAt: new Date(),
        expanded: true
      };
      
      // Collapse all other projects
      const updatedProjects = projects.map(p => ({ ...p, expanded: false }));
      setProjects([newProject, ...updatedProjects]);
      
      // Reset input
      setNewProjectName('');
      setShowNewProjectInput(false);
      
      // Create a default chat for this project
      await handleCreateChat(docRef.id, "New Chat");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setLoadingProject(false);
    }
  };
  
  // Create a new chat
  const handleCreateChat = async (projectId, name = "New Chat") => {
    if (!userId || !projectId) return;
    
    setLoadingChat(true);
    try {
      const chatData = {
        userId,
        projectId,
        name,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'playground_chats'), chatData);
      
      // Add to local state
      const newChat = {
        id: docRef.id,
        ...chatData,
        createdAt: new Date(),
        selected: true
      };
      
      // Deselect all other chats
      const updatedChats = chatHistory.map(c => ({ ...c, selected: false }));
      setChatHistory([newChat, ...updatedChats]);
      
      // Clear messages
      setChatMessages([]);
      
      return docRef.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat");
    } finally {
      setLoadingChat(false);
    }
  };

  // Generate a chat name from the first message
  const generateChatName = (message) => {
    // Get first 30 characters of the message
    const truncated = message.slice(0, 30);
    
    // If the message is shorter than 30 chars, use it as is
    // Otherwise add ellipsis
    const baseName = truncated.length < 30 ? truncated : `${truncated}...`;
    
    // Remove special characters, make it title case
    return baseName
      .replace(/[^\w\s]/gi, '')
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 4)
      .join(' ');
  };

  // Update chat name in Firebase and local state
  const updateChatName = async (chatId, newName) => {
    if (!userId || !chatId) return;
    
    try {
      // Update in Firebase
      const chatRef = doc(db, 'playground_chats', chatId);
      await updateDoc(chatRef, { name: newName });
      
      // Update in local state
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, name: newName } : chat
        )
      );
    } catch (error) {
      console.error("Error updating chat name:", error);
      toast.error("Failed to update chat name");
    }
  };

  //
  // 3) Handlers
  //
  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      
      // Update the UI to show generation was stopped
      setChatMessages(messages => {
        const updatedMessages = [...messages];
        const lastIndex = updatedMessages.length - 1;
        if (lastIndex >= 0 && updatedMessages[lastIndex].isThinking) {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            isThinking: false,
            stopped: true,
            content: updatedMessages[lastIndex].content + " [Generation stopped]"
          };
        }
        return updatedMessages;
      });
      
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Check if a model has been selected
    if (!playgroundModel) {
      toast.error("Please select a model first");
      return;
    }
    
    // Get selected chat ID or active project to create new chat
    const selectedChat = chatHistory.find(c => c.selected);
    const activeProject = projects.find(p => p.expanded);
    
    // If no active project, show error
    if (!activeProject) {
      toast.error("Please create or select a project first");
      return;
    }

    let currentChatId = selectedChat?.id;
    let isFirstMessage = false;
    
    // If no chat is selected, create a new chat
    if (!currentChatId) {
      currentChatId = await handleCreateChat(activeProject.id);
      isFirstMessage = true;
      
      // Set current chat ID for the new chat
      setCurrentChatId(currentChatId);
    }
    
    setIsProcessing(true);

    try {
      // Create user message in Firebase
      const userMessageData = {
        chatId: currentChatId,
        role: 'user',
        content: userInput,
        createdAt: serverTimestamp()
      };
      
      const userMsgRef = await addDoc(collection(db, 'playground_messages'), userMessageData);
      
      // Add to local state
      const userMsg = {
        id: userMsgRef.id,
        ...userMessageData,
        createdAt: new Date()
      };
      
      // Update chat messages and cache
      const updatedMessages = [...chatMessages, userMsg];
      setChatMessages(updatedMessages);
      setMessageCache(prev => ({
        ...prev,
        [currentChatId]: updatedMessages
      }));
      
      setUserInput('');

      // If this is the first message in the chat, auto-generate a name
      if (isFirstMessage || chatMessages.length === 0) {
        const generatedName = generateChatName(userInput);
        await updateChatName(currentChatId, generatedName);
      }

      // Check if we have an endpoint to call
      if (modelEndpoint) {
        console.log(`Calling model API at: ${modelEndpoint}`);
        
        // Prepare messages for API call - convert Firebase format to OpenAI format
        const allMessages = updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Option to limit context window (only send recent messages)
        let messages;
        if (limitContextWindow) {
          // Take only the most recent user message
          const lastUserMessageIndex = findLastIndex(allMessages, msg => msg.role === 'user');
          if (lastUserMessageIndex >= 0) {
            // Only include the last user message
            messages = [allMessages[lastUserMessageIndex]];
          } else {
            messages = allMessages;
          }
        } else {
          // Use all conversation history for context
          messages = allMessages;
          console.log(`Sending ${messages.length} messages to maintain full conversation context`);
        }
        
        // Add system prompt if it's not already in the messages
        if (!messages.some(msg => msg.role === 'system')) {
          messages.unshift({ 
            role: 'system', 
            content: systemPrompt || "You are a helpful assistant. Only respond to the user's most recent question. Do not reference or include information from previous exchanges in the conversation." 
          });
        } else {
          // Update existing system prompt with focus instruction
          const systemIndex = messages.findIndex(msg => msg.role === 'system');
          if (systemIndex >= 0) {
            messages[systemIndex].content += " Only respond to the user's most recent question. Do not reference or include information from previous exchanges in the conversation.";
          }
        }
        
        // Make API request to the model endpoint
        try {
          // Create a temporary assistant "thinking" message

          const modelIdForAPI = (playgroundModel.huggingface_id || playgroundModel.model_id || "").toLowerCase();
          console.log(`Using model ID for API request: ${modelIdForAPI} (instead of Firebase document ID: ${playgroundModel.id})`);

          const thinkingMsg = {
            id: 'thinking',
            chatId: currentChatId,
            role: 'assistant',
            model: playgroundModel.name || playgroundModel.id, // Show model name instead of ID
            content: '',
            isThinking: true,
            createdAt: new Date()
          };
          
          // Add thinking message to UI
          setChatMessages([...updatedMessages, thinkingMsg]);
          
          // Enhanced debugging for the API request
          console.log(`Making API request to: ${modelEndpoint}`);
          
          console.log(`With payload:`, {
            model: modelIdForAPI, // Fix this to show the correct model ID that's being sent
            messagesCount: messages.length,
            temperature,
            max_tokens: maxTokens,
            stream: true
          });
          
          // Create a new AbortController for this request
          const controller = new AbortController();
          setAbortController(controller);
          
          // Validate the endpoint URL before attempting to connect
          if (!modelEndpoint || typeof modelEndpoint !== 'string' || !modelEndpoint.startsWith('http')) {
            throw new Error(`Invalid model endpoint URL: ${modelEndpoint}`);
          }
          
          // Add stream parameter to use streaming responses
          let response;
          let retryCount = 0;
          const maxRetries = 3; // Increased from 2 to 3
          const retryDelays = [1000, 3000, 5000]; // Wait 1s, 3s, then 5s between retries
          
          // Set a longer timeout for fetch requests
          const timeoutController = new AbortController();
          const timeout = setTimeout(() => {
            timeoutController.abort();
          }, 30000); // 30 second timeout
          
          // Combine the user's abort controller with the timeout controller
          const combinedSignal = AbortSignal.any([
            controller.signal,
            timeoutController.signal
          ]);

          while (retryCount <= maxRetries) {
            try {
              console.log(`Making API fetch attempt ${retryCount + 1}...`);
              // First get the actual model name
              const modelIdForAPI = (playgroundModel.huggingface_id || playgroundModel.model_id || "").toLowerCase();
              console.log(`Using model ID for API request: ${modelIdForAPI} (instead of Firebase document ID: ${playgroundModel.id})`);

              // Prepare the request based on model type
              const request = prepareModelRequest(modelIdForAPI, messages, temperature, maxTokens);
              
              // Construct the endpoint URL
              const apiEndpoint = `${modelEndpoint.replace(/\/v1\/(chat\/)?completions\/?$/, '')}/v1/${request.endpoint}`;
              
              // Log request details
              console.log(`Making API request to: ${apiEndpoint}`);
              console.log(`With payload:`, request.payload);

              // Send the request
              response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'bypass-tunnel-reminder': 'true'
                },
                body: JSON.stringify(request.payload),
                signal: combinedSignal
              });

              // If we succeed or get any response, break retry loop
              break;
            } catch (fetchError) {
              retryCount++;
              console.warn(`Fetch attempt ${retryCount} failed:`, fetchError.message);
              
              // If we've reached max retries or it's not a network error, rethrow
              if (retryCount > maxRetries || 
                 (fetchError.name !== 'TypeError' && fetchError.name !== 'AbortError')) {
                throw fetchError;
              }
              
              // Wait before retrying (with increasing delay)
              const delay = retryDelays[retryCount - 1] || 5000;
              console.log(`Waiting ${delay}ms before retry ${retryCount}...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
          
          // Clear the timeout
          clearTimeout(timeout);

          // Check if the response is ok (status in the range 200-299)
          if (!response.ok) {
            // Enhanced error handling for non-ok responses
            const errorDetails = {
              status: response.status,
              statusText: response.statusText,
              endpoint: modelEndpoint,
              headers: Object.fromEntries(response.headers.entries())
            };
            
            console.error('API error details: ', errorDetails);
            
            let errorBody = '';
            try {
              // Try to parse response body as JSON
              errorBody = await response.text();
              console.error('Error response body:', errorBody);
            } catch (e) {
              console.error('Failed to read error response body');
            }
            
            // If it's a timeout (504), show a more user-friendly message
            if (response.status === 504) {
              // Try an alternate endpoint if this is a Gateway Timeout
              toast.error('Model is taking too long to respond. Your message might be too complex or the model might be overloaded.');
              
              // Remove the thinking message
              setChatMessages(updatedMessages);
              
              throw new Error(`Model timed out. Try a shorter message or try again later.`);
            }
            
            // For all other errors
            throw new Error(`API error: ${response.status} ${response.statusText}\n${errorBody}`);
          }
          
          // Initial empty content for streaming
          let streamedContent = '';
          const assistantMessageData = {
            chatId: currentChatId,
            role: 'assistant',
            model: playgroundModel.name || playgroundModel.id, // Show model name instead of ID
            content: '',
            createdAt: serverTimestamp()
          };
          
          // Get a reader from the response body stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          // Process the stream
          let streamDone = false;
          try {
            while (!streamDone) {
              const { done, value } = await reader.read();
              if (done) {
                streamDone = true;
                break;
              }
              
              // Decode the chunk and split by lines
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() !== '');
              
              // Process each line (each line is an SSE event)
              for (const line of lines) {
                // SSE format: each message starts with "data: "
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim();
                  
                  // Skip "[DONE]" message which indicates end of stream
                  if (data === '[DONE]') continue;
                  
                  try {
                    const parsed = JSON.parse(data);
                    
                    // Handle chat completions (has choices with delta)
                    if (parsed.choices && parsed.choices[0]?.delta?.content) {
                      // Append new token to the content
                      streamedContent += parsed.choices[0].delta.content;
                    }
                    // Handle completions (has choices with text)
                    else if (parsed.choices && parsed.choices[0]?.text) {
                      // Append new token to the content
                      streamedContent += parsed.choices[0].text;
                    }
                    
                    // Clean the content based on model type before displaying
                    const cleanedContent = cleanModelResponse(streamedContent, modelIdForAPI);
                    
                    // Update UI with current streamed content
                    setChatMessages(messages => {
                      const updatedMessages = [...messages];
                      // Find and update the thinking message
                      const lastIndex = updatedMessages.length - 1;
                      if (lastIndex >= 0 && updatedMessages[lastIndex].isThinking) {
                        updatedMessages[lastIndex] = {
                          ...updatedMessages[lastIndex],
                          content: cleanedContent,
                          isThinking: true // Keep thinking state during generation
                        };
                      }
                      return updatedMessages;
                    });
                  } catch (e) {
                    console.error('Error parsing streaming data:', e);
                  }
                }
              }
            }
          } catch (e) {
            // Check if this was an abort error
            if (e.name === 'AbortError') {
              console.log('Request was aborted');
              // We handle this in the abort handler, so just return
              return;
            } else {
              // Re-throw other errors
              throw e;
            }
          }
          
          // After stream is complete, save the complete response to Firebase
          assistantMessageData.content = cleanModelResponse(streamedContent, modelIdForAPI);
          
          try {
            console.log("Saving assistant response to Firebase:", {
              chatId: currentChatId,
              role: 'assistant',
              modelName: playgroundModel?.name,
              contentLength: assistantMessageData.content.length
            });
            
            // Double check that we have a valid chatId before saving
            if (!currentChatId) {
              console.error("Cannot save assistant message: currentChatId is missing");
              throw new Error("Missing chat ID for assistant message");
            }
            
            // Ensure content isn't empty
            if (!streamedContent || streamedContent.trim() === '') {
              console.warn("Assistant message content is empty, adding placeholder");
              assistantMessageData.content = "[No response generated]";
            }
            
            const assistantMsgRef = await addDoc(collection(db, 'playground_messages'), assistantMessageData);
            console.log("Successfully saved assistant message with ID:", assistantMsgRef.id);
            
            // Add to local state with the final content
            const assistantMsg = {
              id: assistantMsgRef.id,
              ...assistantMessageData,
              createdAt: new Date(),
              isThinking: false // Mark as no longer thinking when complete
            };
            
            // Update both chat messages and cache with the final message
            setChatMessages(messages => {
              // Replace the temporary thinking message with the final one
              const filteredMessages = messages.filter(msg => !msg.isThinking);
              return [...filteredMessages, assistantMsg];
            });
            
            setMessageCache(prev => {
              const existingMessages = prev[currentChatId] || [];
              const filteredMessages = existingMessages.filter(msg => !msg.isThinking);
              return {
                ...prev,
                [currentChatId]: [...filteredMessages, assistantMsg]
              };
            });
          } catch (saveError) {
            console.error("Failed to save assistant message to Firebase:", saveError);
            toast.error("Failed to save assistant's response. The message may not appear after reload.");
            
            // Still update UI with the response even if Firebase save failed
            setChatMessages(messages => {
              const filteredMessages = messages.filter(msg => !msg.isThinking);
              return [...filteredMessages, {
                id: 'local-only-' + Date.now(),
                chatId: currentChatId,
                role: 'assistant',
                model: playgroundModel?.name || playgroundModel?.id,
                content: streamedContent,
                createdAt: new Date(),
                localOnly: true, // Mark as not saved to Firebase
                isThinking: false
              }];
            });
          }
          
          // Clear the abort controller
          setAbortController(null);
        } catch (error) {
          console.error('Error calling model API:', error);
          
          // Update the thinking message to show the error
          setChatMessages(messages => {
            const updatedMessages = [...messages];
            // Find the thinking message
            const thinkingIndex = updatedMessages.findIndex(msg => msg.isThinking);
            if (thinkingIndex >= 0) {
              updatedMessages[thinkingIndex] = {
                ...updatedMessages[thinkingIndex],
                content: `Error: ${error.message}`,
                isThinking: false,
                error: true
              };
            }
            return updatedMessages;
          });
          
          // Clear the abort controller
          setAbortController(null);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewChat = async () => {
    // Find the active project
    const activeProject = projects.find(p => p.expanded);
    
    if (!activeProject) {
      toast.error("Please create or select a project first");
      return;
    }
    
    // Create a new chat in the active project
    await handleCreateChat(activeProject.id);
  };

  const handleClearChat = async () => {
    // Get selected chat ID
    const selectedChat = chatHistory.find(c => c.selected);
    if (!selectedChat) return;
    
    try {
      // Set clearing state to show animation
      setClearingChat(true);
      setClearingProgress(10); // Start progress
      
      // Apply fading animation to chat messages
      setChatMessages(messages => 
        messages.map(msg => ({
          ...msg,
          isClearing: true
        }))
      );
      
      // Simulate stages of progress
      setTimeout(() => setClearingProgress(30), 300);
      setTimeout(() => setClearingProgress(60), 600);
      
      // Get all messages for this chat
      const messagesRef = collection(db, 'playground_messages');
      const q = query(
        messagesRef,
        where('chatId', '==', selectedChat.id)
      );
      
      const querySnapshot = await getDocs(q);
      setClearingProgress(80); // Update progress
      
      // Create a batch for performance
      const batch = writeBatch(db);
      
      // Add delete operations to batch
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Commit the batch
      await batch.commit();
      setClearingProgress(100); // Complete progress
      
      // Short delay for animation completion
      setTimeout(() => {
        // Clear local state and cache
        setChatMessages([]);
        setMessageCache(prev => ({
          ...prev,
          [selectedChat.id]: []
        }));
        
        // Reset clearing state
        setClearingChat(false);
        setClearingProgress(0);
        
        toast.success("Chat cleared successfully");
      }, 400);
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat");
      setClearingChat(false);
      setClearingProgress(0);
    }
  };

  const handleSaveChat = async () => {
    // Get selected chat ID
    const selectedChat = chatHistory.find(c => c.selected);
    if (!selectedChat) {
      toast.error("No chat selected to save");
      return;
    }
    
    try {
      // Update the chat in Firebase to mark it as saved
      const chatRef = doc(db, 'playground_chats', selectedChat.id);
      await updateDoc(chatRef, { 
        saved: true,
        lastSavedAt: serverTimestamp()
      });
      
      // Update local state
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, saved: true, lastSavedAt: new Date() } 
            : chat
        )
      );
      
      toast.success("Chat saved successfully");
    } catch (error) {
      console.error("Error saving chat:", error);
      toast.error("Failed to save chat");
    }
  };

  const handleChatSelect = async (chatId) => {
    // Skip if already selected
    const currentSelected = chatHistory.find(c => c.selected);
    if (currentSelected?.id === chatId) return;
    
    // Find the chat to select 
    const chatToSelect = chatHistory.find(c => c.id === chatId);
    if (!chatToSelect) return;
    
    // Track the current chat ID
    setCurrentChatId(chatId);
    
    // Mark that chat as selected
    setChatHistory((prev) =>
      prev.map((c) => ({
        ...c,
        selected: c.id === chatId
      }))
    );
    
    // Fetch messages for this chat
    await fetchMessages(chatId);
  };

  // Expand/collapse a project
  const toggleProject = async (projectId) => {
    const projectToToggle = projects.find(p => p.id === projectId);
    
    if (!projectToToggle) return;
    
    // If already expanded, just collapse it
    if (projectToToggle.expanded) {
    setProjects((prev) =>
      prev.map((p) =>
          p.id === projectId ? { ...p, expanded: false } : p
        )
      );
      return;
    }
    
    // Otherwise collapse all projects first, then expand the selected one
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, expanded: true } : { ...p, expanded: false }
      )
    );
    
    // Fetch chats for this project
    await fetchChats(projectId);
  };

  const handleTemperatureChange = (e) => {
    const value = parseFloat(e.target.value);
    setTemperature(value);
    
    // Optionally save to cookies
    try {
      const settings = getCookie('polaris_model_settings') || {};
      setCookie('polaris_model_settings', {
        ...settings,
        temperature: value
      });
    } catch (error) {
      console.error('Error saving temperature to cookie:', error);
    }
  };

  const handleMaxTokensChange = (e) => {
    const value = parseInt(e.target.value);
    setMaxTokens(value);
    
    // Optionally save to cookies
    try {
      const settings = getCookie('polaris_model_settings') || {};
      setCookie('polaris_model_settings', {
        ...settings,
        maxTokens: value
      });
    } catch (error) {
      console.error('Error saving maxTokens to cookie:', error);
    }
  };

  // Function to toggle sections in the UI
  const toggleSection = (section) => {
    switch(section) {
      case 'systemPrompt':
        setSystemPromptExpanded(!systemPromptExpanded);
        break;
      case 'config':
        setConfigExpanded(!configExpanded);
        break;
      case 'notes':
        setNotesExpanded(!notesExpanded);
        break;
      default:
        break;
    }
  };

  // Apply the configuration settings
  const applyModelSettings = () => {
    // If we're in an active chat, notify the user this will apply to future messages
    if (chatMessages.length > 0) {
      toast.success("Settings will be applied to your next message");
    } else {
      toast.success("Model settings applied successfully");
    }
    
    // Log the current settings for debugging
    console.log('Applied model settings:', {
      model: playgroundModel?.name || 'Not selected',
      temperature,
      maxTokens,
      systemPromptLength: systemPrompt.length,
      endpoint: modelEndpoint || 'None'
    });
  };

  const handleSaveSystemPrompt = () => {
    toast.success('System prompt updated successfully');
  };

  // Load previously selected model AND endpoint from cookies
  useEffect(() => {
    // Models are loaded on demand now without cookies
  }, [playgroundModel, availableModels]);

  // Focus new project input when shown
  useEffect(() => {
    if (showNewProjectInput && newProjectInputRef.current) {
      newProjectInputRef.current.focus();
    }
  }, [showNewProjectInput]);

  //
  // 4) Scroll to bottom of chat on new messages
  //
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Add function to delete a project
  const handleDeleteProject = async (projectId) => {
    if (!userId || !projectId) return;
    
    try {
      // Set deleting state
      setDeleteConfirmation(prev => ({
        ...prev,
        isDeleting: true
      }));
      
      // Get all chats for this project first
      const chatsRef = collection(db, 'playground_chats');
      const chatsQuery = query(
        chatsRef,
        where('userId', '==', userId),
        where('projectId', '==', projectId)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      const chatIds = chatsSnapshot.docs.map(doc => doc.id);
      
      // Get all messages for these chats
      const messagesPromises = chatIds.map(async (chatId) => {
        const messagesRef = collection(db, 'playground_messages');
        const messagesQuery = query(
          messagesRef,
          where('chatId', '==', chatId)
        );
        return getDocs(messagesQuery);
      });
      
      const messagesSnapshots = await Promise.all(messagesPromises);
      
      // Create a batch for all deletions
      const batch = writeBatch(db);
      
      // Add all messages to batch delete
      messagesSnapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      });
      
      // Add all chats to batch delete
      chatsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add project to batch delete
      const projectRef = doc(db, 'playground_projects', projectId);
      batch.delete(projectRef);
      
      // Commit all deletes in one batch
      await batch.commit();
      
      // Update local state to remove the project
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // If this was the expanded project, clear chat history
      if (projects.find(p => p.id === projectId && p.expanded)) {
        setChatHistory([]);
        setChatMessages([]);
      }
      
      toast.success("Project deleted successfully");
      
      // Close confirmation dialog
      setDeleteConfirmation({
        isOpen: false,
        type: null,
        itemId: null,
        itemName: '',
        isDeleting: false
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
      
      // Reset deleting state
      setDeleteConfirmation(prev => ({
        ...prev,
        isDeleting: false
      }));
    }
  };

  // Add function to delete a chat
  const handleDeleteChat = async (chatId) => {
    if (!userId || !chatId) return;
    
    try {
      // Set deleting state
      setDeleteConfirmation(prev => ({
        ...prev,
        isDeleting: true
      }));
      
      // Get all messages for this chat
      const messagesRef = collection(db, 'playground_messages');
      const messagesQuery = query(
        messagesRef,
        where('chatId', '==', chatId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Create a batch for all deletions
      const batch = writeBatch(db);
      
      // Add all messages to batch delete
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add chat to batch delete
      const chatRef = doc(db, 'playground_chats', chatId);
      batch.delete(chatRef);
      
      // Commit all deletes in one batch
      await batch.commit();
      
      // Update local state
      const deletedChat = chatHistory.find(c => c.id === chatId);
      const wasSelected = deletedChat?.selected;
      
      // Remove from chat history
      setChatHistory(prev => {
        const filtered = prev.filter(c => c.id !== chatId);
        
        // If this was the selected chat, select another one if available
        if (wasSelected && filtered.length > 0) {
          filtered[0].selected = true;
          
          // Also load the messages for the newly selected chat
          fetchMessages(filtered[0].id);
        } else if (wasSelected) {
          // If there are no chats left, clear messages
          setChatMessages([]);
        }
        
        return filtered;
      });
      
      // If this was the selected chat, clear message cache
      if (wasSelected) {
        setMessageCache(prev => {
          const newCache = { ...prev };
          delete newCache[chatId];
          return newCache;
        });
      }
      
      toast.success("Chat deleted successfully");
      
      // Close confirmation dialog
      setDeleteConfirmation({
        isOpen: false,
        type: null,
        itemId: null,
        itemName: '',
        isDeleting: false
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
      
      // Reset deleting state
      setDeleteConfirmation(prev => ({
        ...prev,
        isDeleting: false
      }));
    }
  };

  // Add function to show confirmation dialog
  const showDeleteConfirmation = (type, id, name) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      itemId: id,
      itemName: name
    });
  };

  // Add function to handle confirmation
  const handleConfirmDelete = () => {
    const { type, itemId } = deleteConfirmation;
    
    if (type === 'project') {
      handleDeleteProject(itemId);
    } else if (type === 'chat') {
      handleDeleteChat(itemId);
    }
  };

  // Add function to cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: null,
      itemId: null,
      itemName: '',
      isDeleting: false
    });
  };

  // Add resize handlers
  useEffect(() => {
    const handleLeftResize = (e) => {
      if (!leftResizeRef.current?.dataset.resizing) return;
      
      const newWidth = Math.max(150, Math.min(400, e.clientX));
      setPanelSizes(prev => ({
        ...prev,
        left: newWidth
      }));
    };
    
    const handleRightResize = (e) => {
      if (!rightResizeRef.current?.dataset.resizing) return;
      if (!rightPanelExpanded) return;
      
      const containerWidth = document.querySelector('.flex.w-full.h-full')?.clientWidth || 1200;
      const newRightWidth = Math.max(250, Math.min(500, containerWidth - e.clientX));
      setPanelSizes(prev => ({
        ...prev,
        right: newRightWidth
      }));
    };
    
    const handleMouseUp = () => {
      if (leftResizeRef.current) {
        leftResizeRef.current.dataset.resizing = '';
      }
      if (rightResizeRef.current) {
        rightResizeRef.current.dataset.resizing = '';
      }
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleLeftResize);
    document.addEventListener('mousemove', handleRightResize);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleLeftResize);
      document.removeEventListener('mousemove', handleRightResize);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [rightPanelExpanded]);

  // Update rightPanelExpanded effect to adjust panel size
  useEffect(() => {
    setPanelSizes(prev => ({
      ...prev,
      right: rightPanelExpanded ? 288 : 40
    }));
  }, [rightPanelExpanded]);

  // Function to handle chat selection
  useEffect(() => {
    // When currentChatId changes, fetch messages
    if (currentChatId) {
      console.log(`Selected chat ID: ${currentChatId}`);
      fetchMessages(currentChatId);
    }
  }, [currentChatId]);

  // Function to navigate to deployments section in AIStudio
  const navigateToDeployments = (model) => {
    // Check if we have access to window object
    if (typeof window !== 'undefined') {
      // Dispatch a custom event that AIStudio can listen for
      const deploymentEvent = new CustomEvent('navigateToDeployments', {
        detail: { 
          modelId: model.id,
          modelName: model.name,
          huggingfaceId: model.huggingface_id || model.id
        }
      });
      window.dispatchEvent(deploymentEvent);
      
      // Close the model dropdown
      setModelDropdownVisible(false);
      
      // console.log(`Navigating to deployments section for model: ${model.name}`);
    }
  };

  // Function to find deployment and extract chat endpoint for a model
  const findModelEndpoint = async (modelId) => {
    if (!userId || !modelId) return null;
    
    try {
      // Get the model details to find its huggingface_id
      const model = availableModels.find(m => m.id === modelId);
      if (!model) {
        console.log(`Model ${modelId} not found in available models`);
        return null;
      }
      
      const modelHuggingfaceId = model.huggingface_id ? model.huggingface_id.toLowerCase() : null;
      
      console.log(`🔍 Finding chat endpoint for model: ${modelId} (huggingface_id: ${modelHuggingfaceId || 'not available'})`);
      
      // Query deployments collection to find matching deployment
      const deploymentsRef = collection(db, 'deployments');
      
      // Use userId directly as requested
      let q = query(
        deploymentsRef, 
        where('userId', '==', userId)
      );
      
      let snapshot = await getDocs(q);
      console.log(`🔄 Found ${snapshot.docs.length} deployments for userId ${userId}`);
      
      // Variables to store what we find
      let chatEndpoint = null;
      let backupEndpoint = null;
      
      // Check each deployment
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Try multiple fields that might contain the model ID
        const deploymentModelId = (data.model_id || data.modelId || data.huggingface_id || '').toLowerCase();
        
        console.log(`📊 Comparing - Model huggingface_id: "${modelHuggingfaceId}" with deployment model_id: "${deploymentModelId}"`);
        
        // First try to match by huggingface_id (if available)
        if (modelHuggingfaceId && (
          deploymentModelId === modelHuggingfaceId || 
          deploymentModelId.includes(modelHuggingfaceId) || 
          modelHuggingfaceId.includes(deploymentModelId)
        )) {
          console.log(`✅ Found matching deployment by huggingface_id: ${doc.id}`);
          
          // Log all endpoints if available
          if (data.endpoints) {
            console.log(`🔬 Endpoints:`, data.endpoints);
            
            // First priority: tunnel_chat endpoint
            if (data.endpoints.tunnel_chat) {
              // Check if it's an orchestrator endpoint (slower, more likely to timeout)
              if (data.endpoints.tunnel_chat.includes('orchestrator-gekh.onrender.com')) {
                // Save as backup but keep looking for better endpoints
                backupEndpoint = data.endpoints.tunnel_chat;
                console.log(`⚠️ Found orchestrator endpoint (might be slower): ${backupEndpoint}`);
              } else {
                // Use this endpoint if it's not an orchestrator endpoint
                chatEndpoint = data.endpoints.tunnel_chat;
                console.log(`🔗 Using tunnel_chat endpoint: ${chatEndpoint}`);
                break;
              }
            }
            // Second priority: chat endpoint
            else if (data.endpoints.chat) {
              // Check if it's an orchestrator endpoint
              if (data.endpoints.chat.includes('orchestrator-gekh.onrender.com')) {
                // Save as backup if we don't have one yet
                if (!backupEndpoint) {
                  backupEndpoint = data.endpoints.chat;
                  console.log(`⚠️ Found orchestrator endpoint (might be slower): ${backupEndpoint}`);
                }
              } else {
                chatEndpoint = data.endpoints.chat;
                console.log(`🔗 Using chat endpoint: ${chatEndpoint}`);
                break;
              }
            }
          } else {
            console.log(`⚠️ No endpoints found in this deployment`);
          }
        }
        // If we can't match by huggingface_id, try matching by model name
        else if (model.name && data.name && (
                model.name.toLowerCase().includes(data.name.toLowerCase()) || 
                data.name.toLowerCase().includes(model.name.toLowerCase()))
        ) {
          console.log(`✅ Found matching deployment by name: ${doc.id}`);
          
          // Log all endpoints if available
          if (data.endpoints) {
            console.log(`🔬 Endpoints:`, data.endpoints);
            
            // Only consider these if we don't have a primary endpoint yet
            if (!chatEndpoint) {
              // First priority: tunnel_chat endpoint
              if (data.endpoints.tunnel_chat) {
                // Check if it's an orchestrator endpoint
                if (data.endpoints.tunnel_chat.includes('orchestrator-gekh.onrender.com')) {
                  // Save as backup if we don't have one yet
                  if (!backupEndpoint) {
                    backupEndpoint = data.endpoints.tunnel_chat;
                    console.log(`⚠️ Found orchestrator endpoint (might be slower): ${backupEndpoint}`);
                  }
                } else {
                  chatEndpoint = data.endpoints.tunnel_chat;
                  console.log(`🔗 Using tunnel_chat endpoint from name match: ${chatEndpoint}`);
                  break;
                }
              }
              // Second priority: chat endpoint
              else if (data.endpoints.chat) {
                // Check if it's an orchestrator endpoint
                if (data.endpoints.chat.includes('orchestrator-gekh.onrender.com')) {
                  // Save as backup if we don't have one yet
                  if (!backupEndpoint) {
                    backupEndpoint = data.endpoints.chat;
                    console.log(`⚠️ Found orchestrator endpoint (might be slower): ${backupEndpoint}`);
                  }
                } else {
                  chatEndpoint = data.endpoints.chat;
                  console.log(`🔗 Using chat endpoint from name match: ${chatEndpoint}`);
                  break;
                }
              }
            }
          } else {
            console.log(`⚠️ No endpoints found in this deployment`);
          }
        }
      }
      
      // If we didn't find a primary endpoint but have a backup, use the backup
      if (!chatEndpoint && backupEndpoint) {
        chatEndpoint = backupEndpoint;
        console.log(`⚠️ Using backup endpoint: ${chatEndpoint}`);
      }
      
      if (!chatEndpoint) {
        console.log(`❌ No chat endpoint found for model ${modelId} (huggingface_id: ${modelHuggingfaceId || 'not available'})`);
      }
      
      return chatEndpoint;
    } catch (error) {
      console.error('Error finding model endpoint:', error);
      return null;
    }
  };

  // Add this new function with the other handlers
  const toggleLimitContext = () => {
    setLimitContextWindow(!limitContextWindow);
  };

  //
  // 5) Render the Playground UI
  //
  return (
    <div className="flex h-full">
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        darkMode={darkMode}
      />
      {/* --------------------------------------------
          LEFT - Chat list / Project folders panel
      -------------------------------------------- */}
      <div 
        ref={leftPanelRef}
        style={{ width: `${panelSizes.left}px` }}
        className={`flex-shrink-0 border-r flex flex-col ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Chat list header */}
        <div
          className={`
            sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between
            ${
              darkMode
                ? 'border-gray-800 bg-gray-900/95 backdrop-blur-sm'
                : 'border-gray-200 bg-white/95 backdrop-blur-sm'
            }
          `}
        >
          {showNewProjectInput ? (
            <div className="flex-1 flex items-center">
              <input
                ref={newProjectInputRef}
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                className={`w-full text-xs px-2 py-1 rounded-md border ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateProject();
                  } else if (e.key === 'Escape') {
                    setShowNewProjectInput(false);
                    setNewProjectName('');
                  }
                }}
              />
              {loadingProject ? (
                <div className="ml-2 animate-spin h-3 w-3 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              ) : (
          <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className={`ml-2 ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  } ${!newProjectName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Save className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowNewProjectInput(true)}
            className={`
                  flex items-center space-x-2 rounded-md px-2 py-1 transition-colors duration-150
              ${
                darkMode
                      ? 'text-blue-400 hover:bg-blue-900/20 hover:text-blue-300'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
              }
            `}
          >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">New Project</span>
          </button>
          
              <span className={`text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Chats
          </span>
            </>
          )}
        </div>

        {/* Project folders & chat list - Fix scrolling here */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {!userId ? (
            <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
              <svg 
                className={`h-10 w-10 mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                Sign in to view your chats
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className={`text-xs px-3 py-1.5 rounded font-medium
                  ${darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Sign In
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-4 text-center">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No projects yet. Create your first project to get started.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="mt-1">
              {/* Folder row */}
              <div
                className={`
                    flex items-center px-3 py-1.5 cursor-pointer transition-colors duration-150 group
                    ${darkMode ? 'hover:bg-gray-800/70' : 'hover:bg-gray-100/70'}
                `}
              >
                  <div className="flex-1 flex items-center" onClick={() => toggleProject(project.id)}>
                <ChevronDown
                  className={`
                        h-3.5 w-3.5 mr-1.5 transform transition-transform duration-200
                    ${!project.expanded ? '-rotate-90' : ''}
                        ${darkMode ? 'text-gray-500' : 'text-gray-500'}
                  `}
                />
                    <Folder className={`h-4 w-4 mr-1.5 ${project.expanded ? (darkMode ? 'text-blue-400' : 'text-blue-500') : (darkMode ? 'text-gray-500' : 'text-gray-600')}`} />
                    <span className={`text-xs font-medium ${project.expanded ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                  {project.name}
                </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showDeleteConfirmation('project', project.id, project.name);
                    }}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
              </div>

                {/* If expanded, show the chat list inside this folder with VS Code-like tree connections */}
              {project.expanded && (
                  <div className="relative">
                    {/* Tree branch line */}
                    <div className={`absolute left-[19px] top-0 bottom-0 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    
                    {chatHistory.length === 0 ? (
                      <div className="pl-10 pr-2 py-2">
                        <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          No chats yet
                        </p>
                      </div>
                    ) : (
                      chatHistory.map((chat, index) => (
                        <div key={chat.id} className="relative">
                          {/* Horizontal tree branch */}
                          <div className={`absolute left-[19px] top-[14px] w-3 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                          
                <div
                  className={`
                              flex items-center py-1.5 pl-8 pr-2 my-0.5 cursor-pointer rounded
                              relative transition-all duration-200 group
                        ${
                          chat.selected
                            ? darkMode
                              ? 'bg-blue-900/30 border-l-2 border-blue-500'
                              : 'bg-blue-50 border-l-2 border-blue-500'
                            : darkMode
                                  ? 'hover:bg-gray-800/70 hover:border-l-2 hover:border-blue-500/50 border-l-2 border-transparent'
                                  : 'hover:bg-gray-100/70 hover:border-l-2 hover:border-blue-500/50 border-l-2 border-transparent'
                        }
                      `}
                    >
                            <div className="flex-1" onClick={() => handleChatSelect(chat.id)}>
                        <span
                          className={`
                                  text-xs truncate
                            ${
                              chat.selected
                                ? darkMode
                                  ? 'text-blue-400 font-medium'
                                  : 'text-blue-600 font-medium'
                                : darkMode
                                        ? 'text-gray-400'
                                        : 'text-gray-600'
                            }
                          `}
                        >
                          {chat.name}
                        </span>
                      </div>

                            <div className="flex items-center">
                              {/* Delete chat button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showDeleteConfirmation('chat', chat.id, chat.name);
                                }}
                                className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                  darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                                }`}
                                title="Delete chat"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              
                              {/* Existing dropdown icon */}
                      {chat.selected && (
                                <ChevronDown className={`h-3.5 w-3.5 ml-1 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      )}
                    </div>
                </div>
                          
                          {/* Last branch cap to close the tree for the last element */}
                          {index === chatHistory.length - 1 && (
                            <div 
                              className={`absolute left-[19px] top-[15px] bottom-0 w-px ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                            ></div>
              )}
            </div>
                      ))
                    )}
                    
                    {/* Add New Chat button with tree connection */}
                    <div className="relative">
                      <div className={`absolute left-[19px] top-0 w-3 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                      <button 
                        onClick={() => handleCreateChat(project.id)}
                        disabled={loadingChat}
                        className={`
                          flex items-center py-1.5 pl-8 pr-2 my-1 rounded
                          ${darkMode ? 'hover:bg-gray-800/50 text-gray-500' : 'hover:bg-gray-100/50 text-gray-500'}
                          transition-all duration-150
                          ${loadingChat ? 'opacity-50 cursor-wait' : ''}
                        `}
                      >
                        {loadingChat ? (
                          <div className="animate-spin h-3 w-3 border-2 border-gray-500 rounded-full border-t-transparent mr-1.5"></div>
                        ) : (
                          <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        <span className="text-xs">New Chat</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resize handle for left panel */}
      <div
        ref={leftResizeRef}
        className={`w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 z-10 ${
          darkMode ? 'bg-gray-800 hover:bg-blue-600 active:bg-blue-700' : 'bg-gray-200'
        }`}
        onMouseDown={(e) => {
          leftResizeRef.current.dataset.resizing = 'true';
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none'; // Prevent text selection during resize
          e.preventDefault();
        }}
      ></div>

      {/* --------------------------------------------
          MIDDLE - Chat interface
      -------------------------------------------- */}
      <div 
        ref={middlePanelRef}
        className={`flex-1 flex flex-col relative ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        {/* Model selection overlay when no model is selected */}
        

        {/* Top navbar with model selector */}
        <div
          className={`
            flex items-center py-1.5 px-3 border-b
            ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
          `}
        >
          <div className="mx-auto relative w-full max-w-md">
            <button
              onClick={userId ? toggleModelDropdown : undefined}
              disabled={!userId}
              className={`
                w-full flex items-center justify-center rounded-md py-1 px-4
                ${!userId 
                  ? (darkMode 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-400 text-gray-300 cursor-not-allowed')
                  : (darkMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white')
                }
              `}
            >
              <span className="text-xs font-medium mr-1">
                {playgroundModel?.name || 'Select a model'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Model Selection Dropdown */}
            {modelDropdownVisible && (
              <div 
                ref={modelDropdownRef}
                className={`
                  absolute top-full left-0 right-0 mt-1 z-50 border rounded-md shadow-lg
                  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
                `}
                style={{ width: '100%' }}
              >
                <div className="text-center font-medium py-2 border-b border-gray-700">Select Model</div>
                
                {/* Filter and dropdown row */}
                <div className="px-3 py-2 space-y-3">
                  {/* Model Type Filter */}
                  <div className="relative">
                    <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Model Type
                    </label>
                    <button
                      id="model-type-button"
                      onClick={toggleModelTypeDropdown}
                      className={`
                        w-full flex items-center justify-between rounded border p-2 text-sm
                        transition-all duration-200
                        ${darkMode 
                          ? 'border-gray-700 bg-gray-800 hover:bg-gray-750 text-white' 
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      <span className="flex items-center">
                        <svg 
                          className={`w-4 h-4 mr-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                          <path d="M13.5 8.5A5 5 0 0 1 16 12"></path>
                        </svg>
                        {modelTypes.find(t => t.id === modelTypeFilter)?.name || 'All Models'}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showModelTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Model Type Dropdown */}
                    {showModelTypeDropdown && (
                      <div 
                        ref={modelTypeDropdownRef}
                        className={`
                          absolute left-0 right-0 mt-1 z-50 border rounded-md shadow-lg overflow-hidden
                          transform transition-all duration-150 origin-top scale-100
                          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
                        `}
                      >
                        {modelTypes.map(type => (
                          <div 
                            key={type.id}
                            onClick={() => selectModelType(type.id)}
                            className={`
                              p-2.5 text-sm cursor-pointer flex items-center
                              transition-colors duration-150
                              ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                              ${modelTypeFilter === type.id 
                                ? (darkMode 
                                    ? 'bg-indigo-900/30 text-indigo-300' 
                                    : 'bg-indigo-50 text-indigo-700'
                                  ) 
                                : ''
                              }
                            `}
                          >
                            {modelTypeFilter === type.id && (
                              <svg 
                                className={`w-4 h-4 mr-1.5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                            <span className={modelTypeFilter === type.id ? 'font-medium' : ''}>
                            {type.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                
                {/* Search input */}
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Search Models
                    </label>
                  <div className={`
                      flex items-center border rounded-md overflow-hidden
                      ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}
                      ${modelSearchQuery ? (darkMode ? 'ring-1 ring-indigo-500' : 'ring-1 ring-indigo-300') : ''}
                      focus-within:${darkMode ? 'ring-1 ring-indigo-600' : 'ring-1 ring-indigo-500'}
                      transition-all duration-200
                    `}>
                      <div className="pl-3">
                        <svg 
                          className={`w-4 h-4 ${
                            modelSearchQuery 
                              ? (darkMode ? 'text-indigo-400' : 'text-indigo-500')
                              : (darkMode ? 'text-gray-500' : 'text-gray-400')
                          }`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </div>
                    <input 
                      type="text" 
                      className={`
                          flex-1 p-2 bg-transparent outline-none text-sm
                        ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}
                      `}
                        placeholder="Find a model..."
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                    />
                      {modelSearchQuery && (
                        <button 
                          onClick={() => setModelSearchQuery('')}
                          className={`px-2 py-1 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
                        >
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      )}
                  </div>
                  </div>
                </div>
                
                {/* Model list header */}
                <div className={`px-3 py-2 border-t border-b text-xs font-medium ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {filteredModels.length} models found
                </div>
                
                {/* Model list - Scrollable */}
                <div className="overflow-y-auto mx-2 mb-2" style={{ maxHeight: '280px' }}>
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => {
                      // Get action from helper function
                      const { action, text } = getModelAction(model);
                      
                      return (
                        <div 
                          key={model.id}
                          className={`
                            flex items-center justify-between p-2 border-b
                            ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}
                          `}
                        >
                          <div className="flex flex-col">
                            <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {model.name}
                            </div>
                            {model.parameters && (
                              <div className="text-xs text-gray-500">{model.parameters} params</div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (action === 'select') {
                                selectModel(model);
                              } else if (action === 'deploy') {
                                handleDeployModel(model);
                              } else if (action === 'monitor') {
                                // Navigate to the deployments section
                                navigateToDeployments(model);
                              }
                            }}
                            className={`
                              px-3 py-1 text-xs font-medium rounded
                              ${action === 'select' 
                                ? darkMode 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                                : action === 'monitor'
                                  ? darkMode
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                                  : action === 'loading'
                                    ? darkMode
                                      ? 'bg-gray-700 text-gray-300'
                                      : 'bg-gray-200 text-gray-600'
                                    : darkMode
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }
                            `}
                          >
                            {action === 'loading' ? (
                              <div className="flex items-center">
                                <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                                {text}
                              </div>
                            ) : (
                              text
                            )}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No models found matching your filters
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Second header row with chat title and options */}
        <div
          className={`
            flex items-center justify-between px-3 py-1.5 border-b
            ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
          `}
        >
          <div className="text-xs font-medium">
            {chatHistory.find(c => c.selected)?.name || 'No chat selected'}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleNewChat}
              className={`py-0.5 text-xs ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
>
  <span className="flex items-center">
    <PlusIcon className="h-3.5 w-3.5 mr-1" />
    New Chat
  </span>
</button>

            <button
              onClick={handleClearChat}
              disabled={!chatHistory.find(c => c.selected) || chatMessages.length === 0 || clearingChat}
              className={`py-0.5 text-xs ${
                !chatHistory.find(c => c.selected) || chatMessages.length === 0 || clearingChat
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <span className="flex items-center">
                {clearingChat ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Clear Chat
                  </>
                )}
              </span>
            </button>

            <button
              onClick={handleSaveChat}
              disabled={!chatHistory.find(c => c.selected) || chatMessages.length === 0}
              className={`py-0.5 text-xs ${
                !chatHistory.find(c => c.selected) || chatMessages.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <span className="flex items-center">
                <Save className="h-3.5 w-3.5 mr-1" />
                Save Chat
              </span>
            </button>
          </div>
        </div>

        {/* Chat content */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} relative`}>
          {clearingChat && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm bg-opacity-50 bg-gray-100 dark:bg-gray-900 dark:bg-opacity-50">
              <div className="w-full max-w-md px-4">
                <div className="relative pt-1 mb-6">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div 
                      className="transition-all duration-300 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      style={{ width: `${clearingProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Clearing chat history...</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto px-4 py-4">
            {isProcessing && chatMessages.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : chatMessages.length > 0 ? (
              chatMessages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              const isThinking = msg.isThinking === true;
              const isError = msg.error || (isAssistant && msg.content && msg.content.includes("Error: API error"));
              const isStopped = msg.stopped === true;
              
              return (
                <div 
                  key={idx} 
                  className={`
                    mb-4 ${isAssistant ? '' : 'flex justify-end'}
                    transition-all duration-500
                    ${clearingChat ? 'opacity-20 blur-[1px] transform scale-95' : 'opacity-100'}
                  `}
                >
                  <div 
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm
                      ${isAssistant 
                        ? darkMode 
                          ? 'bg-gray-800 text-gray-200' 
                          : 'bg-gray-100 text-gray-800' 
                        : darkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                      }
                      ${isThinking ? 'opacity-80' : ''}
                      ${isError ? darkMode ? 'border-red-500 border' : 'bg-red-50 text-red-800 border border-red-200' : ''}
                      ${isStopped ? darkMode ? 'border-yellow-500 border' : 'bg-yellow-50 text-yellow-800 border border-yellow-200' : ''}
                      transition-all duration-300
                    `}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-medium flex items-center gap-1">
                        {isAssistant ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M16.5 7.5h-9v9h9v-9z" />
                              <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                            </svg>
                            Assistant
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                            You
                          </>
                        )}
                      </span>
                      
                      {isAssistant && (
                        <span
                          className={`
                            text-[9px] ml-1 px-1.5 py-0.5 rounded font-mono
                            ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'} 
                          `}
                        >
                          {msg.model || playgroundModel?.name || 'AI'}
                        </span>
                      )}
                      
                      {isThinking && (
                        <span
                          className={`
                            text-[9px] ml-1 px-1.5 py-0.5 rounded
                            ${darkMode ? 'bg-yellow-800/30 text-yellow-400' : 'bg-yellow-200 text-yellow-700'} 
                          `}
                        >
                          thinking...
                        </span>
                      )}
                      
                      {isStopped && (
                        <span
                          className={`
                            text-[9px] ml-1 px-1.5 py-0.5 rounded
                            ${darkMode ? 'bg-yellow-800/30 text-yellow-400' : 'bg-yellow-200 text-yellow-700'} 
                          `}
                        >
                          stopped
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      {isThinking && msg.content === '' ? (
                        <div className="flex space-x-1 items-center h-6">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      ) : (
                        <Markdown className="text-sm message-markdown">{msg.content}</Markdown>
                      )}
                    </div>
                    
                    {isThinking && abortController && (
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={handleStopGeneration}
                          className={`
                            text-[10px] font-medium flex items-center gap-1 px-2 py-1 rounded
                            ${darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }
                          `}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                          </svg>
                          Stop generating
                        </button>
                      </div>
                    )}
                    
                    {isError && (
                      <div className="mt-2 flex justify-end">
                        <button 
                          onClick={() => {
                            // Remove the error message
                            const updatedMessages = [...chatMessages];
                            updatedMessages.pop();
                            setChatMessages(updatedMessages);
                            // Retry the last message
                            handleSendMessage();
                          }}
                          className={`
                            text-[10px] font-medium flex items-center gap-1 px-2 py-1 rounded
                            ${darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }
                          `}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                          </svg>
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12">
                <div className={`text-center p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} max-w-md`}>
                  <div className="mb-3">
                    <svg className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  {!userId ? (
                    <>
                      <h3 className={`text-lg font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Welcome to Polaris
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                        Sign in to start chatting with AI models and explore the possibilities
                      </p>
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mx-auto
                          ${darkMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          } transition-colors duration-200`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                        Sign In
                      </button>
                    </>
                  ) : !playgroundModel ? (
                    <div className={`text-center p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} max-w-xl mx-auto`}>
                      {/* <div className="mb-4">
                        <svg className={`h-14 w-14 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 5A2.5 2.5 0 0 1 22 7.5v12a2.5 2.5 0 0 1-5 0v-12A2.5 2.5 0 0 1 19.5 5Z M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8Z M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z" />
                        </svg>
                      </div> */}
                      
                      <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Select a Model to Start Chatting
                      </h3>
                      
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                        Choose an AI model to begin your conversation experience
                      </p>
                      
                      <button
                        onClick={toggleModelDropdown}
                        className={`px-8 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mx-auto
                          ${darkMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          } transition-colors duration-200`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                        Select Model
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className={`text-lg font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        No messages yet
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {chatHistory.find(c => c.selected) 
                          ? 'Start a conversation by typing a message below'
                          : 'Select a chat from the sidebar or create a new one'}
                      </p>
                      {!chatHistory.find(c => c.selected) && (
                        <button
                          onClick={handleNewChat}
                          className={`mt-4 px-4 py-2 rounded text-sm font-medium
                            ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                          <span className="flex items-center justify-center">
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            New Chat
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* The 'scroll to bottom' reference */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div
          className={`
            px-4 py-3 border-t
            ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
          `}
        >
          <div className="max-w-3xl mx-auto">
            {/* Selected model indicator */}
            {playgroundModel && (
              <div className={`flex items-center mb-2 px-1`}>
                <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className={`h-2 w-2 rounded-full animate-pulse mr-2 ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
                  <span className="font-medium">Using model: </span>
                  <span className={`ml-1 font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {playgroundModel?.name}
                  </span>
                </div>
              </div>
            )}
            
            {/* Message input box */}
            <div className={`
              relative rounded-xl border shadow-sm
              ${darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-300'
              }
            `}>
              {/* Input area */}
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask me anything..."
                rows="2"
                className={`
                  w-full resize-none outline-none text-sm p-2.5 rounded-t-xl
                  ${
                    darkMode
                      ? 'bg-gray-800 text-gray-200 placeholder-gray-500'
                      : 'bg-white text-gray-800 placeholder-gray-400'
                  }
                `}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              {/* Action bar */}
              <div className={`
                px-3 py-1.5 flex items-center justify-between
                border-t rounded-b-xl
                ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}
              `}>
                {/* Left buttons */}
                <div className="flex items-center space-x-2">
                  {/* Audio recording button */}
                  <button
                    className={`
                      p-1 rounded-full text-sm
                      ${darkMode 
                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                    `}
                    title="Record audio message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                    </svg>
                  </button>
                  
                  <span className="text-xs text-gray-500">
                    Shift+Enter for new line
                  </span>
                </div>
                
                {/* Right side */}
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2 font-mono">
                    {userInput.length > 0 ? `${userInput.length}` : ''}
                  </span>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={userInput.trim() === '' || isProcessing || !userId || !playgroundModel}
                    className={`
                      rounded-lg p-2 flex items-center
                      ${(userInput.trim() === '' || isProcessing || !userId || !playgroundModel) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-blue-600'
                      }
                      ${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'}
                    `}
                  >
                    {isProcessing ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                        <span className="text-xs font-medium">Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resize handle for right panel */}
      {rightPanelExpanded && (
        <div
          ref={rightResizeRef}
          className={`w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 z-10 ${
            darkMode ? 'bg-gray-800 hover:bg-blue-600 active:bg-blue-700' : 'bg-gray-200'
          }`}
          onMouseDown={(e) => {
            rightResizeRef.current.dataset.resizing = 'true';
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; // Prevent text selection during resize
            e.preventDefault();
          }}
        ></div>
      )}

      {/* --------------------------------------------
          RIGHT - Configuration panel (UPDATED)
      -------------------------------------------- */}
      <div 
        ref={rightPanelRef}
        style={{ width: `${panelSizes.right}px` }}
        className={`transition-all duration-300 border-l flex flex-col overflow-hidden ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="p-3 border-b flex items-center justify-between">
          {rightPanelExpanded ? (
            <>
              <span className="text-sm font-medium">
                <span className={`inline-flex items-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-5 h-5 mr-1.5 transform transition-transform duration-500"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Advanced Configuration
                </span>
              </span>
              <button 
                onClick={() => setRightPanelExpanded(false)}
                className={`p-1 rounded-md ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <button 
              onClick={() => setRightPanelExpanded(true)}
              className={`mx-auto p-1 rounded-md ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              title="Expand Configuration Panel"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`w-5 h-5 transform rotate-180 transition-transform duration-500 ${darkMode ? 'text-green-400' : 'text-green-600'}`}
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          )}
        </div>

        {rightPanelExpanded && (
          <>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">

            {/* System Prompt Section */}
            <div className="mb-4">
              <div 
                className="flex items-center justify-between mb-2 cursor-pointer"
                onClick={() => toggleSection('systemPrompt')}
              >
                <span className="text-xs font-medium">System Prompt</span>
                <ChevronDown 
                  className={`h-3.5 w-3.5 transform transition-transform duration-200 ${
                    !systemPromptExpanded ? '-rotate-90' : ''
                  }`} 
                />
              </div>
              
              {systemPromptExpanded && (
                <div className={`p-2 rounded-md border ${
                  darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
                }`}>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className={`w-full p-2 rounded-md border text-xs resize-none h-24 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-gray-500">Token count: 40</span>
                    <button 
                      onClick={handleSaveSystemPrompt}
                      className={`px-2 py-1 text-xs rounded-md ${
                        darkMode 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      <span className="flex items-center">
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Model Configuration */}
            <div className="mb-4">
              <div 
                className="flex items-center justify-between mb-2 cursor-pointer"
                onClick={() => toggleSection('config')}
              >
                <span className="text-xs font-medium flex items-center">
                  <Sliders className="h-3.5 w-3.5 mr-1.5" />
                  Model Configuration
                </span>
                <ChevronDown 
                  className={`h-3.5 w-3.5 transform transition-transform duration-200 ${
                    !configExpanded ? '-rotate-90' : ''
                  }`} 
                />
              </div>
              
              {configExpanded && (
                <div className={`p-3 rounded-md border ${
                  darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
                }`}>
                  {/* Temperature */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium">Temperature</label>
                      <span className="text-xs">{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={handleTemperatureChange}
                      className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-500">Precise</span>
                      <span className="text-[10px] text-gray-500">Creative</span>
                    </div>
                  </div>
                  
                  {/* Max Tokens */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium">Max Tokens</label>
                      <span className="text-xs">{maxTokens}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="4096"
                      step="100"
                      value={maxTokens}
                      onChange={handleMaxTokensChange}
                      className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-500">Short</span>
                      <span className="text-[10px] text-gray-500">Long</span>
                    </div>
                  </div>
                  
                  {/* Context Window Toggle */}
                  <div className="mt-4 border-t border-gray-700 pt-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium">Focus on Current Question</label>
                      <button
                        onClick={toggleLimitContext}
                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          limitContextWindow ? 'bg-blue-500' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                        aria-pressed={limitContextWindow}
                      >
                        <span className="sr-only">Limit context window</span>
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            limitContextWindow ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-3">
                      When enabled, the AI will only respond to your most recent question
                    </p>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <button 
                      onClick={applyModelSettings}
                      className={`w-full text-xs py-1.5 rounded-md ${
                        darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      Apply Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={!deleteConfirmation.isDeleting ? cancelDelete : undefined}
          ></div>
          
          {/* Modal */}
          <div className={`relative max-w-md w-full mx-4 p-6 rounded-lg shadow-xl transform transition-all ${
            darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
          }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center text-red-500">
                <AlertTriangle className="h-6 w-6 mr-3" />
                <h3 className="text-lg font-semibold">
                  {deleteConfirmation.type === 'project' ? 'Delete Project' : 'Delete Chat'}
                </h3>
              </div>
              {!deleteConfirmation.isDeleting && (
                <button
                  onClick={cancelDelete}
                  className={`p-1 rounded-full ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Content */}
            <div className="mb-6">
              {deleteConfirmation.isDeleting ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full mb-4"></div>
                  <p>
                    {deleteConfirmation.type === 'project' 
                      ? "Deleting project and associated chats..." 
                      : "Deleting chat and messages..."}
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-4">
                    {deleteConfirmation.type === 'project' 
                      ? "Are you sure you want to delete this project? This will permanently delete the project and all its chats and messages."
                      : "Are you sure you want to delete this chat? This will permanently delete the chat and all its messages."
                    }
                  </p>
                  <div className={`p-3 rounded ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <span className="font-medium">&ldquo;{deleteConfirmation.itemName}&rdquo;</span>
                    {deleteConfirmation.type === 'project' && (
                      <p className="text-sm mt-1 text-gray-500">
                        This action cannot be undone.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Actions */}
            {!deleteConfirmation.isDeleting && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className={`px-4 py-2 rounded text-sm ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded text-sm bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteConfirmation.type === 'project' ? 'Delete Project' : 'Delete Chat'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Model Deploy Panel */}
      <ModelDeployPanel 
        darkMode={darkMode}
        showDeployPanel={showDeployPanel}
        setShowDeployPanel={setShowDeployPanel}
        selectedModel={selectedModelToDeploy}
        onDeploy={handleModelDeployed}
      />
    </div>
  );
};

ModelPlayground.propTypes = {
  darkMode: PropTypes.bool
};

export default ModelPlayground;