// ModelSelection.jsx
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Bot, Check, Cloud, Globe, Loader2, Lock, Plus, Search, Server, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import db from '../../../firebase/config';
import APIKeyDialog from './APIKeyDialog';

const ModelSelection = ({ 
  isModalOpen, 
  handleCloseModal, 
  darkMode,
  onModelSelect,
  userId,
  onDeployClick
}) => {
  const [activeTab, setActiveTab] = useState('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [selectedPublicModel, setSelectedPublicModel] = useState(null);
  const [tempSelection, setTempSelection] = useState(null);
  const [publicModels, setPublicModels] = useState([]);
  const [privateContainers, setPrivateContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelKeys, setModelKeys] = useState({});
  const auth = getAuth();

  useEffect(() => {
    if (isModalOpen && auth.currentUser) {
      fetchModels();
      fetchExistingKeys();
    }
  }, [isModalOpen]);

  const fetchExistingKeys = async () => {
    try {
      const apiKeysRef = collection(db, 'api_keys');
      const q = query(apiKeysRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const keys = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        keys[data.modelId] = true;
      });
      
      setModelKeys(keys);
    } catch (error) {
      console.error('Error fetching existing keys:', error);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔍 Starting model fetch process...');
    console.log('🧑 Current userId:', userId);
    
    try {
      // Fetch public models
      const publicResponse = await fetch('https://polaris-ai-tool.onrender.com/models');
      const publicData = await publicResponse.json();
      console.log('====================================');
      console.log('Model response: ', publicResponse);
      console.log('Public models JSON data:', publicData);
      console.log('====================================');
      
      // Check if the response has the expected structure
      if (!publicData || !publicData.models || !Array.isArray(publicData.models)) {
        console.error('❌ Invalid public models response format:', publicData);
        setError('Failed to load public models. Invalid response format.');
        setPublicModels([]);
      } else {
        const filteredPublicModels = publicData.models
          .filter(model => model.visibility === 'public')
          .map(model => ({
            id: model.id,
            model_id: model.model_id?.toLowerCase(),
            name: model.name,
            description: model.description,
            provider: model.provider,
            type: 'public'
          }));
        
        console.log('📊 Public models fetched:', filteredPublicModels.length);
        console.log('📊 Public models data sample:', filteredPublicModels.slice(0, 1));
        setPublicModels(filteredPublicModels);
      }
  
      // Array to store all private models
      let privateModels = [];
  
      if (userId) {
        try {
          console.log('👤 Fetching models for userId:', userId);
          
          // 1. Fetch private containers
          console.log('🔄 Fetching private containers...');
          
          // Create an AbortController with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          try {
            // Try primary endpoint first
            const privateResponse = await fetch('https://polaris-ai-tool.onrender.com/user_containers/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept': 'application/json'
              },
              body: `user_id=${userId}`,
              signal: controller.signal
            });
            
            clearTimeout(timeoutId); // Clear the timeout if successful
            
            const privateData = await privateResponse.json();
            console.log('📦 Private containers response:', privateData);

            if (privateData && privateData.containers) {
              const containerModels = privateData.containers.map(container => ({
                id: container.id || container.container_id,
                model_id: (container.id || container.container_id)?.toLowerCase(),
                name: container.name || `Container ${container.id}`,
                description: container.description || 'Private container',
                provider: 'Private',
                type: 'private',
                modelType: 'container'
              }));
              
              console.log('📦 Container models mapped:', containerModels.length);
              privateModels = [...containerModels];
            } else {
              console.log('⚠️ No containers found in response');
            }
          } catch (containerError) {
            clearTimeout(timeoutId);
            console.error('❌ Error fetching private containers:', containerError);
            console.log('⚠️ Continuing with Firestore deployments only');
            // Continue with other operations even if private containers fetch fails
          }
  
          // 2. Fetch deployed models from Firestore deployments collection
          console.log('🔄 Querying Firestore deployments...');
          const deploymentsRef = collection(db, 'deployments');
          const q = query(deploymentsRef, where('userId', '==', userId.toLowerCase()));
          const querySnapshot = await getDocs(q);
          
          console.log('🔍 Deployments found:', querySnapshot.size);
          
          const deployedModels = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('📄 Deployment document:', doc.id, data);
            console.log('   Status:', data.status);
            console.log('   ModelId:', data.modelId || data.apiName);
            
            if (data.status === 'active') {  // Only include active deployments
              const deployedModel = {
                id: doc.id,
                model_id: (data.modelId || data.apiName)?.toLowerCase(),
                name: data.apiName || `GPT-${data.modelId || 'Model'}`,
                description: `Deployed ${data.modelId || ''} model`,
                provider: 'Deployed',
                type: 'private',
                modelType: 'deployed',
                deployment: data,  // Include full deployment data for reference
                tunnelUrl: data.tunnelUrl || data.endpoints?.base_url
              };
              
              console.log('✅ Adding deployed model:', deployedModel.name);
              deployedModels.push(deployedModel);
            } else {
              console.log('❌ Skipping non-active deployment');
            }
          });
          
          console.log('🚀 Deployed models found:', deployedModels.length);
          
          // Add deployed models to private models array
          privateModels = [...privateModels, ...deployedModels];
          console.log('🔢 Total private models:', privateModels.length);
        } catch (error) {
          console.error('❌ Error fetching private models:', error);
          setError('Failed to load private models. Please try again.');
        }
      } else {
        console.log('⚠️ No userId provided, skipping private model fetch');
      }
  
      console.log('📊 Final public models:', filteredPublicModels.length);
      console.log('🔒 Final private models:', privateModels.length);
      
      setPrivateContainers(privateModels);  // Store all private models in this state
    } catch (error) {
      console.error('❌ Error in fetchModels:', error);
      setError('Failed to load models. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (model) => {
    console.log('🔍 Selected model:', model);
    
    if (model.type === 'public') {
      if (modelKeys[model.id]) {
        setTempSelection(model);
      } else {
        setSelectedPublicModel(model);
        setShowKeyDialog(true);
      }
    } else {
      setTempSelection(model);
    }
  }

  const handleKeySubmit = (apiKey) => {
    setShowKeyDialog(false);
    if (selectedPublicModel) {
      setModelKeys(prev => ({
        ...prev,
        [selectedPublicModel.id]: true
      }));
      setTempSelection(selectedPublicModel);
    }
  };

  const handleConfirmSelection = () => {
    if (tempSelection) {
      console.log('✅ Confirming selection:', tempSelection);
      // Pass the complete model object
      onModelSelect({
        id: tempSelection.id,
        model_id: tempSelection.model_id?.toLowerCase(),
        name: tempSelection.name,
        description: tempSelection.description,
        provider: tempSelection.provider,
        type: tempSelection.type,
        modelType: tempSelection.modelType,
        deployment: tempSelection.deployment,
        tunnelUrl: tempSelection.tunnelUrl
      });
      handleCloseModal();
    }
  };
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Function to get the appropriate icon based on model type
  const getModelIcon = (model) => {
    if (model.type === 'public') {
      return <Globe className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />;
    } else if (model.modelType === 'deployed') {
      return <Server className={`w-5 h-5 mr-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />;
    } else if (model.modelType === 'container') {
      return <Cloud className={`w-5 h-5 mr-2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />;
    } else {
      return <Bot className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />;
    }
  };

  const filteredPublicModels = publicModels
    .filter(model => 
      !searchQuery || // Only apply filter if there's a search query
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      model.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  console.log('🔍 Filtered public models:', filteredPublicModels.length);
  console.log('🔍 Public models before filtering:', publicModels.length);
  console.log('🔍 Current search query:', searchQuery);
  
  const filteredPrivateModels = privateContainers
    .filter(model => 
      !searchQuery || // Only apply filter if there's a search query
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      model.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  console.log('🔍 Filtered private models:', filteredPrivateModels.length);
  console.log('📝 Private models data:', filteredPrivateModels);

  if (!isModalOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[1001] bg-black/50 backdrop-blur-sm flex items-center justify-center"
        onClick={handleOverlayClick}
      >
        <div 
          className={`w-full max-w-2xl h-[32rem] flex flex-col rounded-xl shadow-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Select Model
            </h2>
            <button
              onClick={handleCloseModal}
              className={`p-1 rounded-lg hover:bg-gray-100 ${
                darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <Search className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className={`bg-transparent w-full text-sm focus:outline-none ${
                  darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-3 space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg -mb-px ${
                activeTab === 'public'
                  ? darkMode
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              Public Models
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg -mb-px ${
                activeTab === 'private'
                  ? darkMode
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              Private Models
            </button>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto p-3 ${
            darkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'
          }`}>
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center text-red-500 text-sm">
                {error}
              </div>
            ) : activeTab === 'public' ? (
              <div className="space-y-2">
                {filteredPublicModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                      tempSelection?.id === model.id
                        ? darkMode 
                          ? 'bg-blue-600/20 border-blue-500' 
                          : 'bg-blue-50 border-blue-200'
                        : darkMode 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      {getModelIcon(model)}
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {model.name}
                          </span>
                          {modelKeys[model.id] && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              darkMode 
                                ? 'bg-green-500/10 text-green-400' 
                                : 'bg-green-100 text-green-600'
                            }`}>
                              API Key Added
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {model.description}
                        </span>
                      </div>
                    </div>
                    {tempSelection?.id === model.id && (
                      <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              filteredPrivateModels.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className={`p-3 rounded-full ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  } mb-3`}>
                    <Plus className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    No Private Models
                  </h3>
                  <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Deploy your own model to get started
                  </p>
                  <button
                    onClick={onDeployClick}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Deploy Model
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPrivateModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border ${
                        tempSelection?.id === model.id
                          ? darkMode 
                            ? 'bg-blue-600/20 border-blue-500' 
                            : 'bg-blue-50 border-blue-200'
                          : darkMode 
                            ? 'border-gray-700 hover:bg-gray-700' 
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {getModelIcon(model)}
                      {model.name}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleConfirmSelection}
              className={`w-full py-2 rounded-lg ${
                darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-gray-900'
              }`}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>

      {/* API Key Dialog */}
      <APIKeyDialog
        isOpen={showKeyDialog}
        onClose={() => setShowKeyDialog(false)}
        onSubmit={handleKeySubmit}
        modelName={selectedPublicModel?.name}
        modelId={selectedPublicModel?.id}
        darkMode={darkMode}
      />
    </>
  );
};

export default ModelSelection;