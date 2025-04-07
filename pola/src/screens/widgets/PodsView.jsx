import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowLeft, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import db from '../firebase/config';
import PodCard from './PodCard';

const PodsView = ({ minerId, onBack, darkMode }) => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minerName, setMinerName] = useState('Unknown Miner');

  useEffect(() => {
    const fetchMinerDetails = async () => {
      if (!minerId) return;
      
      try {
        // Fetch miner name
        const minerDocRef = doc(db, 'miners', minerId);
        const unsub = onSnapshot(minerDocRef, (doc) => {
          if (doc.exists()) {
            setMinerName(doc.data().name || 'Unnamed Miner');
          }
        }, (error) => {
          console.error("Error fetching miner:", error);
        });
        
        return unsub;
      } catch (err) {
        console.error("Error setting up miner listener:", err);
      }
    };
    
    const fetchContainers = () => {
      if (!minerId) return;
      
      try {
        setLoading(true);
        
        // Real-time container listener
        const containerQuery = query(
          collection(db, 'container_subscriptions'), 
          where('miner_id', '==', minerId)
        );
        
        const unsubscribe = onSnapshot(containerQuery, (containerSnapshot) => {
          // Format data for PodCard component
          const podData = containerSnapshot.docs
            .map(doc => {
              const data = doc.data();
              if (!data) return null;
              
              // Skip running containers or if desired
              // if (data.status?.toLowerCase() === 'running') return null;
              
              // Format the data structure expected by PodCard
              return {
                podId: doc.id,
                status: data.status || 'Unknown',
                timeRemaining: calculateTimeRemaining(data.expires_at),
                connection: {
                  host: data.host || 'Unknown',
                  ssh_port: data.ssh_port || 'N/A',
                  username: data.username || 'N/A'
                },
                subscriptionDetails: {
                  specs: {
                    compute: data.resource_type || 'CPU',
                    storage: data.storage?.capacity || 'N/A',
                    ram: data.memory || 'N/A',
                    cpu_specs: data.cpu_specs || {},
                    gpu_specs: data.gpu_specs || {}
                  }
                }
              };
            })
            .filter(Boolean);
          
          setPods(podData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching pod data:", error);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up container listener:", error);
        setLoading(false);
      }
    };
    
    const minerUnsubscribe = fetchMinerDetails();
    const containerUnsubscribe = fetchContainers();
    
    // Clean up listeners when component unmounts
    return () => {
      if (minerUnsubscribe) minerUnsubscribe();
      if (containerUnsubscribe) containerUnsubscribe();
    };
  }, [minerId]);
  
  // Helper function to calculate time remaining
  const calculateTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'Unknown';
    
    try {
      const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
      const now = new Date();
      const diffHours = Math.max(0, (expiry - now) / (1000 * 60 * 60));
      return diffHours.toFixed(1);
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPods = pods.filter(pod => {
    if (!pod) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return pod.podId.toLowerCase().includes(searchLower) ||
           pod.status.toLowerCase().includes(searchLower) ||
           pod.connection.host.toLowerCase().includes(searchLower);
  });

  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack}
          className={`flex items-center gap-1 text-sm py-1 px-2 rounded ${
            darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h2 className={`ml-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Containers for {minerName} <span className="text-sm text-gray-500">({minerId || 'Unknown'})</span>
        </h2>
      </div>
      
      <div className={`p-2 rounded mb-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className={`relative flex-1 max-w-xs ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 sm:mb-0`}>
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search containers..."
              className={`block w-full pl-7 pr-2 py-1 text-xs border rounded ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
      
      <div className="rounded overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-[420px]">
            <p className="text-sm">Loading containers...</p>
          </div>
        ) : pods.length === 0 ? (
          <div className="flex justify-center items-center h-[420px]">
            <p className="text-sm text-gray-500">No containers found for this miner</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {filteredPods.map(pod => (
              <PodCard key={pod.podId} pod={pod} darkMode={darkMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PodsView; 