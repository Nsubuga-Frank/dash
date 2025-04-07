import { ArrowLeft, CheckCircle, ChevronDown, ChevronRight, Clock, Code, Command, Copy, Database, Eye, Folder, HardDrive, Info, Link, Maximize2, Minimize2, Plus, Server, Sparkles, Square, Trash2, User, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import ComingSoonModal from './playground/widgets/ComingSoonModal';

const AIStudio = ({ darkMode }) => {
  const [activeSection, setActiveSection] = useState('catalogue');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedModelType, setSelectedModelType] = useState('All');
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Deployment Panel States
  const [showDeployPanel, setShowDeployPanel] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState('GPU');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [showUserPods, setShowUserPods] = useState(false);
  
  // Deployments State
  const [selectedDeployedModel, setSelectedDeployedModel] = useState(null);
  const [activeDeploymentTab, setActiveDeploymentTab] = useState('overview');
  const [activeConsoleType, setActiveConsoleType] = useState('chat');
  
  // API Tab States
  const [chatLang, setChatLang] = useState('python');
  const [completionLang, setCompletionLang] = useState('python');
  const [embeddingLang, setEmbeddingLang] = useState('python');
  
  // Available model types for filtering
  const modelTypes = ['All', 'OpenAI', 'Llama', 'DeepSeek', 'Qwen', 'Phi'];

  // Navigation sections with icons
  const navigationSections = [
    { id: 'catalogue', label: 'Model Catalogue', icon: Database, comingSoon: false, description: 'Browse and explore AI models' },
    { id: 'deployments', label: 'My Deployments', icon: Server, comingSoon: false, description: 'Manage your model deployments' },
    { id: 'playground', label: 'Playground', icon: Sparkles, comingSoon: false, description: 'Test and experiment with AI models' },
    { 
      id: 'assistants', 
      label: 'AI Assistants', 
      icon: User, 
      comingSoon: true,
      description: 'Create and customize AI assistants with different personalities, knowledge bases, and capabilities. Your AI assistants can help with specific tasks, domains, or provide specialized expertise.'
    },
    { 
      id: 'agents', 
      label: 'Polaris Agents', 
      icon: Sparkles, 
      comingSoon: true,
      description: 'Our agent technology allows for autonomous problem-solving through a chain of thought process. Agents can reason through complex tasks, use tools, and accomplish goals with minimal human supervision.'
    }
  ];

  // Sample model data based on the screenshot
  const models = [
    {
      id: 1,
      name: 'DeepSeek R1 Distill (Owen 7B)',
      description: 'DeepSeek R1 distilled into Owen 7B',
      parameters: '7B',
      type: 'owen',
      brand: 'DeepSeek',
      downloads: '642586',
      lastUpdated: '48 days ago',
      size: '4.68 GB'
    },
    {
      id: 2,
      name: 'DeepSeek R1 Distill (Llama 8B)',
      description: 'DeepSeek R1 distilled into Llama 8B',
      parameters: '8B',
      type: 'llama',
      brand: 'DeepSeek',
      downloads: '523891',
      lastUpdated: '52 days ago',
      size: '5.12 GB'
    },
    {
      id: 3,
      name: 'phi-4',
      description: 'The latest in the Phi model series',
      parameters: '4B',
      type: 'phi',
      brand: 'Phi',
      downloads: '789652',
      lastUpdated: '30 days ago',
      size: '3.84 GB'
    },
    {
      id: 4,
      name: 'Granite 3.1 8B',
      description: 'Dense LLM from IBM supporting up to 128K context length',
      parameters: '8B',
      type: 'granite',
      brand: 'IBM',
      downloads: '356789',
      lastUpdated: '41 days ago',
      size: '7.9 GB'
    },
    {
      id: 5,
      name: 'Hermes 3 Llama 3.2 3B',
      description: 'A generalist model with agentic capabilities',
      parameters: '3B',
      type: 'llama',
      brand: 'Llama',
      downloads: '432156',
      lastUpdated: '39 days ago',
      size: '3.1 GB'
    },
    {
      id: 6,
      name: 'Llama 3.3 70B Instruct',
      description: 'Meta&apos;s latest Llama 70B model',
      parameters: '70B',
      type: 'llama',
      brand: 'Llama',
      downloads: '897654',
      lastUpdated: '35 days ago',
      size: '67.5 GB'
    },
    {
      id: 7,
      name: 'Owen2.5 Coder 14B',
      description: '14B version of the code-specific Owen 2.5 for code generation',
      parameters: '14B',
      type: 'owen',
      brand: 'Qwen',
      downloads: '423567',
      lastUpdated: '42 days ago',
      size: '13.8 GB'
    },
    {
      id: 8,
      name: 'Owen2.5 Coder 32B',
      description: '32B version of the code-specific Owen 2.5 for code generation',
      parameters: '32B',
      type: 'owen',
      brand: 'Qwen',
      downloads: '321456',
      lastUpdated: '44 days ago',
      size: '31.2 GB'
    },
    {
      id: 9,
      name: 'Owen2.5 Coder 3B',
      description: '3B version of the code-specific Owen 2.5 for code generation',
      parameters: '3B',
      type: 'owen',
      brand: 'Qwen',
      downloads: '564321',
      lastUpdated: '38 days ago',
      size: '2.9 GB'
    }
  ];

  // Demo instances data (would come from an API in a real application)
  const instancesData = [
    {
      id: 'i-1',
      name: 'Standard GPU',
      type: 'GPU',
      region: 'US East',
      specs: {
        cpu: '8 vCPU',
        ram: '16 GB',
        storage: '100 GB SSD',
        gpu: 'NVIDIA A10G',
        vram: '24 GB'
      },
      recommendation: 'recommended',
      price: '$0.60/hr'
    },
    {
      id: 'i-2',
      name: 'High Memory CPU',
      type: 'CPU',
      region: 'US West',
      specs: {
        cpu: '16 vCPU',
        ram: '64 GB',
        storage: '250 GB SSD',
        gpu: null,
        vram: null
      },
      recommendation: 'ok',
      price: '$0.35/hr'
    },
    {
      id: 'i-3',
      name: 'Basic CPU',
      type: 'CPU',
      region: 'Europe',
      specs: {
        cpu: '4 vCPU',
        ram: '8 GB',
        storage: '50 GB SSD',
        gpu: null,
        vram: null
      },
      recommendation: 'not_recommended',
      missingRequirements: 'Not enough RAM (minimum 12GB required)',
      price: '$0.15/hr'
    },
    {
      id: 'i-4',
      name: 'ML Optimized',
      type: 'GPU',
      region: 'Asia',
      specs: {
        cpu: '12 vCPU',
        ram: '32 GB',
        storage: '200 GB SSD',
        gpu: 'NVIDIA A100',
        vram: '40 GB'
      },
      recommendation: 'recommended',
      price: '$1.20/hr'
    },
    {
      id: 'i-5',
      name: 'Budget GPU',
      type: 'GPU',
      region: 'US East',
      specs: {
        cpu: '4 vCPU',
        ram: '16 GB',
        storage: '100 GB SSD',
        gpu: 'NVIDIA T4',
        vram: '16 GB'
      },
      recommendation: 'ok',
      price: '$0.35/hr'
    }
  ];
  
  // Sample user pods data
  const userPods = [
    {
      id: 'user-pod-1',
      name: 'My GPU Pod',
      type: 'GPU',
      region: 'US West',
      recommendation: 'recommended',
      specs: {
        cpu: '8 vCPU',
        ram: '16 GB',
        gpu: 'NVIDIA T4',
        vram: '16 GB'
      },
      price: 'Active',
      expiresIn: '13 days'
    },
    {
      id: 'user-pod-2',
      name: 'My CPU Pod',
      type: 'CPU',
      region: 'EU Central',
      recommendation: 'ok',
      specs: {
        cpu: '4 vCPU',
        ram: '8 GB'
      },
      price: 'Active',
      expiresIn: '6 days'
    },
    {
      id: 'user-pod-3',
      name: 'ML Workstation',
      type: 'GPU',
      region: 'Asia Pacific',
      recommendation: 'not_recommended',
      missingRequirements: 'Insufficient VRAM (4GB needed)',
      specs: {
        cpu: '16 vCPU',
        ram: '64 GB',
        gpu: 'NVIDIA K80',
        vram: '2 GB'
      },
      price: 'Active',
      expiresIn: '22 days'
    }
  ];

  // Sample deployed models data
  const deployedModels = [
    {
      id: 'deploy-1',
      name: 'DeepSeek R1 API',
      modelName: 'DeepSeek R1 Distill (Owen 7B)',
      instanceName: 'Standard GPU',
      status: 'running',
      deployedAt: '2023-10-15T14:30:00Z',
      region: 'US East',
      scaling: true,
      stats: {
        totalRequests: 142879,
        uptime: '14 days',
        avgResponse: '243ms',
        cost: 132.50
      },
      recentRequests: [
        { timestamp: '2023-10-29T15:43:12Z', client: 'Web App', duration: '198ms', status: 'success' },
        { timestamp: '2023-10-29T15:42:45Z', client: 'Mobile App', duration: '256ms', status: 'success' },
        { timestamp: '2023-10-29T15:41:32Z', client: 'API Client', duration: '312ms', status: 'success' },
        { timestamp: '2023-10-29T15:40:18Z', client: 'Web App', duration: '187ms', status: 'success' },
        { timestamp: '2023-10-29T15:39:51Z', client: 'API Client', duration: '452ms', status: 'error' }
      ],
      envVars: [
        { name: 'MAX_TOKENS', value: '8192', secret: false },
        { name: 'DEFAULT_TEMP', value: '0.7', secret: false },
        { name: 'API_KEY', value: 'sk-....', secret: true }
      ]
    },
    {
      id: 'deploy-2',
      name: 'Phi-4 Production',
      modelName: 'phi-4',
      instanceName: 'ML Optimized',
      status: 'running',
      deployedAt: '2023-10-20T09:15:00Z',
      region: 'Europe',
      scaling: true,
      stats: {
        totalRequests: 89534,
        uptime: '9 days',
        avgResponse: '156ms',
        cost: 95.75
      },
      recentRequests: [
        { timestamp: '2023-10-29T15:44:22Z', client: 'Web App', duration: '143ms', status: 'success' },
        { timestamp: '2023-10-29T15:43:51Z', client: 'API Client', duration: '165ms', status: 'success' },
        { timestamp: '2023-10-29T15:43:12Z', client: 'Web App', duration: '178ms', status: 'success' },
        { timestamp: '2023-10-29T15:42:45Z', client: 'Mobile App', duration: '149ms', status: 'success' },
        { timestamp: '2023-10-29T15:41:32Z', client: 'API Client', duration: '184ms', status: 'success' }
      ],
      envVars: [
        { name: 'MAX_TOKENS', value: '4096', secret: false },
        { name: 'DEFAULT_TEMP', value: '0.5', secret: false },
        { name: 'API_KEY', value: 'sk-....', secret: true }
      ]
    },
    {
      id: 'deploy-3',
      name: 'Llama 3.3 Staging',
      modelName: 'Llama 3.3 70B Instruct',
      instanceName: 'High Memory CPU',
      status: 'stopped',
      deployedAt: '2023-09-28T11:20:00Z',
      region: 'Asia',
      scaling: false,
      stats: {
        totalRequests: 23458,
        uptime: '4 days',
        avgResponse: '520ms',
        cost: 45.20
      },
      recentRequests: [
        { timestamp: '2023-10-02T18:22:45Z', client: 'Test Suite', duration: '498ms', status: 'success' },
        { timestamp: '2023-10-02T18:21:32Z', client: 'API Client', duration: '512ms', status: 'success' },
        { timestamp: '2023-10-02T18:20:18Z', client: 'Web App', duration: '535ms', status: 'success' },
        { timestamp: '2023-10-02T18:19:51Z', client: 'Test Suite', duration: '592ms', status: 'error' },
        { timestamp: '2023-10-02T18:18:45Z', client: 'API Client', duration: '505ms', status: 'success' }
      ],
      envVars: [
        { name: 'MAX_TOKENS', value: '16384', secret: false },
        { name: 'DEFAULT_TEMP', value: '0.8', secret: false },
        { name: 'API_KEY', value: 'sk-....', secret: true },
        { name: 'DEBUG_MODE', value: 'true', secret: false }
      ]
    }
  ];

  // Available regions for filtering extracted from instances and user pods
  const regions = [...new Set([
    ...instancesData.map(instance => instance.region),
    ...userPods.map(pod => pod.region)
  ])];
  
  // Filter instances based on selected hardware type, region, and recommendation status
  const filteredInstances = instancesData.filter(instance => 
    (selectedHardware === 'All' || instance.type === selectedHardware) &&
    (selectedRegion === 'All' || instance.region === selectedRegion) &&
    (!showRecommendedOnly || instance.recommendation === 'recommended')
  );

  // Filter user pods based on selected hardware type, region, and recommendation status
  const filteredUserPods = userPods.filter(pod => 
    (selectedHardware === 'All' || pod.type === selectedHardware) &&
    (selectedRegion === 'All' || pod.region === selectedRegion) &&
    (!showRecommendedOnly || pod.recommendation === 'recommended')
  );

  // Filter models based on selected type
  const filteredModels = selectedModelType === 'All' 
    ? models 
    : models.filter(model => model.brand === selectedModelType);

  // Default to first model if none selected
  if (!selectedModel && filteredModels.length > 0) {
    setSelectedModel(filteredModels[0]);
  }

  // Toggle expanded/minimized state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle navigation item click
  const handleSectionClick = (section) => {
    if (section.comingSoon) {
      // Use our ComingSoonModal instead of native alert
      handleComingSoonFeature(section.label, section.description);
    } else {
      // Otherwise, navigate to the section
      setActiveSection(section.id);
    }
  };

  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [comingSoonDescription, setComingSoonDescription] = useState("");
  // Add state for deployment notification
  const [showDeploymentNotification, setShowDeploymentNotification] = useState(false);
  const [deploymentMessage, setDeploymentMessage] = useState("");
  
  const handleComingSoonFeature = (feature, description) => {
    setComingSoonFeature(feature);
    setComingSoonDescription(description);
    setShowComingSoonModal(true);
  };
  
  const handleDeployment = (modelName, instanceName) => {
    setDeploymentMessage(`Deploying ${modelName} on ${instanceName}`);
    setShowDeploymentNotification(true);
    
    // Hide the notification after 3 seconds
    setTimeout(() => {
      setShowDeploymentNotification(false);
    }, 3000);
    
    // Hide the deploy panel
    setShowDeployPanel(false);
  };

  // Playground states
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [playgroundModel, setPlaygroundModel] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [temperature, setTemperature] = useState(0.7);
  // eslint-disable-next-line no-unused-vars
  const [maxTokens, setMaxTokens] = useState(2048);
  // eslint-disable-next-line no-unused-vars
  const [topP, setTopP] = useState(0.95);
  const messagesEndRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [currentChat, setCurrentChat] = useState({
    id: 'simple-file-system',
    name: 'C++ Simple File System',
    tokens: '275 tokens',
    selected: true
  });
  
  // Sample chat history
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'simple-file-system',
      name: 'C++ Simple File System',
      tokens: '275 tokens',
      selected: true
    },
    {
      id: 'financial-analysis',
      name: 'Financial analysis',
      tokens: '1k tokens',
      selected: false
    },
    {
      id: 'log-version',
      name: 'log about version of ...',
      tokens: '9k tokens',
      selected: false
    }
  ]);
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  // Handle sending message in playground
  const handleSendMessage = async () => {
    if (!userInput.trim() || !playgroundModel) return;
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userInput
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call your API
      // For now, we'll simulate a response after a short delay
      setTimeout(() => {
        const aiResponse = {
          role: 'assistant',
          content: `This is a simulated response for the message: "${userInput}"\n\nModel: ${playgroundModel?.name}\nTemperature: ${temperature}\nMax Tokens: ${maxTokens}\nTop P: ${topP}`
        };
        
        setChatMessages(prev => [...prev, aiResponse]);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsProcessing(false);
    }
  };
  
  // Clear chat history
  const handleClearChat = () => {
    setChatMessages([]);
  };

  // Handle chat selection
  const handleChatSelect = (chatId) => {
    const updatedHistory = chatHistory.map(chat => ({
      ...chat,
      selected: chat.id === chatId
    }));
    
    setChatHistory(updatedHistory);
    setCurrentChat(updatedHistory.find(chat => chat.id === chatId));
  };

  // Projects/folders
  const [projects, setProjects] = useState([
    {
      id: 'secret-project',
      name: 'Secret project',
      expanded: true
    }
  ]);

  // Toggle project expansion
  const toggleProject = (projectId) => {
    setProjects(projects.map(project => 
      project.id === projectId ? {...project, expanded: !project.expanded} : project
    ));
  };

  return (
    // Perfectly centered container with minimal equal margins
    <div className="px-8 flex items-center justify-center" style={{ height: '100%' }}>
      {/* Centered component with equal margins and responsive size */}
      <div 
        className={`flex flex-col overflow-hidden rounded-lg ${
          darkMode 
            ? 'bg-gray-900 text-white border-gray-600 shadow-xl shadow-blue-900/10' 
            : 'bg-white text-gray-900 border-gray-300 shadow-xl shadow-blue-500/10'
        } transition-all duration-300 border-2 mx-4`}
        style={{ 
          height: isExpanded ? 'calc(100vh - 140px)' : 'calc(90vh - 140px)',
          width: isExpanded ? 'calc(100% - 32px)' : '90%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: '0 auto',
          maxHeight: 'calc(100vh - 140px)'
        }}
      >
        {/* Top header bar */}
        <div className={`flex items-center justify-between px-3 py-1.5 border-b-2 ${
          darkMode 
            ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800' 
            : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
        }`}>
          <div className="flex items-center">
            <div className={`flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <Command className="h-4 w-4 mr-1.5" />
              <span className="font-medium text-sm">Polaris AI Studio</span>
            </div>
            {/* Beta banner */}
            <div className={`ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
              darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
            }`}>
              BETA
            </div>
          </div>
          <div className="flex items-center">
            <button 
              className={`p-1 rounded-full ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              } transition-colors`}
              onClick={toggleExpand}
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Main three-panel layout - flex-1 to fill available space */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left panel - navigation tabs - reduced width to match Sidebar.jsx */}
          <div className={`w-48 flex-shrink-0 border-r-2 overflow-y-auto flex flex-col ${
            darkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="p-1.5 space-y-0.5 flex-grow">
              {navigationSections.map(section => (
                <button
                  key={section.id}
                  className={`w-full flex items-center justify-between p-1.5 py-1 rounded-lg text-xs font-medium transition-colors duration-200
                    ${activeSection === section.id && !section.comingSoon
                      ? darkMode
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : darkMode
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-center gap-1.5">
                    <section.icon className="h-3.5 w-3.5" />
                    <span>{section.label}</span>
                  </div>
                  
                  {section.comingSoon && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                    }`}>
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Premium features upgrade section */}
            <div className={`mt-auto p-2 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className={`p-2 rounded-lg ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/30' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100'
              }`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-medium">Premium Features</span>
                </div>
                <p className="text-[10px] mb-2 opacity-80">Upgrade for advanced AI features, priority compute, and enterprise support.</p>
                <button className={`w-full text-[10px] py-1 rounded ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } transition-colors`}>
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content area - This will contain the different section UIs */}
          <div className="flex-1 flex">
            {activeSection === 'catalogue' && (
              <>
                {/* Fixed header for model list */}
                <div className={`sticky top-0 ${
                  darkMode 
                    ? 'border-b-2 border-gray-700 bg-gray-900 z-10' 
                    : 'border-b-2 border-gray-300 bg-gray-50/95 z-10'
                }`}>
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-xs font-medium">Choose Model</span>
                    <div className="flex items-center">
                      <select 
                        className={`text-xs px-2 py-1 rounded-md border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        } outline-none transition-all`}
                        value={selectedModelType}
                        onChange={(e) => setSelectedModelType(e.target.value)}
                      >
                        {modelTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <button className="ml-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Search bar in the model list header */}
                  <div className="px-2 pb-2 relative">
                    <input
                      type="text"
                      placeholder="Search for models..."
                      className={`w-full py-1.5 pl-3 pr-8 rounded-md border text-xs ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      } outline-none transition-all`}
                    />
                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <X className="h-3 w-3 opacity-70" />
                    </button>
                  </div>
                </div>
                
                {/* Scrollable model list */}
                <div className="flex-1 overflow-y-auto">
                  <div className="divide-y divide-gray-700">
                    {filteredModels.map((model) => (
                      <div 
                        key={model.id}
                        className={`p-3 py-1 cursor-pointer transition-all ${
                          selectedModel?.id === model.id
                            ? darkMode 
                              ? 'bg-blue-900/20 border-l-4 border-blue-500' 
                              : 'bg-blue-50 border-l-4 border-blue-500'
                            : darkMode 
                              ? 'hover:bg-gray-700/50 border-l-4 border-transparent' 
                              : 'hover:bg-gray-100 border-l-4 border-transparent'
                        }`}
                        onClick={() => setSelectedModel(model)}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="pt-0.5">
                            <span className={`inline-block h-4 w-4 rounded-full ${
                              darkMode ? 'bg-blue-800' : 'bg-blue-100'
                            }`}>
                              <span className="flex h-full w-full items-center justify-center">
                                <span className={`h-2.5 w-2.5 rounded-full ${
                                  darkMode ? 'bg-blue-400' : 'bg-blue-500'
                                }`}></span>
                              </span>
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{model.name}</h3>
                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{model.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {activeSection === 'playground' && (
              // Full-width flex container for the three playground panels
              <div className="flex w-full">
                {/* Left - chat list panel */}
                <div className="w-60 flex-shrink-0 border-r flex flex-col overflow-hidden">
                  {/* Chat list header */}
                  <div
                    className={`sticky top-0 px-3 py-2 border-b flex items-center ${
                      darkMode
                        ? 'border-gray-800/80 bg-gray-900/95 backdrop-blur-sm z-10'
                        : 'border-gray-200/80 bg-gray-50/95 backdrop-blur-sm z-10'
                    }`}
                  >
                    <div className="flex space-x-1.5">
                      <button
                        className={`p-1 rounded-md transition-colors duration-150 ${
                          darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        <Square className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={`p-1 rounded-md transition-colors duration-150 ${
                          darkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Folder className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={`p-1 rounded-md transition-colors duration-150 ${
                          darkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs font-medium mx-auto tracking-wide uppercase">Chats</span>
                  </div>

                  {/* Project folders & chat list */}
                  <div className="flex-1 overflow-y-auto">
                    {projects.map((project) => (
                      <div key={project.id} className="mt-1">
                        <div
                          className={`flex items-center px-2 py-1 cursor-pointer transition-colors duration-150 ${
                            darkMode ? 'hover:bg-gray-800/70' : 'hover:bg-gray-100/70'
                          }`}
                          onClick={() => toggleProject(project.id)}
                        >
                          <ChevronRight
                            className={`h-3 w-3 transform transition-transform duration-200 ${
                              project.expanded ? 'rotate-90' : ''
                            }`}
                          />
                          <Square className="h-3 w-3 mx-1 opacity-70" />
                          <span className="text-xs opacity-80">{project.name}</span>
                        </div>
                        {project.expanded && (
                          <div className="ml-1 border-l border-dashed pt-0.5 pb-0.5 pl-1 my-0.5 transition-opacity duration-300 overflow-hidden">
                            {chatHistory.map((chat) => (
                              <div
                                key={chat.id}
                                onClick={() => handleChatSelect(chat.id)}
                                className={`flex items-center px-3 py-1 my-0.5 cursor-pointer rounded-sm transition-all duration-200 ${
                                  chat.selected
                                    ? darkMode
                                      ? 'bg-blue-900/20 border-l-2 border-blue-500'
                                      : 'bg-blue-50 border-l-2 border-blue-500'
                                    : darkMode
                                    ? 'hover:bg-gray-800/50 border-l-2 border-transparent'
                                    : 'hover:bg-gray-100 border-l-2 border-transparent'
                                }`}
                              >
                                <div className="flex-1 flex items-center">
                                  <Code className="h-3 w-3 mr-1.5 opacity-70" />
                                  <span
                                    className={`text-xs truncate ${
                                      chat.selected
                                        ? darkMode
                                          ? 'text-blue-400 font-medium'
                                          : 'text-blue-600 font-medium'
                                        : ''
                                    }`}
                                  >
                                    {chat.name}
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <span className="text-[10px] opacity-60 mr-1 font-mono">{chat.tokens}</span>
                                  <button className="opacity-60 hover:opacity-100 transition-opacity duration-150">
                                    <ChevronDown className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Middle - chat interface */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Top navbar with model selector */}
                  <div className={`flex items-center py-1.5 px-3 border-b ${
                    darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'
                  }`}>
                    <div className="mx-auto relative w-full max-w-md">
                      <button className={`w-full flex items-center justify-center rounded-full py-1 px-4 ${
                        darkMode 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      }`}>
                        <span className="text-xs font-medium mr-1">meta-llama-3.1-8b-instruct</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <button className={`px-2 py-0.5 rounded ml-2 text-xs ${
                      darkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}>
                      Eject
                    </button>
                  </div>
                  
                  {/* Second header row with chat title and options */}
                  <div className={`flex items-center justify-between px-3 py-1.5 border-b ${
                    darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                  }`}>
                    <div className="text-xs font-medium">C++ Simple File System</div>

                    <div className="flex items-center space-x-4">
                      <button className={`py-0.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Appearance
                        </span>
                      </button>

                      <button 
                        onClick={handleClearChat}
                        className={`py-0.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        <span className="flex items-center">
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Clear All
                        </span>
                      </button>

                      <button className={`py-0.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center">
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Duplicate
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Chat content */}
                  <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <div className="max-w-3xl mx-auto px-4 py-4">
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Assistant
                          </span>
                          <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono`}>
                            meta-llama-3.1-8b-instruct
                          </span>
                        </div>

                        <div className={`mt-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          <p className="text-sm mb-3">
                            Before we begin, let&apos;s outline the basic components of our file system:
                          </p>

                          <ol className="list-decimal space-y-2 pl-8 mb-4">
                            <li className="text-sm">
                              <span className="font-medium">FileSystem:</span> This will be the top-level class responsible for managing the file system.
                            </li>
                            <li className="text-sm">
                              <span className="font-medium">Directory:</span> Represents a directory in the file system. It contains a map of child directories and files.
                            </li>
                            <li className="text-sm">
                              <span className="font-medium">File:</span> Represents a file in the file system. It stores the file&apos;s name, size, and contents.
                            </li>
                          </ol>

                          <h3 className="text-sm font-medium mb-2">Implementation</h3>

                          <div className={`p-3 rounded-md mb-4 font-mono text-xs overflow-x-auto ${
                            darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex space-x-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                              </div>
                              <button className="text-xs text-gray-500">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div>
                              <span className="text-blue-400">#include</span> <span className="text-green-400">&lt;iostream&gt;</span>
                            </div>
                            <div>
                              <span className="text-blue-400">#include</span> <span className="text-green-400">&lt;fstream&gt;</span>
                            </div>
                            <div>
                              <span className="text-blue-400">#include</span> <span className="text-green-400">&lt;string&gt;</span>
                            </div>
                            <div>
                              <span className="text-blue-400">#include</span> <span className="text-green-400">&lt;map&gt;</span>
                            </div>
                            <div className="mt-2 text-gray-500">{/* Forward declarations */}</div>
                            <div>
                              <span className="text-purple-400">class</span> <span className="text-yellow-400">FileSystem</span>;
                            </div>
                            <div>
                              <span className="text-purple-400">class</span> <span className="text-yellow-400">Directory</span>;
                            </div>
                            <div>
                              <span className="text-purple-400">class</span> <span className="text-yellow-400">File</span>;
                            </div>
                            <div className="mt-2 text-gray-500">{/* Abstract base class for File System components (Directory/File) */}</div>
                            <div>
                              <span className="text-purple-400">class</span> <span className="text-yellow-400">FileSystemComponent</span> {'{'}
                            </div>
                            <div>
                              <span className="text-purple-400 ml-4">public</span>:
                            </div>
                            <div className="ml-8">
                              <span className="text-blue-400">virtual</span> ~<span className="text-yellow-400">FileSystemComponent</span>() {'{'}{'}'} 
                            </div>
                          </div>
                        </div>
                      </div>
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Input area */}
                  <div className={`px-4 py-3 border-t ${
                    darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                  }`}>
                    <div className="max-w-3xl mx-auto">
                      <div className="relative">
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Type a message and press Enter to send..."
                          rows="1"
                          className={`w-full p-2.5 pl-3 rounded-md border resize-none ${
                            darkMode
                              ? 'bg-gray-800 border-gray-700 focus:border-blue-500 text-gray-200 placeholder-gray-500'
                              : 'bg-white border-gray-300 focus:border-blue-400 text-gray-800 placeholder-gray-400'
                          } focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
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
                          <span className="text-xs text-gray-500 mr-2">Insert (Ctrl + I)</span>
                          <button
                            onClick={handleSendMessage}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              userInput.trim() === '' 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:opacity-90'
                            } ${
                              darkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            Send
                          </button>
                        </div>
                      </div>

                      <div className="mt-1.5 text-center">
                        <span className="text-[10px] text-gray-500 font-mono">Context is 6.7% full</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'deployments' && (
              <>
                {/* Fixed header for deployments list */}
                <div className={`sticky top-0 ${
                  darkMode 
                    ? 'border-b-2 border-gray-700 bg-gray-800/95 z-10' 
                    : 'border-b-2 border-gray-300 bg-gray-50/95 z-10'
                }`}>
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-xs font-medium">Your Deployments</span>
                    <div className="flex items-center">
                      <button 
                        className={`text-xs px-2 py-1 rounded-md ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        New Deploy
                      </button>
                    </div>
                  </div>
                  
                  {/* Search bar in the deployments header */}
                  <div className="px-2 pb-2 relative">
                    <input
                      type="text"
                      placeholder="Search deployments..."
                      className={`w-full py-1.5 pl-3 pr-8 rounded-md border text-xs ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      } outline-none transition-all`}
                    />
                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <X className="h-3 w-3 opacity-70" />
                    </button>
                  </div>
                </div>
                
                {/* Scrollable deployments list */}
                <div className="flex-1 overflow-y-auto">
                  <div className="divide-y divide-blue-100">
                    {deployedModels.map((deployedModel) => (
                      <div 
                        key={deployedModel.id}
                        className={`p-3 py-1 cursor-pointer transition-all ${
                          selectedDeployedModel?.id === deployedModel.id
                            ? darkMode 
                              ? 'bg-blue-900/20 border-l-4 border-blue-500' 
                              : 'bg-blue-50 border-l-4 border-blue-500'
                            : darkMode 
                              ? 'hover:bg-gray-700/50 border-l-4 border-transparent' 
                              : 'hover:bg-gray-100 border-l-4 border-transparent'
                        }`}
                        onClick={() => setSelectedDeployedModel(deployedModel)}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="pt-0.5">
                            <span className={`inline-block h-4 w-4 rounded-full ${
                              deployedModel.status === 'running'
                                ? darkMode ? 'bg-green-800' : 'bg-green-100'
                                : darkMode ? 'bg-yellow-800' : 'bg-yellow-100'
                            }`}>
                              <span className="flex h-full w-full items-center justify-center">
                                <span className={`h-2.5 w-2.5 rounded-full ${
                                  deployedModel.status === 'running'
                                    ? darkMode ? 'bg-green-400' : 'bg-green-500'
                                    : darkMode ? 'bg-yellow-400' : 'bg-yellow-500'
                                }`}></span>
                              </span>
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{deployedModel.name}</h3>
                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{deployedModel.description}</p>
                            <div className="flex items-center mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                deployedModel.status === 'running'
                                  ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                                  : darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                {deployedModel.status === 'running' ? 'Running' : 'Paused'}
                              </span>
                              <span className="text-[10px] text-gray-500 ml-2">
                                {new Date(deployedModel.deployedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Deployment Panel Modal */}
      {showDeployPanel && selectedModel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            // Close panel when clicking the background overlay
            if (e.target === e.currentTarget) {
              setShowDeployPanel(false);
            }
          }}
        >
          <div 
            className={`w-[90%] max-w-4xl flex flex-col h-[600px] rounded-lg shadow-xl ${
              darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
          >
            {/* Fixed Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center">
                <button 
                  className={`p-1 rounded-full mr-2 ${
                    darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => setShowDeployPanel(false)}
                  aria-label="Close panel"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h2 className="text-sm font-medium flex items-center">
                  Deploy {selectedModel.name}
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                    darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {selectedModel.size}
                  </span>
                </h2>
              </div>
            </div>
            
            {/* Fixed Filters Section */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xs font-medium mb-2">Compute Source</h3>
                    <div className={`inline-flex p-1 rounded-full ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <button
                        onClick={() => setShowUserPods(false)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                          !showUserPods
                            ? darkMode 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-500 text-white'
                            : darkMode
                              ? 'text-gray-400 hover:text-gray-300'
                              : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Cloud Compute
                      </button>
                      <button
                        onClick={() => setShowUserPods(true)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                          showUserPods
                            ? darkMode 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-500 text-white'
                            : darkMode
                              ? 'text-gray-400 hover:text-gray-300'
                              : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Your Pods
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-medium mb-2">Hardware Type</h3>
                    <div className={`inline-flex p-1 rounded-full ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      {['All', 'CPU', 'GPU'].map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedHardware(type)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                            selectedHardware === type
                              ? darkMode 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-blue-500 text-white'
                              : darkMode
                                ? 'text-gray-400 hover:text-gray-300'
                                : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-medium mb-2">Filter Options</h3>
                  <div className={`inline-flex p-1 rounded-full ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <button
                      onClick={() => setShowRecommendedOnly(false)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        !showRecommendedOnly
                          ? darkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white'
                          : darkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setShowRecommendedOnly(true)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        showRecommendedOnly
                          ? darkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white'
                          : darkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Recommended
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-medium mb-2">Region</h3>
                  <div className="grid grid-cols-4 gap-1">
                    {['All', ...regions].map(region => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={`px-2 py-1.5 text-[10px] font-medium rounded border transition-all ${
                          selectedRegion === region
                            ? darkMode 
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300' 
                              : 'border-blue-500 bg-blue-50 text-blue-600'
                            : darkMode
                              ? 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scrollable Instances List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {!showUserPods ? (
                  <>
                    <h3 className="text-xs font-medium mb-2 sticky top-0">Available Compute ({filteredInstances.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 min-h-[200px]">
                      {filteredInstances.length === 0 ? (
                        <div className="col-span-full flex items-center justify-center h-[200px] text-gray-500 text-xs">
                          No matching compute instances found. Try changing your filters.
                        </div>
                      ) : (
                        filteredInstances.map(instance => {
                          const isSelected = selectedInstance?.id === instance.id;
                          const isNotRecommended = instance.recommendation === 'not_recommended';
                          const isRecommended = instance.recommendation === 'recommended';
                          const isCompatible = instance.recommendation === 'ok';
                          
                          // Status badge styling
                          let statusBadgeColor = '';
                          let statusText = '';
                          
                          if (isNotRecommended) {
                            statusBadgeColor = darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600';
                            statusText = 'Not Compatible';
                          } else if (isRecommended) {
                            statusBadgeColor = darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600';
                            statusText = 'Recommended';
                          } else if (isCompatible) {
                            statusBadgeColor = darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-600';
                            statusText = 'Compatible';
                          }
                          
                          return (
                            <div 
                              key={instance.id}
                              className={`p-2 rounded-lg border transition-all h-[140px] ${
                                isSelected
                                  ? darkMode 
                                    ? 'border-blue-500 bg-blue-500/10' 
                                    : 'border-blue-500 bg-blue-50'
                                  : darkMode
                                    ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' 
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                              } cursor-pointer flex flex-col relative`}
                              onClick={() => setSelectedInstance(isSelected ? null : instance)}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-xs font-medium truncate">{instance.name}</h4>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusBadgeColor}`}>
                                  {statusText}
                                </span>
                              </div>
                              
                              {isNotRecommended && (
                                <div className="mb-0.5 flex items-center text-[9px] text-red-400">
                                  <Info className="h-2.5 w-2.5 mr-1" />
                                  <span className="truncate">{instance.missingRequirements}</span>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                <div className="flex items-center text-[9px] text-gray-500">
                                  <Server className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                  <span className="truncate">{instance.specs.cpu}</span>
                                </div>
                                <div className="flex items-center text-[9px] text-gray-500">
                                  <HardDrive className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                  <span className="truncate">{instance.specs.ram} RAM</span>
                                </div>
                                {instance.type === 'GPU' && (
                                  <>
                                    <div className="flex items-center text-[9px] text-gray-500">
                                      <svg className="h-2.5 w-2.5 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
                                        <line x1="6" y1="12" x2="18" y2="12" strokeWidth="2" />
                                      </svg>
                                      <span className="truncate">{instance.specs.gpu}</span>
                                    </div>
                                    <div className="flex items-center text-[9px] text-gray-500">
                                      <svg className="h-2.5 w-2.5 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M12 3v18M3 12h18" strokeWidth="2" />
                                      </svg>
                                      <span className="truncate">{instance.specs.vram} VRAM</span>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <div className="absolute bottom-2 left-2 right-2 border-t border-gray-700/30 flex items-center justify-between pt-1">
                                <span className="text-[9px] text-gray-500">{instance.region}</span>
                                <span className={`text-[10px] font-medium ${
                                  darkMode ? 'text-blue-400' : 'text-blue-600'
                                }`}>{instance.price}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xs font-medium mb-2 sticky top-0">Your Compute Pods ({filteredUserPods.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 min-h-[200px]">
                      {filteredUserPods.length === 0 ? (
                        <div className="col-span-full flex items-center justify-center h-[200px] text-gray-500 text-xs">
                          You don&apos;t have any active compute pods. Try deploying with cloud compute instead.
                        </div>
                      ) : (
                        filteredUserPods.map(pod => {
                          const isSelected = selectedInstance?.id === pod.id;
                          const isNotRecommended = pod.recommendation === 'not_recommended';
                          const isRecommended = pod.recommendation === 'recommended';
                          const isCompatible = pod.recommendation === 'ok';
                          
                          // Status badge styling
                          let statusBadgeColor = '';
                          let statusText = '';
                          
                          if (isNotRecommended) {
                            statusBadgeColor = darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600';
                            statusText = 'Not Compatible';
                          } else if (isRecommended) {
                            statusBadgeColor = darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600';
                            statusText = 'Recommended';
                          } else if (isCompatible) {
                            statusBadgeColor = darkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-600';
                            statusText = 'Compatible';
                          }
                          
                          return (
                            <div 
                              key={pod.id}
                              className={`p-2 rounded-lg border transition-all h-[140px] ${
                                isSelected
                                  ? darkMode 
                                    ? 'border-blue-500 bg-blue-500/10' 
                                    : 'border-blue-500 bg-blue-50'
                                  : darkMode
                                    ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' 
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                              } cursor-pointer flex flex-col relative`}
                              onClick={() => setSelectedInstance(isSelected ? null : pod)}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-xs font-medium truncate">{pod.name}</h4>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusBadgeColor}`}>
                                  {statusText}
                                </span>
                              </div>
                              
                              {isNotRecommended && (
                                <div className="mb-0.5 flex items-center text-[9px] text-red-400">
                                  <Info className="h-2.5 w-2.5 mr-1" />
                                  <span className="truncate">{pod.missingRequirements}</span>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                <div className="flex items-center text-[9px] text-gray-500">
                                  <Server className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                  <span className="truncate">{pod.specs.cpu}</span>
                                </div>
                                <div className="flex items-center text-[9px] text-gray-500">
                                  <HardDrive className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                  <span className="truncate">{pod.specs.ram} RAM</span>
                                </div>
                                {pod.type === 'GPU' && (
                                  <>
                                    <div className="flex items-center text-[9px] text-gray-500">
                                      <svg className="h-2.5 w-2.5 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
                                        <line x1="6" y1="12" x2="18" y2="12" strokeWidth="2" />
                                      </svg>
                                      <span className="truncate">{pod.specs.gpu}</span>
                                    </div>
                                    <div className="flex items-center text-[9px] text-gray-500">
                                      <svg className="h-2.5 w-2.5 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M12 3v18M3 12h18" strokeWidth="2" />
                                      </svg>
                                      <span className="truncate">{pod.specs.vram} VRAM</span>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <div className="absolute bottom-2 left-2 right-2 border-t border-gray-700/30 flex items-center justify-between pt-1">
                                <span className="text-[9px] text-gray-500 flex items-center">
                                  <Clock className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                                  {pod.expiresIn}
                                </span>
                                <span className={`text-[10px] font-medium ${
                                  darkMode ? 'text-green-400' : 'text-green-600'
                                }`}>{pod.price}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Fixed Footer with action buttons */}
            <div className={`p-4 border-t flex justify-end ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                className={`px-3 py-1.5 rounded-md text-xs font-medium mr-2 ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setShowDeployPanel(false)}
              >
                Cancel
              </button>
              {/* Check if instance is not recommended */}
              {(() => {
                const isInstanceNotRecommended = selectedInstance && selectedInstance.recommendation === 'not_recommended';
                return (
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                      (!selectedInstance || isInstanceNotRecommended) 
                        ? 'opacity-50 cursor-not-allowed '
                        : ''
                    } ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    disabled={!selectedInstance || isInstanceNotRecommended}
                    onClick={() => {
                      handleDeployment(selectedModel.name, selectedInstance.name);
                    }}
                  >
                    Deploy Now
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        feature={comingSoonFeature}
        description={comingSoonDescription}
        darkMode={darkMode}
      />
      {showDeploymentNotification && (
        <div className={`fixed top-4 right-4 max-w-sm p-3 rounded-lg shadow-lg 
          ${darkMode ? 'bg-gray-800 border border-green-500' : 'bg-white border border-green-400'}
          transition-all duration-300 animate-in slide-in-from-top-5 fade-in-20`}
        >
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <CheckCircle className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
            </div>
            <div className={`ml-3 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {deploymentMessage}
            </div>
            <button
              type="button"
              className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 
                ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
              onClick={() => setShowDeploymentNotification(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

AIStudio.propTypes = {
  darkMode: PropTypes.bool
};

export default AIStudio; 