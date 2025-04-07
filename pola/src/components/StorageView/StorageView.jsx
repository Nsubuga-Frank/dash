import {
  Calendar,
  Clock,
  Database,
  Folder,
  Globe,
  HardDrive,
  Info,
  Lock,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Share2,
  Shield,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DatasetView from '../DatasetView/DatasetView';

const StorageView = ({ darkMode, activeStorageSection = 'overview', onSectionChange }) => {
  // State management for storage functionality
  const [isLoading, setIsLoading] = useState(false);
  const [storageUsage] = useState({ used: 0, total: 100 }); // GB
  
  // Data centers section state
  const [selectedDataCenter, setSelectedDataCenter] = useState(null);
  const [showCreateVolumeForm, setShowCreateVolumeForm] = useState(false);
  const [volumeName, setVolumeName] = useState('');
  const [volumeSize, setVolumeSize] = useState(100);
  
  // My volumes section state
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [showVolumeDetails, setShowVolumeDetails] = useState(false);
  
  // Add new state for the storage configuration
  const [mountPath, setMountPath] = useState('/data');
  const [accessType, setAccessType] = useState('s3');
  const [exposeTcp, setExposeTcp] = useState('');
  
  // Add new state for access configuration
  const [accessKey, setAccessKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientIp, setClientIp] = useState('');
  
  // Dataset states
  const [activeDatasetTab, setActiveDatasetTab] = useState('my-datasets');
  const [selectedDatasetType, setSelectedDatasetType] = useState('images');
  const [selectedUploadServer, setSelectedUploadServer] = useState('us-east');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Mock datasets
  const myDatasets = [
    {
      id: 'ds1',
      name: 'Product Images Dataset',
      type: 'images',
      items: 1204,
      size: '2.4 GB',
      created: '2023-05-12',
      server: 'US East',
      icon: '🖼️'
    },
    {
      id: 'ds2',
      name: 'Customer Feedback Analysis',
      type: 'text',
      items: 24500,
      size: '345 MB',
      created: '2023-06-18',
      server: 'Europe',
      icon: '📝'
    },
    {
      id: 'ds3',
      name: 'Sales Statistics 2023',
      type: 'statistical',
      items: 52,
      size: '128 MB',
      created: '2023-07-01',
      server: 'US West',
      icon: '📊'
    },
    {
      id: 'ds4',
      name: 'Voice Commands Collection',
      type: 'audio',
      items: 820,
      size: '1.2 GB',
      created: '2023-08-05',
      server: 'Asia',
      icon: '🔊'
    }
  ];
  
  // Dataset type options
  const datasetTypes = [
    { id: 'images', name: 'Images', icon: '🖼️', description: 'For image collections, computer vision datasets' },
    { id: 'text', name: 'Text', icon: '📝', description: 'For NLP, document processing, and text analysis' },
    { id: 'statistical', name: 'Statistical', icon: '📊', description: 'For numerical data, time series, and analytics' },
    { id: 'audio', name: 'Audio', icon: '🔊', description: 'For voice, sound, and audio processing tasks' },
    { id: 'mixed', name: 'Mixed', icon: '🧩', description: 'For multi-modal data with various formats' }
  ];
  
  // Server options
  const serverOptions = [
    { id: 'us-east', name: 'US East', latency: 'Low', location: 'Virginia' },
    { id: 'us-west', name: 'US West', latency: 'Low', location: 'Oregon' },
    { id: 'europe', name: 'Europe', latency: 'Medium', location: 'Frankfurt' },
    { id: 'asia', name: 'Asia', latency: 'High', location: 'Tokyo' }
  ];
  
  // Handler for navigating between sections
  const handleSectionChange = (section) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };
  
  // Simulate loading storage data
  useEffect(() => {
    const loadStorageData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For now, we'll just show the coming soon state
      setIsLoading(false);
    };
    
    loadStorageData();
  }, [activeStorageSection]);
  
  // Refresh data functionality (placeholder)
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  // Handle create volume
  const handleCreateVolume = () => {
    // Simulating volume creation
    console.log('Creating volume:', {
      name: volumeName,
      size: volumeSize,
      dataCenter: selectedDataCenter?.name,
      mountPath: mountPath,
      accessType: accessType,
      exposeTcp: exposeTcp,
      accessConfig: {
        accessKey: accessType === 's3' ? accessKey : null,
        username: accessType === 'sftp' ? username : null,
        password: accessType === 'sftp' ? password : null,
        clientIp: accessType === 'nfs' ? clientIp : null
      }
    });
    
    setShowCreateVolumeForm(false);
    setSelectedDataCenter(null);
    setVolumeName('');
    setVolumeSize(100);
    setMountPath('/data');
    setAccessType('s3');
    setExposeTcp('');
    setAccessKey('');
    setUsername('');
    setPassword('');
    setClientIp('');
    // Would normally make an API call here
  };

  // Renders overview section
  const renderOverviewContent = () => (
    <div className="flex flex-col gap-5">
      {/* Hero section with gradients and animation */}
      <div className={`w-full rounded-lg overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-teal-900' : 'bg-gradient-to-br from-white via-blue-50 to-teal-50'}`}>
        <div className="flex flex-col items-center py-8 px-6 text-center relative overflow-hidden">
          {/* Decorative floating elements */}
          <div className="absolute top-8 left-10 opacity-20 animate-pulse">
            <Database size={64} className={darkMode ? 'text-teal-400' : 'text-teal-500'} />
          </div>
          <div className="absolute bottom-12 right-12 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>
            <Globe size={48} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
          </div>
          <div className="absolute top-20 right-20 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>
            <HardDrive size={56} className={darkMode ? 'text-indigo-400' : 'text-indigo-500'} />
          </div>
          
          {/* Beta badge */}
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full font-medium text-sm mb-4 ${
            darkMode ? 'bg-blue-600/30 text-blue-300 border border-blue-500/20' : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            <div className="mr-2 animate-pulse">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${darkMode ? 'bg-blue-400' : 'bg-blue-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${darkMode ? 'bg-blue-500' : 'bg-blue-500'}`}></span>
              </span>
            </div>
            Beta Feature
          </div>
          
          {/* Main title */}
          <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Decentralized <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Storage</span>
          </h1>
          <p className={`text-xl max-w-2xl mb-8 ${darkMode ? 'text-blue-100' : 'text-gray-600'}`}>
            Secure, high-performance storage across a global network with built-in redundancy and encryption.
          </p>

          {/* Stats display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>8</div>
                <div className="text-sm">Global Regions</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>99.9%</div>
                <div className="text-sm">Uptime SLA</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>3x</div>
                <div className="text-sm">Replication</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>256-bit</div>
                <div className="text-sm">Encryption</div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => handleSectionChange('datacenters')}
              className={`flex items-center py-2.5 px-5 rounded-md text-sm font-medium transition transform hover:scale-105 ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20'
              }`}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Create Volume</span>
            </button>
            
            <button 
              onClick={() => handleSectionChange('datasets')}
              className={`flex items-center py-2.5 px-5 rounded-md text-sm font-medium transition transform hover:scale-105 ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white shadow-lg shadow-gray-800/20' : 'bg-white hover:bg-gray-100 text-gray-800 shadow-md shadow-gray-300/20 border border-gray-200'
              }`}>
              <Folder className="h-4 w-4 mr-2" />
              <span>Manage Datasets</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`rounded-xl p-5 transition-all hover:scale-[1.02] ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/30' 
            : 'bg-white border border-blue-100 shadow-md shadow-blue-100/40'
        }`}>
          <div className={`rounded-full p-3 inline-flex mb-3 ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
            <Globe className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Global Network</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            Access your data from 8 regions worldwide with low-latency connections and automatic geo-replication.
          </p>
          <div className={`text-xs px-2 py-1 rounded inline-flex items-center ${
            darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
          }`}>
            <Server className="w-3 h-3 mr-1" />
            <span>8 regions available</span>
          </div>
        </div>
        
        <div className={`rounded-xl p-5 transition-all hover:scale-[1.02] ${
          darkMode 
            ? 'bg-gradient-to-br from-teal-900/40 to-teal-800/20 border border-teal-700/30' 
            : 'bg-white border border-teal-100 shadow-md shadow-teal-100/40'
        }`}>
          <div className={`rounded-full p-3 inline-flex mb-3 ${darkMode ? 'bg-teal-900/50' : 'bg-teal-50'}`}>
            <Shield className={`h-5 w-5 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>End-to-End Encryption</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            Advanced encryption protects your data at rest and in transit with 256-bit AES encryption.
          </p>
          <div className={`text-xs px-2 py-1 rounded inline-flex items-center ${
            darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'
          }`}>
            <Lock className="w-3 h-3 mr-1" />
            <span>Zero-knowledge architecture</span>
          </div>
        </div>
        
        <div className={`rounded-xl p-5 transition-all hover:scale-[1.02] ${
          darkMode 
            ? 'bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 border border-indigo-700/30' 
            : 'bg-white border border-indigo-100 shadow-md shadow-indigo-100/40'
        }`}>
          <div className={`rounded-full p-3 inline-flex mb-3 ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-50'}`}>
            <Share2 className={`h-5 w-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Multi-Protocol Access</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            Connect via S3, SFTP, or NFS with the same data accessible across all protocols.
          </p>
          <div className={`text-xs px-2 py-1 rounded inline-flex items-center ${
            darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
          }`}>
            <Database className="w-3 h-3 mr-1" />
            <span>Compatible with all standards</span>
          </div>
        </div>
      </div>
      
      {/* Storage usage section */}
      <div className={`p-6 rounded-lg border shadow-sm ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HardDrive className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            Storage Usage
          </h2>
          <div className={`px-3 py-1 rounded-md text-xs font-medium ${
            darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
          }`}>
            Beta Feature
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 items-center mb-5">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{Math.round((storageUsage.used / storageUsage.total) * 100)}% of storage used</h3>
            <p className="text-sm opacity-80 mb-2">({storageUsage.used.toFixed(2)} GB of {storageUsage.total} GB)</p>
            <p className="text-xs mb-4">Make room for your datasets, models, and more by cleaning up space</p>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 overflow-hidden flex">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: '42.95%' }}
              ></div>
              <div 
                className="h-full bg-amber-400" 
                style={{ width: '3.92%' }}
              ></div>
              <div 
                className="h-full bg-red-500" 
                style={{ width: '1.73%' }}
              ></div>
              <div 
                className="h-full bg-gray-400" 
                style={{ width: '0.6%' }}
              ></div>
            </div>
            
            <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span>Volumes (42.95 GB)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                <span>Datasets (3.92 GB)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Logs (1.73 GB)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                <span>Other (621.17 MB)</span>
              </div>
            </div>
          </div>
          
          {/* Donut chart */}
          <div className="flex-shrink-0 w-40 h-40 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="12"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="12"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 * (1 - (storageUsage.used / storageUsage.total))}
                className="stroke-blue-500 transition-all duration-1000"
              />
              <text
                x="50"
                y="50"
                dominantBaseline="middle"
                textAnchor="middle"
                className={`text-xl font-bold ${darkMode ? 'fill-white' : 'fill-gray-800'}`}
              >
                {Math.round((storageUsage.used / storageUsage.total) * 100)}%
              </text>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Coming soon roadmap */}
      <div className={`p-6 rounded-lg border shadow-sm ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold mb-4">Storage Roadmap</h2>
        
        <div className={`relative ${darkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'} ml-3 pl-6 max-w-3xl`}>
          <div className="mb-6 relative">
            <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
              darkMode ? 'border-gray-800 bg-blue-500' : 'border-white bg-blue-500'
            } h-4 w-4`}></div>
            <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Now Available in Beta</div>
            <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Decentralized Storage Volumes</div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create and manage storage volumes with multi-region redundancy and encryption.
            </p>
          </div>
          
          <div className="mb-6 relative">
            <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
              darkMode ? 'border-gray-800 bg-teal-500' : 'border-white bg-teal-500'
            } h-4 w-4`}></div>
            <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Coming Q2 2025</div>
            <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Advanced Access Controls</div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Role-based access with fine-grained permissions and audit logging.
            </p>
          </div>
          
          <div className="mb-6 relative">
            <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
              darkMode ? 'border-gray-800 bg-indigo-500' : 'border-white bg-indigo-500'
            } h-4 w-4`}></div>
            <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Coming Q3 2025</div>
            <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Cold Storage Tier</div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Cost-effective archival storage with automatic lifecycle policies.
            </p>
          </div>
          
          <div className="relative">
            <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
              darkMode 
                ? 'border-gray-800 bg-gradient-to-r from-blue-500 via-teal-500 to-indigo-500' 
                : 'border-white bg-gradient-to-r from-blue-500 via-teal-500 to-indigo-500'
            } h-4 w-4`}></div>
            <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Coming Q4 2025</div>
            <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Global CDN Integration</div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Edge caching for ultra-fast content delivery with automatic optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Renders Data Centers section
  const renderDataCentersContent = () => {
    // Dummy data centers
    const dataCenters = [
      {
        id: 'dc1',
        name: 'US East (N. Virginia)',
        location: 'North America',
        availableCapacity: 5000,
        availability: 'High',
        latency: 'Low',
        icon: '🇺🇸',
        status: 'Active',
        isVerified: true
      },
      {
        id: 'dc2',
        name: 'US West (Oregon)',
        location: 'North America',
        availableCapacity: 3500,
        availability: 'High',
        latency: 'Low',
        icon: '🇺🇸',
        status: 'Active',
        isVerified: true
      },
      {
        id: 'dc3',
        name: 'Europe (Frankfurt)',
        location: 'Europe',
        availableCapacity: 4200,
        availability: 'High',
        latency: 'Medium',
        icon: '🇩🇪',
        status: 'Active',
        isVerified: true
      },
      {
        id: 'dc4',
        name: 'Asia Pacific (Tokyo)',
        location: 'Asia',
        availableCapacity: 2800,
        availability: 'Medium',
        latency: 'Medium',
        icon: '🇯🇵',
        status: 'Active',
        isVerified: true
      },
      {
        id: 'dc5',
        name: 'South America (São Paulo)',
        location: 'South America',
        availableCapacity: 1500,
        availability: 'Medium',
        latency: 'High',
        icon: '🇧🇷',
        status: 'Maintenance',
        isVerified: false
      },
      {
        id: 'dc6',
        name: 'Australia (Sydney)',
        location: 'Oceania',
        availableCapacity: 2200,
        availability: 'Medium',
        latency: 'High',
        icon: '🇦🇺',
        status: 'Active',
        isVerified: true
      },
      {
        id: 'dc7',
        name: 'Asia Pacific (Singapore)',
        location: 'Asia',
        availableCapacity: 3100,
        availability: 'High',
        latency: 'Medium',
        icon: '🇸🇬',
        status: 'Active',
        isVerified: true
      },
      {
        id: 'dc8',
        name: 'Europe (London)',
        location: 'Europe',
        availableCapacity: 3800,
        availability: 'High',
        latency: 'Low',
        icon: '🇬🇧',
        status: 'Active',
        isVerified: true
      }
    ];
    
    return (
      <div className="h-full flex flex-col">
        <div className="mb-3">
          <h2 className="text-base font-semibold mb-1">Available Data Centers</h2>
          <p className="text-xs opacity-70 mb-2">Select a data center to provision storage in your preferred region.</p>
        </div>
        
        {/* Scrollable container for data center cards */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {dataCenters.map(dc => {
              const isActive = dc.status === 'Active';
              const isSelectable = isActive && dc.isVerified;
              
              return (
                <div 
                  key={dc.id}
                  onClick={() => {
                    if (isSelectable) {
                      setSelectedDataCenter(dc);
                      setShowCreateVolumeForm(true);
                    }
                  }}
                  className={`w-full rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} 
                    ${darkMode ? 'text-white' : 'text-gray-900'}
                    shadow-md hover:shadow-lg transition-all duration-300
                    ${isSelectable ? 'cursor-pointer transform hover:scale-[1.02]' : 'cursor-not-allowed opacity-75'}
                    p-1.5 space-y-1 relative
                    border ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
                    ${selectedDataCenter?.id === dc.id ? (darkMode ? 'border-blue-500' : 'border-blue-400') : ''}`}
                >
                  {!isSelectable && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-20 dark:bg-opacity-40 flex items-center justify-center z-10 rounded-lg">
                      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-2 py-0.5 rounded text-[9px] font-medium shadow-md border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        {!isActive ? 'Unavailable' : 'Unverified'}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <div className={`font-medium text-[11px] break-words leading-tight w-[65%] ${darkMode ? 'bg-gray-700/50' : 'bg-gray-200/80'} px-1.5 py-1 rounded`}>
                      {dc.name}
                    </div>
                    
                    {/* Status Bar */}
                    <div className={`border ${isActive ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'} rounded text-[9px] px-1.5 py-0.5 inline-flex items-center ${isActive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} shrink-0`}>
                      <div className="flex items-center">
                        <span className={`font-semibold ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isActive ? 'Online' : 'Maintenance'}
                        </span>
                      </div>
                      
                      {dc.isVerified ? (
                        <>
                          <span className="mx-0.5 text-gray-400">|</span>
                          <span className={`font-semibold text-blue-600 dark:text-blue-400`}>verified</span>
                        </>
                      ) : (
                        <>
                          <span className="mx-0.5 text-gray-400">|</span>
                          <span className={`font-semibold text-red-500 dark:text-red-400`}>unverified</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] text-gray-400">{dc.location}</p>
                    <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-[11px] font-medium`}>
                      {dc.availableCapacity} GB
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className={`bg-gray-700/50 dark:bg-gray-700/50 rounded px-1.5 py-1 flex items-center gap-1.5 hover:bg-opacity-70`}>
                      <Globe className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
                      <span className="text-[10px]">Latency: {dc.latency}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className={`bg-gray-200/80 dark:bg-gray-700/50 rounded px-1.5 py-1 flex items-center gap-1.5 hover:bg-opacity-70`}>
                        <HardDrive className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
                        <span className="text-[10px]">
                          {dc.availableCapacity} GB
                        </span>
                      </div>

                      <div className={`bg-gray-200/80 dark:bg-gray-700/50 rounded px-1.5 py-1 flex items-center gap-1.5 hover:bg-opacity-70`}>
                        <Database className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
                        <span className="text-[10px]">
                          Availability: {dc.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Volume Creation Modal */}
        {showCreateVolumeForm && selectedDataCenter && selectedDataCenter.status === 'Active' && selectedDataCenter.isVerified && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`rounded-lg border max-w-md w-full ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold">Rent Storage Space</h3>
                <button 
                  onClick={() => setShowCreateVolumeForm(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-semibold mr-1">Selected Data Center:</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}>{selectedDataCenter.name}</span>
                  </div>
                  <div className="text-[9px] opacity-70 flex items-center">
                    <Globe className="h-3 w-3 mr-1 inline" />
                    <span>{selectedDataCenter.location} - Latency: {selectedDataCenter.latency}</span>
                  </div>
                </div>

                {/* Volume Configuration */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Volume Name</label>
                    <input 
                      type="text"
                      value={volumeName}
                      onChange={(e) => setVolumeName(e.target.value)}
                      placeholder="e.g., my-volume"
                      className={`w-full p-1.5 text-xs rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1">Volume Size (GB)</label>
                    <input 
                      type="number"
                      value={volumeSize}
                      onChange={(e) => setVolumeSize(parseInt(e.target.value))}
                      min="0.5"
                      max={selectedDataCenter?.availableCapacity}
                      className={`w-full p-1.5 text-xs rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    <div className="flex justify-between text-[9px] mt-0.5">
                      <span>Min: 0.5 GB</span>
                      <span>Max: {selectedDataCenter?.availableCapacity} GB</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Mount Path</label>
                  <input 
                    type="text"
                    value={mountPath}
                    onChange={(e) => setMountPath(e.target.value)}
                    placeholder="/data"
                    className={`w-full p-1.5 text-xs rounded-md border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Access Type</label>
                  <select
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                    className={`w-full p-1.5 text-xs rounded-md border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="s3">S3 Compatible</option>
                    <option value="sftp">SFTP Access</option>
                    <option value="nfs">NFS Mount</option>
                  </select>
                </div>

                {/* Conditional fields based on accessType */}
                {accessType === 's3' && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1">S3 Access Key</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        placeholder="Enter access key"
                        className={`w-full p-1.5 text-xs rounded-md border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setAccessKey(Math.random().toString(36).substring(2, 15))}
                      >
                        <RefreshCw size={10} />
                      </button>
                    </div>
                    <p className="text-[9px] mt-0.5 opacity-70">Your access credentials for S3 compatible storage</p>
                  </div>
                )}

                {accessType === 'sftp' && (
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">SFTP Username</label>
                      <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="sftp-user"
                        className={`w-full p-1.5 text-xs rounded-md border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">SFTP Password</label>
                      <div className="relative">
                        <input 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter secure password"
                          className={`w-full p-1.5 text-xs rounded-md border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                        />
                        <button 
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={() => setPassword(Math.random().toString(36).substring(2, 15))}
                        >
                          <RefreshCw size={10} />
                        </button>
                      </div>
                      <p className="text-[9px] mt-0.5 opacity-70">Credentials for SFTP access to your volume</p>
                    </div>
                  </div>
                )}

                {accessType === 'nfs' && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1">Allowed Client IP</label>
                    <input 
                      type="text"
                      value={clientIp}
                      onChange={(e) => setClientIp(e.target.value)}
                      placeholder="e.g., 192.168.1.0/24"
                      className={`w-full p-1.5 text-xs rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    <p className="text-[9px] mt-0.5 opacity-70">IP or CIDR range allowed to mount this volume</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-medium mb-1">Expose TCP Ports (optional)</label>
                  <input 
                    type="text"
                    value={exposeTcp}
                    onChange={(e) => setExposeTcp(e.target.value)}
                    placeholder="e.g., 9000, 9001"
                    className={`w-full p-1.5 text-xs rounded-md border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <p className="text-[9px] mt-0.5 opacity-70">Comma-separated list of ports for additional access</p>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="text-[9px] opacity-70 mr-1">Estimated cost:</span>
                    <span className={`text-xs font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      $0.00/month
                    </span>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowCreateVolumeForm(false)}
                      className={`px-3 py-1.5 rounded-md text-xs ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreateVolume}
                      className={`px-3 py-1.5 rounded-md text-xs ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } ${(!volumeName || volumeSize < 0.5 || volumeSize > selectedDataCenter?.availableCapacity) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!volumeName || volumeSize < 0.5 || volumeSize > selectedDataCenter?.availableCapacity}
                    >
                      Create Volume
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renders My Volumes section
  const renderMyVolumesContent = () => {
    // Dummy volumes data
    const myVolumes = [
      {
        id: 'vol1',
        name: 'Main Storage',
        dataCenter: 'US East (N. Virginia)',
        size: 200,
        maxSize: 5000,
        used: 120,
        createdAt: '2025-01-15',
        expiresAt: '2025-12-15',
        status: 'Active',
        accessMethod: 'S3'
      },
      {
        id: 'vol2',
        name: 'Dataset Storage',
        dataCenter: 'Europe (Frankfurt)',
        size: 150,
        maxSize: 3000,
        used: 85,
        createdAt: '2025-02-22',
        expiresAt: '2025-12-22',
        status: 'Active',
        accessMethod: 'SFTP'
      },
      {
        id: 'vol3',
        name: 'Backup Volume',
        dataCenter: 'US West (Oregon)',
        size: 100,
        maxSize: 2000,
        used: 30,
        createdAt: '2025-03-10',
        expiresAt: '2025-12-10',
        status: 'Active',
        accessMethod: 'NFS'
      },
      {
        id: 'vol4',
        name: 'Development Storage',
        dataCenter: 'Asia Pacific (Tokyo)',
        size: 50,
        maxSize: 1000,
        used: 45,
        createdAt: '2025-04-05',
        expiresAt: '2025-12-05',
        status: 'Pending',
        accessMethod: 'S3'
      },
      {
        id: 'vol5',
        name: 'Archive Data',
        dataCenter: 'US East (N. Virginia)',
        size: 500,
        maxSize: 4000,
        used: 480,
        createdAt: '2025-05-20',
        expiresAt: '2025-12-20',
        status: 'Active',
        accessMethod: 'S3'
      }
    ];
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'Active':
          return darkMode ? 'bg-green-400' : 'bg-green-500';
        case 'Pending':
          return darkMode ? 'bg-yellow-400' : 'bg-yellow-500';
        case 'Suspended':
          return darkMode ? 'bg-red-400' : 'bg-red-500';
        default:
          return darkMode ? 'bg-gray-400' : 'bg-gray-500';
      }
    };
    
    const getUsageBarColor = (usage) => {
      const percentage = (usage / 100) * 100;
      if (percentage <= 30) return 'bg-green-500';
      if (percentage <= 70) return 'bg-yellow-500';
      return 'bg-red-500';
    };
    
    const getAccessMethodBadge = (method) => {
      const baseClasses = "px-1.5 py-0.5 rounded-full text-[9px] font-medium";
      
      switch(method) {
        case 'S3':
          return `${baseClasses} ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600'}`;
        case 'SFTP':
          return `${baseClasses} ${darkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-600'}`;
        case 'NFS':
          return `${baseClasses} ${darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-800'}`;
        default:
          return `${baseClasses} ${darkMode ? 'bg-gray-900/40 text-gray-300' : 'bg-gray-100 text-gray-600'}`;
      }
    };
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">My Storage Volumes</h2>
          <button 
            onClick={() => handleSectionChange('datacenters')}
            className={`flex items-center py-1.5 px-3 rounded-md text-xs ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span>New Volume</span>
          </button>
        </div>
        
        <div className="flex-1 h-[360px] relative rounded-md overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
          <div className={`absolute inset-0 overflow-auto ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
            <table className={`w-full min-w-[900px] text-[10px] ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <thead className={`${darkMode ? 'bg-gray-800/95 text-gray-300 backdrop-blur-sm' : 'bg-gray-50/95 text-gray-700 backdrop-blur-sm'} sticky top-0 z-10`}>
                <tr>
                  <th className="text-left p-2 font-semibold">Volume Name</th>
                  <th className="text-left p-2 font-semibold">Data Center</th>
                  <th className="text-left p-2 font-semibold">Storage Size</th>
                  <th className="text-left p-2 font-semibold w-[140px]">Usage</th>
                  <th className="text-left p-2 font-semibold">Status</th>
                  <th className="text-left p-2 font-semibold">Access Method</th>
                  <th className="text-left p-2 font-semibold">Expires At</th>
                  <th className="text-left p-2 w-[70px] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myVolumes.map((volume) => (
                  <tr 
                    key={volume.id} 
                    className={`border-t ${
                      darkMode ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className="p-2">
                      <div className="font-medium">{volume.name}</div>
                      <div className="text-[9px] opacity-70 mt-0.5">ID: {volume.id}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{volume.dataCenter}</div>
                      <div className="text-[9px] opacity-70 mt-0.5">Created: {volume.createdAt}</div>
                    </td>
                    <td className="p-2 font-medium">
                      {volume.size} GB
                      <div className="text-[9px] opacity-70 mt-0.5">Max: {volume.maxSize} GB</div>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`${getUsageBarColor(volume.used / volume.size * 100)} h-1.5 rounded-full`} 
                            style={{ width: `${(volume.used / volume.size) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="font-medium">{volume.used} GB used</span>
                          <span className="opacity-70">{Math.round((volume.used / volume.size) * 100)}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(volume.status)}`}></span>
                        <span className="font-medium">{volume.status}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className={`inline-flex items-center ${getAccessMethodBadge(volume.accessMethod)}`}>
                        <span>{volume.accessMethod}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{volume.expiresAt}</div>
                      <div className="text-[9px] opacity-70 mt-0.5 flex items-center">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        <span>Auto-renewal enabled</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => {
                            setSelectedVolume(volume);
                            setShowVolumeDetails(true);
                          }}
                          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Volume Details Side Panel */}
        {showVolumeDetails && selectedVolume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-lg border shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold">Volume Details</h3>
                <button 
                  onClick={() => setShowVolumeDetails(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] opacity-70 mb-1">Volume Name</h4>
                    <p className="font-medium">{selectedVolume.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] opacity-70 mb-1">Data Center</h4>
                    <p className="font-medium">{selectedVolume.dataCenter}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] opacity-70 mb-1">Storage Usage</h4>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-1">
                    <div 
                      className={`${getUsageBarColor(selectedVolume.used / selectedVolume.size * 100)} h-2 rounded-full`} 
                      style={{ width: `${(selectedVolume.used / selectedVolume.size) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>{selectedVolume.used} GB used of {selectedVolume.size} GB</span>
                    <span>{Math.round((selectedVolume.used / selectedVolume.size) * 100)}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] opacity-70 mb-1">Created On</h4>
                    <p className="font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1 opacity-70" />
                      {selectedVolume.createdAt}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] opacity-70 mb-1">Expires On</h4>
                    <p className="font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1 opacity-70" />
                      {selectedVolume.expiresAt}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] opacity-70 mb-1">Access Methods</h4>
                  <div className={`mt-1 p-3 rounded-md text-[10px] ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">S3 Compatible</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${
                          selectedVolume.accessMethod === 'S3' ? 
                            (darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800') : 
                            (darkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-200 text-gray-600')
                        }`}>
                          {selectedVolume.accessMethod === 'S3' ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      
                      {selectedVolume.accessMethod === 'S3' && (
                        <div className="mt-1 pl-3 border-l-2 border-blue-500/30">
                          <div className="mb-1">
                            <span className="opacity-70">Endpoint:</span>
                            <code className={`ml-1 px-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                              s3.{selectedVolume.dataCenter.split(' ')[0].toLowerCase()}.polaris.cloud
                            </code>
                          </div>
                          <div>
                            <span className="opacity-70">Bucket:</span>
                            <code className={`ml-1 px-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                              {selectedVolume.name.toLowerCase().replace(/\s+/g, '-')}
                            </code>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">SFTP Access</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${
                          selectedVolume.accessMethod === 'SFTP' ? 
                            (darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800') : 
                            (darkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-200 text-gray-600')
                        }`}>
                          {selectedVolume.accessMethod === 'SFTP' ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      
                      {selectedVolume.accessMethod === 'SFTP' && (
                        <div className="mt-1 pl-3 border-l-2 border-purple-500/30">
                          <div className="mb-1">
                            <span className="opacity-70">Host:</span>
                            <code className={`ml-1 px-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                              sftp.{selectedVolume.dataCenter.split(' ')[0].toLowerCase()}.polaris.cloud
                            </code>
                          </div>
                          <div>
                            <span className="opacity-70">Username:</span>
                            <code className={`ml-1 px-1 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                              user-{selectedVolume.id}
                            </code>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">NFS Mount</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${
                          selectedVolume.accessMethod === 'NFS' ? 
                            (darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800') : 
                            (darkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-200 text-gray-600')
                        }`}>
                          {selectedVolume.accessMethod === 'NFS' ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      
                      {selectedVolume.accessMethod === 'NFS' && (
                        <div className="mt-1 pl-3 border-l-2 border-green-500/30">
                          <div>
                            <span className="opacity-70">Mount command:</span>
                            <code className={`block mt-1 px-1.5 py-1 rounded text-[9px] break-all ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                              {`mount -t nfs nfs.${selectedVolume.dataCenter.split(' ')[0].toLowerCase()}.polaris.cloud:/${selectedVolume.id} /mnt/${selectedVolume.name.toLowerCase().replace(/\s+/g, '-')}`}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t dark:border-gray-700 flex justify-between">
                  <button className={`flex items-center py-1.5 px-3 rounded-md text-[10px] ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}>
                    <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    <span>Increase Storage</span>
                  </button>
                  
                  <button className={`flex items-center py-1.5 px-3 rounded-md text-[10px] ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}>
                    <Settings className="h-3 w-3 mr-1" />
                    <span>Manage</span>
                  </button>
                  
                  <button className={`flex items-center py-1.5 px-3 rounded-md text-[10px] ${
                    darkMode ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'
                  }`}>
                    <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
  };
  
  // Renders datasets section
  const renderDatasetsContent = () => (
    <DatasetView darkMode={darkMode} />
  );

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header with actions */}
      <div className={`flex justify-between items-center py-2 px-3 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h1 className="text-sm font-semibold flex items-center gap-1.5">
          {activeStorageSection === 'overview' && <Database className="h-4 w-4" />}
          {activeStorageSection === 'datacenters' && <Globe className="h-4 w-4" />}
          {activeStorageSection === 'myvolumes' && <HardDrive className="h-4 w-4" />}
          {activeStorageSection === 'datasets' && <Folder className="h-4 w-4" />}
          
          {activeStorageSection === 'overview' ? 'Storage Overview' : 
           activeStorageSection === 'datacenters' ? 'Data Centers' :
           activeStorageSection === 'myvolumes' ? 'My Volumes' : 'Data Sets'}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Action buttons */}
          <button 
            className={`p-1.5 rounded-md ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Beta mode flag with tooltip */}
          <div className="relative group">
            <div
              className={`ml-2 px-3 py-1 text-[11px] font-medium rounded-sm animate-pulse ${
              darkMode 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-700/30' 
                  : 'bg-purple-100 text-purple-600 border border-purple-200'
              }`}
            >
              BETA MODE
            </div>
            {/* Tooltip that appears on hover */}
            <div className={`absolute right-0 top-full mt-1 w-48 p-2 text-[9px] rounded-md shadow-md z-50
              transition-opacity duration-150 opacity-0 group-hover:opacity-100 pointer-events-none
              ${darkMode 
                ? 'bg-gray-800 text-gray-200 border border-gray-700' 
                : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              <div className="font-medium mb-1">Storage Beta</div>
              <p>Polaris Storage is currently in beta. Features and functionality may change before final release.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area - flex-1 to take available space */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {activeStorageSection === 'overview' && renderOverviewContent()}
            {activeStorageSection === 'datacenters' && renderDataCentersContent()}
            {activeStorageSection === 'myvolumes' && renderMyVolumesContent()}
            {activeStorageSection === 'datasets' && renderDatasetsContent()}
          </div>
        )}
      </div>

      {/* Footer with info - fixed at bottom */}
      <div className={`border-t py-2 px-3 flex justify-between items-center text-[9px] ${
        darkMode ? 'border-gray-700 text-gray-400 bg-gray-900' : 'border-gray-200 text-gray-500 bg-white'
      }`}>
        <div className="flex items-center">
          <Info className="h-2.5 w-2.5 mr-1" />
          <span>Cloud storage provided by Polaris Cloud</span>
        </div>
        <div>
          <span>Storage SDK v0.1.0</span>
        </div>
      </div>
    </div>
  );
};

StorageView.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  activeStorageSection: PropTypes.string,
  onSectionChange: PropTypes.func
};

export default StorageView; 