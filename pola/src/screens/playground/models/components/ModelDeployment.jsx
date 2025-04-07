import { getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowLeft, Info } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '../../../../lib/utils';
import db from '../../../firebase/config';
import { getRecommendation } from '../utils/recommendationLogic';
import { transformHardwareData } from '../utils/transformHardwareData';
import ErrorModal from './ErrorNotification';
import InstancesList from './InstanceCard';
import { RegionCards } from './RegionCards';
import { ToggleButton } from './ToggleButton';
import DeploymentTable from './models/DeploymentTable';

export default function ModelDeployment({
  model,
  darkMode,
  onBack,
  isExpanded,
  isRightExpanded,
  isDeploying,
  setIsDeploying
}) {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState('CPU');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [hardwareList, setHardwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ message: null, details: null });
  const [loadingError, setLoadingError] = useState(null);
  const [showDeploymentTable, setShowDeploymentTable] = useState(false);
  const [deploymentName, setDeploymentName] = useState(
    `${model.name?.toLowerCase()}-${Math.floor(10000 + Math.random() * 90000)}`
  );

  // Custom animation styles for beta badge
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        setCurrentUser(user);
      } else {
        console.log('No user authenticated');
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch compute resources and miners
  useEffect(() => {
    console.log('🚀 Starting fetch of compute resources and miners...');
    const unsubscribe = onSnapshot(
      collection(db, 'compute_resources'),
      async (snapshot) => {
        try {
          const hardwarePromises = snapshot.docs.map(async (doc) => {
            console.log(`📘 Processing compute resource: ${doc.id}`);
            const rawData = doc.data();
            const hardwareData = { id: doc.id, ...rawData };
            const networkData = rawData.network || {};

            let sshDetails = null;
            if (networkData.ssh) {
              try {
                const url = new URL(networkData.ssh);
                sshDetails = {
                  protocol: url.protocol.replace(':', ''),
                  username: url.username,
                  hostname: url.hostname,
                  port: url.port
                };
              } catch (parseError) {
                console.error('Error parsing SSH string:', parseError);
                const sshWithoutProtocol = networkData.ssh.replace(/^ssh:\/\//, '');
                const [userAndHost, port] = sshWithoutProtocol.split(':');
                const [username, hostname] = userAndHost.split('@');
                sshDetails = {
                  protocol: 'ssh',
                  username: username || '',
                  hostname: hostname || '',
                  port: port || '',
                };
              }
            }

            hardwareData.parsed_ssh = sshDetails;
            hardwareData.parsed_password = networkData.password;

            const minerQuery = query(
              collection(db, 'miners'),
              where('compute_resources', 'array-contains', doc.id)
            );
            const minerSnapshot = await getDocs(minerQuery);
            
            if (!minerSnapshot.empty) {
              hardwareData.miners = minerSnapshot.docs.map((minerDoc) => ({
                id: minerDoc.id,
                ...minerDoc.data(),
              }));
            } else {
              hardwareData.miners = [];
            }

            return hardwareData;
          });

          const hardware = await Promise.all(hardwarePromises);
          setHardwareList(hardware);
          setLoading(false);
          setLoadingError(null);
        } catch (err) {
          console.error('❌ Error in data fetching:', err);
          setLoadingError(err.message);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Transform and filter instances
  const transformedInstances = useMemo(() => {
    return transformHardwareData(hardwareList);
  }, [hardwareList]);

  const regions = useMemo(() => {
    const uniqueRegions = new Set(transformedInstances.map(inst => inst.region));
    return Array.from(uniqueRegions);
  }, [transformedInstances]);

  const filteredInstances = useMemo(() => {
    if (!model?.requirements) {
      console.warn('Model requirements missing:', model);
      return [];
    }

    return transformedInstances
      .filter((inst) => {
        const matchesType = inst.resource_type === selectedHardware;
        const matchesRegion = selectedRegion === 'All' || inst.region === selectedRegion;
        return matchesType && matchesRegion;
      })
      .map(inst => {
        const recommendationResult = getRecommendation(model.requirements, inst);
        return {
          ...inst,
          recommendation: recommendationResult.recommendation,
          missingRequirements: recommendationResult.missingRequirements,
          recommendation_notes: recommendationResult.recommendationNotes,
          isSmallModel: recommendationResult.smallModel
        };
      });
  }, [selectedHardware, selectedRegion, model, transformedInstances]);

  const handleDeploy = async () => {
    if (!isDeployEnabled || !currentUser) {
      setError({ 
        message: !selectedInstance ? 'Please select an instance first' : 'User authentication required' 
      });
      return;
    }
  
    setIsDeploying(true);
  
    try {
      const payload = {
        model_id: model.name.toLowerCase(),
        user_id: currentUser.uid.toLowerCase(),
        api_name: deploymentName,
        ssh_config: {
          host: selectedInstance?.ssh_config?.host || "",
          username: selectedInstance?.ssh_config?.username || "",
          port: selectedInstance?.ssh_config?.port || "",
          password: selectedInstance?.ssh_config?.password || "",
        },
      };
  
      const response = await fetch('https://c389-24-83-13-62.ngrok-free.app/api/v1/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DeploymentClient/1.0',  // Add custom user agent 
          'Cache-Control': 'no-cache'
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("Deployment response:", data);
  
      if (!response.ok) {
        throw new Error(data.detail || 'Deployment failed');
      }
  
      // Save to monitor collection - now we'll set isPolling to true
      // and let the server-side monitor service handle the polling
      await addDoc(collection(db, 'monitor'), {
        deploymentId: data.deployment_id,
        modelId: model.name,
        userId: currentUser.uid,
        status: data.status,
        createdAt: new Date(data.created_at).toISOString(),
        monitorUrl: `https://c389-24-83-13-62.ngrok-free.app${data.monitor_url}`,
        isPolling: true
      });
  
      // Show deployment table instead of going back
      setShowDeploymentTable(true);
  
    } catch (error) {
      console.error("Deployment error:", error);
      setError({
        message: 'Deployment failed',
        details: error.message
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSelectInstance = (instance) => {
    setSelectedInstance(instance);
  };

  const isDeployEnabled = useMemo(() => {
    return (
      deploymentName?.trim().length > 0 &&
      selectedInstance &&
      selectedInstance.recommendation !== 'not_recommended' &&
      currentUser !== null
    );
  }, [deploymentName, selectedInstance, currentUser]);

  const estimatedCost = selectedInstance?.price || 0;

  if (loadingError) {
    return (
      <div className={cn(
        "mb-4 p-3 rounded-lg text-sm",
        darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
      )}>
        <p>Error loading hardware data: {loadingError}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs underline mt-1 opacity-80 hover:opacity-100"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render deployment table if deployment was successful
  if (showDeploymentTable) {
    return (
      <DeploymentTable
        currentUser={currentUser}
        darkMode={darkMode}
        isExpanded={isExpanded}
        isRightExpanded={isRightExpanded}
        onBack={() => {
          setShowDeploymentTable(false);
          onBack();
        }}
      />
    );
  }

  // Render deployment form
  return (
    <div className={cn(
      'fixed top-16 bottom-16 transition-all p-4 duration-300 rounded-md shadow flex flex-col overflow-y-auto',
      isExpanded ? 'left-60' : 'left-20',
      isRightExpanded ? 'right-64' : 'right-14',
      darkMode ? 'bg-[#1b212c] border border-gray-800' : 'bg-white border border-gray-200'
    )}>
      <div
        className={cn(
          "flex items-center gap-1 cursor-pointer group",
          darkMode ? 'text-gray-300' : 'text-gray-600'
        )}
        onClick={onBack}
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
        <span className="text-xs font-medium">Model Catalogue</span>
      </div>

      <hr className={cn('my-2', darkMode ? 'border-gray-700' : 'border-gray-200')} />

      <ErrorModal
        isOpen={!!error.message}
        message={error.message || ''}
        errorDetails={error.details}
        onClose={() => setError({ message: null, details: null })}
        onRetry={handleDeploy}
        darkMode={darkMode}
      />

      <div className={cn(
        'rounded-lg shadow-sm border space-y-3 relative',
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        {/* Beta ribbon in the corner */}
        <div className="absolute -top-2 -right-2 z-20 group">
          <div className={cn(
            "px-4 py-1.5 flex items-center gap-1",
            "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
            "rounded-md shadow-lg transform rotate-3",
            "hover:rotate-0 transition-all duration-300",
            "border-2 border-white dark:border-gray-800"
          )}
          style={{
            backgroundSize: '200% 200%',
            animation: 'gradient 6s ease infinite'
          }}>
            <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-white text-sm uppercase tracking-wider">Beta</span>
          </div>
          <div className={cn(
            "absolute top-full right-0 mt-2 px-3 py-2 rounded-md",
            "bg-gray-800 text-white text-xs whitespace-nowrap",
            "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity",
            "pointer-events-none z-30"
          )}>
            AI Studio is currently in beta
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 py-2 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded flex items-center justify-center text-xs shadow"
              style={{
                backgroundColor: `${model.provider?.color ?? '#000'}15`,
                color: model.provider?.color,
              }}
            >
              {model.provider?.charAt(0).toUpperCase()}
            </div>
            <h1 className={cn(
              'text-lg font-semibold flex items-center gap-1',
              darkMode ? 'text-white' : 'text-gray-800'
            )}>
              Deploy {model.name}
            </h1>
          </div>
        </div>

        <div className="px-4 space-y-1">
          <div className="flex items-center gap-1">
            <label className={cn('text-xs font-medium', darkMode ? 'text-gray-200' : 'text-gray-700')}>
              Set deployed model name
            </label>
            <Info className="h-3 w-3 text-gray-400" />
          </div>
          <input
            type="text"
            value={deploymentName}
            onChange={(e) => setDeploymentName(e.target.value)}
            className={cn(
              'w-full p-1.5 border rounded text-xs transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none',
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-200 text-gray-800'
            )}
          />
        </div>

        <hr className={cn('border-gray-200', darkMode && 'border-gray-700')} />

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <div className={cn(
                'h-4 w-4 grid place-items-center rounded shadow-sm',
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              )}>
                ⚙️
              </div>
              <h2 className={cn('font-medium text-sm', darkMode ? 'text-white' : 'text-gray-800')}>
                Hardware Configuration
              </h2>
            </div>
          </div>
          <p className={cn('text-xs mb-4', darkMode ? 'text-gray-300' : 'text-gray-600')}>
            Configure compute selections from available infrastructure and regions.
          </p>

          <div className="space-y-6">
            <div className="inline-flex p-0.5 bg-gray-200 rounded-full dark:bg-blue-900">
              {['CPU', 'GPU'].map((type) => (
                <ToggleButton
                  key={type}
                  type={type}
                  selected={selectedHardware === type}
                  onClick={(selected) => {
                    setSelectedHardware(selected);
                    setSelectedInstance(null);
                  }}
                  darkMode={darkMode}
                />
              ))}
            </div>

            <div className="space-y-3">
              <h3 className={cn('text-xs font-medium', darkMode ? 'text-gray-200' : 'text-gray-700')}>
                Select from available regions
              </h3>
              <RegionCards
                locations={regions}
                selectedLocation={selectedRegion}
                setSelectedLocation={(location) => {
                  setSelectedRegion(location);
                  setSelectedInstance(null);
                }}
                darkMode={darkMode}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <InstancesList
                instances={filteredInstances}
                darkMode={darkMode}
                onSelectInstance={handleSelectInstance}
                selectedInstance={selectedInstance}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center mt-2 justify-between">
        <div className="text-xs">
          <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Estimated cost:</div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-blue-400 text-base font-medium">
              ${estimatedCost.toFixed(2)}
            </span>
            <span className={cn(darkMode ? 'text-gray-500' : 'text-gray-400')}>/ h</span>
            <span className={cn(darkMode ? 'text-gray-500' : 'text-gray-400')}>(while running)</span>
          </div>
        </div>

        <button
          disabled={!isDeployEnabled || isDeploying}
          className={cn(
            "px-4 py-1.5 rounded-md font-medium transition-all duration-200",
            isDeployEnabled && !isDeploying
              ? "bg-blue-500 hover:bg-blue-600 text-white hover:shadow cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
          onClick={handleDeploy}
        >
          {isDeploying ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Deploying...</span>
            </div>
          ) : (
            `Deploy ${model.name}`
          )}
        </button>
      </div>
    </div>
  );
}

// Add PropTypes validation
ModelDeployment.propTypes = {
  model: PropTypes.shape({
    name: PropTypes.string,
    provider: PropTypes.shape({
      color: PropTypes.string,
      charAt: PropTypes.func
    }),
    requirements: PropTypes.shape({
      cpu_cores: PropTypes.number,
      ram_gb: PropTypes.number,
      gpu_memory_gb: PropTypes.number,
      storage_gb: PropTypes.number,
      requires_gpu: PropTypes.bool
    })
  }).isRequired,
  darkMode: PropTypes.bool,
  onBack: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  isRightExpanded: PropTypes.bool,
  isDeploying: PropTypes.bool,
  setIsDeploying: PropTypes.func.isRequired
};