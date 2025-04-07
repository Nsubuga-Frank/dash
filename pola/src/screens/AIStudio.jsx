import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import {
  Book,
  Bot,
  Box,
  Brain,
  CircleDollarSign,
  Clock,
  Code,
  Command,
  Copy,
  Cpu,
  Database,
  Folder,
  Globe,
  Hammer,
  HardDrive,
  Hexagon,
  Link,
  Maximize2,
  Minimize2,
  Play,
  PlayCircle,
  PlusCircle,
  RefreshCw,
  Rocket,
  Server,
  ServerCog,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';
import APIReference from '../components/APIReference';
import DeploymentDetails from '../components/DeploymentDetails';
import FinetuningView from '../components/FinetuningView';
import MetricsPanel from '../components/MetricsPanel';
import ModelDeployPanel from '../components/ModelDeployPanel';
import ModelPlayground from '../components/ModelPlayground';
import ModelReadbuddy from '../components/ModelReadbuddy';
import ServicesView from '../components/ServicesView';
import StorageView from '../components/StorageView';
import { db } from '../data/firebase.js';
import { getHuggingFaceRepoUrl } from '../utils/huggingfaceUtils';
import ClusterDeployment from './ClusterDeployment';
import DeploymentModal from './DeploymentModal';
import NodesDashboard from './NodesDashboard';
import PaymentScreen from './payment/PaymentScreen';
import ComingSoonModal from './playground/widgets/ComingSoonModal';
import PodGrid from './widgets/PodGrid';
// Import PodGrid and ClusterDeployment components

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
    id: 'deployments',
    label: 'Deployments',
    icon: Rocket,
    comingSoon: false,
    hideFromTabs: true, // This will hide it from tabs but keep it in sidebar
    description: 'View and manage model deployments'
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
    id: 'hardware',
    label: 'Hardware',
    icon: Cpu,
    comingSoon: false,
    description: 'Browse available hardware options.'
  },
  {
    id: 'instances',
    label: 'My Pods',
    icon: Box,
    comingSoon: false,
    description: 'Manage your compute pods.'
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

// Define storage navigation sections
const storageNavigationSections = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Database,
    comingSoon: false,
    description: 'Storage dashboard and overview'
  },
  {
    id: 'datacenters',
    label: 'Data Centers',
    icon: Globe,
    comingSoon: false,
    description: 'Browse available data centers'
  },
  {
    id: 'myvolumes',
    label: 'My Volumes',
    icon: HardDrive,
    comingSoon: false,
    description: 'Manage your storage volumes'
  },
  {
    id: 'datasets',
    label: 'Data Sets',
    icon: Folder,
    comingSoon: false,
    description: 'Manage your datasets'
  }
];

// Define finetuning navigation sections
const finetuningNavigationSections = [
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Hammer,
    comingSoon: false,
    description: 'View and manage finetuning jobs'
  },
  {
    id: 'models',
    label: 'Models',
    icon: Brain,
    comingSoon: false,
    description: 'View your finetuned models'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Copy,
    comingSoon: false,
    description: 'Finetuning templates and recipes'
  }
];

// Define inference navigation sections
const servicesNavigationSections = [
  {
    id: 'endpoints',
    label: 'Endpoints',
    icon: Link,
    comingSoon: false,
    description: 'Manage model endpoints'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Folder,
    comingSoon: false,
    description: 'Quick deploy templates'
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Clock,
    comingSoon: false,
    description: 'Monitor inference performance'
  }
];

const AIStudio = ({ darkMode }) => {
  // Add the auth at the top of the component state declarations
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  
  // Models state
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(true);
  
  // Only keeping the deployment-related state that's actually used
  const [selectedDeployedModel, setSelectedDeployedModel] = useState(null);
  
  // Add sidebar collapse state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Listen for custom events to activate sections from other components
  useEffect(() => {
    const handleActivateSection = (event) => {
      const { section } = event.detail;
      
      // Activate the requested section
      if (section === 'catalog') {
        setActiveSection('catalog');
        setActiveSidebarItem('catalog');
      }
    };
    
    // Add event listener
    document.addEventListener('activateAIStudioSection', handleActivateSection);
    
    // Clean up
    return () => {
      document.removeEventListener('activateAIStudioSection', handleActivateSection);
    };
  }, []);
  
  // Listen for activate-catalog event
  useEffect(() => {
    const handleActivateCatalog = () => {
      setActiveSection('catalogue');
      setActiveSidebarItem('catalogue');
    };
    
    window.addEventListener('activate-catalog', handleActivateCatalog);
    
    return () => {
      window.removeEventListener('activate-catalog', handleActivateCatalog);
    };
  }, []);
  
  // Fetch models from Firebase
  useEffect(() => {
    const fetchModels = async () => {
      console.log('Fetching models from Firebase huggingface_models collection...');
      try {
        setLoadingModels(true);
        const modelsCollection = collection(db, 'huggingface_models');
        const modelsSnapshot = await getDocs(modelsCollection);
        
        console.log('Firebase response:', modelsSnapshot.docs.length, 'models found');
        
        const modelsData = modelsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            parameters: data.parameters,
            brand: data.brand,
            type: data.type,
            downloads: data.downloads,
            lastUpdated: data.lastUpdated,
            size: data.size,
            huggingface_id: data.huggingface_id,
            requirements: data.requirements,
            quantizations: data.quantizations
          };
        });
        
        console.log('Processed models for UI:', modelsData);
        setModels(modelsData);
      } catch (error) {
        console.error('Error fetching models from Firebase:', error);
        toast.error('Failed to load models');
      } finally {
        setLoadingModels(false);
      }
    };
    
    fetchModels();
  }, []);
  
  // Coming Soon Modal states
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [comingSoonDescription, setComingSoonDescription] = useState("");
  
  // Active main section
  const [activeSection, setActiveSection] = useState('compute');
  // Main active sidebar item (changes when user clicks sidebar)
  const [activeSidebarItem, setActiveSidebarItem] = useState('compute');
  
  // Active compute section
  const [activeComputeSection, setActiveComputeSection] = useState('hardware');

  // Active nodes section - add this new state
  const [activeNodesSection, setActiveNodesSection] = useState('all');

  // Active storage section
  const [activeStorageSection, setActiveStorageSection] = useState('overview');

  // Active finetuning section
  const [activeFinetuningSection, setActiveFinetuningSection] = useState('jobs');

  // Active inference section
  const [activeServicesSection, setActiveServicesSection] = useState('endpoints');

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

  // Effect to handle navbar visibility in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('fullscreen-mode');
      
      // Add escape key handler to exit fullscreen
      const handleEscKey = (e) => {
        if (e.key === 'Escape') {
          setIsFullscreen(false);
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    } else {
      document.body.classList.remove('fullscreen-mode');
    }
  }, [isFullscreen]);

  // Handle sidebar item click
  const handleSectionClick = (section) => {
    if (section.comingSoon) {
      setComingSoonFeature(section.label);
      setComingSoonDescription(section.description || `We're working hard to bring ${section.label} to you soon!`);
      setShowComingSoonModal(true);
      return;
    }
    
    // Check which section we're in
    if (activeSection === 'compute') {
      // For compute section, update activeComputeSection
      setActiveComputeSection(section.id);
    } else if (activeSection === 'nodes') {
      // For nodes section, update activeNodesSection
      setActiveNodesSection(section.id);
    } else if (activeSection === 'storage') {
      // For storage section, update activeStorageSection
      setActiveStorageSection(section.id);
    } else if (activeSection === 'services') {
      // For services section, update activeServicesSection
      setActiveServicesSection(section.id);
    } else if (activeSection === 'finetuning') {
      // For finetuning section, update activeFinetuningSection
      setActiveFinetuningSection(section.id);
    } else {
      // Default behavior for other sections
      setActiveSection(section.id);
      setActiveSidebarItem(section.id);
    }
  };

  // Handle tab switch - update both main tab and sidebar
  const handleTabSwitch = (tabId) => {
    if (tabId === 'compute') {
      setActiveSection('compute');
      setActiveSidebarItem('compute');
      // Reset compute section to default when switching to compute tab
      setActiveComputeSection('hardware');
    } else if (tabId === 'nodes') {
      setActiveSection('nodes');
      setActiveSidebarItem('nodes');
      // Reset nodes section to default
      setActiveNodesSection('all');
    } else if (tabId === 'storage') {
      setActiveSection('storage');
      setActiveSidebarItem('storage');
      // Reset storage section to default
      setActiveStorageSection('overview');
    } else if (tabId === 'services') {
      setActiveSection('services');
      setActiveSidebarItem('services');
      // Reset services section to default
      setActiveServicesSection('endpoints');
    } else if (tabId === 'finetuning') {
      setActiveSection('finetuning');
      setActiveSidebarItem('finetuning');
      // Reset finetuning section to default
      setActiveFinetuningSection('jobs');
    } else if (tabId === 'settings') {
      setActiveSection('settings');
      setActiveSidebarItem('settings');
    } else if (tabId === 'deployments') {
      setActiveSection('deployments');
      setActiveSidebarItem('deployments');
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

  // Define container styles for consistent layout
  const containerStyles = {
    height: isFullscreen
      ? 'calc(100vh - 20px)'
      : isExpanded
      ? 'calc(100vh - 140px)'
      : 'calc(90vh - 140px)',
    width: isFullscreen
      ? 'calc(100vw - 20px)'
      : isExpanded
      ? 'calc(100% - 32px)'
      : '90%',
    position: isFullscreen ? 'fixed' : 'absolute',
    top: isFullscreen ? '10px' : '50%',
    left: isFullscreen ? '10px' : '50%',
    right: isFullscreen ? '10px' : 'auto',
    bottom: isFullscreen ? '10px' : 'auto',
    transform: isFullscreen ? 'none' : 'translate(-50%, -50%)',
    margin: isFullscreen ? '0' : '0 auto',
    maxHeight: isFullscreen ? 'calc(100vh - 20px)' : 'calc(100vh - 140px)',
    padding: '0',
    zIndex: isFullscreen ? '9999' : 'auto',
    boxShadow: isFullscreen
      ? '0 0 15px rgba(0, 0, 0, 0.2)'
      : isExpanded
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    borderRadius: isFullscreen ? '8px' : '0',
    transitionProperty: 'all',
    transformOrigin: 'center',
    transitionTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
  };

  // Inside the component, add state variables for wallet and usage data
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [computeUsage, setComputeUsage] = useState({ cpu: {}, gpu: {} });
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  
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
    <div  className="px-8 flex items-center justify-center" style={{ height: '100%' }}>
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
        className={`${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } rounded-lg border overflow-hidden shadow-xl flex flex-col`}
        style={containerStyles}
      >
        {/* Header bar */}
        <div
          className={`flex items-center justify-between py-1 border-b-2 ${
            darkMode
              ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900'
              : 'border-gray-200 bg-gradient-to-r from-white to-gray-50'
          }`}
        >
          {/* Title on the far left */}
          <div className="flex items-center ml-4">
            <div className="flex items-center">
              <Brain className={`h-3.5 w-3.5 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className="font-medium text-xs">Polaris Cloud</span>
            </div>
            <div
              className={`ml-2 px-1.5 py-0.5 text-[7px] font-medium rounded-full ${
                darkMode 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-700/30' 
                  : 'bg-purple-100 text-purple-600 border border-purple-200'
              }`}
            >
              BETA
            </div>
          </div>
          
          {/* Centered tabs */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className={`h-7 flex ${darkMode ? 'shadow-lg shadow-blue-900/20' : 'shadow-md shadow-blue-500/10'}`}>
              <button
                className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                  ${
                    activeSection === 'compute' 
                      ? darkMode 
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('compute')}
              >
                <div className="flex items-center justify-center w-full">
                  <ServerCog 
                    className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'compute'
                        ? darkMode ? 'text-purple-300' : 'text-purple-500'
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
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('nodes')}
              >
                <div className="flex items-center justify-center w-full">
                  <Server
                    className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'nodes'
                        ? darkMode ? 'text-purple-300' : 'text-purple-500'
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
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('catalogue')}
              >
                <div className="flex items-center justify-center w-full">
                  <Command className={`h-3 w-3 mr-1.5 ${
                    activeSection === 'studio' || activeSection === 'catalogue'
                      ? darkMode ? 'text-purple-300' : 'text-purple-500'
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
                    activeSection === 'storage' 
                      ? darkMode 
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('storage')}
              >
                <div className="flex items-center justify-center w-full">
                  <Database
                    className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'storage'
                        ? darkMode ? 'text-purple-300' : 'text-purple-500'
                        : darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} 
                  />
                  <span className="relative z-10">Storage</span>
                </div>
                {/* Vertical separator */}
                <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'storage' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </button>

              <button
                className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                  ${
                    activeSection === 'services' 
                      ? darkMode 
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('services')}
              >
                <div className="flex items-center justify-center w-full">
                  <svg 
                    className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'services'
                        ? darkMode ? 'text-purple-300' : 'text-purple-500'
                        : darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`}
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.5 19.5a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10z" />
                    <path d="M5 9.3V5.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3.8" />
                    <path d="M8 15h7" />
                    <path d="M8 18h4" />
                    <path d="M11 3v4" />
                    <path d="M11 21v-4" />
                    <path d="M3 11h4" />
                    <path d="M21 11h-4" />
                  </svg>
                  <span className="relative z-10">Cloud</span>
                </div>
                {/* Vertical separator */}
                <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'services' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </button>

              <button
                className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                  ${
                    activeSection === 'finetuning' 
                      ? darkMode 
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('finetuning')}
              >
                <div className="flex items-center justify-center w-full">
                  <Hammer 
                    className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'finetuning'
                        ? darkMode ? 'text-purple-300' : 'text-purple-500'
                        : darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} 
                  />
                  <span className="relative z-10">Finetuning</span>
                </div>
                {/* Vertical separator */}
                <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'finetuning' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </button>
              
              <button
                className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                  ${
                    activeSection === 'deployments' 
                      ? darkMode 
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('deployments')}
                style={{ display: 'none' }} /* Hide the deployments tab */
              >
                <div className="flex items-center justify-center w-full">
                  <Rocket 
                    className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'deployments'
                        ? darkMode ? 'text-purple-300' : 'text-purple-500'
                        : darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} 
                  />
                  <span className="relative z-10">Deployments</span>
                </div>
                {/* Vertical separator */}
                <div className={`absolute right-0 top-1.5 bottom-1.5 w-[1px] ${activeSection === 'deployments' ? 'hidden' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </button>

              <button
                className={`group relative h-full px-4 min-w-[100px] text-[10px] font-medium transition-all duration-200 flex items-center
                  ${
                    activeSection === 'settings' 
                      ? darkMode 
                        ? 'bg-gradient-to-b from-purple-900/70 to-blue-900/80 text-white' 
                        : 'bg-gradient-to-b from-purple-100 to-blue-100 text-gray-800'
                      : darkMode 
                        ? 'bg-gray-800 text-gray-300 hover:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:text-blue-600'
                  }`}
                onClick={() => handleTabSwitch('settings')}
              >
                <div className="flex items-center justify-center w-full">
                  <Settings
                    className={`h-3 w-3 mr-1.5 ${
                      activeSection === 'settings'
                        ? darkMode ? 'text-purple-300' : 'text-purple-500'
                        : darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`}
                  />
                  <span className="relative z-10">Settings</span>
                </div>
              </button>
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
              onClick={toggleExpand}
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              className={`p-1 rounded-full transition-colors duration-200 ${
                darkMode
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                // Custom icon for exit fullscreen that's different from Minimize2
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                  <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                </svg>
              ) : (
                // Standard Maximize icon for entering fullscreen
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                  <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Layout: Left nav + (optional middle) + main content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left panel: navigation */}
          <div
            className={`${isSidebarExpanded ? 'w-44' : 'w-16'} flex-shrink-0 border-r-2 overflow-y-auto flex flex-col transition-all duration-300 ${
              darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="p-1.5 space-y-1 flex-grow">
              {(activeSection === 'compute' 
                ? computeNavigationSections 
                : activeSection === 'nodes'
                  ? nodesNavigationSections
                  : activeSection === 'storage'
                    ? storageNavigationSections
                    : activeSection === 'finetuning'
                      ? finetuningNavigationSections
                      : activeSection === 'services'
                        ? servicesNavigationSections
                        : navigationSections).map((section) => (
                <button
                  key={section.id}
                  className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} p-2 rounded-lg text-xs font-medium transition-colors duration-200
                    ${
                      (
                        (activeSection === 'compute' 
                          ? activeComputeSection 
                          : activeSection === 'nodes'
                            ? activeNodesSection
                            : activeSection === 'storage'
                              ? activeStorageSection
                              : activeSection === 'finetuning'
                                ? activeFinetuningSection
                                : activeSection === 'services'
                                  ? activeServicesSection
                                  : activeSidebarItem) === section.id
                      ) && !section.comingSoon
                        ? darkMode
                          ? 'bg-gradient-to-r from-blue-700/20 to-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                          : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 border-l-2 border-blue-500'
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
                            : activeSection === 'storage'
                              ? activeStorageSection
                              : activeSection === 'finetuning'
                                ? activeFinetuningSection
                                : activeSection === 'services'
                                  ? activeServicesSection
                                  : activeSidebarItem) === section.id
                      ) && !section.comingSoon
                        ? darkMode ? 'text-blue-400' : 'text-blue-500'
                        : darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`} />
                    {isSidebarExpanded && <span>{section.label}</span>}
                  </div>
                  {isSidebarExpanded && section.comingSoon && (
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded-full ${
                        darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
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
              {isSidebarExpanded ? (
              <div
                className={`p-2 rounded-lg ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/30'
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {/* A simple star icon (inline SVG) */}
                  <svg className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-xs font-medium">Premium Features</span>
                </div>
                <p className="text-[10px] mb-2 opacity-80">
                  Upgrade for advanced AI features, priority compute, and enterprise support.
                </p>
                <button
                  className={`w-full text-[10px] py-1 rounded ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors`}
                >
                    Coming Soon
                </button>
              </div>
              ) : (
                <div className="flex justify-center">
                  <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              )}
              
              {/* Toggle sidebar button */}
              <button 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className={`mt-3 w-full flex justify-center items-center p-1.5 rounded-md ${
                  darkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' 
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                } transition-colors`}
              >
                {isSidebarExpanded ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Conditionally render the middle column for "catalogue" or "deployments" (not used in playground, etc.) */}
          {(activeSection === 'catalogue' && activeSidebarItem !== 'playground' && activeSidebarItem !== 'readbuddy') && (
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
                      {loadingModels ? (
                        <div className="p-10 flex justify-center items-center">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                      ) : (
                        filteredModels.map((model) => (
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
                              {/* Model content */}
                            <div className="flex-grow overflow-hidden">
                              <h3 className="text-sm font-medium truncate">{model.name}</h3>
                              <div className="flex items-center space-x-3 mt-0.5 text-[10px]">
                                <span className={`flex items-center px-1.5 py-0.5 rounded-full ${
                                  darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {model.parameters}
                                </span>
                              </div>
                            </div>
                            </div>
                          </div>
                        ))
                      )}
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

            {/* Deployments section */}
            {activeSection === 'deployments' && (
              <DeploymentDetails
                      darkMode={darkMode}
                selectedDeployment={selectedDeployedModel}
                onBack={() => setSelectedDeployedModel(null)}
                activeDeploymentTab={activeDeploymentTab}
                setActiveDeploymentTab={setActiveDeploymentTab}
                setSelectedDeployedModel={setSelectedDeployedModel}
              />
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
                  <div className="flex items-center justify-between">
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
                  <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {activeComputeSection === 'instances' && 'Manage and monitor your compute pods.'}
                    {activeComputeSection === 'hardware' && 'Browse available hardware options for your workloads.'}
                    {activeComputeSection === 'usage' && 'Monitor resource usage and manage billing details.'}
                    {activeComputeSection === 'networking' && 'Configure networking options for your pods.'}
                    {activeComputeSection === 'settings' && 'Configure compute settings and preferences.'}
                  </p>
                    <button 
                      onClick={() => window.open('https://github.com/bigideaafrica/polaris', '_blank')}
                      className={`
                        px-2 py-1 mt-2 rounded text-xs font-medium
                        inline-flex items-center gap-1.5
                        ${darkMode 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20' 
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md shadow-purple-500/20'
                        } transition-all duration-200 transform hover:scale-105`}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-3 h-3"
                      >
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                      </svg>
                      Contribute Compute
                    </button>
                  </div>
                </div>

                {/* Compute content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-0">
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
                      <div>
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
            {(activeSection === 'nodes' || activeSection === 'settings') && (
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
                        {activeSection === 'nodes' ? 'Nodes' : 'Settings'}
                      </h2>
                      <button
                        className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-md absolute right-3 top-3 ${
                          darkMode
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                        onClick={() => {
                          if (activeSection === 'nodes') {
                            window.open('https://github.com/bigideaafrica/polaris', '_blank');
                          } else {
                            // Original create pod functionality
                          }
                        }}
                      >
                        {activeSection === 'nodes' && <FaGithub className="w-3 h-3 mr-1" />}
                        <span>{activeSection === 'nodes' ? 'Register Node' : 'Create Setting'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activeSection === 'nodes' 
                      ? 'Monitor registered nodes around the globe.' 
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

            {/* Storage section */}
            {activeSection === 'storage' && (
              <div className="flex-1 overflow-hidden">
                <StorageView 
                  darkMode={darkMode} 
                  activeStorageSection={activeStorageSection} 
                  onSectionChange={(section) => {
                    // Update the active storage section
                    setActiveStorageSection(section);
                    
                    // Find the corresponding section object from navigation sections
                    const sectionObj = storageNavigationSections.find(s => s.id === section);
                    if (sectionObj) {
                      handleSectionClick(sectionObj);
                    }
                  }}
                />
              </div>
            )}

            {/* Services section */}
            {activeSection === 'services' && (
              <div className="flex-1 overflow-hidden">
                <ServicesView darkMode={darkMode} />
              </div>
            )}

            {/* Finetuning section */}
            {activeSection === 'finetuning' && (
              <div className="flex-1 overflow-hidden">
                <FinetuningView darkMode={darkMode} />
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
        darkMode={darkMode}
        showDeployPanel={showDeployPanel}
        setShowDeployPanel={setShowDeployPanel}
        selectedModel={selectedModel}
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

      {/* Set up event listener for deployments navigation */}
      {useEffect(() => {
        const handleDeploymentsNavigation = (event) => {
          const { modelId, modelName } = event.detail;
          console.log(`Navigating to deployments section for model: ${modelName} (${modelId})`);
          
          // Set the active section to deployments
          setActiveSection('deployments');
          setActiveSidebarItem('deployments');
          
          // We're now using the DeploymentDetails component directly in the deployments section
          console.log('Showing deployments section');
        };
        
        // Add the event listener
        window.addEventListener('navigateToDeployments', handleDeploymentsNavigation);
        
        // Clean up the event listener when component unmounts
        return () => {
          window.removeEventListener('navigateToDeployments', handleDeploymentsNavigation);
        };
      }, [setActiveSection, setActiveSidebarItem])}

      {/* Inside the AIStudio component, add useEffect to listen for the custom event  
      useEffect(() => {
        const handleActivateCatalog = () => {
          setActiveSection('compute');
          setActiveSidebarItem('compute');
          setActiveComputeSection('catalogue');
        };
        
        window.addEventListener('activate-catalog', handleActivateCatalog);
        
        return () => {
          window.removeEventListener('activate-catalog', handleActivateCatalog);
        };
      }, [])} */}
    </div>
  );
};

AIStudio.propTypes = {
  darkMode: PropTypes.bool
};

export default AIStudio;
