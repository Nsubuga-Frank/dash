import { collection, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, CheckCircle, Database, Info, Server, Terminal, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import db from '../screens/firebase/config';
import { deployModel, getDeploymentById } from '../services/deploymentService';
import DeploymentStatus from './DeploymentStatus';
import ModelHardwareCard from './ModelHardwareCard';

/**
 * A compact modal panel for deploying models to compute resources
 */
const ModelDeployPanel = ({
  darkMode,
  showDeployPanel,
  setShowDeployPanel,
  selectedModel = {},
  onDeploy
}) => {
  const [computeResources, setComputeResources] = useState([]);
  const [resourceAvailability, setResourceAvailability] = useState({});
  const [minerMappings, setMinerMappings] = useState({});
  const [minerStates, setMinerStates] = useState({});
  const [verifiedMiners, setVerifiedMiners] = useState({});
  const [activeSubscriptions, setActiveSubscriptions] = useState({});
  const [resourcesWithStates, setResourcesWithStates] = useState([]);

  const [selectedHardware, setSelectedHardware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [showDeploymentView, setShowDeploymentView] = useState(false);
  const [filterBy, setFilterBy] = useState('all');

  // New state to track the final deployment ID
  const [deploymentId, setDeploymentId] = useState(null);

  // Fetch miners data
  useEffect(() => {
    if (!showDeployPanel) return;

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
  }, [showDeployPanel]);

  // Fetch compute resources
  useEffect(() => {
    if (!showDeployPanel) return;

    const unsubscribeResources = onSnapshot(
      collection(db, 'compute_resources'),
      (snapshot) => {
        const resources = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setComputeResources(resources);
      },
      (error) => {
        console.error('Error fetching compute resources:', error);
        setLoading(false);
      }
    );
    return () => unsubscribeResources();
  }, [showDeployPanel]);

  // Fetch resource availability
  useEffect(() => {
    if (!showDeployPanel) return;

    const unsubscribeAvailability = onSnapshot(
      collection(db, 'resource_availability'),
      (snapshot) => {
        const availabilityData = {};
        snapshot.docs.forEach((doc) => {
          availabilityData[doc.id] = doc.data();
        });
        setResourceAvailability(availabilityData);
      },
      (error) => {
        console.error('Error fetching resource availability:', error);
      }
    );
    return () => unsubscribeAvailability();
  }, [showDeployPanel]);

  // Fetch miner states
  useEffect(() => {
    if (!showDeployPanel) return;

    const unsubMinerStates = onSnapshot(
      collection(db, 'miner_states'),
      (snapshot) => {
        const newMinerStates = {};
        snapshot.forEach((docSnap) => {
          newMinerStates[docSnap.id] = docSnap.data();
        });
        setMinerStates(newMinerStates);
      },
      (error) => {
        console.error('Error fetching miner_states:', error);
      }
    );
    return () => unsubMinerStates();
  }, [showDeployPanel]);

  // Fetch active subscriptions
  useEffect(() => {
    if (!showDeployPanel) return;

    const unsubSubscriptions = onSnapshot(
      collection(db, 'container_subscriptions'),
      (snapshot) => {
        const subsMapping = {};
        snapshot.docs.forEach((doc) => {
          const subData = doc.data();
          if (subData.status === "active") {
            subsMapping[subData.resource_id] = "active";
          }
        });
        setActiveSubscriptions(subsMapping);
      },
      (error) => {
        console.error('Error fetching container_subscriptions:', error);
      }
    );
    return () => unsubSubscriptions();
  }, [showDeployPanel]);

  // Combine all data to form complete resource objects
  useEffect(() => {
    if (!showDeployPanel || computeResources.length === 0 || !selectedModel || !selectedModel.name) return;

    console.log('Recalculating compatibility for model:', selectedModel.name);
    
    // Safe access to requirements with fallbacks
    const requirements = selectedModel.requirements || {};
    const cpuRequirements = requirements.cpu || {};
    const gpuRequirements = requirements.gpu || {};
    
    // Log the actual values we get from the model
    console.log('Model requirements (raw):', { 
      minRam: cpuRequirements.minRam, 
      minVram: gpuRequirements.minVram,
      storage: requirements.storage,
      gpu_required: gpuRequirements.required || false,
      contextLength: requirements.contextLength
    });
    
    // Set explicit default values only if actual values are missing
    const modelRam = cpuRequirements.minRam 
      ? parseInt(cpuRequirements.minRam.replace(/GB|MB/gi, '').trim()) 
      : 16;
      
    const modelVram = gpuRequirements.minVram 
      ? parseInt(gpuRequirements.minVram.replace(/GB|MB/gi, '').trim()) 
      : 8;
    
    const storageRequired = requirements.storage 
      ? parseInt(requirements.storage.replace(/GB|MB/gi, '').trim()) 
      : 20;
    
    console.log('Model requirements (parsed):', { 
      minRam: modelRam, 
      minVram: modelVram, 
      storage: storageRequired,
      gpu_required: gpuRequirements.required || false
    });

    const combined = computeResources.map((resource) => {
      const minerId = minerMappings[resource.id];
      const minerState = minerId ? minerStates[minerId] : null;
      const availabilityEntry = Object.entries(resourceAvailability).find(
        ([, value]) => value.compute_resource_id === resource.id
      );
      const availability = availabilityEntry ? availabilityEntry[1] : null;
      
      const isVerifiedMiner = minerId ? verifiedMiners[minerId] || false : false;
      const subscription_status = activeSubscriptions[resource.id] || "inactive";
      
      // Calculate RAM values
      const ramValue = parseInt(resource.ram) || 0;
      const vramValue = resource.gpu_specs?.memory_size ? parseInt(resource.gpu_specs.memory_size) : 0;
      
      // Check if GPU is required but hardware is CPU
      const gpuRequiredButCpuHardware = gpuRequirements.required && resource.resource_type !== 'GPU';
      
      const isCompatible = !gpuRequiredButCpuHardware && 
                          ramValue >= modelRam && 
                          (resource.resource_type !== 'GPU' || vramValue >= modelVram);
      
      // Debug compatibility for first resource
      if (resource.id === computeResources[0]?.id) {
        console.log('Hardware compatibility check for:', resource.name);
        console.log('RAM check:', ramValue, '>=', modelRam, '=', ramValue >= modelRam);
        console.log('VRAM check:', vramValue, '>=', modelVram, '=', resource.resource_type !== 'GPU' || vramValue >= modelVram);
        if (gpuRequirements.required) {
          console.log('GPU required check:', resource.resource_type === 'GPU', '=', !gpuRequiredButCpuHardware);
        }
        console.log('Overall compatibility:', isCompatible);
      }
      
      // Determine reason for incompatibility
      let compatibilityReason = 'Compatible with model requirements';
      if (!isCompatible) {
        if (gpuRequiredButCpuHardware) {
          compatibilityReason = 'GPU required for this model';
        } else if (ramValue < modelRam) {
          compatibilityReason = `Requires ${modelRam}GB RAM`;
        } else if (resource.resource_type === 'GPU' && vramValue < modelVram) {
          compatibilityReason = `Requires ${modelVram}GB VRAM`;
        }
      }
      
      // Calculate overall availability
      const isOnline = minerState?.current_status === 'online';
      const isAvailable = isOnline && isVerifiedMiner && subscription_status !== 'active' && isCompatible;
      
      if (resource.id === computeResources[0]?.id) {
        console.log('Hardware availability check:', {
          isOnline,
          isVerifiedMiner,
          subscription_status,
          isCompatible,
          isAvailable
        });
      }
      
      return {
        ...resource,
        minerId: minerId || 'N/A',
        minerState: minerState || { current_status: 'unknown' },
        availability: availability || {
          total_capacity: resource.cpu_specs?.total_cpus || 0,
          available_capacity: 0,
          total_storage: parseFloat(resource.storage?.capacity) || 0,
          available_storage: 0,
          active_allocations: 0,
          status: 'unavailable'
        },
        currentStatus: minerState?.current_status || 'unknown',
        isVerifiedMiner,
        subscription_status,
        isCompatible,
        isAvailable,
        compatibilityInfo: compatibilityReason,
        // Pass the exact model requirements - use the direct values from the model where available
        modelRequirements: {
          minRam: cpuRequirements.minRam || `${modelRam} GB`,
          minVram: gpuRequirements.minVram || `${modelVram} GB`,
          storage: requirements.storage || `${storageRequired} GB`,
          contextLength: requirements.contextLength || 8192,
          required: gpuRequirements.required || false
        }
      };
    });
    
    setResourcesWithStates(combined);
    setLoading(false);
    
    // When model changes, clear selected hardware to force user to select appropriate hardware
    setSelectedHardware(null);
    
  }, [computeResources, resourceAvailability, minerMappings, minerStates, activeSubscriptions, verifiedMiners, selectedModel, showDeployPanel]);

  // Filter resources based on compatibility and type
  const filteredResources = resourcesWithStates.filter(resource => {
    if (filterBy === 'compatible') return resource.isCompatible;
    if (filterBy === 'available') return resource.isAvailable;
    if (filterBy === 'gpu') return resource.resource_type === 'GPU';
    if (filterBy === 'cpu') return resource.resource_type === 'CPU';
    return true; // 'all'
  });

  // Handle deployment
  const handleDeploy = async () => {
    if (!selectedHardware) {
      setError('Please select a hardware instance first');
      return;
    }
    
    if (!selectedHardware.isCompatible) {
      setError(`Selected hardware is not compatible with this model: ${selectedHardware.compatibilityInfo}`);
      return;
    }
    
    if (!selectedHardware.isAvailable) {
      // Check why it's not available and provide a specific message
      if (selectedHardware.currentStatus !== 'online') {
        setError('Selected hardware is currently offline. Please select an online resource.');
        return;
      }
      if (!selectedHardware.isVerifiedMiner) {
        setError('Selected hardware is from an unverified provider. Please select a verified resource.');
        return;
      }
      if (selectedHardware.subscription_status === 'active') {
        setError('Selected hardware is already in use. Please select an available resource.');
        return;
      }
      setError('Selected hardware is not available. Please select a different resource.');
      return;
    }
    
    try {
      setError(null);
      setDeploymentStatus('deploying');
      setShowDeploymentView(true);
      
      // Log the full deployment configuration
      console.log('=== DEPLOYMENT CONFIGURATION ===');
      console.log('Model:', {
        id: selectedModel.id,
        huggingface_id: selectedModel.huggingface_id,
        name: selectedModel.name,
        parameters: selectedModel.parameters,
        type: selectedModel.type,
        requirements: selectedModel.requirements
      });
      
      console.log('Hardware:', {
        id: selectedHardware.id,
        name: selectedHardware.name,
        resource_type: selectedHardware.resource_type,
        ram: selectedHardware.ram,
        storage: selectedHardware.storage,
        provider: {
          id: selectedHardware.minerId,
          status: selectedHardware.minerState?.current_status,
          verified: selectedHardware.isVerifiedMiner
        },
        availability: selectedHardware.availability,
        gpu_specs: selectedHardware.gpu_specs,
        cpu_specs: selectedHardware.cpu_specs,
        minerState: selectedHardware.minerState
      });
      
      // Prepare SSH configuration based on provider details
      const sshConfig = {
        enabled: true,
        provider_id: selectedHardware.minerId,
        resource_id: selectedHardware.id
      };
      
      // Add network details if available
      if (selectedHardware.network) {
        // Parse the SSH URL if it exists
        if (selectedHardware.network.ssh) {
          const sshUrl = selectedHardware.network.ssh;
          console.log('SSH URL from resource:', sshUrl);
          
          // Extract host, port from ssh URL (format: ssh://username@host:port)
          try {
            // Remove ssh:// prefix and parse
            const urlPart = sshUrl.replace('ssh://', '');
            const [userHost, port] = urlPart.split(':');
            const [username, host] = userHost.split('@');
            
            // Update the SSH config with parsed details
            sshConfig.username = username;
            sshConfig.host = host;
            sshConfig.port = parseInt(port, 10);
            sshConfig.auth_type = 'password';
            
            // Add password if available
            if (selectedHardware.network.password) {
              sshConfig.password = selectedHardware.network.password;
            }
            
            console.log('Parsed SSH details:', {
              username,
              host,
              port
            });
          } catch (e) {
            console.error('Error parsing SSH URL:', e);
          }
        } else {
          // If SSH URL is not available, try to use other network properties
          if (selectedHardware.network.username) {
            sshConfig.username = selectedHardware.network.username;
          }
          
          if (selectedHardware.network.internal_ip) {
            sshConfig.host = selectedHardware.network.internal_ip;
          }
          
          if (selectedHardware.network.open_ports) {
            sshConfig.port = parseInt(selectedHardware.network.open_ports, 10);
          }
          
          if (selectedHardware.network.password) {
            sshConfig.auth_type = 'password';
            sshConfig.password = selectedHardware.network.password;
          }
        }
      }
      
      console.log('SSH Configuration:', sshConfig);
      
      // Add initial deployment log
      addDeploymentLog(`Starting deployment of ${selectedModel.name} on ${selectedHardware.name}...`);
      addDeploymentLog('Initializing deployment environment...');
      
      // Use the modelRequirements from the selected hardware which already contains the model requirements
      const minRequirements = selectedHardware.modelRequirements || {};
      
      // Log requirements being used for deployment
      addDeploymentLog(`Using requirements: RAM ${minRequirements.minRam}, VRAM ${minRequirements.minVram}, Storage ${minRequirements.storage}`);
      
      // Deploy the model using our service with SSH configuration
      const deployOptions = {
        ssh_config: sshConfig,
        api_name: `${selectedModel.name.toLowerCase().replace(/\s+/g, '-')}-api`
      };
      
      console.log('Deployment options:', deployOptions);
      
      // Deploy the model using our service
      const result = await deployModel(selectedModel, selectedHardware, deployOptions);
      
      if (result && result.success) {
        // Save the deployment ID for status tracking
        setDeploymentId(result.deployment_id);
        
        addDeploymentLog('Deployment has been initialized!');
        addDeploymentLog(`Deployment ID: ${result.deployment_id}`);
        addDeploymentLog('Your deployment is being processed. You can monitor status in the Deployments tab.');
        addDeploymentLog(`Status: ${result.status}`);
        
        // Fetch full deployment details
        const deploymentDetails = await getDeploymentById(result.deployment_id);
        
        // Notify parent
        if (onDeploy) {
          onDeploy(deploymentDetails);
        }
        
        setDeploymentStatus('complete');
      } else {
        throw new Error(result?.error || 'Deployment failed');
      }
    } catch (err) {
      console.error('Deployment error:', err);
      addDeploymentLog(`ERROR: ${err.message}`);
      setDeploymentStatus('failed');
    }
  };

  // Add log entry with timestamp
  const addDeploymentLog = (message) => {
    const timestamp = new Date().toISOString();
    setDeploymentLogs(prev => [...prev, { timestamp, content: message }]);
  };

  // Handle back button in deployment view
  const handleBackToSelection = () => {
    // If deployment is complete or failed, allow going back to selection
    if (deploymentStatus === 'complete' || deploymentStatus === 'failed') {
      setShowDeploymentView(false);
      setDeploymentStatus(null);
      setDeploymentLogs([]);
    } else {
      // Otherwise, just show a warning
      addDeploymentLog('WARNING: Deployment in progress, please wait...');
    }
  };

  // Close panel handler
  const handleClosePanel = () => {
    if (deploymentStatus === 'deploying') {
      // Warn user about closing during deployment
      if (window.confirm('Deployment is in progress. Are you sure you want to close this panel?')) {
        setShowDeployPanel(false);
      }
    } else {
      setShowDeployPanel(false);
    }
  };

  // Navigate to deployments section function
  const navigateToDeployments = () => {
    if (typeof window !== 'undefined') {
      // Dispatch a custom event that AIStudio can listen for
      const deploymentEvent = new CustomEvent('navigateToDeployments', {
        detail: { 
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          huggingfaceId: selectedModel.huggingface_id || selectedModel.id
        }
      });
      window.dispatchEvent(deploymentEvent);
      
      // Close the deployment panel
      setShowDeployPanel(false);
      
      console.log(`Navigating to deployments section for model: ${selectedModel.name}`);
    }
  };

  // Early return if panel shouldn't be shown
  if (!showDeployPanel) return null;
  
  // Display placeholder if no model is selected
  if (!selectedModel || !selectedModel.name) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black/50' : 'bg-black/30'}`}>
        <div className={`w-full max-w-3xl max-h-[85vh] rounded-lg shadow-xl overflow-hidden ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}>
          <div className={`flex items-center justify-between p-3 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className="text-base font-semibold flex items-center">
              <Server className="w-4 h-4 mr-1" />
              Deploy Model
            </h2>
            <button
              onClick={() => setShowDeployPanel(false)}
              className={`p-1 rounded-full hover:bg-opacity-10 ${
                darkMode ? 'hover:bg-white' : 'hover:bg-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className={`p-3 rounded-lg text-center ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Info className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm">Please select a model before attempting deployment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black/50' : 'bg-black/30'}`}>
      <div className={`w-full max-w-3xl max-h-[85vh] rounded-lg shadow-xl overflow-hidden ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            {showDeploymentView && (
              <button
                onClick={handleBackToSelection}
                className={`p-1 rounded-full ${deploymentStatus === 'deploying' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                disabled={deploymentStatus === 'deploying'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-semibold flex items-center">
              <Server className="w-4 h-4 mr-1" />
              {showDeploymentView 
                ? `Deploying ${selectedModel.name}` 
                : `Deploy ${selectedModel.name}`}
            </h2>
          </div>
          <button
            onClick={handleClosePanel}
            className={`p-1 rounded-full hover:bg-opacity-10 ${
              darkMode ? 'hover:bg-white' : 'hover:bg-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-3rem)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className={`m-4 p-3 rounded-lg ${
              darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'
            }`}>
              <div className="flex items-start">
                <Info className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          ) : showDeploymentView ? (
            // Deployment View
            <div className="p-4 space-y-3">
              {/* Status Indicator */}
              <div className={`flex items-center p-3 rounded-lg ${
                deploymentStatus === 'complete' ? (darkMode ? 'bg-green-900/20' : 'bg-green-50') :
                deploymentStatus === 'failed' ? (darkMode ? 'bg-red-900/20' : 'bg-red-50') :
                (darkMode ? 'bg-blue-900/20' : 'bg-blue-50')
              }`}>
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  deploymentStatus === 'complete' ? 'bg-green-500' :
                  deploymentStatus === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'
                }`}></div>
                <span className="text-sm">
                  {deploymentStatus === 'complete' ? 'Deployment Complete' :
                   deploymentStatus === 'failed' ? 'Deployment Failed' : 'Deploying...'}
                </span>
              </div>
              
              {/* Show deployment status component if we have a deployment ID */}
              {deploymentId && deploymentStatus === 'complete' && (
                <DeploymentStatus 
                  deploymentId={deploymentId}
                  darkMode={darkMode}
                />
              )}
              
              {/* If not showing the status component, show the compact configuration */}
              {(!deploymentId || deploymentStatus !== 'complete') && (
                <div className={`p-3 rounded-lg text-sm ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center">
                      <span className="opacity-70 mr-2">Model:</span>
                      <span className="font-medium">{selectedModel.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="opacity-70 mr-2">Hardware:</span>
                      <span className="font-medium">{selectedHardware?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="opacity-70 mr-2">RAM:</span>
                      <span className="font-medium">{selectedHardware?.modelRequirements?.minRam || selectedHardware?.ram}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="opacity-70 mr-2">Type:</span>
                      <span className="font-medium">{selectedHardware?.resource_type}</span>
                    </div>
                    {selectedHardware?.resource_type === 'GPU' && (
                      <div className="flex items-center">
                        <span className="opacity-70 mr-2">VRAM:</span>
                        <span className="font-medium">{selectedHardware?.modelRequirements?.minVram || selectedHardware?.gpu_specs?.memory_size || 'N/A'}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="opacity-70 mr-2">Storage:</span>
                      <span className="font-medium">{selectedHardware?.modelRequirements?.storage || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Logs Panel */}
              <div>
                <div className="flex items-center mb-1">
                  <Terminal className="w-3.5 h-3.5 mr-1.5" />
                  <h3 className="text-sm font-medium">Deployment Logs</h3>
                </div>
                <div className={`font-mono text-xs leading-relaxed overflow-y-auto max-h-64 p-3 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  {deploymentLogs.map((log, idx) => (
                    <div key={idx} className="mb-0.5">
                      <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})} &gt;
                      </span>{' '}
                      <span className={log.content.startsWith('ERROR') 
                        ? (darkMode ? 'text-red-400' : 'text-red-600') 
                        : log.content.startsWith('WARNING')
                        ? (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                        : 'text-inherit'
                      }>
                        {log.content}
                      </span>
                    </div>
                  ))}
                  {deploymentStatus === 'deploying' && (
                    <div className="h-3 w-3 border-l-2 border-blue-500 animate-pulse ml-1"></div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              {deploymentStatus === 'complete' && (
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={navigateToDeployments}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium 
                    ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    <Database className="w-3.5 h-3.5 mr-1" />
                    View Deployments
                  </button>
                  <button 
                    onClick={navigateToDeployments}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium 
                    ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Manage Deployments
                  </button>
                </div>
              )}
              
              {deploymentStatus === 'failed' && (
                <div className="flex justify-end">
                  <button 
                    onClick={handleClosePanel}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
                    } text-white`}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Hardware Selection View
            <div className="p-4">
              {/* Model Requirements - Compact Version */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-medium">Minimal Deployment Requirements</h3>
                  {!selectedModel.requirements && (
                    <span className="text-[9px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded">
                      Requirements estimated
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Memory Panel */}
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex justify-between items-center">
                      <span>Memory</span>
                      {selectedModel.requirements?.cpu?.recommended && (
                        <span className="text-[8px] opacity-70">Rec: {selectedModel.requirements.cpu.recommended} cores</span>
                      )}
                    </div>
                    <div className="font-medium text-xs flex items-center">
                      {selectedModel.requirements?.cpu?.minRam ? (
                        selectedModel.requirements.cpu.minRam
                      ) : (
                        <>
                          <span className="text-yellow-500 mr-1">⚠️</span> 16 GB
                        </>
                      )}
                    </div>
                    {selectedModel.requirements?.cpu?.minCores && (
                      <div className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Min: {selectedModel.requirements.cpu.minCores} cores
                      </div>
                    )}
                  </div>
                  
                  {/* GPU Panel */}
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-900/10' : 'bg-green-50'}`}>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex justify-between items-center">
                      <span>GPU</span>
                      {selectedModel.requirements?.gpu?.required && (
                        <span className="text-[8px] opacity-80 text-red-600 dark:text-red-400 font-medium">Required</span>
                      )}
                    </div>
                    <div className="font-medium text-xs flex items-center">
                      {selectedModel.requirements?.gpu?.minVram ? (
                        selectedModel.requirements.gpu.minVram
                      ) : (
                        <>
                          <span className="text-yellow-500 mr-1">⚠️</span> 8 GB
                        </>
                      )}
                    </div>
                    {selectedModel.requirements?.gpu?.recommendedType && (
                      <div className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        Rec: {selectedModel.requirements.gpu.recommendedType}
                      </div>
                    )}
                  </div>
                  
                  {/* Storage Panel */}
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 flex justify-between items-center">
                      <span>Storage</span>
                      {selectedModel.requirements?.contextLength && (
                        <span className="text-[8px] opacity-70">{parseInt(selectedModel.requirements.contextLength).toLocaleString()} ctx</span>
                      )}
                    </div>
                    <div className="font-medium text-xs flex items-center">
                      {selectedModel.requirements?.storage ? (
                        selectedModel.requirements.storage
                      ) : (
                        <>
                          <span className="text-yellow-500 mr-1">⚠️</span> 20 GB
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Model Parameters */}
                <div className={`mt-1.5 p-1.5 rounded text-[10px] ${darkMode ? 'bg-gray-800/80' : 'bg-gray-100'}`}>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <div>
                      <span className="text-gray-500">Model:</span> <span className="font-medium">{selectedModel.name}</span>
                    </div>
                    {selectedModel.parameters && (
                      <div>
                        <span className="text-gray-500">Parameters:</span> <span className="font-medium">{selectedModel.parameters}</span>
                      </div>
                    )}
                    {selectedModel.type && (
                      <div>
                        <span className="text-gray-500">Type:</span> <span className="font-medium">{selectedModel.type}</span>
                      </div>
                    )}
                    {selectedModel.requirements?.contextLength && (
                      <div>
                        <span className="text-gray-500">Context:</span> <span className="font-medium">{selectedModel.requirements.contextLength}</span>
                      </div>
                    )}
                    {selectedModel.size && (
                      <div>
                        <span className="text-gray-500">Size:</span> <span className="font-medium">{selectedModel.size}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hardware Filter Buttons */}
              <div className="flex mb-3 space-x-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'compatible', label: 'Compatible' },
                  { id: 'available', label: 'Available' },
                  { id: 'gpu', label: 'GPU' },
                  { id: 'cpu', label: 'CPU' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterBy(filter.id)}
                    className={`px-2.5 py-1 text-sm rounded-md transition-colors ${
                      filterBy === filter.id
                        ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                        : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Hardware Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2">
                {filteredResources.map((hardware) => (
                  <ModelHardwareCard
                    key={hardware.id}
                    hardware={hardware}
                    isSelected={selectedHardware?.id === hardware.id}
                    onSelect={(id) => {
                      if (id === null) {
                        setSelectedHardware(null);
                      } else {
                        const selected = resourcesWithStates.find(h => h.id === id);
                        setSelectedHardware(selected);
                        
                        // Log detailed hardware information when selected
                        console.log('Selected hardware details:', {
                          id: selected.id,
                          name: selected.name,
                          type: selected.resource_type,
                          ram: selected.ram,
                          storage: selected.storage?.capacity,
                          provider: {
                            id: selected.minerId,
                            status: selected.minerState?.current_status,
                            verified: selected.isVerifiedMiner
                          },
                          network: selected.network,
                          ...(selected.resource_type === 'GPU' && {
                            gpu_specs: selected.gpu_specs || {}
                          }),
                          ...(selected.resource_type === 'CPU' && {
                            cpu_specs: selected.cpu_specs || {}
                          }),
                          availability: selected.availability,
                          currentStatus: selected.currentStatus
                        });
                      }
                    }}
                    darkMode={darkMode}
                  />
                ))}
              </div>
              
              {filteredResources.length === 0 && (
                <div className={`p-3 rounded-lg text-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <p className="text-sm">No hardware resources found. Please try a different filter.</p>
                </div>
              )}

              {/* Deploy Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleDeploy}
                  disabled={!selectedHardware || !selectedHardware.isAvailable}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                    selectedHardware && selectedHardware.isAvailable
                      ? darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title={selectedHardware ? 
                    (!selectedHardware.isAvailable ? 
                      (!selectedHardware.isCompatible ? 'Hardware not compatible with model requirements' : 
                       selectedHardware.currentStatus !== 'online' ? 'Hardware is offline' :
                       !selectedHardware.isVerifiedMiner ? 'Provider not verified' :
                       selectedHardware.subscription_status === 'active' ? 'Hardware already in use' : 
                       'Hardware not available') : 
                      'Deploy model to this hardware') : 
                    'Select hardware to deploy'
                  }
                >
                  <Server className="w-4 h-4 mr-1.5" />
                  Deploy Model
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ModelDeployPanel.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  showDeployPanel: PropTypes.bool.isRequired,
  setShowDeployPanel: PropTypes.func.isRequired,
  selectedModel: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    ram: PropTypes.string,
    vram: PropTypes.string,
    disk: PropTypes.string,
    cpu_cores: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    architecture: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.string,
    parameters: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    requirements: PropTypes.shape({
      cpu: PropTypes.shape({
        minRam: PropTypes.string,
      }),
      gpu: PropTypes.shape({
        minVram: PropTypes.string,
      }),
      storage: PropTypes.string,
      contextLength: PropTypes.number,
    }),
  }),
  onDeploy: PropTypes.func.isRequired
};

export default ModelDeployPanel; 