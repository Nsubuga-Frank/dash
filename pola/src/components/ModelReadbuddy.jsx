import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import {
  ChevronDown,
  Copy,
  Folder,
  Link,
  Plus,
  PlusIcon,
  Save
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../data/firebase.js';
import ModelDeployPanel from './ModelDeployPanel';

/**
 * ModelReadbuddy
 * 
 * This version defines its own local states for chat messages,
 * projects, user input, etc., so you don't need to pass them
 * from the parent.
 */
const ModelReadbuddy = ({
  darkMode,
}) => {
  //
  // 1) Local states for chat + playground
  //
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Add state for selected document and library
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Firebase auth
  const auth = getAuth();
  const [userId, setUserId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [userInfo, setUserInfo] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loggedIn, setLoggedIn] = useState(false);

  // Example chat messages: each message has {role, content}
  const [chatMessages, setChatMessages] = useState([]);
  // Message cache to store messages for each chat
  const [messageCache, setMessageCache] = useState({});
  // Current chat ID to track which chat we're viewing - state only needed for the setter
  // eslint-disable-next-line no-unused-vars
  const [currentChatId, setCurrentChatId] = useState(null);

  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Example model settings - initialize with null to require selection
  const [playgroundModel, setPlaygroundModel] = useState(null);
  // Add state for right panel collapse
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);
  
  // Add state for model selection dropdown
  const [modelDropdownVisible, setModelDropdownVisible] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [modelTypeFilter, setModelTypeFilter] = useState('all');
  const [showModelTypeDropdown, setShowModelTypeDropdown] = useState(false);
  
  // Add state to track expanded libraries
  const [expandedLibraries, setExpandedLibraries] = useState(['library-1']);
  
  // Model deployment state
  const [showDeployPanel, setShowDeployPanel] = useState(false);
  const [selectedModelToDeploy, setSelectedModelToDeploy] = useState(null);
  // Add deployment status state management
  const [modelDeploymentStatus, setModelDeploymentStatus] = useState({});
  const [checkingDeploymentStatus, setCheckingDeploymentStatus] = useState({});
  const [deployedModels, setDeployedModels] = useState([
    { id: '1', name: 'meta-llama-3.1-8b-instruct', type: 'llama', status: 'deployed' },
    { id: '4', name: 'claude-3-opus', type: 'claude', status: 'deployed' },
    { id: '6', name: 'llama-2-13b', type: 'llama', status: 'deployed' },
    { id: '8', name: 'mixtral-8x7b', type: 'mixtral', status: 'deployed' }
  ]);
  
  // Load models from Firebase 'huggingface_models' collection
  const [availableModels, setAvailableModels] = useState([]);
  
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
  
  // Refetch deployment statuses periodically
  useEffect(() => {
    // Only run if we have a user ID and models to check
    if (!userId || availableModels.length === 0) return;
    
    console.log('Setting up deployment status checking for ReadBuddy models');
    
    // Initial fetch of deployment statuses
    availableModels.forEach(model => {
      if (model.id) {
        fetchModelDeploymentStatus(model.id);
      }
    });
    
    // Set up interval for real-time status checking (every 5 seconds)
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
  const selectModel = (model) => {
    setPlaygroundModel(model);
    setModelDropdownVisible(false);
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
      // Add the newly deployed model to deployedModels
      setDeployedModels(prev => [...prev, {
        ...selectedModelToDeploy,
        status: 'deployed'
      }]);
      
      // Select the newly deployed model
      setPlaygroundModel(selectedModelToDeploy);
      
      toast.success(`Model ${selectedModelToDeploy.name} deployed successfully!`);
    }
    return { success: true };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setModelDropdownVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if a model is deployed
  const isModelDeployed = (modelId) => {
    return deployedModels.some(m => m.id === modelId);
  };

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

  // Add state for confirmation dialogs
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    type: null, // 'library-limit', 'delete-library', 'delete-document'
    title: '',
    message: '',
    itemId: null,
    itemName: '',
    isDeleting: false,
    onConfirm: null
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
  
  // Check auth state changes to load libraries when user signs in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserInfo({
          displayName: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || "/img/avatar.png",
        });
        setLoggedIn(true);
        
        // Load user libraries when authenticated
        fetchUserLibraries(user.uid);
      } else {
        setLoggedIn(false);
        setUserId(null);
        setUserInfo(null);
        
        // Reset libraries when signed out
        setUserLibraries([]);
        setExpandedLibraries([]);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Track library limits
  const maxLibraries = 3;
  const maxDocumentsPerLibrary = 5;

  // Use Firebase for user libraries instead of dummy data
  const [userLibraries, setUserLibraries] = useState([]);
  const [loadingLibraries, setLoadingLibraries] = useState(false);
  
  // Add state for library creation modal
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [libraryDocuments, setLibraryDocuments] = useState([]);
  
  // Fetch user libraries from Firestore
  const fetchUserLibraries = async (userIdParam) => {
    const currentUserId = userIdParam || userId;
    if (!currentUserId) return;
    
    setLoadingLibraries(true);
    try {
      const librariesRef = collection(db, 'user_libraries');
      const q = query(
        librariesRef,
        where('userId', '==', currentUserId)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedLibraries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        documents: doc.data().documents || []
      }));
      
      setUserLibraries(fetchedLibraries);
      
      // Expand first library by default if available and set it as selected
      if (fetchedLibraries.length > 0) {
        const firstLibrary = fetchedLibraries[0];
        
        if (!expandedLibraries.includes(firstLibrary.id)) {
          setExpandedLibraries(prev => [...prev, firstLibrary.id]);
        }
        
        // Set the first library as selected
        setSelectedLibrary(firstLibrary);
      }
    } catch (error) {
      console.error("Error fetching libraries:", error);
      toast.error("Failed to load document libraries");
    } finally {
      setLoadingLibraries(false);
    }
  };
  
  // Function to toggle library expansion
  const toggleLibrary = (libraryId) => {
    setExpandedLibraries(prev => 
      prev.includes(libraryId) 
        ? prev.filter(id => id !== libraryId) 
        : [...prev, libraryId]
    );
  };
  
  // Determine file icon and color based on file type
  const getFileTypeInfo = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      'pdf': { color: 'red', icon: 'file-pdf' },
      'doc': { color: 'blue', icon: 'file-word' },
      'docx': { color: 'blue', icon: 'file-word' },
      'txt': { color: 'gray', icon: 'file-text' },
      'csv': { color: 'green', icon: 'file-spreadsheet' },
      'xls': { color: 'green', icon: 'file-excel' },
      'xlsx': { color: 'green', icon: 'file-excel' },
      'ppt': { color: 'orange', icon: 'file-presentation' },
      'pptx': { color: 'orange', icon: 'file-presentation' },
      'jpg': { color: 'purple', icon: 'file-image' },
      'jpeg': { color: 'purple', icon: 'file-image' },
      'png': { color: 'purple', icon: 'file-image' },
      'gif': { color: 'purple', icon: 'file-image' },
    };
    
    return typeMap[extension] || { color: 'gray', icon: 'file' };
  };

  // Replace the toast warning with a modal confirmation dialog
  const showLimitWarning = (type, current, max) => {
    const title = type === 'library' ? 'Library Limit Reached' : 'Document Limit Reached';
    const message = type === 'library' 
      ? `You can only have a maximum of ${max} libraries. Try organizing your documents better within existing libraries.` 
      : `This library can only have a maximum of ${max} documents. Consider creating a new library for additional documents.`;
    
    setConfirmationDialog({
      isOpen: true,
      type: `${type}-limit`,
      title,
      message,
      itemId: null,
      itemName: '',
      onConfirm: () => setConfirmationDialog(prev => ({...prev, isOpen: false}))
    });
  };
  
  // Replace with real Firebase implementation
  const fetchChats = async (libraryId, documentId = null) => {
    if (!userId) return;
    
    setLoadingChat(true);
    try {
      // Clear current chat data
      setChatHistory([]);
      setChatMessages([]);
      
      // Create query to fetch chats based on context
      const chatsRef = collection(db, 'readbuddy_chats');
      let q;
      
      if (documentId) {
        // Document-specific chats
        q = query(
          chatsRef,
          where('userId', '==', userId),
          where('libraryId', '==', libraryId),
          where('documentId', '==', documentId)
        );
      } else {
        // Library-specific chats (excluding document-specific chats)
        q = query(
          chatsRef,
          where('userId', '==', userId),
          where('libraryId', '==', libraryId),
          where('documentId', '==', null)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const fetchedChats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        selected: false
      }));
      
      // Select the first chat if available
      if (fetchedChats.length > 0) {
        fetchedChats[0].selected = true;
        setChatHistory(fetchedChats);
        
        // Set current chat ID
        setCurrentChatId(fetchedChats[0].id);
        
        // Fetch messages for this chat
        await fetchMessages(fetchedChats[0].id);
      } else {
        // If no chats exist, create a default one
        await createDefaultChat(libraryId, documentId);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    } finally {
      setLoadingChat(false);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    if (!userId || !chatId) return;
    
    try {
      // Check if we already have messages in the cache
      if (messageCache[chatId] && messageCache[chatId].length > 0) {
        // Use cached messages first for instant display
        setChatMessages(messageCache[chatId]);
        return;
      }
      
      // No cached messages, show loading state
      setIsProcessing(true);
      
      // Fetch from Firebase
      const messagesRef = collection(db, 'readbuddy_messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update cache with new messages
      setMessageCache(prev => ({
        ...prev,
        [chatId]: fetchedMessages
      }));
      
      // Update chat messages
      setChatMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load chat messages");
    } finally {
      setIsProcessing(false);
    }
  };

  // Create a default chat when none exists
  const createDefaultChat = async (libraryId, documentId = null) => {
    if (!userId) return;
    
    try {
      // Get context name for the chat title
      let contextName = "New Chat";
      if (documentId && selectedDocument) {
        contextName = `Chat about ${selectedDocument.name}`;
      } else if (selectedLibrary) {
        contextName = `${selectedLibrary.name} Chat`;
      }
      
      // Create chat in Firebase
      const chatData = {
        userId,
        libraryId,
        documentId,
        name: contextName,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'readbuddy_chats'), chatData);
      
      // Add to local state
      const newChat = {
        id: docRef.id,
        ...chatData,
        createdAt: new Date(),
        selected: true
      };
      
      setChatHistory([newChat]);
      setCurrentChatId(newChat.id);
      setChatMessages([]);
    } catch (error) {
      console.error("Error creating default chat:", error);
      toast.error("Failed to create a new chat");
    }
  };

  // Handle selecting a library
  const handleSelectLibrary = async (library) => {
    setSelectedLibrary(library);
    setSelectedDocument(null);
    
    // Fetch library-specific chats
    await fetchChats(library.id);
  };

  // Handle selecting a document
  const handleSelectDocument = async (library, document) => {
    setSelectedLibrary(library);
    setSelectedDocument(document);
    
    // Fetch document-specific chats
    await fetchChats(library.id, document.id);
  };

  // Handle creating a new chat
  const handleNewChat = async () => {
    if (!selectedLibrary) {
      toast.error("Please select a library first");
      return;
    }
    
    try {
      // Generate appropriate name based on context
      let chatName = "New Chat";
      if (selectedDocument) {
        chatName = `Chat about ${selectedDocument.name}`;
      }
      
      // Create chat in Firebase
      const chatData = {
        userId,
        libraryId: selectedLibrary.id,
        documentId: selectedDocument ? selectedDocument.id : null,
        name: chatName,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'readbuddy_chats'), chatData);
      
      // Create new chat in local state
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
      setMessageCache(prev => ({
        ...prev,
        [newChat.id]: []
      }));
      
      // Set current chat ID
      setCurrentChatId(newChat.id);
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error("Failed to create a new chat");
    }
  };

  // Handle selecting a chat
  const handleChatSelect = (chatId) => {
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
    
    // Get cached messages or fetch if not in cache
    if (messageCache[chatId] && messageCache[chatId].length > 0) {
      setChatMessages(messageCache[chatId]);
    } else {
      fetchMessages(chatId);
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
      const chatRef = doc(db, 'readbuddy_chats', chatId);
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

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Check if a model has been selected
    if (!playgroundModel) {
      toast.error("Please select a model first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create user message in Firebase
      const userMessageData = {
        userId,
        chatId: selectedChat.id,
        role: 'user',
        content: userInput,
        createdAt: serverTimestamp()
      };
      
      const userMsgRef = await addDoc(collection(db, 'readbuddy_messages'), userMessageData);
      
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
        [selectedChat.id]: updatedMessages
      }));
      
      setUserInput('');
      
      // If this is the first message, generate a name based on the message
      if (chatMessages.length === 0) {
        const generatedName = generateChatName(userInput);
        await updateChatName(selectedChat.id, generatedName);
      }
      
      // Simulate AI response (replace with actual API call)
      setTimeout(async () => {
        try {
          // Create assistant message in Firebase
          const assistantMessageData = {
            userId,
            chatId: selectedChat.id,
            role: 'assistant',
            model: playgroundModel.name,
            content: `This is a response to your query: "${userInput}". In a real implementation, this would be a response from the AI model.`,
            createdAt: serverTimestamp()
          };
          
          const assistantMsgRef = await addDoc(collection(db, 'readbuddy_messages'), assistantMessageData);
          
          // Add to local state
          const assistantMsg = {
            id: assistantMsgRef.id,
            ...assistantMessageData,
            createdAt: new Date()
          };
          
          // Update chat messages and cache
          const finalMessages = [...updatedMessages, assistantMsg];
          setChatMessages(finalMessages);
          setMessageCache(prev => ({
            ...prev,
            [selectedChat.id]: finalMessages
          }));
        } catch (error) {
          console.error("Error creating assistant message:", error);
          toast.error("Failed to generate response");
        } finally {
          setIsProcessing(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setIsProcessing(false);
    }
  };

  // Delete a chat
  const handleDeleteChat = async (chatId) => {
    if (!userId || !chatId) return;
    
    try {
      // Get all messages for this chat
      const messagesRef = collection(db, 'readbuddy_messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId)
      );
      
      const messagesSnapshot = await getDocs(q);
      
      // Create a batch for all deletions
      const batch = writeBatch(db);
      
      // Add all messages to batch delete
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add chat to batch delete
      const chatRef = doc(db, 'readbuddy_chats', chatId);
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
      
      // Remove from message cache
      setMessageCache(prev => {
        const newCache = { ...prev };
        delete newCache[chatId];
        return newCache;
      });
      
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };
  
  // Clear all messages from the current chat
  const handleClearChat = async () => {
    // Find the currently selected chat
    const selectedChat = chatHistory.find(c => c.selected);
    if (!selectedChat || !userId) return;
    
    try {
      // Get all messages for this chat
      const messagesRef = collection(db, 'readbuddy_messages');
      const q = query(
        messagesRef,
        where('chatId', '==', selectedChat.id)
      );
      
      const messagesSnapshot = await getDocs(q);
      
      // Create a batch for all deletions
      const batch = writeBatch(db);
      
      // Add all messages to batch delete
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Commit all deletes in one batch
      await batch.commit();
      
      // Clear messages in local state
      setChatMessages([]);
      
      // Clear from message cache
      setMessageCache(prev => ({
        ...prev,
        [selectedChat.id]: []
      }));
      
      toast.success("Chat cleared successfully");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat messages");
    }
  };
  
  // Save chat as a text file
  const handleSaveChat = () => {
    // Find the currently selected chat
    const selectedChat = chatHistory.find(c => c.selected);
    if (!selectedChat || chatMessages.length === 0) return;
    
    try {
      // Create chat export content
      let chatContent = `# ${selectedChat.name}\n`;
      chatContent += `# Generated on ${new Date().toLocaleString()}\n\n`;
      
      // Add each message
      chatMessages.forEach(msg => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'User';
        chatContent += `## ${role}\n${msg.content}\n\n`;
      });
      
      // Create a blob and download link
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedChat.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Chat exported successfully");
    } catch (error) {
      console.error("Error exporting chat:", error);
      toast.error("Failed to export chat");
    }
  };
  
  // Add document to library
  const handleAddDocumentToLibrary = async (libraryId, files) => {
    if (!userId || !libraryId || !files || files.length === 0) return;
    
    try {
      // Get the library reference
      const libraryRef = doc(db, 'user_libraries', libraryId);
      
      // Get the current library
      const library = userLibraries.find(lib => lib.id === libraryId);
      
      // Check document limit
      if (library.documents.length + files.length > maxDocumentsPerLibrary) {
        showLimitWarning('document', library.documents.length, maxDocumentsPerLibrary);
        return;
      }
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload file to Firebase Storage
        const storage = getStorage();
        const fileRef = ref(storage, `documents/${userId}/${libraryId}/${Date.now()}_${file.name}`);
        
        // Show loading toast
        const loadingToastId = toast.loading(`Uploading ${file.name}...`);
        
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        
        // Create document object
        const newDocument = {
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadUrl,
          createdAt: new Date().toISOString()
        };
        
        // Update library with new document
        const updatedDocuments = [...library.documents, newDocument];
        await updateDoc(libraryRef, {
          documents: updatedDocuments
        });
        
        // Update local state
        setUserLibraries(prev => 
          prev.map(lib => 
            lib.id === libraryId 
              ? { ...lib, documents: [...lib.documents, newDocument] } 
              : lib
          )
        );
        
        // Update toast
        toast.update(loadingToastId, {
          render: `${file.name} uploaded successfully`,
          type: toast.TYPE.SUCCESS,
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error("Error adding document to library:", error);
      toast.error("Failed to upload document");
    }
  };
  
  // Handle showing the library creation modal
  const handleOpenLibraryModal = () => {
    // Check if we've reached the maximum number of libraries
    if (userLibraries.length >= maxLibraries) {
      showLimitWarning('library', userLibraries.length, maxLibraries);
      return;
    }
    
    // Reset the new library name input
    setNewLibraryName('');
    
    // Show the modal
    setShowLibraryModal(true);
  };

  // Handle creating a new library
  const handleCreateLibrary = async () => {
    // Close the modal first
    setShowLibraryModal(false);
    
    // Create a default library name if empty
    let libraryName = newLibraryName.trim();
    if (!libraryName) {
      const libraryNumber = userLibraries.length + 1;
      libraryName = `Library ${libraryNumber}`;
    }
    
    try {
      // Create library in Firebase
      const libraryData = {
        userId,
        name: libraryName,
        color: 'blue', // Default color
        documents: [],
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'user_libraries'), libraryData);
      
      // Add to local state
      const newLibrary = {
        id: docRef.id,
        ...libraryData,
        createdAt: new Date()
      };
      
      setUserLibraries(prev => [...prev, newLibrary]);
      setExpandedLibraries(prev => [...prev, newLibrary.id]);
      setSelectedLibrary(newLibrary);
      
      toast.success(`Library "${libraryName}" created successfully`);
    } catch (error) {
      console.error("Error creating library:", error);
      toast.error("Failed to create library");
    }
  };
  
  // Add effect to log modal visibility changes
  useEffect(() => {
    console.log('showLibraryModal state changed:', showLibraryModal);
  }, [showLibraryModal]);

  // Handle document deletion
  const handleDeleteDocument = (libraryId, document) => {
    setConfirmationDialog({
      isOpen: true,
      type: 'delete-document',
      title: 'Delete Document',
      message: `Are you sure you want to delete "${document.name}"? This will also delete all chats associated with this document.`,
      libraryId,
      itemId: document.id,
      itemName: document.name,
      onConfirm: () => confirmDeleteDocument(libraryId, document.id)
    });
  };

  // Confirm document deletion
  const confirmDeleteDocument = async (libraryId, documentId) => {
    if (!userId) return;
    
    // Set deleting state
    setConfirmationDialog(prev => ({...prev, isDeleting: true}));
    
    try {
      // Find the library
      const library = userLibraries.find(lib => lib.id === libraryId);
      if (!library) return;
      
      // Find document index
      const docIndex = library.documents.findIndex(doc => doc.id === documentId);
      if (docIndex === -1) return;
      
      // Get document reference to delete
      const documentToDelete = library.documents[docIndex];
      
      // Update library documents (remove this document)
      const updatedDocuments = [...library.documents];
      updatedDocuments.splice(docIndex, 1);
      
      // Update in Firebase
      const libraryRef = doc(db, 'user_libraries', libraryId);
      await updateDoc(libraryRef, {
        documents: updatedDocuments
      });
      
      // Delete document file from storage if possible
      if (documentToDelete.url) {
        try {
          const storage = getStorage();
          const fileRef = ref(storage, documentToDelete.url);
          await deleteObject(fileRef);
        } catch (error) {
          console.error("Error deleting document file:", error);
        }
      }
      
      // Delete associated chats
      await deleteChatsForDocument(libraryId, documentId);
      
      // Update local state
      setUserLibraries(prev => 
        prev.map(lib => 
          lib.id === libraryId 
            ? { ...lib, documents: updatedDocuments } 
            : lib
        )
      );
      
      // If this was the selected document, clear it
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
      
      toast.success(`Document "${documentToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      // Close the confirmation dialog
      setConfirmationDialog(prev => ({...prev, isOpen: false, isDeleting: false}));
    }
  };
  
  // Handle library deletion
  const handleDeleteLibrary = (library) => {
    const docCount = library.documents.length;
    setConfirmationDialog({
      isOpen: true,
      type: 'delete-library',
      title: 'Delete Library',
      message: `Are you sure you want to delete the library "${library.name}"? This will delete all ${docCount} document${docCount !== 1 ? 's' : ''} and all chats associated with this library.`,
      itemId: library.id,
      itemName: library.name,
      onConfirm: () => confirmDeleteLibrary(library.id)
    });
  };
  
  // Confirm library deletion
  const confirmDeleteLibrary = async (libraryId) => {
    if (!userId) return;
    
    // Set deleting state
    setConfirmationDialog(prev => ({...prev, isDeleting: true}));
    
    try {
      // Find the library to get its documents
      const library = userLibraries.find(lib => lib.id === libraryId);
      if (!library) return;
      
      // Delete library from Firebase
      const libraryRef = doc(db, 'user_libraries', libraryId);
      await deleteDoc(libraryRef);
      
      // Try to delete all documents from storage
      for (const document of library.documents) {
        if (document.url) {
          try {
            const storage = getStorage();
            const fileRef = ref(storage, document.url);
            await deleteObject(fileRef);
          } catch (error) {
            console.error(`Error deleting document file for ${document.name}:`, error);
          }
        }
      }
      
      // Delete all associated chats
      await deleteChatsForLibrary(libraryId);
      
      // Update local state
      setUserLibraries(prev => prev.filter(lib => lib.id !== libraryId));
      setExpandedLibraries(prev => prev.filter(id => id !== libraryId));
      
      // If this was the selected library, clear it
      if (selectedLibrary?.id === libraryId) {
        setSelectedLibrary(null);
        setSelectedDocument(null);
        setChatHistory([]);
        setChatMessages([]);
      }
      
      toast.success(`Library "${library.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting library:", error);
      toast.error("Failed to delete library");
    } finally {
      // Close the confirmation dialog
      setConfirmationDialog(prev => ({...prev, isOpen: false, isDeleting: false}));
    }
  };
  
  // Helper to delete all chats for a document
  const deleteChatsForDocument = async (libraryId, documentId) => {
    try {
      // Find all chats for this document
      const chatsRef = collection(db, 'readbuddy_chats');
      const q = query(
        chatsRef,
        where('userId', '==', userId),
        where('libraryId', '==', libraryId),
        where('documentId', '==', documentId)
      );
      
      const chatsSnapshot = await getDocs(q);
      
      // Delete each chat and its messages
      const batch = writeBatch(db);
      
      for (const chatDoc of chatsSnapshot.docs) {
        const chatId = chatDoc.id;
        
        // Add chat to delete batch
        batch.delete(chatDoc.ref);
        
        // Find and delete all messages for this chat
        const messagesRef = collection(db, 'readbuddy_messages');
        const msgQuery = query(
          messagesRef,
          where('chatId', '==', chatId)
        );
        
        const messagesSnapshot = await getDocs(msgQuery);
        messagesSnapshot.docs.forEach(msgDoc => {
          batch.delete(msgDoc.ref);
        });
      }
      
      // Commit all deletions
      await batch.commit();
      
      // Update local state if needed
      if (selectedDocument?.id === documentId) {
        setChatHistory([]);
        setChatMessages([]);
      }
    } catch (error) {
      console.error("Error deleting chats for document:", error);
      throw error;
    }
  };
  
  // Helper to delete all chats for a library
  const deleteChatsForLibrary = async (libraryId) => {
    try {
      // Find all chats for this library
      const chatsRef = collection(db, 'readbuddy_chats');
      const q = query(
        chatsRef,
        where('userId', '==', userId),
        where('libraryId', '==', libraryId)
      );
      
      const chatsSnapshot = await getDocs(q);
      
      // Delete each chat and its messages
      const batch = writeBatch(db);
      
      for (const chatDoc of chatsSnapshot.docs) {
        const chatId = chatDoc.id;
        
        // Add chat to delete batch
        batch.delete(chatDoc.ref);
        
        // Find and delete all messages for this chat
        const messagesRef = collection(db, 'readbuddy_messages');
        const msgQuery = query(
          messagesRef,
          where('chatId', '==', chatId)
        );
        
        const messagesSnapshot = await getDocs(msgQuery);
        messagesSnapshot.docs.forEach(msgDoc => {
          batch.delete(msgDoc.ref);
        });
      }
      
      // Commit all deletions
      await batch.commit();
    } catch (error) {
      console.error("Error deleting chats for library:", error);
      throw error;
    }
  };
  
  //
  // 5) Render the Playground UI
  //
  return (
    <div className="flex w-full h-full">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
      
      {/* --------------------------------------------
          LEFT - Chat history panel
      -------------------------------------------- */}
      <div 
        ref={leftPanelRef}
        style={{ width: `${panelSizes.left}px` }}
        className={`flex-shrink-0 border-r flex flex-col ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
      >
        {/* Chat list header */}
        <div
          className={`sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between ${darkMode ? 'border-gray-800 bg-gray-900/95 backdrop-blur-sm' : 'border-gray-200 bg-white/95 backdrop-blur-sm'}`}
        >
          <span className={`text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {selectedDocument 
              ? `Chats for ${selectedDocument.name}`
              : selectedLibrary
                ? `Chats for ${selectedLibrary.name}`
                : 'Chat History'}
          </span>
          <button
            onClick={handleNewChat}
            disabled={!selectedLibrary}
            className={`p-1 rounded ${!selectedLibrary ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'}`}
            title="New Chat"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Chat History list */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {!selectedLibrary ? (
            <div className="p-4 text-center">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a library or document first
              </p>
            </div>
          ) : loadingChat ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="p-4 text-center">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No chats yet. Start a new conversation.
              </p>
            </div>
          ) : (
            <div className="relative">
              {chatHistory.map((chat, index) => (
                <div key={chat.id} className="relative">
                  {index > 0 && (
                    <div className={`absolute left-3 top-0 w-px h-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                  )}
                  <div
                    className={`flex items-center py-2 pl-4 pr-2 cursor-pointer group transition-colors duration-150 ${
                      chat.selected
                        ? (darkMode ? 'bg-blue-900/30 border-l-2 border-blue-500' : 'bg-blue-50 border-l-2 border-blue-500')
                        : (darkMode ? 'hover:bg-gray-800/60 border-l-2 border-transparent' : 'hover:bg-gray-100 border-l-2 border-transparent')
                    }`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className={`text-xs font-medium truncate ${chat.selected ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          {chat.name || 'New Chat'}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`text-[10px] truncate ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(chat.createdAt?.seconds ? chat.createdAt.toDate() : chat.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <button 
                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 hover:text-gray-300' : 'hover:bg-gray-200 hover:text-gray-700'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        title="Delete chat"
                      >
                        <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {index < chatHistory.length - 1 && (
                    <div className={`absolute left-3 bottom-0 w-px h-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resize handle for left panel */}
      <div
        ref={leftResizeRef}
        className={`w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 z-10 ${darkMode ? 'bg-gray-800 hover:bg-blue-600 active:bg-blue-700' : 'bg-gray-200'}`}
        onMouseDown={(e) => {
          leftResizeRef.current.dataset.resizing = 'true';
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          e.preventDefault();
        }}
      ></div>

      {/* --------------------------------------------
          MIDDLE - Chat interface
      -------------------------------------------- */}
      <div ref={middlePanelRef} className="flex-1 flex flex-col relative overflow-hidden">
        {/* Model selection overlay when no model is selected */}
        {!playgroundModel && (
          <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center backdrop-blur-md transition-all duration-300 model-overlay-animation">
            <div 
              className={`p-6 rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 hover:scale-[1.01] ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                  <svg 
                    className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Select a Model
                </h3>
              </div>
              
              <p className={`mb-5 text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Please select a deployed model to start using the readbuddy. If you don&apos;t have any models deployed, you can deploy one from the model selection dropdown.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={toggleModelDropdown}
                  className={`
                    w-full py-2.5 px-4 rounded-md transition-all duration-200 flex items-center justify-center
                    text-sm font-medium text-white shadow-sm
                    ${darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20' 
                      : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-blue-400/20'
                    }
                  `}
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Select Model
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top navbar with model selector */}
        <div
          className={`flex items-center py-1.5 px-3 border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
        >
          <div className="mx-auto relative w-full max-w-md">
            <button
              onClick={toggleModelDropdown}
              className={`w-full flex items-center justify-center rounded-md py-1 px-4 ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
            >
              <span className="text-xs font-medium mr-1">
                {playgroundModel?.name || 'meta-llama-3.1-8b-instruct'}
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
                <div className="flex mx-2 mb-2">
                  <div className="flex-1 relative">
                    <button
                      id="model-type-button"
                      onClick={toggleModelTypeDropdown}
                      className={`
                        w-full flex items-center justify-center rounded-l border p-1 text-center text-xs
                        ${darkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-gray-50 text-gray-800'}
                      `}
                    >
                      <span className="flex-1 text-center">
                        {modelTypes.find(t => t.id === modelTypeFilter)?.name || 'All Models'}
                      </span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </button>
                    
                    {/* Model Type Dropdown */}
                    {showModelTypeDropdown && (
                      <div 
                        ref={modelTypeDropdownRef}
                        className={`
                          absolute top-full left-0 right-0 mt-1 z-50 border rounded-md shadow-lg overflow-hidden
                          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
                        `}
                      >
                        {modelTypes.map(type => (
                          <div 
                            key={type.id}
                            onClick={() => selectModelType(type.id)}
                            className={`
                              p-2 text-xs cursor-pointer
                              ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                              ${modelTypeFilter === type.id ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}
                            `}
                          >
                            {type.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`
                    flex-1 border-r border-t border-b rounded-r p-1 text-center text-xs
                    ${darkMode ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-300 bg-gray-50 text-gray-700'}
                  `}>
                    Filter Model Type
                  </div>
                </div>
                
                {/* Search input */}
                <div className="flex mx-2 mb-2">
                  <div className={`
                    flex-1 border rounded-l p-1
                    ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}
                  `}>
                    <input 
                      type="text" 
                      className={`
                        w-full bg-transparent outline-none text-xs
                        ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}
                      `}
                      placeholder="Search Model Name"
                      value={modelSearchQuery}
                      onChange={(e) => setModelSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className={`
                    border-r border-t border-b rounded-r p-1 px-3 text-center text-xs
                    ${darkMode ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-300 bg-gray-50 text-gray-700'}
                  `}>
                    Search
                  </div>
                </div>
                
                {/* Model list - Scrollable */}
                <div className="overflow-y-auto mx-2 mb-2" style={{ maxHeight: '280px' }}>
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => {
                      const modelAction = getModelAction(model);
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
                            <div className="flex items-center">
                              {model.parameters && (
                                <div className="text-xs text-gray-500 mr-1.5">{model.parameters} params</div>
                              )}
                              {modelDeploymentStatus[model.id] && modelAction.action !== 'loading' && (
                                <div className={`text-xs px-1 py-0.5 rounded ${
                                  modelAction.action === 'select' 
                                    ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                    : darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {typeof modelDeploymentStatus[model.id] === 'object' && modelDeploymentStatus[model.id].statusText 
                                    ? modelDeploymentStatus[model.id].statusText 
                                    : modelAction.text}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (modelAction.action === 'deploy') {
                                handleDeployModel(model);
                              } else if (modelAction.action === 'select') {
                                selectModel(model);
                              } else if (modelAction.action === 'monitor') {
                                // Could add navigation to deployment status page
                                window.dispatchEvent(new CustomEvent('navigateToDeployments', {
                                  detail: { modelId: model.id, modelName: model.name }
                                }));
                              }
                            }}
                            className={`
                              px-3 py-1 text-xs font-medium rounded flex items-center
                              ${modelAction.action === 'loading'
                                ? darkMode 
                                  ? 'bg-gray-700 text-gray-300 cursor-wait' 
                                  : 'bg-gray-200 text-gray-800 cursor-wait'
                                : modelAction.action === 'select'
                                  ? darkMode 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                  : modelAction.action === 'monitor'
                                    ? darkMode
                                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : darkMode
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }
                            `}
                          >
                            {modelAction.action === 'loading' && (
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {modelAction.text}
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
          className={`flex items-center justify-between px-3 py-1.5 border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
        >
          <div className="text-xs font-medium">
            {selectedLibrary ? (
              <span>
                {selectedLibrary.name} {selectedDocument ? `› ${selectedDocument.name}` : ''}
              </span>
            ) : (
              'No library selected'
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleNewChat}
              disabled={!selectedLibrary}
              className={`py-0.5 text-xs ${!selectedLibrary ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <span className="flex items-center">
                <PlusIcon className="h-3.5 w-3.5 mr-1" />
                New Chat
              </span>
            </button>

            <button
              onClick={handleClearChat}
              disabled={!chatHistory.find(c => c.selected) || chatMessages.length === 0}
              className={`py-0.5 text-xs ${!chatHistory.find(c => c.selected) || chatMessages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <span className="flex items-center">
                <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Chat
              </span>
            </button>

            <button
              onClick={handleSaveChat}
              disabled={!chatHistory.find(c => c.selected) || chatMessages.length === 0}
              className={`py-0.5 text-xs ${!chatHistory.find(c => c.selected) || chatMessages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <span className="flex items-center">
                <Save className="h-3.5 w-3.5 mr-1" />
                Save Chat
              </span>
            </button>
          </div>
        </div>

        {/* Chat content section */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-3xl mx-auto px-4 py-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12">
                <div className={`text-center p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} max-w-md`}>
                  <div className="mb-3">
                    <svg className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    No chats yet
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedLibrary 
                      ? selectedDocument
                      ? 'Start a conversation by creating a new chat'
                        : 'Select a document or create a new chat for this library' 
                      : 'Select a library or document from the sidebar first'}
                  </p>
                </div>
              </div>
            ) : isProcessing && chatMessages.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : chatMessages.length > 0 ? (
              chatMessages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div key={idx} className="mb-6">
                    <div className="flex items-center mb-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {isAssistant ? 'Assistant' : 'User'}
                      </span>
                      {isAssistant && (
                        <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} font-mono`}>
                          {msg.model || 'meta-llama-3.1-8b-instruct'}
                        </span>
                      )}
                    </div>
                    <div className={`mt-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      <div className="text-sm whitespace-pre-wrap">
                        {isAssistant && msg.content.includes('Implementation') ? (
                          <>
                            <h3 className="text-lg font-medium mb-4">Implementation</h3>
                            <div className="relative group">
                              <pre className={`p-4 rounded-md overflow-x-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <code className="text-sm font-mono">
                                  {`#include <iostream>
#include <fstream>
#include <string>
#include <map>

// Forward declarations
class FileSystem;
class Directory;
class File;

// Abstract base class for File System components (Directory/File)
class FileSystemComponent {
public:
    virtual ~FileSystemComponent() {}`}
                                </code>
                              </pre>
                              <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Select a chat from history or start a new conversation
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className={`px-4 py-3 border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={selectedLibrary ? "Type a message and press Enter to send..." : "Select a library first to start chatting"}
                disabled={!selectedLibrary}
                rows="1"
                className={`w-full p-2.5 pl-3 rounded-md border resize-none ${
                  !selectedLibrary 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                } ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 focus:border-blue-500 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 focus:border-blue-400 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && selectedLibrary) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>

            <div className="flex justify-between items-center mt-1.5">
              <div className="flex items-center">
                <span className="text-xs text-gray-500">User (Ctrl + U)</span>
                <button className="ml-2 opacity-70">
                  <Link className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">
                  {isProcessing ? 'Processing...' : 'Insert (Ctrl + I)'}
                </span>
                <button
                  onClick={handleSendMessage}
                  disabled={!selectedLibrary || userInput.trim() === '' || isProcessing}
                  className={`px-2 py-1 rounded text-xs font-medium ${(!selectedLibrary || userInput.trim() === '' || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </span>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>

            <div className="mt-1.5 text-center">
              <span className="text-[10px] text-gray-500 font-mono">
                Token Usage: 100/1500
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resize handle for right panel */}
      {rightPanelExpanded && (
        <div
          ref={rightResizeRef}
          className={`w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 z-10 ${darkMode ? 'bg-gray-800 hover:bg-blue-600 active:bg-blue-700' : 'bg-gray-200'}`}
          onMouseDown={(e) => {
            rightResizeRef.current.dataset.resizing = 'true';
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
          }}
        ></div>
      )}

      {/* --------------------------------------------
          RIGHT - Document libraries panel
      -------------------------------------------- */}
      <div 
        ref={rightPanelRef}
        style={{ width: `${panelSizes.right}px` }}
        className={`transition-all duration-300 border-l flex flex-col overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          {rightPanelExpanded ? (
            <>
              <span className="text-sm font-medium">
                <span className={`inline-flex items-center ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  <Folder className="w-4 h-4 mr-1.5" />
                  Document Library
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
              title="Expand Library Panel"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {rightPanelExpanded && (
          <>
            <div className="p-3">
              {/* Library Search */}
              <div className="mb-4">
                <div className={`flex items-center w-full rounded-md border mb-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className={`w-full py-1.5 px-3 text-xs rounded-md border-0 outline-none ${darkMode ? 'bg-gray-800 text-gray-200 placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                  />
                  <button className={`px-3 py-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Create New Library Button */}
                <div className="mb-4">
                  <button 
                    onClick={() => {
                      console.log('Add Library button clicked');
                      handleOpenLibraryModal();
                    }}
                    className={`w-full py-1.5 px-3 flex justify-center items-center rounded-md text-xs font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    <PlusIcon className="h-3.5 w-3.5 mr-1" />
                    Add Library
                  </button>
                  <p className={`text-[10px] mt-1 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Max {maxLibraries} libraries • {userLibraries.length} used
                  </p>
                </div>
              </div>
            </div>

            {/* Libraries & Documents list */}
            <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {loadingLibraries ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : userLibraries.length === 0 ? (
                <div className="p-4 text-center">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No libraries yet. Create your first library to get started.
                  </p>
                </div>
              ) : (
                userLibraries.map((library) => (
                  <div key={library.id}>
                    {/* Library folder row */}
                    <div
                      className={`flex items-center px-3 py-1.5 cursor-pointer transition-colors duration-150 group ${
                        selectedLibrary?.id === library.id
                          ? (darkMode ? 'bg-blue-900/30' : 'bg-blue-50')
                          : (darkMode ? 'hover:bg-gray-800/70' : 'hover:bg-gray-100/70')
                      }`}
                    >
                      <div 
                        className="flex-1 flex items-center" 
                        onClick={() => {
                          toggleLibrary(library.id);
                          handleSelectLibrary(library);
                        }}
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 mr-1.5 transform transition-transform duration-200 ${!expandedLibraries.includes(library.id) ? '-rotate-90' : ''} ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}
                        />
                        <Folder className={`h-4 w-4 mr-1.5 ${expandedLibraries.includes(library.id) ? (darkMode ? 'text-yellow-500' : 'text-yellow-500') : (darkMode ? 'text-gray-500' : 'text-gray-600')}`} />
                        <span className={`text-xs font-medium ${selectedLibrary?.id === library.id ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                          {library.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                      <input 
                        type="file" 
                        id={`add-to-library-${library.id}`} 
                        className="hidden" 
                        multiple 
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleAddDocumentToLibrary(library.id, e.target.files);
                          }
                        }}
                      />
                      <label
                        htmlFor={`add-to-library-${library.id}`}
                        className={`flex items-center py-0.5 px-1 rounded text-xs ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (library.documents.length >= maxDocumentsPerLibrary) {
                            e.preventDefault();
                            showLimitWarning('document', library.documents.length, maxDocumentsPerLibrary);
                            // Prevent the file input from opening if limit is reached
                            document.getElementById(`add-to-library-${library.id}`).disabled = true;
                            setTimeout(() => {
                              document.getElementById(`add-to-library-${library.id}`).disabled = false;
                            }, 100);
                          }
                        }}
                        title={`Add document (${library.documents.length}/${maxDocumentsPerLibrary})`}
                      >
                        <Plus className="h-3.5 w-3.5 mr-0.5" />
                        <span className="text-[10px]">Add</span>
                      </label>
                        <button
                          className={`ml-1 py-0.5 px-1 rounded text-xs ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLibrary(library);
                          }}
                          title="Delete library"
                        >
                          <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Documents list inside library */}
                    {expandedLibraries.includes(library.id) && (
                      <div className="relative">
                        <div className={`absolute left-[19px] top-0 bottom-0 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        
                        {library.documents.length === 0 ? (
                          <div className="pl-10 pr-2 py-1">
                            <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              No documents in this library
                            </p>
                          </div>
                        ) : (
                          library.documents.map((document, index) => {
                            const { color } = getFileTypeInfo(document.name);
                            return (
                              <div key={document.id} className="relative">
                                <div className={`absolute left-[19px] top-[12px] w-3 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                
                                <div
                                  className={`flex items-center py-1 pl-8 pr-2 cursor-pointer rounded relative transition-all duration-200 group ${
                                    selectedDocument?.id === document.id
                                      ? darkMode
                                        ? 'bg-blue-900/30 border-l-2 border-blue-500'
                                        : 'bg-blue-50 border-l-2 border-blue-500'
                                      : darkMode
                                        ? 'hover:bg-gray-800/70 hover:border-l-2 hover:border-blue-500/50 border-l-2 border-transparent'
                                        : 'hover:bg-gray-100/70 hover:border-l-2 hover:border-blue-500/50 border-l-2 border-transparent'
                                  }`}
                                  onClick={() => handleSelectDocument(library, document)}
                                >
                                  <div className="flex-1 flex items-center min-w-0">
                                    {/* File type icon with color */}
                                    <div className={`mr-1.5 text-${color}-500 flex-shrink-0`}>
                                      {document.name.toLowerCase().endsWith('.pdf') && (
                                        <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"/>
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.453 7.453 0 0 1 8.203 14c.308 0 .593.035.826.12.218.084.403.21.54.372.153.181.243.427.243.713 0 .287-.085.516-.23.705zm3.807 1.468c-.215.207-.52.35-.899.437a5.07 5.07 0 0 1-.985.086 8.76 8.76 0 0 1-1.045-.06V14.13c.255-.018.515-.035.826-.035.485 0 .884.06 1.194.18.309.126.545.357.704.662.163.31.242.707.242 1.193.001.51-.08.924-.207 1.156zm5.695-.036h-.96l-.48-1.926a9.798 9.798 0 0 1-.24-1.187h-.015c-.075.394-.18.84-.314 1.187l-.502 1.926h-.944l-1.11-3.99h.9l.427 1.866c.105.422.21.9.284 1.286h.016c.068-.35.175-.828.305-1.286l.483-1.866h.96l.442 1.866c.104.422.21.882.28 1.286h.018c.077-.404.172-.846.277-1.268l.413-1.883h.851L19 17.622zM14 9h-1V4l5 5h-4z"/>
                                        </svg>
                                      )}
                                      {(document.name.toLowerCase().endsWith('.doc') || document.name.toLowerCase().endsWith('.docx')) && (
                                        <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1.01 17H8.99C8.445 19 8 18.552 8 18.01c0-.26.1-.507.273-.687L9 16.59V14c0-.552.448-1 1-1h4c.552 0 1 .448 1 1v2.59l.726.726c.173.18.274.428.274.687 0 .542-.445.997-.99.997zM14 9h-1V4l5 5h-4z"/>
                                          <path d="M10 14v5h1v-5h-1zm3 0v5h1v-5h-1z"/>
                                        </svg>
                                      )}
                                      {document.name.toLowerCase().endsWith('.txt') && (
                                        <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM8 20V4h5v4h5v12H8zm9-11h-4V5l4 4z"/>
                                          <path d="M10 14h6v1h-6zm0-3h6v1h-6zm0 6h4v1h-4z"/>
                                        </svg>
                                      )}
                                      {!document.name.toLowerCase().match(/\.(pdf|docx?|txt)$/) && (
                                        <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                        </svg>
                                      )}
                                    </div>
                                    
                                    <span className={`text-xs truncate ${selectedDocument?.id === document.id ? (darkMode ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium') : (darkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                      {document.name}
                                    </span>
                                  </div>
                                  
                                  {/* Add delete button */}
                                  <button
                                    className={`ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDocument(library.id, document);
                                    }}
                                    title="Delete document"
                                  >
                                    <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                                
                                {index === library.documents.length - 1 && (
                                  <div className={`absolute left-[19px] top-[14px] bottom-0 w-px ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}></div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Library creation modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div 
            className={`rounded-lg shadow-lg p-6 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New Library
            </h3>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Library Name
              </label>
              <input
                type="text"
                value={newLibraryName}
                onChange={(e) => setNewLibraryName(e.target.value)}
                placeholder="Enter library name"
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
              />
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Leave empty to use default name
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLibraryModal(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLibrary}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  darkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmationDialog.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div 
            className={`rounded-lg shadow-lg p-6 w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {confirmationDialog.type?.includes('limit') ? (
              <>
                <div className="flex items-start mb-4">
                  <div className="mr-3 flex-shrink-0">
                    <div className={`rounded-full p-2 ${darkMode ? 'bg-red-900' : 'bg-red-100'}`}>
                      <svg className={`h-6 w-6 ${darkMode ? 'text-red-500' : 'text-red-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {confirmationDialog.title}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {confirmationDialog.message}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setConfirmationDialog(prev => ({...prev, isOpen: false}))}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Ok, Got it
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start mb-4">
                  <div className="mr-3 flex-shrink-0">
                    <div className={`rounded-full p-2 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                      <svg className={`h-6 w-6 ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {confirmationDialog.title}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {confirmationDialog.message}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setConfirmationDialog(prev => ({...prev, isOpen: false}))}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmationDialog.onConfirm}
                    disabled={confirmationDialog.isDeleting}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      confirmationDialog.isDeleting
                        ? darkMode 
                          ? 'bg-red-800 text-gray-300 cursor-not-allowed' 
                          : 'bg-red-300 text-gray-600 cursor-not-allowed'
                        : darkMode 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {confirmationDialog.isDeleting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </>
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

ModelReadbuddy.propTypes = {
  darkMode: PropTypes.bool
};

export default ModelReadbuddy;