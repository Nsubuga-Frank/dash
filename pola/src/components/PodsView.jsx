import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { AlertTriangle, ArrowLeft, Clock, Search, Server, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast'; // Import toast
import { db } from '../data/firebase';

const PodsView = ({ minerId, onBack, darkMode }) => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minerName, setMinerName] = useState('');
  const [terminating, setTerminating] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [containerToTerminate, setContainerToTerminate] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [terminateLog, setTerminateLog] = useState('');

  useEffect(() => {
    const fetchMinerName = async () => {
      try {
        // Fetch the miner details to display its name
        const minerDoc = await getDocs(query(collection(db, 'miners'), where('__name__', '==', minerId)));
        if (!minerDoc.empty) {
          setMinerName(minerDoc.docs[0].data().name || 'Unnamed Miner');
        }
      } catch (error) {
        console.error("Error fetching miner name:", error);
        toast.error("Failed to fetch miner details");
      }
    };
    
    fetchMinerName();
    
    // Set up real-time listener for containers
    setLoading(true);
    
    // Determine which query to use (try both paths)
    const setupContainerListener = async () => {
      const containerSubscriptionsCollection = collection(db, 'container_subscriptions');
      
      // First try the direct path
      let containerQuery = query(containerSubscriptionsCollection, where('miner_id', '==', minerId));
      let testSnapshot = await getDocs(containerQuery);
      
      // If no results, use the nested path
      if (testSnapshot.empty) {
        console.log(`No containers found with miner_id field, using container_info.miner_id path for listener`);
        containerQuery = query(containerSubscriptionsCollection, where('container_info.miner_id', '==', minerId));
      }
      
      // Set up the real-time listener
      const unsubscribe = onSnapshot(
        containerQuery,
        (snapshot) => {
          if (snapshot.empty) {
            console.log(`No containers found for miner ${minerId}`);
            setContainers([]);
            setLoading(false);
            return;
          }
          
          const containerData = snapshot.docs
            .map(doc => {
              const data = doc.data();
              
              // Get the container ID
              const containerIdInInfo = data.container_info?.container_id;
              const containerId = data.container_id || containerIdInInfo || 'Unknown';
              
              // Get the container status
              const status = (data.status || data.container_info?.status || '').toLowerCase();
              
              // Skip containers where doc.id === container_id
              if (doc.id === containerId) {
                console.log(`Skipping container where doc.id (${doc.id}) matches container_id`);
                return null;
              }
              
              // Skip containers with "running" status
              if (status === 'running') {
                console.log(`Skipping container with "running" status: ${containerId}`);
                return null;
              }
              
              // Get the user ID
              const userId = data.user_id || data.subscription_details?.user_id || '';
              
              // Try to find the SSH key
              const sshKey = data.ssh_key || data.container_info?.ssh_key || '';
              
              return {
                id: doc.id,
                containerId: containerId,
                container_info: data.container_info, // Keep the entire container_info object
                status: data.status || data.container_info?.status || 'Unknown',
                host: data.host || data.container_info?.host || 'Unknown',
                sshPort: data.ssh_port || data.container_info?.ssh_port || 'N/A',
                username: data.username || data.container_info?.username || 'N/A',
                createdAt: formatTimestamp(data.created_at || data.container_info?.created_at),
                expiresAt: formatTimestamp(data.expires_at || data.container_info?.expires_at),
                minerId: data.miner_id || data.container_info?.miner_id || 'Unknown',
                sshKey: sshKey,
                plan: data.subscription_details?.plan || 'standard',
                userId: userId
              };
            })
            // Filter out null entries (skipped containers)
            .filter(Boolean);
          
          setContainers(containerData);
          setLoading(false);
          toast.success("Container data updated");
        },
        (error) => {
          console.error("Error listening to container changes:", error);
          toast.error("Failed to listen for container updates");
          setLoading(false);
        }
      );
      
      // Return the unsubscribe function
      return unsubscribe;
    };
    
    // Set up the listener and store the unsubscribe function
    let unsubscribe;
    setupContainerListener().then(unsub => {
      unsubscribe = unsub;
    }).catch(error => {
      console.error("Error setting up container listener:", error);
      toast.error("Failed to set up container monitoring");
    });
    
    // Clean up the listener when component unmounts or minerId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [minerId]);

  useEffect(() => {
    // After containers are loaded, fetch additional data
    const fetchAdditionalData = async () => {
      if (containers.length === 0) return;
      
      try {
        // Fetch user details for all containers
        const userIds = containers.map(container => container.userId).filter(Boolean);
        if (userIds.length > 0) {
          const uniqueUserIds = [...new Set(userIds)];
          const usersCollection = collection(db, 'users');
          
          // Get user details for each unique userId
          const newUserDetails = { ...userDetails };
          
          for (const userId of uniqueUserIds) {
            if (!newUserDetails[userId]) { // Only fetch if we don't already have the details
              try {
                const userQuery = query(usersCollection, where('__name__', '==', userId));
                const userSnapshot = await getDocs(userQuery);
                
                if (!userSnapshot.empty) {
                  const userData = userSnapshot.docs[0].data();
                  newUserDetails[userId] = {
                    displayName: userData.displayName || 'Unknown User',
                    email: userData.email || 'No Email'
                  };
                } else {
                  newUserDetails[userId] = {
                    displayName: 'Unknown User',
                    email: 'No Email'
                  };
                }
              } catch (error) {
                console.error(`Error fetching user details for ${userId}:`, error);
                newUserDetails[userId] = {
                  displayName: 'Unknown User',
                  email: 'Error fetching details'
                };
              }
            }
          }
          
          setUserDetails(newUserDetails);
        }
        
        // Get SSH keys for containers where we don't have one
        const containersWithoutKeys = containers.filter(container => !container.sshKey);
        if (containersWithoutKeys.length > 0) {
          const updatedContainers = [...containers];
          
          for (const container of containersWithoutKeys) {
            try {
              // Look for a container document with the same ID as our containerId
              const containerCollection = collection(db, 'containers');
              const keyQuery = query(containerCollection, where('__name__', '==', container.containerId));
              const keySnapshot = await getDocs(keyQuery);
              
              if (!keySnapshot.empty) {
                const keyData = keySnapshot.docs[0].data();
                const sshKey = keyData.ssh_key || '';
                
                if (sshKey) {
                  // Update the container with the found SSH key
                  const containerIndex = updatedContainers.findIndex(c => c.id === container.id);
                  if (containerIndex !== -1) {
                    updatedContainers[containerIndex] = {
                      ...updatedContainers[containerIndex],
                      sshKey
                    };
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching SSH key for ${container.containerId}:`, error);
              toast.error(`Failed to fetch SSH key for container ${container.containerId.substring(0, 8)}...`);
            }
          }
          
          setContainers(updatedContainers);
        }
      } catch (error) {
        console.error("Error fetching additional data:", error);
        toast.error("Failed to fetch additional container data");
      }
    };
    
    fetchAdditionalData();
  }, [containers.length]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firebase timestamp or string format
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp.toString();
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    if (expiresAt === 'N/A') return 'N/A';
    
    try {
      const now = new Date();
      const expiry = typeof expiresAt === 'string' 
        ? new Date(expiresAt) 
        : expiresAt;
      
      const diffMs = expiry - now;
      if (diffMs <= 0) return 'Expired';
      
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHrs > 24) {
        const days = Math.floor(diffHrs / 24);
        return `${days}d ${diffHrs % 24}h remaining`;
      }
      
      return `${diffHrs}h ${diffMins}m remaining`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openTerminateDialog = (container) => {
    setContainerToTerminate(container);
    setShowConfirmDialog(true);
  };
  
  const closeTerminateDialog = () => {
    setShowConfirmDialog(false);
    setContainerToTerminate(null);
  };
  
  const handleTerminate = async (container) => {
    // Show a loading toast that we'll update later
    const toastId = toast.loading(`Terminating container ${container.containerId.substring(0, 8)}...`);
    
    try {
      // Use the container object instead of just the ID
      const containerInfo = container.container_info || {};
      const containerId = containerInfo.container_id || container.containerId;
      
      setTerminating(containerId);
      closeTerminateDialog();
      
      // Clear previous logs
      setTerminateLog('');
      
      // Add log for starting termination
      logTerminate(`Starting termination of container ${containerId}`);
      logTerminate(`Using container_info.container_id: ${containerId}`);
      
      const auth = getAuth();
      
      // Check if auth.currentUser is null and handle it
      if (!auth.currentUser) {
        logTerminate("Error: User is not authenticated. Please log in again.");
        toast.error("Authentication error. Please log in again.", { id: toastId });
        throw new Error("User not authenticated (auth.currentUser is null)");
      }
      
      // Add log for getting token
      logTerminate("Getting authentication token...");
      const token = await auth.currentUser.getIdToken();
      logTerminate("Token acquired successfully");
      
      const baseUrl = 'https://orchestrator-gekh.onrender.com';
      
      logTerminate(`Sending termination request for container ${containerId}`);
      
      const response = await fetch(`${baseUrl}/api/v1/containers/${containerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Log the response status and headers
      logTerminate(`Response status: ${response.status} - ${response.statusText}`);
      logTerminate(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers]))}`);
      
      // Get and log the response body
      let responseData;
      let responseText = '';
      try {
        responseText = await response.text();
        logTerminate(`Raw response body: ${responseText}`);
        
        // Try to parse as JSON if possible
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          try {
            responseData = JSON.parse(responseText);
            logTerminate(`Parsed response data: ${JSON.stringify(responseData, null, 2)}`);
          } catch (parseError) {
            logTerminate(`Failed to parse response as JSON: ${parseError.message}`);
          }
        }
      } catch (bodyError) {
        logTerminate(`Error reading response body: ${bodyError.message}`);
      }
      
      if (response.ok) {
        // Update the local state immediately without waiting for the listener
        setContainers(prevContainers => 
          prevContainers.map(c => 
            c.containerId === containerId 
              ? { ...c, status: 'terminated' } 
              : c
          )
        );
        
        // Then try to update Firestore as a backup
        try {
          logTerminate("Updating container status in Firestore...");
          
          const containerRef = doc(db, 'container_subscriptions', container.id);
          await updateDoc(containerRef, {
            status: 'terminated'
          });
          
          logTerminate("Container status updated in Firestore");
        } catch (dbError) {
          logTerminate(`Warning: Could not update status in Firestore: ${dbError.message}`);
          console.warn("Could not update container status in Firestore:", dbError);
          // We don't need to handle this error further since we've already updated the local state
        }
        
        toast.success(`Container ${containerId.substring(0, 8)}... terminated successfully`, { id: toastId });
        logTerminate(`Container ${containerId} terminated successfully`);
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not get error details';
        }
        
        logTerminate(`Failed to terminate container: ${response.status} - ${response.statusText}`);
        logTerminate(`Error details: ${errorText}`);
        
        // Update the local state to show failure
        setContainers(prevContainers => 
          prevContainers.map(c => 
            c.containerId === containerId 
              ? { ...c, status: 'termination_failed', terminationError: `${response.status}: ${response.statusText}` } 
              : c
          )
        );
        
        toast.error(`Failed to terminate: ${response.status} - ${response.statusText}`, { 
          id: toastId,
          duration: 5000 
        });
        
        throw new Error(`Failed to terminate: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error terminating container:", error);
      logTerminate(`Error: ${error.message || 'Unknown error occurred'}`);
      
      // Make sure we show an error toast
      toast.error(`Error: ${error.message || 'Unknown error'}`, { 
        id: toastId,
        duration: 5000 
      });
      
      // Update the local state directly for the error case
      setContainers(prevContainers => 
        prevContainers.map(c => 
          c.id === container.id 
            ? { ...c, status: 'termination_failed', terminationError: error.message } 
            : c
        )
      );
    } finally {
      setTerminating(null);
    }
  };
  
  const logTerminate = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminateLog(prev => `${prev}[${timestamp}] ${message}\n`);
    console.log(`[Termination Log] ${message}`);
  };

  const filteredContainers = containers.filter(container => {
    const matchesSearch = 
      container.containerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'terminated':
        return darkMode ? 'text-red-400' : 'text-red-600';
      case 'failed':
      case 'termination_failed':
        return darkMode ? 'text-red-400' : 'text-red-600';
      case 'deploying':
      case 'pending':
        return darkMode ? 'text-blue-400' : 'text-blue-600';
      default:
        return darkMode ? 'text-green-400' : 'text-green-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status.toLowerCase()) {
      case 'terminated':
        return darkMode ? 'bg-red-900/20' : 'bg-red-50';
      case 'failed':
      case 'termination_failed':
        return darkMode ? 'bg-red-900/20' : 'bg-red-50';
      case 'deploying':
      case 'pending':
        return darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
      default:
        return darkMode ? 'bg-green-900/20' : 'bg-green-50';
    }
  };
  
  // Helper function to format status display
  const getStatusLabel = (container) => {
    const status = container.status.toLowerCase();
    if (status === 'termination_failed') {
      return 'Termination Failed';
    }
    // Capitalize first letter
    return container.status.charAt(0).toUpperCase() + container.status.slice(1);
  };

  return (
    <div>
      {/* Confirmation Dialog */}
      {showConfirmDialog && containerToTerminate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Terminate Container
              </h3>
            </div>
            
            <div className="mb-6">
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to terminate this container? This action cannot be undone.
              </p>
              
              <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} mb-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-gray-500" />
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {containerToTerminate.containerId.substring(0, 8)}...
                  </span>
                </div>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Host:</span>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {containerToTerminate.host}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Status:</span>
                    <span className={getStatusColor(containerToTerminate.status)}>
                      {containerToTerminate.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeTerminateDialog}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleTerminate(containerToTerminate)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  darkMode 
                    ? 'bg-red-700 text-white hover:bg-red-600' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Terminate Container
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Termination Logs Dialog */}
      {terminateLog && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className={`relative w-full max-w-2xl rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[80vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Termination Logs</h3>
              <button
                onClick={() => setTerminateLog('')}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`overflow-auto flex-1 p-2 font-mono text-xs rounded ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <pre className="whitespace-pre-wrap">{terminateLog}</pre>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setTerminateLog('')}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
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
          Containers for {minerName} <span className="text-sm text-gray-500">({minerId})</span>
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
      
      <div className={`rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm overflow-hidden relative`}>
        {loading ? (
          <div className="flex justify-center items-center h-[420px]">
            <p className="text-sm">Loading containers...</p>
          </div>
        ) : containers.length === 0 ? (
          <div className="flex justify-center items-center h-[420px]">
            <p className="text-sm text-gray-500">No containers found for this miner</p>
          </div>
        ) : (
          <div className="h-[420px] relative">
            <div className={`absolute inset-0 overflow-x-auto overflow-y-auto ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
              <table className={`w-full min-w-[1200px] text-xs ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <thead className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'} sticky top-0 z-10`}>
                  <tr>
                    <th className="text-left p-2 font-semibold">Container ID</th>
                    <th className="text-left p-2 w-[90px] font-semibold">Status</th>
                    <th className="text-left p-2 w-[90px] font-semibold">Plan</th>
                    <th className="text-left p-2 w-[120px] font-semibold">Host</th>
                    <th className="text-left p-2 w-[80px] font-semibold">Port</th>
                    <th className="text-left p-2 w-[100px] font-semibold">Username</th>
                    {/* <th className="text-left p-2 w-[150px] font-semibold">Public Key</th> */}
                    <th className="text-left p-2 w-[200px] font-semibold">User</th>
                    <th className="text-left p-2 w-[120px] font-semibold">Created/Expires</th>
                    <th className="text-left p-2 w-[120px] font-semibold">Time Remaining</th>
                    <th className="text-center p-2 w-[100px] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContainers.map((container) => (
                    <tr key={container.id} className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Server className="w-3 h-3 text-gray-500" />
                          <span className="font-medium" title={container.containerId}>
                            {container.containerId}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBgColor(container.status)} ${getStatusColor(container.status)}`}>
                          {getStatusLabel(container)}
                        </span>
                        {container.terminationError && (
                          <div className="text-[0.65rem] mt-1 text-red-500 max-w-[120px] truncate" title={container.terminationError}>
                            {container.terminationError}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <span className="font-medium capitalize">{container.plan}</span>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{container.host}</span>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{container.sshPort}</span>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{container.username}</span>
                      </td>
                      {/* <td className="p-2">
                        <div className="flex items-center">
                          <code className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} truncate max-w-[120px]`} title={container.sshKey}>
                            {container.sshKey ? (container.sshKey.substring(0, 15) + '...') : 'No key'}
                          </code>
                        </div>
                      </td> */}
                      <td className="p-2">
                        {container.userId && userDetails[container.userId] ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{userDetails[container.userId].displayName}</span>
                            <span className="text-[0.65rem] text-gray-500">{userDetails[container.userId].email}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unknown User</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col">
                          <span className="text-[0.65rem] text-gray-500">Created: {container.createdAt}</span>
                          <span className="text-[0.65rem] text-gray-500">Expires: {container.expiresAt}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        {container.status.toLowerCase() !== 'terminated' ? (
                          <span className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRemaining(container.expiresAt)}
                          </span>
                        ) : (
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {container.status.toLowerCase() !== 'terminated' && 
                         container.status.toLowerCase() !== 'termination_failed' && (
                          <button
                            onClick={() => openTerminateDialog(container)}
                            disabled={terminating === container.containerId || terminating === (container.container_info?.container_id || container.containerId)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              terminating === container.containerId || terminating === (container.container_info?.container_id || container.containerId)
                                ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                                : `${darkMode ? 'bg-red-800/70 text-red-300 hover:bg-red-700/70' : 'bg-red-100 text-red-600 hover:bg-red-200'}`
                            }`}
                          >
                            {terminating === container.containerId || terminating === (container.container_info?.container_id || container.containerId) ? 'Terminating...' : 'Terminate'}
                          </button>
                        )}
                        {(container.status.toLowerCase() === 'terminated' || 
                          container.status.toLowerCase() === 'termination_failed') && (
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodsView;