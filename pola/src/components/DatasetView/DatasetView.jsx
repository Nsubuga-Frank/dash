import {
  ArrowLeft,
  ChartBar,
  Database,
  FileStack,
  FileText,
  Globe,
  Layers,
  Radio,
  Share2,
  Tag,
  Upload,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import DatasetCard from './DatasetCard';

const DatasetView = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
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
      created: '2025-05-12',
      server: 'US East',
      icon: '🖼️'
    },
    {
      id: 'ds2',
      name: 'Customer Feedback Analysis',
      type: 'text',
      items: 24500,
      size: '345 MB',
      created: '2025-06-18',
      server: 'Europe',
      icon: '📝'
    },
    {
      id: 'ds3',
      name: 'Sales Statistics 2025',
      type: 'statistical',
      items: 52,
      size: '128 MB',
      created: '2025-07-01',
      server: 'US West',
      icon: '📊'
    },
    {
      id: 'ds4',
      name: 'Voice Commands Collection',
      type: 'audio',
      items: 820,
      size: '1.2 GB',
      created: '2025-08-05',
      server: 'Asia',
      icon: '🔊'
    },
    {
      id: 'ds5',
      name: 'E-commerce Product Photos',
      type: 'images',
      items: 3250,
      size: '5.7 GB',
      created: '2025-09-15',
      server: 'US East',
      icon: '🖼️'
    },
    {
      id: 'ds6',
      name: 'NLP Training Corpus',
      type: 'text',
      items: 156000,
      size: '780 MB',
      created: '2025-10-03',
      server: 'Europe',
      icon: '📝'
    },
    {
      id: 'ds7',
      name: 'Financial Data Analysis',
      type: 'statistical',
      items: 125,
      size: '89 MB',
      created: '2025-11-17',
      server: 'US West',
      icon: '📊'
    },
    {
      id: 'ds8',
      name: 'Music Samples Collection',
      type: 'audio',
      items: 1450,
      size: '3.2 GB',
      created: '2025-12-20',
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

  const handleUploadModalOpen = () => {
    setIsUploadModalOpen(true);
  };
  
  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
  };

  const handleDatasetSelect = (datasetId) => {
    // Show loading indicator while "selecting" the dataset
    setIsLoading(true);
    // Simulate a loading process
    setTimeout(() => setIsLoading(false), 800);
    console.log('Selected dataset:', datasetId);
    // Add your dataset selection logic here
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="p-4">
            {/* Overview Section */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-5">
                {/* Hero section with gradients and animation */}
                <div className={`w-full rounded-lg overflow-hidden ${darkMode ? 'bg-[#7E3916]' : 'bg-gradient-to-br from-white via-amber-50 to-orange-50'}`}>
                  <div className="flex flex-col items-center py-8 px-6 text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-8 left-10 opacity-20">
                      <FileStack size={64} className={darkMode ? 'text-amber-400' : 'text-amber-500'} />
                    </div>
                    <div className="absolute bottom-12 right-12 opacity-30">
                      <FileText size={48} className={darkMode ? 'text-orange-400' : 'text-orange-500'} />
                    </div>
                    <div className="absolute top-20 right-20 opacity-20">
                      <Layers size={56} className={darkMode ? 'text-yellow-400' : 'text-yellow-500'} />
                    </div>
                    
                    {/* Data Management badge */}
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full font-medium text-sm mb-4 ${
                      darkMode ? 'bg-orange-600/30 text-orange-300 border border-orange-500/20' : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      <div className="mr-2">
                        <span className="relative flex h-3 w-3">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${darkMode ? 'bg-orange-400' : 'bg-orange-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${darkMode ? 'bg-orange-500' : 'bg-orange-500'}`}></span>
                        </span>
                      </div>
                      Data Management
                    </div>
                    
                    {/* Main title */}
                    <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Intelligent <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>Datasets</span>
                    </h1>
                    <p className={`text-xl max-w-2xl mb-8 ${darkMode ? 'text-amber-100' : 'text-gray-600'}`}>
                      Create, manage, and share high-quality datasets for all your machine learning projects.
                    </p>

                    {/* Stats display */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
                      <div className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
                      }`}>
                        <div className="text-center">
                          <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>5</div>
                          <div className="text-sm">Data Types</div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
                      }`}>
                        <div className="text-center">
                          <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>100%</div>
                          <div className="text-sm">ML Ready</div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
                      }`}>
                        <div className="text-center">
                          <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>10TB</div>
                          <div className="text-sm">Storage Limit</div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-sm'
                      }`}>
                        <div className="text-center">
                          <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>4</div>
                          <div className="text-sm">Global Regions</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={handleUploadModalOpen}
                        className={`flex items-center py-2.5 px-5 rounded-md text-sm font-medium ${
                          darkMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}>
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Upload Dataset</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('my-datasets')}
                        className={`flex items-center py-2.5 px-5 rounded-md text-sm font-medium ${
                          darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-900 hover:bg-black text-white'
                        }`}>
                        <Database className="h-4 w-4 mr-2" />
                        <span>View My Datasets</span>
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('public')}
                        className={`flex items-center py-2.5 px-5 rounded-md text-sm font-medium ${
                          darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-900 hover:bg-black text-white'
                        }`}>
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Public Datasets</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={`rounded-xl p-5 transition-all hover:scale-[1.02] ${
                    darkMode 
                      ? 'bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-700/30' 
                      : 'bg-white border border-amber-100 shadow-md shadow-amber-100/40'
                  }`}>
                    <div className={`rounded-full p-3 inline-flex mb-3 ${darkMode ? 'bg-amber-900/50' : 'bg-amber-50'}`}>
                      <Tag className={`h-5 w-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Advanced Labeling</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      AI-powered assistance for dataset labeling with support for all data types and automatic suggestions.
                    </p>
                    <div className={`text-xs px-2 py-1 rounded inline-flex items-center ${
                      darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <Radio className="w-3 h-3 mr-1" />
                      <span>Automatic annotation</span>
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-5 transition-all hover:scale-[1.02] ${
                    darkMode 
                      ? 'bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700/30' 
                      : 'bg-white border border-orange-100 shadow-md shadow-orange-100/40'
                  }`}>
                    <div className={`rounded-full p-3 inline-flex mb-3 ${darkMode ? 'bg-orange-900/50' : 'bg-orange-50'}`}>
                      <Layers className={`h-5 w-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Version Control</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      Track changes with complete version history and rollback capabilities for all your datasets.
                    </p>
                    <div className={`text-xs px-2 py-1 rounded inline-flex items-center ${
                      darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-700'
                    }`}>
                      <Database className="w-3 h-3 mr-1" />
                      <span>Full data lineage</span>
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-5 transition-all hover:scale-[1.02] ${
                    darkMode 
                      ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-700/30' 
                      : 'bg-white border border-yellow-100 shadow-md shadow-yellow-100/40'
                  }`}>
                    <div className={`rounded-full p-3 inline-flex mb-3 ${darkMode ? 'bg-yellow-900/50' : 'bg-yellow-50'}`}>
                      <Share2 className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Seamless Sharing</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      Granular access controls and permission management for team collaboration or public datasets.
                    </p>
                    <div className={`text-xs px-2 py-1 rounded inline-flex items-center ${
                      darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      <Globe className="w-3 h-3 mr-1" />
                      <span>Global distribution</span>
                    </div>
                  </div>
                </div>
                
                {/* Dataset types section */}
                <div className={`p-6 rounded-lg border shadow-sm ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileStack className={`h-5 w-5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                      Supported Data Types
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {datasetTypes.map(type => (
                      <div 
                        key={type.id} 
                        className={`p-4 rounded-lg text-center transition hover:scale-105 ${
                          darkMode 
                            ? 'bg-gray-700/50 border border-gray-600 hover:border-amber-500/50' 
                            : 'bg-gray-50 border border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <div className="font-medium text-sm mb-1">{type.name}</div>
                        <p className="text-xs opacity-70">{type.description.split(' for ')[0]}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-5 pt-5 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium">Recent Datasets Activity</h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        darkMode ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>Coming soon</div>
                    </div>
                    
                    <div className={`w-full h-12 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <ChartBar className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className="text-sm">Activity timeline will appear here</span>
                    </div>
                  </div>
                </div>
                
                {/* Coming soon roadmap */}
                <div className={`p-6 rounded-lg border shadow-sm ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <h2 className="text-lg font-semibold mb-4">Dataset Management Roadmap</h2>
                  
                  <div className={`relative ${darkMode ? 'border-l border-gray-700' : 'border-l border-gray-200'} ml-3 pl-6 max-w-3xl`}>
                    <div className="mb-6 relative">
                      <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                        darkMode ? 'border-gray-800 bg-amber-500' : 'border-white bg-amber-500'
                      } h-4 w-4`}></div>
                      <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Now Available</div>
                      <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dataset Management</div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Upload, organize, and explore datasets with version control and basic labeling.
                      </p>
                    </div>
                    
                    <div className="mb-6 relative">
                      <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                        darkMode ? 'border-gray-800 bg-orange-500' : 'border-white bg-orange-500'
                      } h-4 w-4`}></div>
                      <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Coming Q3 2025</div>
                      <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI-Powered Labeling</div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Automated annotation suggestions and smart labeling for all data types.
                      </p>
                    </div>
                    
                    <div className="mb-6 relative">
                      <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                        darkMode ? 'border-gray-800 bg-yellow-500' : 'border-white bg-yellow-500'
                      } h-4 w-4`}></div>
                      <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Coming Q4 2025</div>
                      <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Public Dataset Marketplace</div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Discover, share, and collaborate on public datasets with the community.
                      </p>
                    </div>
                    
                    <div className="relative">
                      <div className={`absolute -left-9 mt-1.5 rounded-full border-4 ${
                        darkMode 
                          ? 'border-gray-800 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500' 
                          : 'border-white bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500'
                      } h-4 w-4`}></div>
                      <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Coming Q1 2025</div>
                      <div className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Advanced Analytics</div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Statistical analysis, bias detection, and quality metrics for your datasets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Datasets Section */}
            {activeTab === 'my-datasets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setActiveTab('overview')} 
                      className={`p-1.5 mr-3 rounded-md ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <ArrowLeft className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <h2 className="text-xl font-semibold">My Datasets</h2>
                  </div>
                  
                  <button 
                    onClick={handleUploadModalOpen}
                    className={`flex items-center py-1.5 px-3 rounded-md text-sm ${
                      darkMode 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    <span>Upload Dataset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myDatasets.map(dataset => (
                    <DatasetCard 
                      key={dataset.id}
                      dataset={dataset}
                      darkMode={darkMode}
                      onSelect={handleDatasetSelect}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Public Datasets Section */}
            {activeTab === 'public' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setActiveTab('overview')} 
                      className={`p-1.5 mr-3 rounded-md ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <ArrowLeft className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <h2 className="text-xl font-semibold">Public Datasets</h2>
                  </div>
                  
                  <button 
                    onClick={handleUploadModalOpen}
                    className={`flex items-center py-1.5 px-3 rounded-md text-sm ${
                      darkMode 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    <span>Upload Dataset</span>
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center h-40 border rounded-lg border-dashed p-8 text-center">
                  <Globe className={`h-10 w-10 mb-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                  <h3 className="text-base font-medium mb-2">Public Dataset Directory</h3>
                  <p className="text-sm opacity-70 text-center max-w-md">
                    Browse, search, and use public datasets from the community. Coming soon in Q4 2025.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Dataset Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-lg border shadow-lg max-w-2xl w-full ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } flex flex-col max-h-[75vh]`}>
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-sm font-semibold">Upload New Dataset</h3>
              <button 
                onClick={handleUploadModalClose}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto p-3 flex-grow">
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Dataset Name</label>
                <input 
                  type="text"
                  placeholder="Enter dataset name"
                  className={`w-full p-2 text-xs rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Dataset Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {datasetTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedDatasetType(type.id)}
                      className={`p-2 rounded-lg border text-left ${
                        selectedDatasetType === type.id
                          ? (darkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-300')
                          : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{type.icon}</span>
                        <span className="text-xs font-medium">{type.name}</span>
                      </div>
                      <p className="text-[10px] mt-1 opacity-70">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Upload to Server</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {serverOptions.map(server => (
                    <button
                      key={server.id}
                      onClick={() => setSelectedUploadServer(server.id)}
                      className={`p-2 rounded-lg border ${
                        selectedUploadServer === server.id
                          ? (darkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-300')
                          : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')
                      }`}
                    >
                      <div className="text-xs font-medium">{server.name}</div>
                      <div className="flex justify-between text-[10px] mt-1 opacity-70">
                        <span>{server.location}</span>
                        <span>{server.latency} latency</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Upload Files</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  darkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <div className="flex flex-col items-center">
                    <Upload className={`h-8 w-8 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    
                    <p className="text-xs mb-1">Drag and drop your files here, or click to browse</p>
                    <p className="text-[10px] opacity-70 mb-1.5">Supported formats depend on dataset type</p>
                    
                    {(selectedDatasetType === 'images' || selectedDatasetType === 'audio' || selectedDatasetType === 'mixed') && (
                      <div className={`p-2 rounded-lg my-1.5 text-[10px] text-left w-full ${
                        darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <p className="font-medium mb-0.5 flex items-center">
                          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          For {selectedDatasetType} datasets:
                        </p>
                        <p>Please upload your files as a compressed ZIP archive to preserve folder structure and metadata.</p>
                      </div>
                    )}
                    
                    <button className={`py-1 px-2.5 rounded-md text-[10px] ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}>
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Advanced Settings</label>
                <div className={`p-2 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="flex items-center text-xs mb-0.5">
                        <input type="checkbox" className="mr-1.5" />
                        <span>Make dataset public</span>
                      </label>
                      <p className="text-[10px] opacity-70 ml-5">Share with the community</p>
                    </div>
                    
                    <div>
                      <label className="flex items-center text-xs mb-0.5">
                        <input type="checkbox" className="mr-1.5" />
                        <span>Enable versioning</span>
                      </label>
                      <p className="text-[10px] opacity-70 ml-5">Track changes to your dataset</p>
                    </div>
                    
                    <div>
                      <label className="flex items-center text-xs mb-0.5">
                        <input type="checkbox" className="mr-1.5" />
                        <span>Apply automatic labeling</span>
                      </label>
                      <p className="text-[10px] opacity-70 ml-5">For supported dataset types</p>
                    </div>
                    
                    <div>
                      <label className="flex items-center text-xs mb-0.5">
                        <input type="checkbox" className="mr-1.5" />
                        <span>Create train/test split</span>
                      </label>
                      <p className="text-[10px] opacity-70 ml-5">80/20 split by default</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fixed Footer */}
            <div className="flex justify-end gap-2 p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button 
                onClick={handleUploadModalClose}
                className={`px-3 py-1 rounded-md text-xs ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button 
                className={`px-3 py-1 rounded-md text-xs ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Upload Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DatasetView.propTypes = {
  darkMode: PropTypes.bool.isRequired
};

export default DatasetView; 