import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import {
    ArrowLeft,
    BarChartHorizontal,
    Book,
    Bot,
    Box,
    Brain,
    Circle,
    CircleDollarSign,
    Clock,
    Code,
    Command,
    Cpu,
    Database,
    Folder,
    Hexagon,
    Info,
    Link,
    Maximize,
    Maximize2,
    Minimize,
    Minimize2,
    Play,
    PlayCircle,
    PlusCircle,
    RefreshCw,
    Server,
    ServerCog,
    Settings,
    Sparkles,
    Terminal,
    User,
    X
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';
import APIReference from '../components/APIReference';
import MetricsPanel from '../components/MetricsPanel';
import ModelDeployPanel from '../components/ModelDeployPanel';
import ModelPlayground from '../components/ModelPlayground';
import ModelReadbuddy from '../components/ModelReadbuddy';
import { getHuggingFaceRepoUrl } from '../utils/huggingfaceUtils';
import ClusterDeployment from './ClusterDeployment';
import DeploymentModal from './DeploymentModal';
import db from './firebase/config';
import NodesDashboard from './NodesDashboard';
import PaymentScreen from './PaymentScreen';
import ComingSoonModal from './playground/widgets/ComingSoonModal';
import PodGrid from './widgets/PodGrid';

//
// 1) Define your navigation sections here.
//    You can set comingSoon = true for tabs not yet ready.
//
const navigationSections = [
  {
    id: 'playground',
    label: 'Playground',
    icon: PlayCircle,
    comingSoon: false,
    description: 'Test models with prompts'
  },
  {
    id: 'readbuddy',
    label: 'ReadBuddy',
    icon: Book,
    comingSoon: false,
    description: 'Document chat & libraries'
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    icon: Folder,
    comingSoon: false,
    description: 'Browse and search for models'
  },
  {
    id: 'agentmaker',
    label: 'Agent Maker',
    icon: Bot,
    comingSoon: true,
    description: 'Create and customize AI agents for various tasks. Build intelligent agents that can understand context, make decisions, and execute complex workflows.'
  },
  {
    id: 'aiassistant',
    label: 'AI Assistant',
    icon: Sparkles,
    comingSoon: true,
    description: 'Your personalized AI assistant for everyday tasks. Get help with coding, writing, analysis, and more with our advanced AI assistant.'
  },
  {
    id: 'api',
    label: 'API & Tokens',
    icon: Code,
    comingSoon: true,
    description: 'Access our powerful AI models through our API. Get API keys, manage tokens, and integrate AI capabilities into your applications.'
  }
];

// Define navigation sections for the Compute tab
const computeNavigationSections = [
  {
    id: 'instances',
    label: 'My Pods',
    icon: Box,
    comingSoon: false,
    description: 'Manage your compute pods.'
  },
  {
    id: 'hardware',
    label: 'Hardware',
    icon: Cpu,
    comingSoon: false,
    description: 'Browse available hardware options.'
  },
  {
    id: 'usage',
    label: 'Usage & Billing',
    icon: CircleDollarSign,
    comingSoon: false,
    description: 'Monitor resource usage and billing details.'
  }
];

// Define nodes navigation sections
const nodesNavigationSections = [
  {
    id: 'all',
    label: 'All',
    icon: Hexagon,
    comingSoon: false,
    description: 'View all nodes'
  },
  {
    id: 'verified',
    label: 'Verified',
    icon: Server,
    comingSoon: false,
    description: 'View verified nodes'
  },
  {
    id: 'notverified',
    label: 'Not Verified',
    icon: Server,
    comingSoon: false,
    description: 'View unverified nodes'
  }
];

const AIStudio = ({ darkMode, modelsData, initialSection }) => {
  // Add the auth at the top of the component state declarations
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  
  // Coming Soon Modal states
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [comingSoonDescription, setComingSoonDescription] = useState("");
  
  // Active main section - use initialSection if provided, otherwise default to 'catalogue'
  const [activeSection, setActiveSection] = useState(initialSection || 'catalogue');
  // Active sidebar section for each main tab
  const [activeSidebarItem, setActiveSidebarItem] = useState(initialSection || 'catalogue');
  
  // Color schemes for each section in both dark and light modes
  const colorSchemes = {
    compute: {
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950',
        border: 'border-indigo-800',
        accent: 'indigo'
      },
      light: {
        bg: 'bg-gradient-to-br from-white via-white to-indigo-50',
        border: 'border-indigo-200',
        accent: 'indigo'
      }
    },
    nodes: {
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950',
        border: 'border-emerald-800',
        accent: 'emerald'
      },
      light: {
        bg: 'bg-gradient-to-br from-white via-white to-emerald-50',
        border: 'border-emerald-200',
        accent: 'emerald'
      }
    },
    catalogue: {
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950',
        border: 'border-purple-800',
        accent: 'purple'
      },
      light: {
        bg: 'bg-gradient-to-br from-white via-white to-purple-50',
        border: 'border-purple-200',
        accent: 'purple'
      }
    },
    studio: {
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950',
        border: 'border-purple-800',
        accent: 'purple'
      },
      light: {
        bg: 'bg-gradient-to-br from-white via-white to-purple-50',
        border: 'border-purple-200',
        accent: 'purple'
      }
    },
    agents: {
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950',
        border: 'border-cyan-800',
        accent: 'cyan'
      },
      light: {
        bg: 'bg-gradient-to-br from-white via-white to-cyan-50',
        border: 'border-cyan-200',
        accent: 'cyan'
      }
    },
    settings: {
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-900 to-rose-950',
        border: 'border-rose-800',
        accent: 'rose'
      },
      light: {
        bg: 'bg-gradient-to-br from-white via-white to-rose-50',
        border: 'border-rose-200',
        accent: 'rose'
      }
    }
  };

  // Get current color scheme based on active section
  const getCurrentColorScheme = () => {
    const section = activeSection === 'studio' ? 'catalogue' : activeSection;
    return colorSchemes[section][darkMode ? 'dark' : 'light'];
  };

  // Active compute section
  const [activeComputeSection, setActiveComputeSection] = useState('instances');

  // Active nodes section - add this new state
  const [activeNodesSection] = useState('all');

  // Model selection
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedModelType, setSelectedModelType] = useState('All');

  // Expand/minimize & fullscreen
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Deployment panel toggles
  const [showDeployPanel, setShowDeployPanel] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);

  // Deployments
  const [selectedDeployedModel, setSelectedDeployedModel] = useState(null);
  const [activeDeploymentTab, setActiveDeploymentTab] = useState('overview');
  const [activeConsoleType, setActiveConsoleType] = useState('chat');

  // API Tabs
  const [chatLang, setChatLang] = useState('python');
  const [completionLang, setCompletionLang] = useState('python');
  const [embeddingLang, setEmbeddingLang] = useState('python');

  // Hardware state variables
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false); // Add this state variable for deployment status
  const [selectedSSHKey, setSelectedSSHKey] = useState(null);
  const [selectedResource] = useState('standard');
  const [minerMappings, setMinerMappings] = useState({});
  const [verifiedMiners, setVerifiedMiners] = useState({});
  const [hardwareResources, setHardwareResources] = useState([]);

  // Filter states for hardware section
  const [typeFilter, setTypeFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Filter model types
  const modelTypes = ['All', 'OpenAI', 'Llama', 'DeepSeek', 'Qwen', 'Phi'];
  
  // Filter hardware resources based on selected filters
  const filteredHardwareResources = hardwareResources.filter(resource => {
    // Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'gpu' && !resource.specs?.gpu) return false;
      if (typeFilter === 'cpu' && resource.specs?.gpu) return false;
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      if (verificationFilter === 'verified' && !resource.isVerifiedMiner) return false;
      if (verificationFilter === 'unverified' && resource.isVerifiedMiner) return false;
    }

    return true;
  });

  // Fetch miners data
  useEffect(() => {
    const unsubMiners = onSnapshot(
      collection(db, "miners"),
      (snapshot) => {
        const newMappings = {};
        const newVerifiedMiners = {};
        
        snapshot.forEach((docSnap) => {
          const minerId = docSnap.id;
          const data = docSnap.data();
          
          newVerifiedMiners[minerId] = data.status === "verified";
          
          if (Array.isArray(data.compute_resources)) {
            data.compute_resources.forEach((resourceId) => {
              newMappings[resourceId] = minerId;
            });
          }
        });
        
        setMinerMappings(newMappings);
        setVerifiedMiners(newVerifiedMiners);
      },
      (error) => {
        console.error("Error fetching miners:", error);
      }
    );
    return () => unsubMiners();
  }, []);

  // Fetch hardware resources
  useEffect(() => {
    const unsubscribeResources = onSnapshot(
      collection(db, 'compute_resources'),
      (snapshot) => {
        const resources = snapshot.docs.map((doc) => {
          const data = doc.data();
          const minerId = minerMappings[doc.id];
          const isVerifiedMiner = minerId ? verifiedMiners[minerId] || false : false;
          
          return {
            id: doc.id,
            ...data,
            isVerifiedMiner
          };
        });
        setHardwareResources(resources);
      },
      (error) => {
        console.error('Error fetching compute resources:', error);
      }
    );
    return () => unsubscribeResources();
  }, [minerMappings, verifiedMiners]);

  // Function to handle resource deployment
  const handleDeployResource = () => {
    if (!selectedSSHKey || !selectedPlan) {
      toast.error('Please select an SSH key and subscription plan');
      return;
    }
    
    // Set deployment status to true
    setIsDeploying(true);
    
    // Get the selected SSH key from deployment config
    const sshKey = selectedSSHKey;
    
    // Simulate the createSubscription function from DeploymentConfig
    console.log('Deploying resource:', {
      sshKey,
      plan: selectedPlan
    });
    
    // Simulate API delay
    setTimeout(() => {
      toast.success('Resource deployment initiated successfully!');
      setShowDeploymentModal(false);
      setIsDeploying(false); // Reset deployment status
      
      // Navigate to instances section to see the new instance
      setActiveComputeSection('instances');
    }, 1500);
  };

  // Models from props or fallback
  const models = modelsData || [
    {
      id: 1,
      name: 'Llama-3 8B',
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
      description: 'Meta\'s latest Llama 70B model',
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

  // Demo instances data
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

  // Sample user pods
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
        cost: 132.5
      },
      recentRequests: [
        {
          timestamp: '2023-10-29T15:43:12Z',
          client: 'Web App',
          duration: '198ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:42:45Z',
          client: 'Mobile App',
          duration: '256ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:41:32Z',
          client: 'API Client',
          duration: '312ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:40:18Z',
          client: 'Web App',
          duration: '187ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:39:51Z',
          client: 'API Client',
          duration: '452ms',
          status: 'error'
        }
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
        {
          timestamp: '2023-10-29T15:44:22Z',
          client: 'Web App',
          duration: '143ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:43:51Z',
          client: 'API Client',
          duration: '165ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:43:12Z',
          client: 'Web App',
          duration: '178ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:42:45Z',
          client: 'Mobile App',
          duration: '149ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-29T15:41:32Z',
          client: 'API Client',
          duration: '184ms',
          status: 'success'
        }
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
        cost: 45.2
      },
      recentRequests: [
        {
          timestamp: '2023-10-02T18:22:45Z',
          client: 'Test Suite',
          duration: '498ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-02T18:21:32Z',
          client: 'API Client',
          duration: '512ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-02T18:20:18Z',
          client: 'Web App',
          duration: '535ms',
          status: 'success'
        },
        {
          timestamp: '2023-10-02T18:19:51Z',
          client: 'Test Suite',
          duration: '592ms',
          status: 'error'
        },
        {
          timestamp: '2023-10-02T18:18:45Z',
          client: 'API Client',
          duration: '505ms',
          status: 'success'
        }
      ],
      envVars: [
        { name: 'MAX_TOKENS', value: '16384', secret: false },
        { name: 'DEFAULT_TEMP', value: '0.8', secret: false },
        { name: 'API_KEY', value: 'sk-....', secret: true },
        { name: 'DEBUG_MODE', value: 'true', secret: false }
      ]
    }
  ];

  //
  // 2) Derive any needed data (filters, regions, etc.) based on the lists above
  //
  // Note: filtering for deployment options is now handled directly in the ModelDeployPanel component
  
  // Filter models by brand
  const filteredModels =
    selectedModelType === 'All'
      ? models
      : models.filter((model) => model.brand === selectedModelType);

  //
  // 3) Prevent infinite re-render by using an effect
  //    If no selectedModel is set, pick the first from the filtered list (if any)
  //
  useEffect(() => {
    if (!selectedModel && filteredModels.length > 0) {
      setSelectedModel(filteredModels[0]);
    }
  }, [selectedModel, filteredModels]);

  //
  // Handlers
  //
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle sidebar item click
  const handleSectionClick = (section) => {
    if (section.comingSoon) {
      setComingSoonFeature(section.label);
      setComingSoonDescription(section.description || `We're working hard to bring ${section.label} to you soon!`);
      setShowComingSoonModal(true);
      return;
    }
    
    setActiveSection(section.id);
    setActiveSidebarItem(section.id);
  };

  // Handle tab switch - update both main tab and sidebar
  const handleTabSwitch = (tabId) => {
    if (tabId === 'compute') {
      setActiveSection('compute');
      setActiveSidebarItem('compute');
      // Reset compute section to default when switching to compute tab
      setActiveComputeSection('instances');
    } else if (tabId === 'nodes') {
      setActiveSection('nodes');
      setActiveSidebarItem('nodes');
    } else if (tabId === 'settings') {
      setActiveSection('settings');
      setActiveSidebarItem('settings');
    } else if (tabId === 'agents') {
      setActiveSection('agents');
    } else {
      setActiveSection('playground');
      // When switching to AI Studio, set the sidebar item to match
      setActiveSidebarItem('playground');
    }
  };

  // Handle deployment action
  const handleDeployment = (modelName, instanceName) => {
    console.log(`Deploying ${modelName} on ${instanceName}`);
    alert(`Model deployment started: ${modelName} on ${instanceName}`);
    setShowDeployPanel(false);
  };

  // Add ReadBuddy handlers - remove since ModelReadbuddy handles its own functionality
  // const handleCreateLibrary = () => {
  //   if (newLibraryName.trim()) {
  //     const newLibrary = {
  //       id: `lib-${Date.now()}`,
  //       name: newLibraryName,
  //       documents: []
  //     };
  //     
  //     setLibraries([...libraries, newLibrary]);
  //     setNewLibraryName('');
  //     setShowNewLibraryInput(false);
  //     setSelectedLibrary(newLibrary);
  //   }
  // };
  
  // const handleUploadDocument = () => {
  //   // Implementation for uploading documents
  // };
  
  // const handleSelectDocument = (doc) => {
  //   setSelectedDocument(doc);
  // };
  
  // const handleSelectAllDocuments = (libraryId) => {
  //   const library = libraries.find(lib => lib.id === libraryId);
  //   if (library) {
  //     if (selectedDocuments.length === library.documents.length) {
  //       setSelectedDocuments([]);
  //     } else {
  //       setSelectedDocuments([...library.documents]);
  //     }
  //   }
  // };
  
  // const handleSendMessage = (message) => {
  //   // Implementation for sending messages
  // };

  // Pod grid ref and refreshing state
  const podGridRef = useRef(null);
  const [refreshingPods, setRefreshingPods] = useState(false);

  // Add function to refresh pods
  const handleRefreshPods = async () => {
    if (podGridRef.current) {
      setRefreshingPods(true);
      await podGridRef.current.fetchPods();
      setRefreshingPods(false);
    }
  };

  // Inside the component, add state variables for wallet and usage data
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [computeUsage, setComputeUsage] = useState({ cpu: {}, gpu: {} });
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  
  // Use useEffect to handle initialSection changes after mount
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
      setActiveSidebarItem(initialSection);
    }
  }, [initialSection]);
  
  // Fetch wallet data effect
  useEffect(() => {
    if (!userId) return;
    
    const fetchWalletData = async () => {
      setLoadingWallet(true);
      try {
        // Get wallet data
        const walletRef = doc(db, 'wallets', userId);
        const walletSnap = await getDoc(walletRef);
        
        if (walletSnap.exists()) {
          setWalletBalance(walletSnap.data().balance || 0);
        } else {
          setWalletBalance(0);
        }
        
        // Get transactions
        const transactionsRef = collection(db, 'transactions');
        const q = query(
          transactionsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const txData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setTransactions(txData);
        
        // Calculate compute usage from container_subscriptions
        await calculateComputeUsage(userId);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        toast.error("Failed to load billing data");
      } finally {
        setLoadingWallet(false);
      }
    };
    
    // Define handlePaymentSuccess here to have access to fetchWalletData
    window.handlePaymentSuccess = () => {
      setShowPaymentModal(false);
      fetchWalletData(); // Refresh wallet data after successful payment
    };
    
    fetchWalletData();
  }, [userId]);
  
  // Calculate compute usage from subscriptions
  const calculateComputeUsage = async (userId) => {
    try {
      const now = new Date();
      const range = getDateRangeFromTimeRange(timeRange);
      
      // Get subscriptions within date range
      const subsRef = collection(db, 'container_subscriptions');
      const q = query(
        subsRef,
        where('user_id', '==', userId),
        where('created_at', '>=', range.start)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Initialize usage data for each day
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const cpuUsage = {};
      const gpuUsage = {};
      
      days.forEach(day => {
        cpuUsage[day] = 0;
        gpuUsage[day] = 0;
      });
      
      // Calculate hours used per day
      querySnapshot.docs.forEach(doc => {
        const sub = doc.data();
        const resourceType = sub.subscription_details?.specs?.compute?.toLowerCase() || '';
        const createdAt = sub.created_at?.toDate() || new Date();
        const expiresAt = sub.expires_at?.toDate() || new Date();
        
        // Skip if terminated early
        if (sub.status === 'terminated') return;
        
        // Calculate hours per day within the range
        let currentDate = new Date(Math.max(createdAt, range.start));
        const endDate = new Date(Math.min(expiresAt, now));
        
        while (currentDate < endDate) {
          const day = days[currentDate.getDay()];
          const hoursInDay = Math.min(24, (endDate - currentDate) / (1000 * 60 * 60));
          
          if (resourceType.includes('gpu')) {
            gpuUsage[day] += hoursInDay;
          } else {
            cpuUsage[day] += hoursInDay;
          }
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(0, 0, 0, 0);
        }
      });
      
      setComputeUsage({ 
        cpu: cpuUsage, 
        gpu: gpuUsage 
      });
    } catch (error) {
      console.error("Error calculating compute usage:", error);
    }
  };
  
  // Helper to get date range from timeRange selection
  const getDateRangeFromTimeRange = (range) => {
    const now = new Date();
    const start = new Date();
    let lastDay; // Declare variable outside case blocks
    
    switch (range) {
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case 'thisMonth':
        start.setDate(1); // First day of current month
        break;
      case 'lastMonth':
        start.setMonth(now.getMonth() - 1);
        start.setDate(1);
        lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate(); // Assign to variable declared outside
        now.setMonth(now.getMonth() - 1);
        now.setDate(lastDay);
        break;
      default: // 7days
        start.setDate(now.getDate() - 7);
        break;
    }
    
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  };
  
  // Estimate monthly cost based on current usage
  const calculateEstimatedMonthlyCost = () => {
    if (!transactions.length) return 0;
    
    // Get debits from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const debits = transactions.filter(tx => 
      tx.type === 'debit' && 
      new Date(tx.createdAt) >= thirtyDaysAgo
    );
    
    if (!debits.length) return 0;
    
    // Calculate total and extrapolate to 30 days
    const totalDebits = debits.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const oldestTxDate = new Date(Math.min(...debits.map(tx => new Date(tx.createdAt).getTime())));
    const daysDiff = Math.max(1, Math.ceil((new Date() - oldestTxDate) / (1000 * 60 * 60 * 24)));
    
    // Extrapolate to 30 days
    return (totalDebits / daysDiff) * 30;
  };
  
  // Count active pods from container_subscriptions
  const countActivePods = () => {
    const activeCpu = transactions.filter(tx => 
      tx.description?.toLowerCase().includes('cpu') && 
      tx.type === 'debit'
    ).length;
    
    const activeGpu = transactions.filter(tx => 
      tx.description?.toLowerCase().includes('gpu') && 
      tx.type === 'debit'
    ).length;
    
    return {
      cpu: activeCpu,
      gpu: activeGpu,
      total: activeCpu + activeGpu
    };
  };

  // Format date for display
  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get last deposit amount
  const getLastDeposit = () => {
    const deposits = transactions.filter(tx => tx.type === 'credit');
    if (deposits.length === 0) return 0;
    return deposits[0].amount || 0;
  };
  
  // ACTUAL BILLING UI SECTION STARTS HERE
  {activeComputeSection === 'usage' && (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium">Usage & Billing Summary</h3>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`text-xs rounded-md border px-2 py-1 ${
              darkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="thisMonth">This month</option>
            <option value="lastMonth">Last month</option>
          </select>
          <button
            className={`px-2 py-1 rounded text-xs font-medium ${
              darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            Export
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className={`
              inline-flex items-center gap-1 px-2 py-1 text-xs font-medium 
              rounded-lg transition-all duration-200
              bg-gradient-to-r from-violet-500 to-purple-500 
              hover:from-violet-600 hover:to-purple-600
              text-white
            `}
          >
            <PlusCircle className="w-3 h-3" />
            Add Credit
          </button>
        </div>
      </div>

      {loadingWallet ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs opacity-70">Current Balance</p>
                  <p className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {formatCurrency(walletBalance)}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <CircleDollarSign className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  +{formatCurrency(getLastDeposit())}
                </span>
                <span className="text-[10px] ml-1 opacity-70">last deposit</span>
              </div>
            </div>

            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs opacity-70">Active Pods</p>
                  <p className="text-xl font-semibold">{countActivePods().total}</p>
                </div>
                <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <Cpu className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
              </div>
              <div className="flex items-center">
                {countActivePods().cpu > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {countActivePods().cpu} CPU
                  </span>
                )}
                {countActivePods().gpu > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded ml-1 bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
                    {countActivePods().gpu} GPU
                  </span>
                )}
              </div>
            </div>

            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs opacity-70">Est. Monthly Cost</p>
                  <p className="text-xl font-semibold">{formatCurrency(calculateEstimatedMonthlyCost())}</p>
                </div>
                <div className={`p-2 rounded-full ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                  <Clock className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Based on current usage</span>
              </div>
            </div>
          </div>

          {/* Usage Chart */}
          <div className={`rounded-lg p-3 mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h4 className="text-xs font-medium mb-3">Compute Usage</h4>
            <div className="h-36 w-full flex items-end justify-between gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                // Use actual usage data from computeUsage state
                const cpuHours = computeUsage.cpu[day] || 0;
                const gpuHours = computeUsage.gpu[day] || 0;
                
                // Calculate percentages for the chart (max 100%)
                const maxHours = 24;
                const cpuHeight = Math.min(100, (cpuHours / maxHours) * 100);
                const gpuHeight = Math.min(100, (gpuHours / maxHours) * 100);
                
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                    <div 
                      className={`w-full rounded-t-sm ${darkMode ? 'bg-blue-500/30' : 'bg-blue-200'}`}
                      style={{ height: `${cpuHeight}%` }}
                      title={`${cpuHours.toFixed(1)} CPU hours`}
                    ></div>
                    <div 
                      className={`w-full rounded-t-sm ${darkMode ? 'bg-violet-500/30' : 'bg-violet-200'}`}
                      style={{ height: `${gpuHeight}%` }}
                      title={`${gpuHours.toFixed(1)} GPU hours`}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] opacity-70">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="flex items-center justify-center mt-2 gap-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-500/70' : 'bg-blue-400'} mr-1`}></div>
                <span className="text-[10px] opacity-70">CPU Hours</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-violet-500/70' : 'bg-violet-400'} mr-1`}></div>
                <span className="text-[10px] opacity-70">GPU Hours</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h4 className="text-xs font-medium mb-3">Recent Transactions</h4>
            <div className={`overflow-hidden rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <th className="text-[10px] font-medium text-left p-2">Date</th>
                    <th className="text-[10px] font-medium text-left p-2">Description</th>
                    <th className="text-[10px] font-medium text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-2 text-center text-xs opacity-70">No transactions found</td>
                    </tr>
                  ) : (
                    transactions.slice(0, 4).map(tx => (
                      <tr key={tx.id}>
                        <td className="p-2 text-[10px] opacity-70">
                          {formatTransactionDate(tx.createdAt)}
                        </td>
                        <td className="p-2 text-[10px]">
                          {tx.description || (tx.type === 'credit' ? 'Deposit' : 'Charge')}
                        </td>
                        <td className={`p-2 text-[10px] text-right ${
                          tx.type === 'credit' 
                            ? darkMode ? 'text-green-400' : 'text-green-600'
                            : darkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {transactions.length > 4 && (
              <div className="flex justify-center mt-3">
                <button className={`text-[10px] ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  View all transactions
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )}

  //
  // 4) The main return, including UI layout
  //
  return (
    <div className="px-8 flex items-center justify-center" style={{ height: '100%' }}>
      {/* Add custom animation styles */}
      <style>
        {`
          @keyframes pulse-subtle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          @keyframes glow-subtle {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.2; }
          }
          .animate-pulse-subtle {
            animation: pulse-subtle 2s ease-in-out infinite;
          }
          .animate-glow-subtle {
            animation: glow-subtle 2s ease-in-out infinite;
          }
        `}
      </style>
      
      {/* Fullscreen backdrop */}
      {isFullscreen && <div className="fixed inset-0 backdrop-blur-sm bg-black/10 z-40"></div>}

      <div
        className={`flex flex-col overflow-hidden rounded-lg ${
          getCurrentColorScheme().bg
        } ${
          darkMode
            ? 'text-white border-opacity-30'
            : 'text-gray-900 border-opacity-30'
        } transition-all duration-500 ease-in-out border-2 ${
          getCurrentColorScheme().border
        } ${
          isFullscreen ? 'fixed z-50 rounded-none border-0' : ''
        }`}
        style={{
          height: isFullscreen
            ? 'calc(100vh - 0.75rem)'
            : isExpanded
            ? 'calc(100vh - 140px)'
            : 'calc(90vh - 140px)',
          width: isFullscreen
            ? 'calc(100% - 0.75rem)'
            : isExpanded
            ? 'calc(100% - 32px)'
            : '90%',
          position: isFullscreen ? 'fixed' : 'absolute',
          top: isFullscreen ? '0.375rem' : '50%',
          left: isFullscreen ? '0.375rem' : '50%',
          right: isFullscreen ? '0.375rem' : 'auto',
          bottom: isFullscreen ? '0.375rem' : 'auto',
          transform: isFullscreen ? 'none' : 'translate(-50%, -50%)',
          margin: isFullscreen ? '0' : '0 auto',
          maxHeight: isFullscreen ? 'calc(100vh - 0.75rem)' : 'calc(100vh - 140px)',
          padding: '0',
          boxShadow: isFullscreen
            ? '0 0 20px rgba(0, 0, 0, 0.1)'
            : isExpanded
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          transitionProperty: 'all',
          transformOrigin: 'center',
          transitionTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
        }}
      >
        {/* Header bar - update with dynamic color schemes */}
        <div
          className={`flex items-center justify-between py-1 border-b-2 ${
            darkMode
              ? `border-${getCurrentColorScheme().accent}-700/50 bg-gradient-to-r from-gray-900 to-${getCurrentColorScheme().accent}-900/30`
              : `border-${getCurrentColorScheme().accent}-200 bg-gradient-to-r from-white to-${getCurrentColorScheme().accent}-50/50`
          } transition-all duration-300 ease-in-out`}
        >
          {/* Title on the far left */}
          <div className="flex items-center ml-4">
            <div className="flex items-center">
              <Brain className={`h-3.5 w-3.5 mr-2 ${darkMode ? `text-${getCurrentColorScheme().accent}-400` : `text-${getCurrentColorScheme().accent}-600`}`} />
              <span className="font-medium text-xs">Polaris Cloud</span>
            </div>
            <div
              className={`ml-2 px-1.5 py-0.5 text-[7px] font-medium rounded-full ${
                darkMode 
                  ? `bg-${getCurrentColorScheme().accent}-500/20 text-${getCurrentColorScheme().accent}-300 border border-${getCurrentColorScheme().accent}-700/30` 
                  : `bg-${getCurrentColorScheme().accent}-100 text-${getCurrentColorScheme().accent}-600 border border-${getCurrentColorScheme().accent}-200`
              }`}
            >
              BETA
            </div>
            
            {/* Resource selector buttons */}
            {/* <div className={`ml-4 flex rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setSelectedResource('standard')}
                className={`px-2 py-0.5 text-xs transition-all ${
                  selectedResource === 'standard'
                    ? darkMode
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-50'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setSelectedResource('premium')}
                className={`px-2 py-0.5 text-xs transition-all ${
                  selectedResource === 'premium'
                    ? darkMode
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-50'
                }`}
              >
                Premium
              </button>
              <button
                onClick={() => setSelectedResource('enterprise')}
                className={`px-2 py-0.5 text-xs transition-all ${
                  selectedResource === 'enterprise'
                    ? darkMode
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-50'
                }`}
              >
                Enterprise
              </button>
            </div> */}
          </div>
          
          {/* Centered tabs */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className={`h-7 flex ${darkMode ? `shadow-lg shadow-${getCurrentColorScheme().accent}-900/20` : `shadow-md shadow-${getCurrentColorScheme().accent}-500/10`}`}>
              <div className="h-full flex">
                <button
                  className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                    ${
                      activeSection === 'compute' 
                        ? darkMode 
                          ? `bg-gradient-to-b from-indigo-900/70 to-indigo-900/80 text-white` 
                          : `bg-gradient-to-b from-indigo-100 to-indigo-100 text-gray-800`
                        : darkMode 
                          ? `bg-gray-800 text-gray-300 hover:text-indigo-400` 
                          : `bg-gray-100 text-gray-600 hover:text-indigo-600`
                    }`}
                  onClick={() => handleTabSwitch('compute')}
                >
                  <div className="flex items-center justify-center w-full">
                    <ServerCog 
                      className={`h-3 w-3 mr-1.5 ${
                        activeSection === 'compute'
                          ? darkMode ? `text-indigo-300` : `text-indigo-500`
                          : darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`} 
                    />
                    <span className="relative z-10">Compute</span>
                  </div>
                  {/* Vertical separator */}
                  <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'compute' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                </button>
                
                <button
                  className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                    ${
                      activeSection === 'nodes' 
                        ? darkMode 
                          ? `bg-gradient-to-b from-emerald-900/70 to-emerald-900/80 text-white` 
                          : `bg-gradient-to-b from-emerald-100 to-emerald-100 text-gray-800`
                        : darkMode 
                          ? `bg-gray-800 text-gray-300 hover:text-emerald-400` 
                          : `bg-gray-100 text-gray-600 hover:text-emerald-600`
                    }`}
                  onClick={() => handleTabSwitch('nodes')}
                >
                  <div className="flex items-center justify-center w-full">
                    <Server
                      className={`h-3 w-3 mr-1.5 ${
                        activeSection === 'nodes'
                          ? darkMode ? `text-emerald-300` : `text-emerald-500`
                          : darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`} 
                    />
                    <span className="relative z-10">Nodes</span>
                  </div>
                  {/* Vertical separator */}
                  <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'nodes' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                </button>

                <button
                  className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                    ${
                      activeSection === 'studio' || activeSection === 'catalogue'
                        ? darkMode 
                          ? `bg-gradient-to-b from-purple-900/70 to-purple-900/80 text-white` 
                          : `bg-gradient-to-b from-purple-100 to-purple-100 text-gray-800`
                        : darkMode 
                          ? `bg-gray-800 text-gray-300 hover:text-purple-400` 
                          : `bg-gray-100 text-gray-600 hover:text-purple-600`
                    }`}
                  onClick={() => handleTabSwitch('catalogue')}
                >
                  <div className="flex items-center justify-center w-full">
                    <Command className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'studio' || activeSection === 'catalogue'
                        ? darkMode ? `text-purple-300` : `text-purple-500`
                        : darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className="relative z-10">AI Studio</span>
                  </div>
                  {/* Vertical separator */}
                  <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${(activeSection === 'studio' || activeSection === 'catalogue') ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                </button>

                <button
                  className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                    ${
                      activeSection === 'agents' 
                        ? darkMode 
                          ? `bg-gradient-to-b from-cyan-900/70 to-cyan-900/80 text-white` 
                          : `bg-gradient-to-b from-cyan-100 to-cyan-100 text-gray-800`
                        : darkMode 
                          ? `bg-gray-800 text-gray-300 hover:text-cyan-400` 
                          : `bg-gray-100 text-gray-600 hover:text-cyan-600`
                    }`}
                  onClick={() => handleTabSwitch('agents')}
                >
                  <div className="flex items-center justify-center w-full">
                    <User
                      className={`h-3 w-3 mr-1.5 ${
                        activeSection === 'agents'
                          ? darkMode ? `text-cyan-300` : `text-cyan-500`
                          : darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}
                    />
                    <span className="relative z-10">Agents</span>
                  </div>
                  {/* Vertical separator */}
                  <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'agents' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                </button>

                <button
                  className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                    ${
                      activeSection === 'settings' 
                        ? darkMode 
                          ? `bg-gradient-to-b from-rose-900/70 to-rose-900/80 text-white` 
                          : `bg-gradient-to-b from-rose-100 to-rose-100 text-gray-800`
                        : darkMode 
                          ? `bg-gray-800 text-gray-300 hover:text-rose-400` 
                          : `bg-gray-100 text-gray-600 hover:text-rose-600`
                    }`}
                  onClick={() => handleTabSwitch('settings')}
                >
                  <div className="flex items-center justify-center w-full">
                    <Settings
                      className={`h-3 w-3 mr-1.5 ${
                        activeSection === 'settings'
                          ? darkMode ? `text-rose-300` : `text-rose-500`
                          : darkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}
                    />
                    <span className="relative z-10">Settings</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Controls on the right */}
          <div className="flex items-center space-x-2 pr-4">
            <button
              className={`p-1 rounded-full transition-colors duration-200 ${
                darkMode
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
            </button>
            <button
              className={`p-1 rounded-full transition-colors duration-200 ${
                darkMode
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              onClick={toggleExpand}
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Layout: Left nav + (optional middle) + main content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left panel: navigation */}
          <div
            className={`w-44 flex-shrink-0 border-r-2 overflow-y-auto flex flex-col ${
              darkMode 
              ? `bg-gray-900/80 border-${getCurrentColorScheme().accent}-800/30` 
              : `bg-white/90 border-${getCurrentColorScheme().accent}-200/50`
            } transition-all duration-300 ease-in-out`}
          >
            <div className="p-1.5 space-y-1 flex-grow">
              {(activeSection === 'compute' 
                ? computeNavigationSections 
                : activeSection === 'nodes'
                  ? nodesNavigationSections
                  : navigationSections).map((section) => (
                <button
                  key={section.id}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors duration-200
                    ${
                      (
                        (activeSection === 'compute' 
                          ? activeComputeSection 
                          : activeSection === 'nodes'
                            ? activeNodesSection
                            : activeSidebarItem) === section.id
                      ) && !section.comingSoon
                        ? darkMode
                          ? `bg-gradient-to-r from-${getCurrentColorScheme().accent}-700/20 to-${getCurrentColorScheme().accent}-600/20 text-${getCurrentColorScheme().accent}-400 border-l-2 border-${getCurrentColorScheme().accent}-500`
                          : `bg-gradient-to-r from-${getCurrentColorScheme().accent}-100 to-${getCurrentColorScheme().accent}-50 text-${getCurrentColorScheme().accent}-600 border-l-2 border-${getCurrentColorScheme().accent}-500`
                        : darkMode
                        ? 'text-gray-400 hover:bg-gray-800/50'
                        : 'text-gray-600 hover:bg-gray-100/80'
                    }`}
                  onClick={() => handleSectionClick(section)}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className={`h-4 w-4 ${
                      (
                        (activeSection === 'compute' 
                          ? activeComputeSection 
                          : activeSection === 'nodes'
                            ? activeNodesSection
                            : activeSidebarItem) === section.id
                      ) && !section.comingSoon
                        ? darkMode ? `text-${getCurrentColorScheme().accent}-400` : `text-${getCurrentColorScheme().accent}-500`
                        : darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`} />
                    <span>{section.label}</span>
                  </div>
                  {section.comingSoon && (
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded-full ${
                        darkMode ? `bg-${getCurrentColorScheme().accent}-500/20 text-${getCurrentColorScheme().accent}-300` : `bg-${getCurrentColorScheme().accent}-100 text-${getCurrentColorScheme().accent}-600`
                      }`}
                    >
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
            {/* "Premium Features" banner at bottom */}
            <div
              className={`mt-auto p-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setComingSoonFeature("Premium Features");
                  setComingSoonDescription("Access advanced features like custom fine-tuning, model optimization, and priority compute resources.");
                  setShowComingSoonModal(true);
                }}
              >
                <div className={`p-1 rounded-md ${
                  darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Premium Features
                </span>
              </div>
            </div>
          </div>

          {/* Conditionally render the middle column for "catalogue" or "deployments" (not used in playground, etc.) */}
          {((activeSection === 'catalogue' && activeSidebarItem !== 'playground' && activeSidebarItem !== 'readbuddy') || activeSidebarItem === 'deployments') && (
            <div
              className={`w-72 flex-shrink-0 border-r-2 flex flex-col ${
                darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}
            >
              {activeSection === 'catalogue' && (
                <>
                  {/* Models list header */}
                  <div
                    className={`sticky top-0 ${
                      darkMode
                        ? 'border-b-2 border-gray-700 bg-gray-800/95 z-10'
                        : 'border-b-2 border-gray-300 bg-gray-50/95 z-10'
                    }`}
                  >
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
                          {modelTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <button className="ml-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Search bar */}
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
                          className={`p-2 py-1.5 cursor-pointer transition-all ${
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
                          <div className="flex items-center space-x-2">
                            {/* Provider-specific icon */}
                            <div className="flex-shrink-0 mr-1">
                              {model.brand === 'DeepSeek' ? (
                                <Brain size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                              ) : model.brand === 'OpenAI' ? (
                                <Sparkles size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                              ) : model.brand === 'Llama' ? (
                                <Database size={20} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                              ) : model.brand === 'Phi' ? (
                                <Hexagon size={20} className={darkMode ? 'text-teal-400' : 'text-teal-600'} />
                              ) : model.brand === 'Qwen' ? (
                                <ServerCog size={20} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
                              ) : model.brand === 'Mistral' ? (
                                <Box size={20} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                              ) : model.brand === 'Gemma' ? (
                                <Server size={20} className={darkMode ? 'text-rose-400' : 'text-rose-600'} />
                              ) : (
                                <Circle size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                              )}
                            </div>
                            
                            <div className="flex-grow overflow-hidden">
                              <h3 className="text-sm font-medium truncate">{model.name}</h3>
                              
                              <div className="flex items-center space-x-3 mt-0.5 text-[10px]">
                                {/* Parameters badge */}
                                <span className={`flex items-center px-1.5 py-0.5 rounded-full ${
                                  darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                  {model.parameters}
                                </span>
                                
                                {/* Quantization badge */}
                                <span className={`flex items-center px-1.5 py-0.5 rounded-full ${
                                  darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                  </svg>
                                  {model.type}
                                </span>
                                
                                {/* Size badge */}
                                <span className={`flex items-center px-1.8 py-0.5 rounded-full ${
                                  darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                                }`}>
                                  <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                  </svg>
                                  {model.size}
                                </span>
                              </div>
                            </div>
                            
                            {/* Downloads indicator */}
                            <div className={`flex-shrink-0 flex items-center text-[9px] px-1.5 py-0.5 rounded-full opacity-90 ml-1
                              ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              <svg className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {model.downloads.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'deployments' && (
                <>
                  {/* Deployments list header */}
                  <div
                    className={`sticky top-0 ${
                      darkMode
                        ? 'border-b-2 border-gray-700 bg-gray-800/95 z-10'
                        : 'border-b-2 border-gray-300 bg-gray-50/95 z-10'
                    }`}
                  >
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

                    {/* Search bar */}
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

                  {/* Deployments list */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-blue-100">
                      {deployedModels.map((dm) => (
                        <div
                          key={dm.id}
                          className={`p-3 py-1 cursor-pointer transition-all ${
                            selectedDeployedModel?.id === dm.id
                              ? darkMode
                                ? 'bg-blue-900/20 border-l-4 border-blue-500'
                                : 'bg-blue-50 border-l-4 border-blue-500'
                              : darkMode
                              ? 'hover:bg-gray-700/50 border-l-4 border-transparent'
                              : 'hover:bg-gray-100 border-l-4 border-transparent'
                          }`}
                          onClick={() => setSelectedDeployedModel(dm)}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="pt-0.5">
                              <span
                                className={`inline-block h-4 w-4 rounded-full ${
                                  dm.status === 'running'
                                    ? darkMode
                                      ? 'bg-green-800'
                                      : 'bg-green-100'
                                    : darkMode
                                    ? 'bg-yellow-800'
                                    : 'bg-yellow-100'
                                }`}
                              >
                                <span className="flex h-full w-full items-center justify-center">
                                  <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      dm.status === 'running'
                                        ? darkMode
                                          ? 'bg-green-400'
                                          : 'bg-green-500'
                                        : darkMode
                                        ? 'bg-yellow-400'
                                        : 'bg-yellow-500'
                                    }`}
                                  ></span>
                                </span>
                              </span>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">{dm.name}</h3>
                              <p
                                className={`text-xs mt-0.5 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                {dm.description}
                              </p>
                              <div className="flex items-center mt-1">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    dm.status === 'running'
                                      ? darkMode
                                        ? 'bg-green-900/30 text-green-400'
                                        : 'bg-green-100 text-green-600'
                                      : darkMode
                                      ? 'bg-yellow-900/30 text-yellow-400'
                                      : 'bg-yellow-100 text-yellow-600'
                                  }`}
                                >
                                  {dm.status === 'running' ? 'Running' : 'Paused'}
                                </span>
                                <span className="text-[10px] text-gray-500 ml-2">
                                  {new Date(dm.deployedAt).toLocaleDateString()}
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
          )}

          {/* Right/main content area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Catalogue section content - should not show when in playground mode or readbuddy mode */}
            {activeSection === 'catalogue' && activeSidebarItem !== 'playground' && activeSidebarItem !== 'readbuddy' && selectedModel && (
              <>
                {/* Model header */}
                <div
                  className={`sticky top-0 p-3 border-b-2 z-10 ${
                    darkMode
                      ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800'
                      : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <h2 className="text-lg font-medium">{selectedModel.name}</h2>
                      <a
                        href={
                          selectedModel.huggingface_id
                            ? getHuggingFaceRepoUrl(selectedModel.huggingface_id)
                            : `https://huggingface.co/models?search=${encodeURIComponent(
                                selectedModel.name
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-2 p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-200 text-blue-600'
                        }`}
                        title={
                          selectedModel.huggingface_id
                            ? `View ${selectedModel.name} on Hugging Face`
                            : `Search for ${selectedModel.name} on Hugging Face`
                        }
                      >
                        <Link className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center">
                      <button
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Params:</div>
                      <div>{selectedModel.parameters}</div>
                    </div>

                    <div>
                      <div className="text-gray-500 mb-1">Stats:</div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{selectedModel.downloads}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 mb-1">Last updated:</div>
                      <div>{selectedModel.lastUpdated}</div>
                    </div>
                  </div>
                </div>

                {/* Model details scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    {/* Model Specs */}
                    <div
                      className={`mb-4 p-3 rounded-lg ${
                        darkMode
                          ? 'bg-gray-800/50 border border-gray-700'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <h3 className="text-sm font-medium mb-3">Model Specifications</h3>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Architecture</div>
                          <div className="flex items-center">
                            <span className="font-mono text-xs mr-2">Q4_K_M</span>
                            <span className="text-xs">{selectedModel.name}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Parameters</div>
                          <div className="text-xs">{selectedModel.parameters}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Context Length</div>
                          <div className="text-xs">128k tokens</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                          <div className="text-xs">{selectedModel.lastUpdated}</div>
                        </div>
                      </div>

                      {/* Compute Requirements */}
                      <div className="border-t border-dashed pt-3 mt-2 mb-1">
                        <h4 className="text-xs font-medium mb-2">Minimal Deployment Requirements</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-blue-500/10 rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">Memory</div>
                            <div className="text-xs font-medium">12 GB RAM</div>
                          </div>
                          <div className="bg-green-500/10 rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">GPU</div>
                            <div className="text-xs font-medium">8 GB VRAM</div>
                          </div>
                          <div className="bg-purple-500/10 rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">Storage</div>
                            <div className="text-xs font-medium">{selectedModel.size}</div>
                          </div>
                        </div>

                        {/* Deploy button */}
                        <div className="mt-3 flex justify-end">
                          <button
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                              darkMode
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20'
                                : 'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20'
                            } text-white transition-all transform hover:scale-105`}
                            onClick={() => setShowDeployPanel(true)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            <span>Deploy Model ({selectedModel.size})</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* About This Model (streamlined readme) */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">About This Model</h3>
                        <span
                          className={`flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500`}
                        >
                          {selectedModel.brand} Model
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-lg text-xs ${
                          darkMode
                            ? 'bg-gray-800/60 border border-gray-700'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-3">
                          <div className="font-medium">{selectedModel.name}</div>
                          <span className="text-gray-500">by</span>
                          <a
                            href="#"
                            className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                          >
                            {selectedModel.brand}
                          </a>
                        </div>
                        <div className="space-y-2 mb-3">
                          <p>{selectedModel.description}</p>
                          <p>
                            <span className="font-medium">{selectedModel.parameters}</span> parameter model with{' '}
                            <span className="font-medium">{selectedModel.downloads}</span> downloads.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-dashed pt-2 mt-2">
                          <div className="flex items-center">
                            <span className="text-gray-500 text-xs mr-1">Quantization:</span>
                            <span
                              className={`px-1 rounded font-mono text-[10px] ${
                                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {selectedModel.type}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 text-xs mr-1">Last Updated:</span>
                            <span className="text-xs">{selectedModel.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Deployments section - no selected model */}
            {activeSection === 'deployments' && !selectedDeployedModel && (
              <>
                <div
                  className={`sticky top-0 p-3 border-b-2 z-10 ${
                    darkMode
                      ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800'
                      : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-medium">Your Deployments</h2>
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-3 py-1.5 rounded text-xs font-medium ${
                          darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <span>New Deployment</span>
                      </button>
                      <button
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Manage your deployed models and monitor their performance
                    </p>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <span className="mr-1">Total:</span>
                      <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                        {deployedModels.length} {deployedModels.length === 1 ? 'deployment' : 'deployments'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <div className="space-y-3">
                      {deployedModels.map((dm) => (
                        <div
                          key={dm.id}
                          className={`p-3 rounded-lg border-2 ${
                            darkMode
                              ? 'bg-gray-900 border-gray-700 hover:border-blue-500'
                              : 'bg-white border-gray-200 hover:border-blue-500'
                          } cursor-pointer transition-all`}
                          onClick={() => setSelectedDeployedModel(dm)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-start space-x-2">
                              <div
                                className={`w-2.5 h-2.5 mt-1 rounded-full ${
                                  dm.status === 'running'
                                    ? 'bg-green-500'
                                    : dm.status === 'stopped'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                              />
                              <div>
                                <h3 className="text-sm font-medium">{dm.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{dm.modelName}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  dm.status === 'running'
                                    ? darkMode
                                      ? 'bg-green-500/20 text-green-300'
                                      : 'bg-green-100 text-green-600'
                                    : darkMode
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : 'bg-yellow-100 text-yellow-600'
                                }`}
                              >
                                {dm.status.charAt(0).toUpperCase() + dm.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mb-2">
                            <div>
                              <div className="text-xs text-gray-500">Requests</div>
                              <div className="text-xs font-medium">
                                {dm.stats.totalRequests.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Region</div>
                              <div className="text-xs font-medium">{dm.region}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Avg Response</div>
                              <div className="text-xs font-medium">{dm.stats.avgResponse}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Cost</div>
                              <div className="text-xs font-medium">${dm.stats.cost.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-dashed">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 text-gray-500 mr-1" />
                              <span className="text-[10px] text-gray-500">
                                {new Date(dm.deployedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  darkMode
                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                <span>Details</span>
                              </button>
                              <button
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  dm.status === 'running'
                                    ? darkMode
                                      ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : darkMode
                                    ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                              >
                                <span>{dm.status === 'running' ? 'Stop' : 'Start'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Deployments section - a specific model is selected */}
            {activeSection === 'deployments' && selectedDeployedModel && (
              <>
                <div
                  className={`sticky top-0 p-3 border-b-2 z-10 ${
                    darkMode
                      ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800'
                      : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <button
                        className={`p-1 rounded-full mr-2 ${
                          darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        onClick={() => setSelectedDeployedModel(null)}
                        aria-label="Back to deployments list"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <h2 className="text-lg font-medium">{selectedDeployedModel.name}</h2>
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          selectedDeployedModel.status === 'running'
                            ? darkMode
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-green-100 text-green-600'
                            : selectedDeployedModel.status === 'stopped'
                            ? darkMode
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-yellow-100 text-yellow-600'
                            : darkMode
                            ? 'bg-gray-500/20 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedDeployedModel.status.charAt(0).toUpperCase() +
                          selectedDeployedModel.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedDeployedModel.status === 'running'
                            ? darkMode
                              ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                            : darkMode
                            ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        <span>{selectedDeployedModel.status === 'running' ? 'Stop' : 'Start'}</span>
                      </button>
                      <button
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Model:</div>
                      <div className="text-md">{selectedDeployedModel.modelName}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Instance:</div>
                      <div className="text-md">{selectedDeployedModel.instanceName}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Deployed:</div>
                      <div className="text-md">
                        {new Date(selectedDeployedModel.deployedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab navigation for selected deployment */}
                <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'api', label: 'API', icon: Code },
                    { id: 'console', label: 'Test Console', icon: Terminal },
                    { id: 'metrics', label: 'Metrics', icon: BarChartHorizontal }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDeploymentTab(tab.id)}
                      className={`relative flex-1 flex items-center justify-center py-1.5 px-2 text-[10px] font-medium transition-all
                        ${
                          activeDeploymentTab === tab.id
                            ? darkMode
                              ? 'text-blue-400 border-b-2 border-blue-500'
                              : 'text-blue-600 border-b-2 border-blue-500'
                            : darkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/60'
                        }
                      `}
                    >
                      <tab.icon className="h-3 w-3 mr-1" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                  {activeDeploymentTab === 'overview' && (
                    <div className="p-4">
                      {/* Stats Summary */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div
                          className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}
                        >
                          <div className="text-xs text-gray-500 mb-1">Total Requests</div>
                          <div className="text-lg font-semibold">
                            {selectedDeployedModel.stats.totalRequests.toLocaleString()}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}
                        >
                          <div className="text-xs text-gray-500 mb-1">Uptime</div>
                          <div className="text-lg font-semibold">{selectedDeployedModel.stats.uptime}</div>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}
                        >
                          <div className="text-xs text-gray-500 mb-1">Avg Response</div>
                          <div className="text-lg font-semibold">
                            {selectedDeployedModel.stats.avgResponse}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}
                        >
                          <div className="text-xs text-gray-500 mb-1">Cost</div>
                          <div className="text-lg font-semibold">
                            ${selectedDeployedModel.stats.cost.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Configuration */}
                      <div
                        className={`mb-4 p-3 rounded-lg ${
                          darkMode
                            ? 'bg-gray-800/50 border border-gray-700'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <h3 className="text-sm font-medium mb-3">Deployment Configuration</h3>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Endpoint</div>
                            <div className="flex items-center">
                              <code
                                className={`text-xs px-2 py-1 rounded ${
                                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                                } flex-1`}
                              >
                                https://api.polaris.ai/v1/deployments/{selectedDeployedModel.id}
                              </code>
                              <button
                                className={`p-1 ml-2 rounded ${
                                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'
                                }`}
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                                    strokeWidth="2"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Region</div>
                            <div className="text-xs">{selectedDeployedModel.region}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Auto Scaling</div>
                            <div className="text-xs">
                              {selectedDeployedModel.scaling ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Status</div>
                            <div
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
                                selectedDeployedModel.status === 'running'
                                  ? darkMode
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-green-100 text-green-600'
                                  : darkMode
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-yellow-100 text-yellow-600'
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                  selectedDeployedModel.status === 'running'
                                    ? 'bg-green-500'
                                    : 'bg-yellow-500'
                                }`}
                              ></div>
                              {selectedDeployedModel.status.charAt(0).toUpperCase() +
                                selectedDeployedModel.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Environment variables */}
                      <div
                        className={`mb-4 p-3 rounded-lg ${
                          darkMode
                            ? 'bg-gray-800/50 border border-gray-700'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <h3 className="text-sm font-medium mb-3">Environment Variables</h3>
                        <div
                          className={`rounded-lg overflow-hidden border ${
                            darkMode ? 'border-gray-700' : 'border-gray-200'
                          }`}
                        >
                          <table className="w-full text-xs">
                            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                              <tr>
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {selectedDeployedModel.envVars.map((env, idx) => (
                                <tr
                                  key={idx}
                                  className={darkMode ? 'bg-gray-900' : 'bg-white'}
                                >
                                  <td className="px-3 py-2 font-mono">{env.name}</td>
                                  <td className="px-3 py-2 font-mono">
                                    {env.secret ? '**************' : env.value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDeploymentTab === 'metrics' && (
                    <MetricsPanel darkMode={darkMode} selectedDeployedModel={selectedDeployedModel} />
                  )}

                  {activeDeploymentTab === 'api' && (
                    <APIReference
                      darkMode={darkMode}
                      selectedDeployedModel={selectedDeployedModel}
                      chatLang={chatLang}
                      setChatLang={setChatLang}
                      completionLang={completionLang}
                      setCompletionLang={setCompletionLang}
                      embeddingLang={embeddingLang}
                      setEmbeddingLang={setEmbeddingLang}
                    />
                  )}

                  {activeDeploymentTab === 'console' && (
                    <ModelPlayground
                      darkMode={darkMode}
                      selectedDeployedModel={selectedDeployedModel}
                      activeConsoleType={activeConsoleType}
                      setActiveConsoleType={setActiveConsoleType}
                    />
                  )}
                </div>
              </>
            )}

            {/* Playground as a main section */}
            {activeSidebarItem === 'playground' && (
              <div className="flex-1 overflow-hidden">
                {/* Remove all catalog-related elements and show only ModelPlayground */}
                <ModelPlayground
                  darkMode={darkMode}
                  selectedDeployedModel={
                    selectedDeployedModel || (deployedModels.length > 0 ? deployedModels[0] : null)
                  }
                  activeConsoleType={activeConsoleType}
                  setActiveConsoleType={setActiveConsoleType}
                />
              </div>
            )}

            {/* API as a main section */}
            {activeSection === 'api' && (
              <div className="flex-1 overflow-hidden">
                <APIReference
                  darkMode={darkMode}
                  selectedDeployedModel={
                    selectedDeployedModel || (deployedModels.length > 0 ? deployedModels[0] : null)
                  }
                  chatLang={chatLang}
                  setChatLang={setChatLang}
                  completionLang={completionLang}
                  setCompletionLang={setCompletionLang}
                  embeddingLang={embeddingLang}
                  setEmbeddingLang={setEmbeddingLang}
                />
              </div>
            )}

            {/* Metrics as a main section */}
            {activeSection === 'metrics' && (
              <div className="flex-1 overflow-hidden">
                <MetricsPanel
                  darkMode={darkMode}
                  selectedDeployedModel={
                    selectedDeployedModel || (deployedModels.length > 0 ? deployedModels[0] : null)
                  }
                />
              </div>
            )}
            
            {/* Compute section */}
            {activeSection === 'compute' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Compute header */}
                <div
                  className={`sticky top-0 p-3 border-b-2 z-10 ${
                    darkMode
                      ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800'
                      : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-medium capitalize">{activeComputeSection}</h2>
                    <div className="flex items-center gap-2">
                      {activeComputeSection === 'instances' && (
                        <>
                          <button
                            onClick={handleRefreshPods}
                            className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center
                              ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                            title="Refresh pods"
                          >
                            <RefreshCw className={`w-4 h-4 ${refreshingPods ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => setActiveComputeSection('hardware')}
                            className={`px-3 py-1.5 rounded text-xs font-medium ${
                              darkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            <span>Launch Instance</span>
                          </button>
                        </>
                      )}
                      {activeComputeSection === 'hardware' && (
                        <>
                          {/* Resource Type Filters */}
                          <div className={`flex rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                              onClick={() => setTypeFilter('all')}
                              className={`px-3 py-1.5 text-sm transition-all ${
                                typeFilter === 'all'
                                  ? darkMode
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                  : darkMode
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              All Resources
                            </button>
                            <button
                              onClick={() => setTypeFilter('gpu')}
                              className={`px-3 py-1.5 text-sm transition-all ${
                                typeFilter === 'gpu'
                                  ? darkMode
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                  : darkMode
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              GPU Only
                            </button>
                            <button
                              onClick={() => setTypeFilter('cpu')}
                              className={`px-3 py-1.5 text-sm transition-all ${
                                typeFilter === 'cpu'
                                  ? darkMode
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                  : darkMode
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              CPU Only
                            </button>
                          </div>

                          {/* Verification Status Filters */}
                          <div className={`flex rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                              onClick={() => setVerificationFilter('all')}
                              className={`px-3 py-1.5 text-sm transition-all ${
                                verificationFilter === 'all'
                                  ? darkMode
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                  : darkMode
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              All Status
                            </button>
                            <button
                              onClick={() => setVerificationFilter('verified')}
                              className={`px-3 py-1.5 text-sm transition-all ${
                                verificationFilter === 'verified'
                                  ? darkMode
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                  : darkMode
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              Verified
                            </button>
                            <button
                              onClick={() => setVerificationFilter('unverified')}
                              className={`px-3 py-1.5 text-sm transition-all ${
                                verificationFilter === 'unverified'
                                  ? darkMode
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-50 text-blue-600'
                                  : darkMode
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              Unverified
                            </button>
                          </div>
                        </>
                      )}
                      <button
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activeComputeSection === 'instances' && 'Manage and monitor your compute pods.'}
                    {activeComputeSection === 'hardware' && 'Browse available hardware options for your workloads.'}
                    {activeComputeSection === 'usage' && 'Monitor resource usage and manage billing details.'}
                    {activeComputeSection === 'networking' && 'Configure networking options for your pods.'}
                    {activeComputeSection === 'settings' && 'Configure compute settings and preferences.'}
                  </p>
                </div>

                {/* Compute content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    {activeComputeSection === 'instances' && (
                      <div className="p-4">
                        {userId ? (
                          <PodGrid 
                            ref={podGridRef}
                            userId={userId} 
                            darkMode={darkMode} 
                            onLaunchNewPod={() => setActiveComputeSection('hardware')}
                            refreshingExternal={refreshingPods}
                          />
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-gray-500">Please sign in to view your compute pods.</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeComputeSection === 'hardware' && (
                      <div className="p-4">
                        {/* Filter buttons container */}
                        <ClusterDeployment 
                          darkMode={darkMode}
                          onNavChange={(section) => {
                            if (section === 'deploy') {
                              setShowDeploymentModal(true);
                            }
                          }}
                          typeFilter={typeFilter}
                          verificationFilter={verificationFilter}
                          resources={filteredHardwareResources}
                        />
                      </div>
                    )}
                    
                    {activeComputeSection === 'usage' && (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-medium">Usage & Billing Summary</h3>
                          <div className="flex items-center gap-2">
                            <select
                              value={timeRange}
                              onChange={(e) => setTimeRange(e.target.value)}
                              className={`text-xs rounded-md border px-2 py-1 ${
                                darkMode
                                ? 'bg-gray-800 border-gray-700 text-gray-200'
                                : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            >
                              <option value="7days">Last 7 days</option>
                              <option value="30days">Last 30 days</option>
                              <option value="thisMonth">This month</option>
                              <option value="lastMonth">Last month</option>
                            </select>
                            <button
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                darkMode
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                              }`}
                            >
                              Export
                            </button>
                            <button
                              onClick={() => setShowPaymentModal(true)}
                              className={`
                                inline-flex items-center gap-1 px-2 py-1 text-xs font-medium 
                                rounded-lg transition-all duration-200
                                bg-gradient-to-r from-violet-500 to-purple-500 
                                hover:from-violet-600 hover:to-purple-600
                                text-white
                              `}
                            >
                              <PlusCircle className="w-3 h-3" />
                              Add Credit
                            </button>
                          </div>
                        </div>

                        {loadingWallet ? (
                          <div className="flex justify-center items-center h-64">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                          </div>
                        ) : (
                          <>
                            {/* Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-xs opacity-70">Current Balance</p>
                                    <p className={`text-xl font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                      {formatCurrency(walletBalance)}
                                    </p>
                                  </div>
                                  <div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                    <CircleDollarSign className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    +{formatCurrency(getLastDeposit())}
                                  </span>
                                  <span className="text-[10px] ml-1 opacity-70">last deposit</span>
                                </div>
                              </div>

                              <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-xs opacity-70">Active Pods</p>
                                    <p className="text-xl font-semibold">{countActivePods().total}</p>
                                  </div>
                                  <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                    <Cpu className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {countActivePods().cpu > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                      {countActivePods().cpu} CPU
                                    </span>
                                  )}
                                  {countActivePods().gpu > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded ml-1 bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400">
                                      {countActivePods().gpu} GPU
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-xs opacity-70">Est. Monthly Cost</p>
                                    <p className="text-xl font-semibold">{formatCurrency(calculateEstimatedMonthlyCost())}</p>
                                  </div>
                                  <div className={`p-2 rounded-full ${darkMode ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                                    <Clock className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Based on current usage</span>
                                </div>
                              </div>
                            </div>

                            {/* Usage Chart */}
                            <div className={`rounded-lg p-3 mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <h4 className="text-xs font-medium mb-3">Compute Usage</h4>
                              <div className="h-36 w-full flex items-end justify-between gap-1 mb-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                  // Use actual usage data from computeUsage state
                                  const cpuHours = computeUsage.cpu[day] || 0;
                                  const gpuHours = computeUsage.gpu[day] || 0;
                                  
                                  // Calculate percentages for the chart (max 100%)
                                  const maxHours = 24;
                                  const cpuHeight = Math.min(100, (cpuHours / maxHours) * 100);
                                  const gpuHeight = Math.min(100, (gpuHours / maxHours) * 100);
                                  
                                  return (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
                                      <div 
                                        className={`w-full rounded-t-sm ${darkMode ? 'bg-blue-500/30' : 'bg-blue-200'}`}
                                        style={{ height: `${cpuHeight}%` }}
                                        title={`${cpuHours.toFixed(1)} CPU hours`}
                                      ></div>
                                      <div 
                                        className={`w-full rounded-t-sm ${darkMode ? 'bg-violet-500/30' : 'bg-violet-200'}`}
                                        style={{ height: `${gpuHeight}%` }}
                                        title={`${gpuHours.toFixed(1)} GPU hours`}
                                      ></div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between text-[10px] opacity-70">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                  <div key={day}>{day}</div>
                                ))}
                              </div>
                              <div className="flex items-center justify-center mt-2 gap-4">
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-500/70' : 'bg-blue-400'} mr-1`}></div>
                                  <span className="text-[10px] opacity-70">CPU Hours</span>
                                </div>
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-violet-500/70' : 'bg-violet-400'} mr-1`}></div>
                                  <span className="text-[10px] opacity-70">GPU Hours</span>
                                </div>
                              </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <h4 className="text-xs font-medium mb-3">Recent Transactions</h4>
                              <div className={`overflow-hidden rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                                <table className="w-full">
                                  <thead>
                                    <tr className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                      <th className="text-[10px] font-medium text-left p-2">Date</th>
                                      <th className="text-[10px] font-medium text-left p-2">Description</th>
                                      <th className="text-[10px] font-medium text-right p-2">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactions.length === 0 ? (
                                      <tr>
                                        <td colSpan="3" className="p-2 text-center text-xs opacity-70">No transactions found</td>
                                      </tr>
                                    ) : (
                                      transactions.slice(0, 4).map(tx => (
                                        <tr key={tx.id}>
                                          <td className="p-2 text-[10px] opacity-70">
                                            {formatTransactionDate(tx.createdAt)}
                                          </td>
                                          <td className="p-2 text-[10px]">
                                            {tx.description || (tx.type === 'credit' ? 'Deposit' : 'Charge')}
                                          </td>
                                          <td className={`p-2 text-[10px] text-right ${
                                            tx.type === 'credit' 
                                              ? darkMode ? 'text-green-400' : 'text-green-600'
                                              : darkMode ? 'text-red-400' : 'text-red-600'
                                          }`}>
                                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount || 0)}
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              {transactions.length > 4 && (
                                <div className="flex justify-center mt-3">
                                  <button className={`text-[10px] ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                                    View all transactions
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content for Nodes and Settings sections */}
            {(activeSection === 'nodes' || activeSection === 'settings' || activeSection === 'agents') && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div
                  className={`sticky top-0 p-3 border-b-2 z-10 ${
                    darkMode
                      ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800'
                      : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className={`font-semibold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activeSection === 'nodes' ? 'Nodes' : activeSection === 'agents' ? 'Agents' : 'Settings'}
                      </h2>
                      <button
                        className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md absolute right-3 top-3 ${
                          darkMode
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                        onClick={() => {
                          if (activeSection === 'nodes') {
                            window.open('https://github.com/bigideaafrica/polaris_go', '_blank');
                          } else {
                            // Original create pod functionality
                          }
                        }}
                      >
                        {activeSection === 'nodes' && <FaGithub className="w-3 h-3 mr-1" />}
                        <span>{activeSection === 'nodes' ? 'Register Node' : activeSection === 'agents' ? 'Create Agent' : 'Create Setting'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activeSection === 'nodes' 
                      ? 'Monitor registered nodes around the globe.' 
                      : activeSection === 'agents'
                        ? 'Create and manage automated AI agents.'
                        : 'Configure application settings and preferences.'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeSection === 'nodes' ? (
                    <NodesDashboard 
                      darkMode={darkMode} 
                      filterType={
                        activeNodesSection === 'verified' 
                          ? 'Verified' 
                          : activeNodesSection === 'notverified' 
                            ? 'Not Verified' 
                            : 'Show All'
                      } 
                    />
                  ) : (
                    <div className="p-4 flex items-center justify-center">
                      <div className="text-center p-6">
                        <ServerCog className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                          The {activeSection} section is currently under development. Check back soon for updates!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ReadBuddy section */}
            {activeSidebarItem === 'readbuddy' && (
              <ModelReadbuddy 
                darkMode={darkMode} 
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Replace the deployment panel with the ModelDeployPanel component */}
      <ModelDeployPanel
        showDeployPanel={showDeployPanel}
        setShowDeployPanel={setShowDeployPanel}
        selectedModel={selectedModel}
        darkMode={darkMode}
        instancesData={instancesData}
        userPods={userPods}
        selectedInstance={selectedInstance}
        setSelectedInstance={setSelectedInstance}
        onDeploy={({model, instance}) => handleDeployment(model.name, instance.name)}
      />
      
      {/* Deployment Modal */}
      {showDeploymentModal && (
        <DeploymentModal
          isOpen={showDeploymentModal}
          onClose={() => setShowDeploymentModal(false)}
          selectedResource={selectedResource}
          darkMode={darkMode}
          onDeploy={handleDeployResource}
          isDeploying={isDeploying}
          selectedKey={selectedSSHKey}
          onSelectKey={setSelectedSSHKey}
          computeDetails={{
            ip: selectedResource?.ip || "192.168.1.1",
            sshCommand: `ssh root@${selectedResource?.ip || "192.168.1.1"} -p ${selectedResource?.ports?.ssh || 22}`,
            ports: {
              ssh: selectedResource?.ports?.ssh || 22
            },
            duration: "24 hours"
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentScreen
          darkMode={darkMode}
          currentBalance={walletBalance}
          user={userId}
          onSuccess={window.handlePaymentSuccess}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
      
      {/* Add ComingSoonModal at the end of the component */}
      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        feature={comingSoonFeature}
        description={comingSoonDescription}
        darkMode={darkMode}
      />
    </div>
  );
};

AIStudio.propTypes = {
  darkMode: PropTypes.bool,
  modelsData: PropTypes.array,
  initialSection: PropTypes.string
};

export default AIStudio;
