import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { db } from '../data/firebase';

const DeploymentsSection = ({ darkMode, userId, onSelectDeployment }) => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch deployments from Firebase
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    
    // Create a query to get all deployments for this user
    const deploymentsRef = collection(db, 'deployments');
    const q = query(
      deploymentsRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    
    // Set up a real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Fetched ${snapshot.docs.length} deployments for user ${userId}`);
      
      const fetchedDeployments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDeployments(fetchedDeployments);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching deployments:', error);
      setLoading(false);
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [userId]);
  
  // Filter deployments based on search query
  const filteredDeployments = deployments.filter(deployment => {
    // If no search query, show all
    if (!searchQuery.trim()) return true;
    
    // Otherwise, filter by name, model, or status
    const query = searchQuery.toLowerCase();
    return (
      (deployment.name?.toLowerCase().includes(query)) ||
      (deployment.model_name?.toLowerCase().includes(query)) ||
      (deployment.model_id?.toLowerCase().includes(query)) ||
      (deployment.status?.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header with title and search */}
      <div className={`sticky top-0 ${
        darkMode
          ? 'border-b-2 border-gray-700 bg-gray-800/95 z-10'
          : 'border-b-2 border-gray-300 bg-gray-50/95 z-10'
      }`}>
        <div className="p-2 flex items-center justify-between">
          <span className="text-xs font-medium">Your Deployments</span>
          <div className="flex items-center">
            <button
              className={`text-xs px-2 py-1 rounded-md ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              New Deploy
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-2 pb-2 relative">
          <input
            type="text"
            placeholder="Search deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-3 py-1 text-xs rounded-md ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
            } border`}
          />
        </div>
      </div>

      {/* Deployments list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredDeployments.length === 0 ? (
          <div className="p-4 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery ? 'No deployments found matching your search.' : 'You have no deployments yet.'}
            </p>
            <button
              className={`mt-3 text-xs px-3 py-1.5 rounded-md ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Deploy a model
            </button>
          </div>
        ) : (
          <div>
            {filteredDeployments.map((deployment) => (
              <div 
                key={deployment.id}
                onClick={() => onSelectDeployment(deployment)}
                className={`
                  p-3 border-b cursor-pointer
                  ${darkMode 
                    ? 'border-gray-700 hover:bg-gray-700/50' 
                    : 'border-gray-200 hover:bg-gray-100/50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {deployment.name || deployment.model_name || 'Unnamed Deployment'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Model: {deployment.model_id || 'Unknown'} 
                    </p>
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs
                    ${getStatusColor(deployment.status, darkMode)}
                  `}>
                    {deployment.status || 'Unknown'}
                  </div>
                </div>
                
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>Created: {formatDate(deployment.created_at)}</span>
                  <span className="mx-2">•</span>
                  <span>ID: {deployment.id.substring(0, 8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format date
function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  
  // Handle Firebase timestamps
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Helper function to get status color
function getStatusColor(status, darkMode) {
  if (!status) return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
  
  const normalizedStatus = status.toLowerCase();
  
  if (['active', 'running', 'completed'].includes(normalizedStatus)) {
    return darkMode ? 'bg-green-800/40 text-green-300' : 'bg-green-100 text-green-800';
  }
  
  if (['queued', 'pending'].includes(normalizedStatus)) {
    return darkMode ? 'bg-orange-800/40 text-orange-300' : 'bg-orange-100 text-orange-800';
  }
  
  if (['deploying', 'creating'].includes(normalizedStatus)) {
    return darkMode ? 'bg-blue-800/40 text-blue-300' : 'bg-blue-100 text-blue-800';
  }
  
  if (['failed', 'error'].includes(normalizedStatus)) {
    return darkMode ? 'bg-red-800/40 text-red-300' : 'bg-red-100 text-red-800';
  }
  
  return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
}

DeploymentsSection.propTypes = {
  darkMode: PropTypes.bool,
  userId: PropTypes.string,
  onSelectDeployment: PropTypes.func
};

export default DeploymentsSection; 