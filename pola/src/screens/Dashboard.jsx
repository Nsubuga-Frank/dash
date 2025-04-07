/* eslint-disable react/prop-types */
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ClusterTable from '../components/ClusterTable';
import MetricsModal from '../components/MetricsModal';
import PodsView from '../components/PodsView';
import StatusFilter from '../components/StatusFilter';
import { db } from '../data/firebase';

const Dashboard = ({ darkMode, initialFilter = 'Show All', showTitle = true }) => {
  const [clusters, setClusters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Show All');
  const [validationFilter, setValidationFilter] = useState(initialFilter);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [communeMiners, setCommuneMiners] = useState([]);
  const [bittensorMiners, setBittensorMiners] = useState([]);
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedMinerId, setSelectedMinerId] = useState(null);

  // Set initial validation filter from props
  useEffect(() => {
    setValidationFilter(initialFilter);
  }, [initialFilter]);

  const mapFirestoreStatus = (status) => {
    switch (status) {
      case 'online':
        return 'Running';
      case 'pending_verification':
        return 'Deploying';
      case 'terminated':
        return 'Terminated';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const calculateTimestamp = (createdAt) => {
    if (!createdAt) return 'N/A';
    const timestamp = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateTimeRemaining = (createdAt) => {
    if (!createdAt) return '0h';
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffHours = Math.round((now - created) / (1000 * 60 * 60));
    return `${diffHours}h`;
  };

  const setupMinerStateListener = (minerId) => {
    const q = query(collection(db, 'miner_states'), where('miner_id', '==', minerId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const stateDoc = querySnapshot.docs[0];
          const stateData = stateDoc.data();
          // console.log(`Real-time update for miner ${minerId}:`, stateData);
          const metrics = stateData.current_metrics?.metrics || {};
          const systemInfo = stateData.current_metrics?.system_info || {};
          setClusters((prevClusters) =>
            prevClusters.map((cluster) => {
              if (cluster.id === minerId) {
                const hasIncident =
                  metrics.cpu_usage > 90 ||
                  metrics.memory_usage > 90 ||
                  metrics.disk_usage > 90;
                // console.log(`Updating cluster ${minerId} with metrics:`, metrics);
                return {
                  ...cluster,
                  status:
                    stateData.current_status === 'online'
                      ? 'Running'
                      : stateData.current_status === 'offline'
                      ? 'Failed'
                      : cluster.status,
                  cpuUsage: metrics.cpu_usage || 0,
                  memoryUsage: metrics.memory_usage || 0,
                  diskUsage: metrics.disk_usage || 0,
                  incident: hasIncident,
                  osVersion: systemInfo.os_version || cluster.osVersion,
                  hostname: systemInfo.hostname || cluster.hostname,
                  heartbeatCount: stateData.heartbeat_count || cluster.heartbeatCount,
                  lastHeartbeat: stateData.last_heartbeat
                    ? new Date(stateData.last_heartbeat.seconds * 1000).toLocaleString()
                    : cluster.lastHeartbeat
                };
              }
              return cluster;
            })
          );
        } else {
          console.log(`No state update available for miner ${minerId}`);
        }
      },
      (error) => {
        console.error("Error listening to miner state:", error);
      }
    );
  };

  const fetchComputeResource = async (minerId, computeResourceIds) => {
    try {
      const computeCollection = collection(db, 'compute_resources');
      const resourceSnapshot = await getDocs(computeCollection);
      console.log(
        `[Compute Resource] Fetched resources for miner ${minerId}. Total resources: ${resourceSnapshot.docs.length}`
      );
      console.log('====================================');
      console.log('Resource data:', resourceSnapshot.docs.map((doc) => doc.data()));
      console.log('====================================');
      const matchingResource = resourceSnapshot.docs.find((doc) =>
        computeResourceIds.includes(doc.id)
      );
      if (matchingResource) {
        const resourceData = matchingResource.data();
        console.log(`[Compute Resource] Found resource for miner ${minerId}:`, {
          resourceType: resourceData.resource_type,
          cpuSpecs: resourceData.cpu_specs,
          gpuSpecs: resourceData.gpu_specs,
          name: resourceData.name
        });
        setClusters((prevClusters) =>
          prevClusters.map((cluster) => {
            if (cluster.id === minerId) {
              const resourceType = resourceData.resource_type || 'CPU';
              let deviceName = 'Unknown';
              if (resourceType === 'GPU') {
                deviceName = resourceData.gpu_specs?.gpu_name || 'Unknown GPU';
              } else {
                deviceName = resourceData.cpu_specs?.cpu_name || 'Unknown CPU';
              }
              console.log(`Updating data for miner ${minerId}:`, {
                resourceType,
                deviceName,
                coresPerSocket: resourceData.cpu_specs?.cores_per_socket || 1,
                maxMhz: resourceData.cpu_specs?.cpu_max_mhz,
                minMhz: resourceData.cpu_specs?.cpu_min_mhz
              });
              return {
                ...cluster,
                gpu: {
                  type: resourceType,
                  name: deviceName,
                  count: resourceData.cpu_specs?.cores_per_socket || 1,
                  maxMhz: resourceData.cpu_specs?.cpu_max_mhz,
                  minMhz: resourceData.cpu_specs?.cpu_min_mhz
                },
                clusterType: resourceType === 'CPU' ? 'CPU' : 'GPU'
              };
            }
            return cluster;
          })
        );
      } else {
        console.warn(`[Compute Resource] No resource found for miner ${minerId}`);
      }
    } catch (error) {
      console.error("[Compute Resource] Error fetching resources:", error);
    }
  };

  const fetchCommuneMiners = async () => {
    try {
      const q = query(collection(db, 'commune_miners'));
      const querySnapshot = await getDocs(q);
      const minerIds = querySnapshot.docs.map(doc => doc.data().miner_id);
      setCommuneMiners(minerIds);
    } catch (error) {
      console.error("Error fetching commune miners:", error);
    }
  };

  const fetchBittensorMiners = async () => {
    try {
      const q = query(collection(db, 'bittensor_miners'));
      const querySnapshot = await getDocs(q);
      const minerIds = querySnapshot.docs.map(doc => doc.data().miner_id);
      setBittensorMiners(minerIds);
    } catch (error) {
      console.error("Error fetching bittensor miners:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting data fetch...");
      try {
        setLoading(true);
        const minerCollectionRef = collection(db, 'miners');
        const minersQuery = query(minerCollectionRef);
        const querySnapshot = await getDocs(minersQuery);
        
        // Process miner documents
        const clusterData = [];
        const minerStateUnsubscribes = [];
        
        // Fetch commune miners for badges
        await fetchCommuneMiners();
        
        // Fetch bittensor miners for badges
        await fetchBittensorMiners();
        
        // Process each miner document
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          
          // Skip miners with "running" status to match containers logic
          const minerStatus = data.status?.toLowerCase() || '';
          if (minerStatus === 'running') {
            console.log(`Skipping miner with "running" status: ${doc.id}`);
            continue;
          }
          
          const cluster = {
            id: doc.id,
            name: data.name || 'Unnamed Miner',
            status: mapFirestoreStatus(data.status),
            validationStatus: data.status === 'verified' ? 'Verified' : 'Not Verified',
            location: data.location || 'Unknown',
            created_at: data.created_at || new Date().toISOString(),
            computeResources: data.compute_resources || []
          };
          
          clusterData.push(cluster);
          console.log(`Setting up listener for miner ${doc.id}`);
          const minerStateUnsubscribe = setupMinerStateListener(doc.id);
          minerStateUnsubscribes.push(minerStateUnsubscribe);
          console.log(`Fetching compute resource for miner ${doc.id}`);
          await fetchComputeResource(doc.id, data.compute_resources || []);
        }
        
        const initialClusterData = clusterData.map((miner) => ({
          id: miner.id,
          name: miner.name,
          status: mapFirestoreStatus(miner.status),
          validationStatus: miner.validationStatus,
          location: miner.location,
          created_at: miner.created_at,
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          timestamp: calculateTimestamp(miner.created_at),
          timeRemaining: calculateTimeRemaining(miner.created_at),
          incident: false,
          gpu: {
            type: 'CPU',
            count: 0,
            name: 'Unknown'
          },
          clusterType: '',
          osVersion: 'N/A',
          hostname: 'N/A',
          heartbeatCount: 0,
          lastHeartbeat: 'N/A'
        }));
        console.log("Initial cluster data:", initialClusterData);
        setClusters(initialClusterData);
        setLoading(false);
        console.log("Data fetch complete.");
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        
        // Provide fallback data if there's an error
        const fallbackData = [
          { 
            id: 1, 
            name: 'Sample Node 1', 
            status: 'Running', 
            validationStatus: 'Not Verified',
            location: 'US East',
            cpuUsage: 45,
            memoryUsage: 32,
            diskUsage: 15,
            incident: false,
            timestamp: new Date().toLocaleString(),
            timeRemaining: '4h',
            gpu: { type: 'CPU', name: 'Intel i7', count: 8 },
            clusterType: 'CPU'
          },
          { 
            id: 2, 
            name: 'Sample Node 2', 
            status: 'Running', 
            validationStatus: 'Verified',
            location: 'EU West',
            cpuUsage: 27,
            memoryUsage: 18,
            diskUsage: 32,
            incident: false,
            timestamp: new Date().toLocaleString(),
            timeRemaining: '6h',
            gpu: { type: 'GPU', name: 'NVIDIA A100', count: 1 },
            clusterType: 'GPU'
          },
          { 
            id: 3, 
            name: 'Sample Node 3', 
            status: 'Deploying', 
            validationStatus: 'Not Verified',
            location: 'Asia Pacific',
            cpuUsage: 60,
            memoryUsage: 45,
            diskUsage: 75,
            incident: true,
            timestamp: new Date().toLocaleString(),
            timeRemaining: '2h',
            gpu: { type: 'GPU', name: 'NVIDIA RTX 3090', count: 2 },
            clusterType: 'GPU'
          },
          { 
            id: 4, 
            name: 'Sample Node 4', 
            status: 'Failed', 
            validationStatus: 'Verified',
            location: 'US West',
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            incident: true,
            timestamp: new Date().toLocaleString(),
            timeRemaining: '8h',
            gpu: { type: 'CPU', name: 'AMD EPYC', count: 16 },
            clusterType: 'CPU'
          }
        ];
        setClusters(fallbackData);
      }
    };
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    console.log("Search term changed to:", e.target.value);
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (status) => {
    console.log("Status filter changed to:", status);
    setStatusFilter(status);
  };

  const handleRename = (index) => {
    const newName = prompt("Enter new name for the cluster:");
    if (newName) {
      console.log(`Renaming cluster at index ${index} to:`, newName);
      setClusters((prevClusters) =>
        prevClusters.map((cluster, i) =>
          i === index ? { ...cluster, name: newName } : cluster
        )
      );
    }
  };

  const handleViewMetrics = (index) => {
    console.log("Viewing metrics for cluster at index:", index);
    setSelectedCluster(clusters[index]);
    setShowMetricsModal(true);
  };

  const handleViewPods = (index) => {
    console.log("Viewing pods for cluster at index:", index);
    setSelectedMinerId(clusters[index].id);
    setViewMode('pods');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedMinerId(null);
  };

  // First filter based on validation status
  const validationFilteredClusters = clusters.filter((cluster) => {
    return validationFilter === 'Show All' || 
           cluster.validationStatus === validationFilter;
  });
  
  // Then apply search and status filters
  const filteredClusters = validationFilteredClusters.filter((cluster) => {
    const matchesSearch = 
      cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (cluster.location && cluster.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'Show All' || cluster.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleValidate = async (index) => {
    try {
      const cluster = filteredClusters[index];
      const minerId = cluster.id;
      const minerDocRef = doc(db, 'miners', minerId);
      
      // Toggle validation status
      const newStatus = cluster.validationStatus === 'Verified' ? 'Not Verified' : 'Verified';
      const newStatusValue = newStatus === 'Verified' ? 'verified' : 'pending_verification';
      
      // Update the status field, not validation_status
      await updateDoc(minerDocRef, {
        status: newStatusValue
      });
      
      // Update local state
      setClusters(prevClusters => 
        prevClusters.map(c => 
          c.id === minerId 
            ? {...c, validationStatus: newStatus, status: mapFirestoreStatus(newStatusValue)} 
            : c
        )
      );
      
      toast.success(`Miner ${newStatus === 'Verified' ? 'validated' : 'unvalidated'} successfully.`);
      
    } catch (error) {
      console.error("Error validating miner:", error);
      toast.error("Failed to validate miner");
    }
  };
  
  const handleDelete = async (index) => {
    try {
      const cluster = filteredClusters[index];
      const minerId = cluster.id;
      
      // First check if it's a commune or bittensor miner
      let networkCollectionPath = null;
      let networkDocId = null;
      
      if (communeMiners.includes(minerId)) {
        // Find the commune_miners document that references this miner
        const communeQuery = query(collection(db, 'commune_miners'), where('miner_id', '==', minerId));
        const communeSnapshot = await getDocs(communeQuery);
        if (!communeSnapshot.empty) {
          networkCollectionPath = 'commune_miners';
          networkDocId = communeSnapshot.docs[0].id;
        }
      } else if (bittensorMiners.includes(minerId)) {
        // Find the bittensor_miners document that references this miner
        const bittensorQuery = query(collection(db, 'bittensor_miners'), where('miner_id', '==', minerId));
        const bittensorSnapshot = await getDocs(bittensorQuery);
        if (!bittensorSnapshot.empty) {
          networkCollectionPath = 'bittensor_miners';
          networkDocId = bittensorSnapshot.docs[0].id;
        }
      }
      
      // Delete the network-specific document if found
      if (networkCollectionPath && networkDocId) {
        await deleteDoc(doc(db, networkCollectionPath, networkDocId));
      }
      
      // Delete the miner document
      await deleteDoc(doc(db, 'miners', minerId));
      
      // Remove from local state
      setClusters(prevClusters => prevClusters.filter(c => c.id !== minerId));
      
      // Remove from communeMiners or bittensorMiners arrays if present
      if (communeMiners.includes(minerId)) {
        setCommuneMiners(prev => prev.filter(id => id !== minerId));
      }
      
      if (bittensorMiners.includes(minerId)) {
        setBittensorMiners(prev => prev.filter(id => id !== minerId));
      }
      
      toast.success("Miner deleted successfully");
      
    } catch (error) {
      console.error("Error deleting miner:", error);
      toast.error("Failed to delete miner");
    }
  };

  if (viewMode === 'pods' && selectedMinerId) {
    return <PodsView minerId={selectedMinerId} onBack={handleBackToDashboard} darkMode={darkMode} />;
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} min-h-screen`}>
      {viewMode === 'dashboard' ? (
        <>
          {showTitle && (
            <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6`}>
              <div className="max-w-full mx-auto">
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {validationFilter === 'Verified' 
                    ? 'Verified Nodes' 
                    : validationFilter === 'Not Verified' 
                      ? 'Unverified Nodes' 
                      : 'Registered Miner Nodes'}
                </h1>
              </div>
            </div>
          )}

          <div className="p-6 py-0">
            <div className={`p-3 rounded mb-5 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className={`relative flex-1 max-w-xs ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-0`}>
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search nodes..."
                    className={`block w-full pl-7 pr-2 py-1 text-xs border rounded ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <StatusFilter statusFilter={statusFilter} handleStatusChange={handleStatusChange} darkMode={darkMode} />
              </div>
            </div>
            
            <div className={`p-6 pb-3 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Compute Resources</h2>
                  <div className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    {loading ? 'Loading...' : `${filteredClusters.length} resources`}
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-80">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading compute resources...</p>
                </div>
              ) : filteredClusters.length === 0 ? (
                <div className="text-center pt-12 pb-0">
                  <XCircle className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>No compute resources found</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm || statusFilter !== 'Show All' || validationFilter !== 'Show All'
                      ? 'Try adjusting your search filters'
                      : 'No compute resources in the system'}
                  </p>
                </div>
              ) : (
                <ClusterTable
                  filteredClusters={filteredClusters}
                  handleRename={handleRename}
                  handleValidate={handleValidate}
                  handleDelete={handleDelete}
                  handleViewMetrics={handleViewMetrics}
                  handleViewPods={handleViewPods}
                  darkMode={darkMode}
                  communeMiners={communeMiners}
                  bittensorMiners={bittensorMiners}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <PodsView
          minerId={selectedMinerId}
          onBack={handleBackToDashboard}
          darkMode={darkMode}
        />
      )}
      {showMetricsModal && (
        <MetricsModal
          cluster={selectedCluster}
          onClose={() => setShowMetricsModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default Dashboard;