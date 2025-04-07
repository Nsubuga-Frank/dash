import { getAuth } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { AlertTriangle, BarChart3, Clock, Loader, Search, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import db from '../../firebase/config';

// Import components
import ClusterStatsCard from './components/ClusterStatsCard';
import ClusterTable from './components/ClusterTable';
import StatusFilter from './components/StatusFilter';

const NodesMonitoring = ({ darkMode }) => {
  const [clusters, setClusters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Show All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get currently authenticated user
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (userId) {
      // Reference to Firestore 'nodes' collection
      const clustersRef = collection(db, 'nodes');

      // Create a query to filter documents where 'userId' equals the current user's ID
      const clusterQuery = query(clustersRef, where('userId', '==', userId));

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        clusterQuery,
        (snapshot) => {
          // Map through the snapshot docs to get data
          const clusterData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          setClusters(clusterData.length ? clusterData : []);
          setIsLoading(false);
        },
        (error) => {
          console.error(error);
          setClusters([]);
          setIsLoading(false);
        }
      );

      // Cleanup listener on unmount
      return () => unsubscribe();
    } else {
      // If no user logged in, reset clusters
      setClusters([]);
      setIsLoading(false);
    }
  }, []);

  // Stats calculations
  const runningClusters = clusters.filter(c => c.status === 'Running').length;
  const deployingClusters = clusters.filter(c => c.status === 'Deploying').length;
  const failedClusters = clusters.filter(c => c.status === 'Failed').length;
  const totalIncidents = clusters.filter(c => c.incident).length;

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  const handleTerminate = (index) => {
    setClusters((prevClusters) =>
      prevClusters.map((cluster, i) =>
        i === index && (cluster.status === 'Running' || cluster.status === 'Deploying')
          ? { ...cluster, status: 'Stopped', cpuUsage: 0, memoryUsage: 0 }
          : cluster
      )
    );
  };

  const handleRename = (index) => {
    const newName = prompt("Enter new name for the cluster:");
    if (newName) {
      setClusters((prevClusters) =>
        prevClusters.map((cluster, i) =>
          i === index ? { ...cluster, name: newName } : cluster
        )
      );
    }
  };

  // Filter clusters by search term and selected status
  const filteredClusters = clusters.filter(cluster => {
    const matchesSearch = cluster.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Show All' || cluster.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Nodes Monitoring Dashboard</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor and manage your network nodes: fast, simple, and scalable cluster management.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ClusterStatsCard 
            title="Running Nodes" 
            value={isLoading ? "-" : runningClusters} 
            icon={<BarChart3 className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />}
            darkMode={darkMode}
            isLoading={isLoading}
          />
          <ClusterStatsCard 
            title="Deploying Nodes" 
            value={isLoading ? "-" : deployingClusters} 
            icon={<Clock className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />}
            darkMode={darkMode}
            isLoading={isLoading}
          />
          <ClusterStatsCard 
            title="Failed Nodes" 
            value={isLoading ? "-" : failedClusters} 
            icon={<XCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />}
            darkMode={darkMode}
            isLoading={isLoading}
          />
          <ClusterStatsCard 
            title="Active Incidents" 
            value={isLoading ? "-" : totalIncidents} 
            icon={<AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />}
            darkMode={darkMode}
            isLoading={isLoading}
          />
        </div>

        {/* Search and Filters */}
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className={`relative flex-1 max-w-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search nodes..."
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={isLoading}
              />
            </div>

            <StatusFilter 
              statusFilter={statusFilter} 
              handleStatusChange={handleStatusChange} 
              darkMode={darkMode} 
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Clusters Table */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className={`w-8 h-8 animate-spin mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                Loading your node data...
              </p>
            </div>
          ) : (
            <ClusterTable 
              filteredClusters={filteredClusters}
              handleRename={handleRename}
              handleTerminate={handleTerminate}
              darkMode={darkMode}
            />
          )}
        </div>
      </main>
    </div>
  );
};

NodesMonitoring.propTypes = {
  darkMode: PropTypes.bool.isRequired
};

export default NodesMonitoring;