import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Info, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaHdd, FaMemory, FaMicrochip, FaServer, FaTerminal } from 'react-icons/fa';
import db from './firebase/config';
import SSHKeyManagement from './widgets/SSHKeyManagement';

const DeploymentModal = ({ 
  isOpen, 
  onClose, 
  selectedResource, 
  darkMode, 
  onDeploy, 
  isDeploying,
  deploymentStatus,
  selectedKey,
  onSelectKey,
  computeDetails,
  onAccessDetailsDone,
  auth,
  minerMappings,
  deploymentLogs = []
}) => {
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [selectedAccessMethods] = useState({
    ssh: true,
    jupyter: false,
    tensorboard: false
  });
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [clickedTooltip, setClickedTooltip] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showSSH, setShowSSH] = useState(false);
  const [sshKeys, setSSHKeys] = useState([]);
  const [error, setError] = useState(null);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [localIsDeploying, setLocalIsDeploying] = useState(isDeploying);
  const [localDeploymentStatus, setLocalDeploymentStatus] = useState(deploymentStatus);
  const [showLogs, setShowLogs] = useState(false);

  // Fetch SSH keys for the logged in user
  useEffect(() => {
    const fetchSSHKeys = async () => {
      if (!auth?.currentUser) {
        setSSHKeys([]);
        return;
      }
      
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists() && userSnap.data().ssh_keys) {
          setSSHKeys(userSnap.data().ssh_keys);
        }
      } catch (error) {
        console.error('Error fetching SSH keys:', error);
        setError('Failed to load SSH keys');
      }
    };

    fetchSSHKeys();
  }, [auth?.currentUser]);

  // Handle adding new SSH key
  const handleAddKey = async (keyName, publicKey) => {
    if (!auth?.currentUser) {
      showToast('Please sign in to add SSH keys');
      return;
    }
  
    if (!keyName.trim() || !publicKey.trim()) {
      setError('Both key name and public key are required');
      return;
    }
  
    setIsAddingKey(true);
    setError(null);
  
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const newKey = {
        name: keyName,
        public_key: publicKey,
        created_at: new Date().toISOString()
      };
  
      await updateDoc(userDocRef, {
        ssh_keys: arrayUnion(newKey)
      });
  
      setSSHKeys([...sshKeys, newKey]);
      setIsAddingKey(false);
    } catch (error) {
      console.error('Error adding SSH key:', error);
      setError('Failed to add SSH key');
      setIsAddingKey(false);
    }
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clickedTooltip && !event.target.closest('.info-button')) {
        setClickedTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clickedTooltip]);

  // Add toast handler
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  // Handle SSH key selection
  const handleSshClick = () => {
    console.log('SSH Click - Auth state:', auth?.currentUser);
    
    if (!auth?.currentUser) {
      showToast('Please sign in to add SSH keys');
      return;
    }
    
    setShowSSH(true);
  };

  // Handle key selection
  const handleKeySelect = (key) => {
    onSelectKey(key);
    setShowSSH(false);
  };

  // Handle deploy click with validation
  const handleDeploy = async () => {
    try {
      // Set deploying state
      setLocalIsDeploying(true);
      setLocalDeploymentStatus("Preparing deployment...");
      
      // Debug log to see what we're working with
      console.log('Selected Resource:', selectedResource);
      console.log('Miner Mappings:', minerMappings);

      // Check if user is logged in
      if (!auth?.currentUser) {
        showToast('Please sign in to deploy');
        setLocalIsDeploying(false);
        return;
      }

      // Check for subscription plan
      if (!selectedPlan) {
        showToast('Please select a subscription plan');
        setLocalIsDeploying(false);
        return;
      }

      // Check for SSH key when SSH is enabled
      if (selectedAccessMethods.ssh && !selectedKey?.public_key) {
        showToast('Please select an SSH key for SSH access');
        setLocalIsDeploying(false);
        return;
      }

      // Check for at least one access method
      const hasAccessMethod = Object.values(selectedAccessMethods).some(method => method);
      if (!hasAccessMethod) {
        showToast('Please enable at least one access method');
        setLocalIsDeploying(false);
        return;
      }

      // Check if we have a valid resource
      if (!selectedResource?.id) {
        throw new Error("No compute resource selected");
      }

      // Get the miner ID from the mappings
      const minerId = minerMappings[selectedResource.id];
      if (!minerId) {
        throw new Error("No miner found for this compute resource");
      }

      setLocalDeploymentStatus("Preparing container...");
      const containerId = 'container_' + Math.random().toString(36).substr(2, 9);
      const containerData = {
        id: containerId,
        user_id: auth.currentUser.uid,
        miner_id: minerId,
        resource_id: selectedResource.id,
        ssh_key: selectedKey?.public_key
      };

      console.log('Selected Resource:', selectedResource);
      console.log('Miner ID:', minerId);
      console.log('Container Data:', containerData);

      setLocalDeploymentStatus("Authenticating...");
      const token = await auth.currentUser.getIdToken();
      
      setLocalDeploymentStatus("Sending request to server...");
      console.log('Making API request to create container...');
      
      const response = await fetch("https://orchestrator-gekh.onrender.com/api/v1/containers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(containerData)
      });
      
      console.log('API Response Status:', response.status);
      
      // Simple JSON response parsing
      const responseData = await response.json();
      console.log('API Response Data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.detail || 'Failed to create container');
      }

      setLocalDeploymentStatus("Container deployed successfully!");
      
      // Show success toast
      showToast('Container deployed successfully!');
      
      // Save response data for future reference
      console.log('Deployment successful:', responseData);
      
      // Call the onDeploy callback with the container data so DeploymentConfig
      // doesn't need to create another container
      onDeploy(selectedPlan, selectedAccessMethods, {
        containerId: responseData.container_id,
        containerInfo: responseData.container_info,
        success: responseData.success
      });
    } catch (error) {
      console.error('Deployment error:', error);
      setLocalDeploymentStatus("Deployment failed");
      showToast(error.message);
      setLocalIsDeploying(false);
    }
  };

  const accessMethodInfo = {
    ssh: {
      title: "SSH Access",
      description: "Secure Shell (SSH) provides direct command-line access to your compute instance. You'll use your SSH key to connect securely from your terminal using commands like 'ssh user@hostname'."
    },
    jupyter: {
      title: "Jupyter Notebook",
      description: "Access your compute through a web-based Jupyter Notebook interface. Perfect for interactive Python development and data science workflows. Coming soon!"
    },
    api: {
      title: "API Access",
      description: "RESTful API endpoints for programmatic access to your compute instance. Ideal for automation and integration with other tools. Coming soon!"
    }
  };

  if (!isOpen) return null;

  const specs = selectedResource?.gpu_specs || selectedResource?.cpu_specs || {};
  const isGPU = selectedResource?.resource_type?.toLowerCase() === "gpu";
  const basePrice = 0;

  const plans = [
    {
      id: "standard",
      name: "Standard",
      description: "Dedicated compute",
      compute: isGPU ? `${specs.cuda_cores || 0} CUDA cores` : `${specs.total_cpus || 0} CPU cores`,
      ram: selectedResource?.ram || "0 GB",
      storage: selectedResource?.storage?.capacity || "0 GB",
      computePrice: 0,
      networkPrice: 0,
    },
    {
      id: "weekly",
      name: "Weekly",
      description: "5% savings",
      compute: isGPU ? `${specs.cuda_cores || 0} CUDA cores` : `${specs.total_cpus || 0} CPU cores`,
      ram: selectedResource?.ram || "0 GB",
      storage: selectedResource?.storage?.capacity || "0 GB",
      computePrice: 0,
      networkPrice: 0,
    },
    {
      id: "monthly",
      name: "Monthly",
      description: "10% savings",
      compute: isGPU ? `${specs.cuda_cores || 0} CUDA cores` : `${specs.total_cpus || 0} CPU cores`,
      ram: selectedResource?.ram || "0 GB",
      storage: selectedResource?.storage?.capacity || "0 GB",
      computePrice: 0,
      networkPrice: 0,
    },
  ];

  const selectedPlanDetails = plans.find((plan) => plan.id === selectedPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-3xl mx-4 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} flex flex-col max-h-[65vh]`}>
        {/* Toast Message */}
        {toast.show && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mt-[-1rem] z-50">
            <div className="px-4 py-2 rounded-lg bg-blue-100 border border-blue-200 shadow-lg">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <p className="text-[11px] font-medium text-blue-800">{toast.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <FaServer className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {isGPU 
                  ? (selectedResource?.gpu_specs?.gpu_name || selectedResource?.name || "Unknown GPU")
                  : (selectedResource?.cpu_specs?.cpu_name || selectedResource?.name || "Unknown CPU")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isGPU ? "GPU" : "CPU"} Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-grow">
          {/* Machine Details */}
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-1.5">Machine Details</h3>
            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-4 gap-1">
                <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                  <FaMicrochip className="w-3.5 h-3.5 text-violet-500" />
                    <p className="text-xs font-medium">Compute</p>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {isGPU ? `${specs.cuda_cores || 0} CUDA cores` : `${specs.total_cpus || 0} CPU cores`}
                  </p>
                </div>

                <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                  <FaMemory className="w-3.5 h-3.5 text-violet-500" />
                    <p className="text-xs font-medium">Memory</p>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {selectedResource?.ram || "0 GB"}
                  </p>
                </div>

                <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                  <FaHdd className="w-3.5 h-3.5 text-violet-500" />
                    <p className="text-xs font-medium">Storage</p>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {selectedResource?.storage?.capacity || "0 GB"}
                  </p>
                </div>

                <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                  <FaServer className="w-3.5 h-3.5 text-violet-500" />
                    <p className="text-xs font-medium">Type</p>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {isGPU ? "GPU Server" : "CPU Server"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-1.5">Subscription Plans</h3>
            <div className="grid grid-cols-3 gap-1">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-lg p-2 cursor-pointer transition-all ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                  } ${
                    selectedPlan === plan.id
                      ? 'ring-1 ring-violet-500'
                      : 'hover:ring-1 hover:ring-violet-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{plan.name}</span>
                    {plan.id !== "standard" && (
                      <span className="text-[10px] text-violet-500">
                        {plan.id === "weekly" ? "5% off" : "10% off"}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold mb-1">
                    ${(plan.computePrice + plan.networkPrice).toFixed(2)}
                    <span className="text-[10px] text-gray-500">/hr</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Access Methods Selection - Moved before Cost Breakdown */}
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-1">Access Methods</h3>
            <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-3 gap-1">
                {/* SSH Access */}
                <div
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAccessMethods.ssh 
                      ? `${darkMode ? 'bg-violet-500/10' : 'bg-violet-50'} ring-2 ring-violet-500` 
                      : darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={handleSshClick}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <FaTerminal className="w-3 h-3 text-violet-500" />
                    <p className="text-xs font-medium">SSH Access</p>
                    <div className={`w-full py-1 px-1.5 rounded bg-violet-500/10 text-violet-500 text-[10px] font-medium truncate`}>
                      {selectedKey ? selectedKey.name : auth?.currentUser ? "Select Key" : "Sign in to add keys"}
                    </div>
                    <button
                      className="ml-auto p-0.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-600/50 group relative info-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setClickedTooltip(clickedTooltip === 'ssh' ? null : 'ssh');
                      }}
                      onMouseEnter={() => setActiveTooltip('ssh')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <div className={`absolute z-50 w-96 p-4 text-xs rounded-lg shadow-xl border
                        ${darkMode 
                          ? 'bg-blue-950 border-blue-800 text-white' 
                          : 'bg-white border-blue-300 text-blue-900'} 
                        -translate-y-[calc(100%+1rem)] translate-x-1 right-0 transition-opacity duration-150
                        ${clickedTooltip === 'ssh' || activeTooltip === 'ssh' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                            <FaTerminal className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold mb-1 text-sm ${darkMode ? 'text-white' : 'text-blue-900'}`}>{accessMethodInfo.ssh.title}</p>
                            <p className={`${darkMode ? 'text-blue-100' : 'text-blue-800'} leading-relaxed`}>{accessMethodInfo.ssh.description}</p>
                          </div>
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-blue-300 bg-blue-900/50' : 'text-blue-700 bg-blue-50'} p-2 rounded-md`}>
                          {selectedKey 
                            ? `Using SSH key: ${selectedKey.name}`
                            : 'Click to select an SSH key before enabling SSH access'}
                        </div>
                      </div>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">Secure Shell access</p>
                  <div className={`mt-1.5 text-[10px] font-medium text-center py-0.5 rounded ${
                    selectedAccessMethods.ssh 
                      ? 'bg-violet-500 text-white' 
                      : darkMode 
                        ? 'bg-gray-600 text-gray-400' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {!selectedKey ? 'Select Key' : selectedAccessMethods.ssh ? 'Enabled' : 'Disabled'}
                  </div>
                </div>

                {/* Jupyter Notebook */}
                <div
                  className={`rounded-lg p-1.5 ${
                    darkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <FaServer className="w-3 h-3 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500">Jupyter Notebook</p>
                    <button
                      className="ml-auto p-0.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-600/50 group relative info-button"
                      onClick={() => setClickedTooltip(clickedTooltip === 'jupyter' ? null : 'jupyter')}
                      onMouseEnter={() => setActiveTooltip('jupyter')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <div className={`absolute z-50 w-96 p-4 text-xs rounded-lg shadow-xl border
                        ${darkMode 
                          ? 'bg-blue-950 border-blue-800 text-white' 
                          : 'bg-white border-blue-300 text-blue-900'} 
                        -translate-y-[calc(100%+1rem)] -translate-x-[calc(100%-1rem)] transition-opacity duration-150
                        ${clickedTooltip === 'jupyter' || activeTooltip === 'jupyter' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                            <FaServer className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold mb-1 text-sm ${darkMode ? 'text-white' : 'text-blue-900'}`}>{accessMethodInfo.jupyter.title}</p>
                            <p className={`${darkMode ? 'text-blue-100' : 'text-blue-800'} leading-relaxed`}>{accessMethodInfo.jupyter.description}</p>
                          </div>
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-blue-300 bg-blue-900/50' : 'text-blue-700 bg-blue-50'} p-2 rounded-md`}>
                          Coming soon: Interactive Python development in your browser
                        </div>
                      </div>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">Python development</p>
                  <div className={`mt-1.5 text-[10px] font-medium text-center py-0.5 rounded ${
                    darkMode 
                      ? 'bg-gray-600 text-gray-400' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    Coming Soon
                  </div>
                </div>

                {/* API Access */}
                <div
                  className={`rounded-lg p-1.5 ${
                    darkMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <FaServer className="w-3 h-3 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500">API Access</p>
                    <button
                      className="ml-auto p-0.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-600/50 group relative info-button"
                      onClick={() => setClickedTooltip(clickedTooltip === 'api' ? null : 'api')}
                      onMouseEnter={() => setActiveTooltip('api')}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <div className={`absolute z-50 w-96 p-4 text-xs rounded-lg shadow-xl border
                        ${darkMode 
                          ? 'bg-blue-950 border-blue-800 text-white' 
                          : 'bg-white border-blue-300 text-blue-900'} 
                        -translate-y-[calc(100%+1rem)] -translate-x-[calc(100%-1rem)] transition-opacity duration-150
                        ${clickedTooltip === 'api' || activeTooltip === 'api' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                            <FaServer className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold mb-1 text-sm ${darkMode ? 'text-white' : 'text-blue-900'}`}>{accessMethodInfo.api.title}</p>
                            <p className={`${darkMode ? 'text-blue-100' : 'text-blue-800'} leading-relaxed`}>{accessMethodInfo.api.description}</p>
                          </div>
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-blue-300 bg-blue-900/50' : 'text-blue-700 bg-blue-50'} p-2 rounded-md`}>
                          Coming soon: RESTful API access for automation
                        </div>
                      </div>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">REST API endpoints</p>
                  <div className={`mt-1.5 text-[10px] font-medium text-center py-0.5 rounded ${
                    darkMode 
                      ? 'bg-gray-600 text-gray-400' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown - Moved after Access Methods */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Cost Breakdown</h3>
            <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Compute Cost</span>
                  <span>${selectedPlanDetails.computePrice.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Network Cost</span>
                  <span>${selectedPlanDetails.networkPrice.toFixed(2)}/hr</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Total</span>
                    <span>${(selectedPlanDetails.computePrice + selectedPlanDetails.networkPrice).toFixed(2)}/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Logs Section */}
          {(localIsDeploying || deploymentLogs.length > 0) && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Deployment Logs</h3>
                <button 
                  onClick={() => setShowLogs(!showLogs)}
                  className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {showLogs ? 'Hide Logs' : 'Show Logs'}
                </button>
              </div>
              
              {showLogs && (
                <div className={`rounded-lg p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} max-h-40 overflow-y-auto text-xs font-mono`}>
                  {deploymentLogs.length === 0 ? (
                    <div className="text-center py-2 text-gray-500">No logs available yet</div>
                  ) : (
                    <div className="space-y-2">
                      {deploymentLogs.map((log, index) => (
                        <div key={index} className={`p-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className={`font-medium ${log.message.includes('Error') ? 'text-red-500' : darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {log.message}
                            </span>
                            <span className="text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {log.data && (
                            <div className={`p-1 rounded text-[9px] whitespace-pre-wrap ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              {log.data}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          {computeDetails ? (
            <button
              onClick={onAccessDetailsDone}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700`}
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                {localIsDeploying && (
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-lg">
                    <div className="animate-pulse w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">{localDeploymentStatus || 'Deploying...'}</p>
                  </div>
                )}
                <button
                  onClick={handleDeploy}
                  disabled={localIsDeploying || !Object.values(selectedAccessMethods).some(method => method)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {localIsDeploying ? 'Deploying...' : 'Deploy Now'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add SSHKeyManagement */}
      {showSSH && (
        <SSHKeyManagement
          darkMode={darkMode}
          sshKeys={sshKeys}
          onSelect={handleKeySelect}
          onAddKey={handleAddKey}
          error={error}
          isAddingKey={isAddingKey}
          isLoggedIn={!!auth?.currentUser}
          onClose={() => setShowSSH(false)}
        />
      )}

      {/* Add a simplified success popup message for deployment success */}
      {computeDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onAccessDetailsDone}></div>
          <div className={`relative w-full max-w-md mx-4 rounded-xl p-6 shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} text-center`}>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Deployment Successful!</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your container has been created successfully. 
              You can view and access your deployment under <span className="font-semibold">My Pods</span>.
            </p>
            
            <button
              onClick={onAccessDetailsDone}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DeploymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedResource: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    gpu_specs: PropTypes.object,
    cpu_specs: PropTypes.object,
    resource_type: PropTypes.string,
    hourly_price: PropTypes.number,
    ram: PropTypes.string,
    storage: PropTypes.shape({
      capacity: PropTypes.string
    })
  }).isRequired,
  darkMode: PropTypes.bool.isRequired,
  onDeploy: PropTypes.func.isRequired,
  isDeploying: PropTypes.bool.isRequired,
  deploymentStatus: PropTypes.string,
  selectedKey: PropTypes.shape({
    public_key: PropTypes.string,
    name: PropTypes.string
  }),
  onSelectKey: PropTypes.func,
  computeDetails: PropTypes.shape({
    ip: PropTypes.string,
    sshCommand: PropTypes.string,
    ports: PropTypes.shape({
      ssh: PropTypes.number
    }),
    username: PropTypes.string,
    duration: PropTypes.string,
    containerId: PropTypes.string
  }),
  onAccessDetailsDone: PropTypes.func,
  auth: PropTypes.object.isRequired,
  minerMappings: PropTypes.object.isRequired,
  deploymentLogs: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string,
      message: PropTypes.string,
      data: PropTypes.string
    })
  )
};

export default DeploymentModal; 