/* eslint-disable react/prop-types */
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import db from '../screens/firebase/config';
import { getStatusColor, getUsageColor } from '../utils/utils';
import ActionDropdown from './ActionDropdown';

const getValidationStatusColor = (status, darkMode) => {
  switch(status) {
    case 'Not Verified':
      return darkMode ? 'bg-red-800/30 text-red-300 border border-red-700/50' : 'bg-red-100 text-red-600 border border-red-200';
    case 'Verified':
      return darkMode ? 'bg-green-800/30 text-green-300 border border-green-700/50' : 'bg-green-100 text-green-600 border border-green-200';
    default:
      return darkMode ? 'bg-gray-800/30 text-gray-300 border border-gray-700/50' : 'bg-gray-100 text-gray-600 border border-gray-200';
  }
};

const getUsageBarColor = (usage) => {
  if (usage <= 30) return 'bg-green-500';
  if (usage <= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

const UsageBar = ({ resourceType, cpuUsage, gpuUsage, memoryUsage, diskUsage }) => {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden flex">
        {resourceType === 'GPU' ? (
          <>
            <div className={`${getUsageBarColor(gpuUsage)}`} style={{ width: `${gpuUsage}%` }} title={`GPU: ${gpuUsage.toFixed(1)}%`}></div>
            <div className={`${getUsageBarColor(memoryUsage)}`} style={{ width: `${memoryUsage}%` }} title={`Memory: ${memoryUsage.toFixed(1)}%`}></div>
          </>
        ) : (
          <>
            <div className={`${getUsageBarColor(cpuUsage)}`} style={{ width: `${cpuUsage}%` }} title={`CPU: ${cpuUsage.toFixed(1)}%`}></div>
            <div className={`${getUsageBarColor(memoryUsage)}`} style={{ width: `${memoryUsage}%` }} title={`Memory: ${memoryUsage.toFixed(1)}%`}></div>
          </>
        )}
        <div className={`${getUsageBarColor(diskUsage)}`} style={{ width: `${diskUsage}%` }} title={`Disk: ${diskUsage.toFixed(1)}%`}></div>
      </div>
      <div className="flex justify-between text-[8px]">
        {resourceType === 'GPU' ? (
          <span className={`${getUsageColor(gpuUsage)} font-medium`}>GPU {gpuUsage.toFixed(1)}%</span>
        ) : (
          <span className={`${getUsageColor(cpuUsage)} font-medium`}>CPU {cpuUsage.toFixed(1)}%</span>
        )}
        <span className={`${getUsageColor(memoryUsage)} font-medium`}>Mem {memoryUsage.toFixed(1)}%</span>
        <span className={`${getUsageColor(diskUsage)} font-medium`}>Disk {diskUsage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const NetworkIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39M11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor"/>
  </svg>
);

const CommuneBadge = ({ darkMode }) => (
  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${darkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
    <NetworkIcon />
    <span className="text-[9px] font-medium">commune</span>
  </div>
);

const BittensorBadge = ({ darkMode }) => (
  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
    <NetworkIcon />
    <span className="text-[9px] font-medium">bittensor</span>
  </div>
);

const ClusterTable = ({ filteredClusters, handleViewMetrics, darkMode, communeMiners, bittensorMiners, onRename, onTerminate }) => {
  const [resourcesMap, setResourcesMap] = useState({});

  const isActiveStatus = (status) => {
    return status === "Running" || status === "Deploying";
  };

  const getStatusPriority = (status) => {
    if (status === "Running") return 0;
    if (status === "Deploying") return 1;
    return 2;
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesCollection = collection(db, 'compute_resources');
        const resourcesSnapshot = await getDocs(resourcesCollection);
        const resourcesData = {};
        resourcesSnapshot.docs.forEach(doc => {
          resourcesData[doc.id] = { id: doc.id, ...doc.data() };
        });
        setResourcesMap(resourcesData);
        console.log("Resources data:", resourcesData);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  const getResourceDetails = (cluster) => {
    // Try direct ID match first
    let resource = resourcesMap[cluster.id];
    
    // If no direct match, try to find by location
    if (!resource && cluster.location) {
      const matchByLocation = Object.values(resourcesMap).find(r => 
        r.location && r.location === cluster.location
      );
      if (matchByLocation) resource = matchByLocation;
    }
    
    // If still no match, try any active resource
    if (!resource) {
      const anyActiveResource = Object.values(resourcesMap).find(r => r.is_active === true);
      if (anyActiveResource) resource = anyActiveResource;
    }

    if (!resource) {
      return {
        type: 'Unknown',
        name: 'Unknown Device',
        specs: {
          memory: 'N/A',
          clock: 'N/A',
          power: 'N/A',
          count: 0,
          cores: 0,
          threads: 0,
          maxClock: 0,
          totalCPUs: 0
        }
      };
    }
    
    // Log the resource type for debugging
    console.log('Resource:', resource.id, 'Resource type:', resource.resource_type);

    // Check resource_type first - highest priority
    if (resource.resource_type === 'GPU') {
      return {
        type: 'GPU',
        name: resource.gpu_specs ? resource.gpu_specs.gpu_name : (resource.name || 'Unknown GPU'),
        specs: {
          memory: resource.gpu_specs ? resource.gpu_specs.memory_size : (resource.memory_size || 'N/A'),
          clock: resource.gpu_specs ? resource.gpu_specs.clock_speed : (resource.clock_speed || 'N/A'),
          power: resource.gpu_specs ? resource.gpu_specs.power_consumption : (resource.power_consumption || 'N/A'),
          count: resource.gpu_specs ? resource.gpu_specs.total_gpus : (resource.total_gpus || 1)
        }
      };
    } else if (resource.cpu_specs || resource.resource_type === 'CPU') {
      // If it has cpu_specs or resource_type is explicitly CPU
      return {
        type: 'CPU',
        name: resource.cpu_specs ? resource.cpu_specs.cpu_name : (resource.name || 'Unknown CPU'),
        specs: {
          cores: resource.cpu_specs ? resource.cpu_specs.cores_per_socket : (resource.cores_per_socket || 0),
          threads: resource.cpu_specs ? resource.cpu_specs.threads_per_core : (resource.threads_per_core || 0),
          maxClock: resource.cpu_specs ? resource.cpu_specs.cpu_max_mhz : (resource.cpu_max_mhz || 0),
          totalCPUs: resource.cpu_specs ? resource.cpu_specs.total_cpus : (resource.total_cpus || 0)
        }
      };
    }
    
    // If we still can't determine the type
    console.log('Could not determine resource type:', resource);
    return {
      type: resource.resource_type || 'Unknown',
      name: resource.name || (resource.resource_type === 'GPU' ? 'Generic GPU' : 'Generic CPU'),
      specs: {
        memory: resource.memory_size || 'N/A',
        clock: resource.clock_speed || 'N/A',
        power: resource.power_consumption || 'N/A',
        count: resource.total_gpus || 0,
        cores: resource.cores_per_socket || 0,
        threads: resource.threads_per_core || 0,
        maxClock: resource.cpu_max_mhz || 0,
        totalCPUs: resource.total_cpus || 0
      }
    };
  };

  const sortedClusters = [...filteredClusters].sort((a, b) => {
    return getStatusPriority(a.status) - getStatusPriority(b.status);
  });

  const renderSpecInfo = (resourceDetails) => {
    if (!resourceDetails) return 'No specs available';
    
    if (resourceDetails.type === 'GPU') {
      return resourceDetails.specs.memory ? `(${resourceDetails.specs.memory})` : '(No memory info)';
    } else if (resourceDetails.type === 'CPU') {
      const cores = resourceDetails.specs.cores || 0;
      const maxClock = resourceDetails.specs.maxClock || 0;
      return `(${cores} cores${maxClock ? `, ${maxClock}MHz` : ''})`;
    }
    return '(No specs available)';
  };

  const renderSystemDetails = (resourceDetails) => {
    if (!resourceDetails) return 'No system details';
    
    if (resourceDetails.type === 'GPU') {
      const clock = resourceDetails.specs.clock || 'N/A';
      const power = resourceDetails.specs.power || 'N/A';
      return `${clock} | ${power}`;
    } else if (resourceDetails.type === 'CPU') {
      const totalCPUs = resourceDetails.specs.totalCPUs || 0;
      const maxClock = resourceDetails.specs.maxClock || 0;
      return `${totalCPUs} threads${maxClock ? ` @ ${maxClock}MHz` : ''}`;
    }
    return 'No system details';
  };

  return (
    <div className="h-[360px] relative rounded-md overflow-hidden">
      <div className={`absolute inset-0 overflow-auto ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
        <table className={`w-full min-w-[1200px] text-[10px] ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <thead className={`${darkMode ? 'bg-gray-800/95 text-gray-300 backdrop-blur-sm' : 'bg-gray-50/95 text-gray-700 backdrop-blur-sm'} sticky top-0 z-10`}>
            <tr>
              <th className="text-left p-1 w-[100px] font-semibold">Timestamp</th>
              <th className="text-left p-1 w-[80px] font-semibold">Status</th>
              <th className="text-left p-1 w-[120px] font-semibold">Validation</th>
              <th className="text-left p-1 font-semibold">Location</th>
              <th className="text-left p-1 font-semibold">Network</th>
              <th className="text-left p-1 font-semibold">Compute Hrs</th>
              <th className="text-left p-1 w-[140px] font-semibold">CPUs/GPUs</th>
              <th className="text-left p-1 w-[140px] font-semibold">Usage</th>
              <th className="text-left p-1 w-[140px] font-semibold">System Details</th>
              <th className="text-left p-1 w-[70px] font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedClusters.map((cluster, index) => {
              const resourceDetails = getResourceDetails(cluster);
              return (
                <tr 
                  key={index} 
                  className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t
                    ${!isActiveStatus(cluster.status) ? 
                      darkMode ? 'bg-red-900/10' : 'bg-red-50/50' 
                      : ''
                    }`}
                >
                  <td className="p-1">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{cluster.timestamp || 'N/A'}</span>
                  </td>
                  <td className="p-1">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(cluster.status)}`}></span>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} font-medium`}>
                        {isActiveStatus(cluster.status) ? cluster.status : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td className="p-1">
                    <span className={`inline-block px-1 py-0.5 rounded-full text-[9px] font-semibold ${getValidationStatusColor(cluster.validationStatus, darkMode)}`}>{cluster.validationStatus}</span>
                  </td>
                  <td className="p-1">
                    <span className={`text-[10px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>{cluster.location}</span>
                  </td>
                  <td className="p-1">
                    {communeMiners && communeMiners.includes(cluster.id) ? (
                      <CommuneBadge darkMode={darkMode} />
                    ) : bittensorMiners && bittensorMiners.includes(cluster.id) ? (
                      <BittensorBadge darkMode={darkMode} />
                    ) : (
                      <span className="text-[9px] text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-1 font-medium">{cluster.timeRemaining}</td>
                  <td className="p-1">
                    <div className="flex flex-col">
                      <span className="font-medium">{resourceDetails.name}</span>
                      <span className="text-[9px] text-gray-500">
                        {resourceDetails.type === 'CPU' ? 'CPU' : 'GPU'} {renderSpecInfo(resourceDetails)}
                      </span>
                    </div>
                  </td>
                  <td className="p-1">
                    {cluster.status !== 'Failed' && cluster.status !== 'Terminated' ? (
                      <UsageBar 
                        resourceType={resourceDetails.type}
                        cpuUsage={cluster.cpuUsage || 0}
                        gpuUsage={cluster.gpuUsage || 0}
                        memoryUsage={cluster.memoryUsage || 0}
                        diskUsage={cluster.diskUsage || 0}
                      />
                    ) : (
                      <span className="text-[9px] text-gray-500">No data</span>
                    )}
                  </td>
                  <td className="p-1">
                    <div className="flex flex-col text-[9px] text-gray-500">
                      <span>{renderSystemDetails(resourceDetails)}</span>
                      <div className="flex items-center gap-0.5">
                        <span>HB:</span>
                        <span className="text-[10px]">{cluster.status === 'Running' ? '❤️' : '🩶'}</span>
                        <span>{cluster.heartbeatCount || 0}</span>
                      </div>
                      <div className="mt-0.5">
                        <span>Last: {cluster.lastHeartbeat || 'Never'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-1 text-left">
                    <ActionDropdown
                      onViewMetrics={handleViewMetrics ? () => handleViewMetrics(index) : null}
                      onRename={onRename ? () => onRename(index) : null}
                      onTerminate={onTerminate ? () => onTerminate(index) : null}
                      clusterStatus={cluster.status}
                      darkMode={darkMode}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClusterTable;