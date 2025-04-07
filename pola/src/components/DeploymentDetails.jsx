import { getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { AlertTriangle, ArrowRight, Check, ChevronLeft, ChevronRight, Code, Cpu, Info, RefreshCw, RotateCw, Terminal, Trash, Upload, X, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../data/firebase';

// Import API_BASE_URL from deploymentService
const API_BASE_URL = 'https://aphrodite-engine.onrender.com';

// Skeleton loader for a deployment card
const DeploymentCardSkeleton = memo(({ darkMode }) => (
  <div className={`relative overflow-hidden rounded border shadow-sm animate-pulse ${
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`}>
    <div className="p-2.5">
      <div className="flex items-center mb-1.5">
        <div className={`p-1 rounded-md mr-1.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div className="h-3 w-3" />
        </div>
        <div className="flex-1">
          <div className={`h-4 w-20 mb-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-2 w-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
      
      <div className="space-y-1 mt-2">
        <div className={`h-2 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <div className={`h-2 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      </div>
    </div>
  </div>
));

DeploymentCardSkeleton.displayName = 'DeploymentCardSkeleton';

DeploymentCardSkeleton.propTypes = {
  darkMode: PropTypes.bool
};

// Skeleton loader for the overview tab
const OverviewSkeleton = memo(({ darkMode }) => (
  <div className="p-6 space-y-6 overflow-auto animate-pulse">
    <div className={`p-5 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center mb-4">
        <div className={`h-4 w-4 mr-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <div className={`h-4 w-40 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-3 w-${i % 2 === 0 ? '20' : 'full'} rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        ))}
      </div>
    </div>
    
    <div className={`p-5 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className={`h-4 w-32 mb-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      <div className={`h-10 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
    </div>
  </div>
));

OverviewSkeleton.displayName = 'OverviewSkeleton';

OverviewSkeleton.propTypes = {
  darkMode: PropTypes.bool
};

// Skeleton loader for the API tab
const ApiSkeleton = memo(({ darkMode }) => (
  <div className="p-6 space-y-6 overflow-auto animate-pulse">
    <div className={`p-5 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className={`h-4 w-32 mb-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      <div className={`h-3 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      <div className={`h-3 w-3/4 mt-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
    </div>
    
    {[...Array(2)].map((_, i) => (
      <div key={i} className={`rounded-lg shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div className={`h-4 w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`h-3 w-full mt-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
        <div className="p-4">
          <div className={`h-3 w-24 mb-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-20 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    ))}
  </div>
));

ApiSkeleton.displayName = 'ApiSkeleton';

ApiSkeleton.propTypes = {
  darkMode: PropTypes.bool
};

// Skeleton loader for the Console tab
const ConsoleSkeleton = memo(({ darkMode }) => (
  <div className="p-4 h-full flex flex-col animate-pulse">
    <div className={`p-4 rounded-t-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className="flex items-center mb-3">
        <div className={`h-4 w-4 mr-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <div className={`h-4 w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      </div>
      
      <div className={`h-8 w-64 mb-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      
      <div className="grid grid-cols-3 gap-4 mb-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        ))}
      </div>
    </div>
    
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className={`flex-1 p-4 ${darkMode ? 'bg-gray-750 border-l border-r border-gray-700' : 'bg-gray-50 border-l border-r border-gray-200'}`}>
        <div className="flex items-center justify-center h-full">
          <div className={`h-4 w-48 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
      
      <div className={`p-3 rounded-b-lg border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex">
          <div className={`flex-1 h-10 rounded-l-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`w-10 h-10 rounded-r-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  </div>
));

ConsoleSkeleton.displayName = 'ConsoleSkeleton';

ConsoleSkeleton.propTypes = {
  darkMode: PropTypes.bool
};

const DeploymentDetails = ({ 
  darkMode, 
  selectedDeployment, 
  setSelectedDeployedModel
}) => {
  // Add formatTimestamp function
  const formatTimestamp = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleString();
  };
  
  // State for deployments data
  const [deployedModels, setDeployedModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add state for tabs
  const [activeTab, setActiveTab] = useState('overview');
  
  // Add state for usage data
  const [usageData, setUsageData] = useState(null);
  
  // State for logs
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logStreamActive, setLogStreamActive] = useState(false);
  const logStreamRef = useRef(null);
  const logContainerRef = useRef(null);
  
  // Add state for logs panel width
  const [logsPanelWidth, setLogsPanelWidth] = useState(null); // null = default width
  const [isExpanded, setIsExpanded] = useState(false); // Track if panel is expanded
  const logsPanelRef = useRef(null);
  const logsResizeRef = useRef(null);
  
  // State for deletion
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState(null);
  
  // State for notifications
  const [notification, setNotification] = useState(null);
  
  // Add state for active language in code examples
  const [activeLanguage, setActiveLanguage] = useState('curl');
  
  // Add state for console interface
  const [consoleMode, setConsoleMode] = useState('chat');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(256);
  const [streamResponse, setStreamResponse] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completionResponse, setCompletionResponse] = useState(null);
  
  // State for configuration panel
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  
  // Create mountedRef outside of useEffect for use in fetchUsageData
  const mountedRef = useRef(true);
  
  // If deployment status is not active, switch to logs tab and keep only logs tab available
  useEffect(() => {
    if (selectedDeployment && selectedDeployment.status !== 'active' && activeTab !== 'logs') {
      setActiveTab('logs');
    }
  }, [selectedDeployment, activeTab]);
  
  // Stop log streaming - define this function first before it's used
  const stopLogStream = useCallback(() => {
    if (logStreamRef.current) {
      console.log("Closing WebSocket connection");
      
      // If it's a WebSocket, use the close method
      if (logStreamRef.current instanceof WebSocket) {
        logStreamRef.current.close();
      } 
      // For backward compatibility with any old stream connections
      else if (typeof logStreamRef.current.close === 'function') {
        logStreamRef.current.close();
      }
      
      logStreamRef.current = null;
      setLogStreamActive(false);
    }
  }, []);

  // Helper function to safely access nested properties with multiple possible field names
  const getSafeValue = (obj, paths, defaultValue = null) => {
    if (!obj) return defaultValue;
    
    // Try each possible path
    for (const path of Array.isArray(paths) ? paths : [paths]) {
      let value = obj;
      const keys = path.split('.');
      
      for (let i = 0; i < keys.length; i++) {
        if (value === null || value === undefined) break;
        value = value[keys[i]];
      }
      
      if (value !== null && value !== undefined) {
        return value;
      }
    }
    
    return defaultValue;
  };

  // Function to fetch usage data for a deployment with performance optimization
  const fetchUsageData = useCallback(async (deploymentId) => {
    try {
      console.log(`Fast-loading usage data for deployment: ${deploymentId}`);
      
      // Get the deployment document
      const deploymentDocRef = doc(db, 'deployments', deploymentId);
      
      // Create a fast single-fetch for initial data
      const deploymentDoc = await getDoc(deploymentDocRef);
      if (!deploymentDoc.exists()) {
        throw new Error('Deployment not found');
      }
      
      const deploymentData = deploymentDoc.data();
      
      // Create the query for usage data
      const usageRef = collection(db, 'usage');
      const q = query(
        usageRef,
        where('deployment_id', '==', deploymentId),
        orderBy('timestamp', 'desc')
      );
      
      // Initial quick setup of model info before waiting for stats
      const tunnelUi = getSafeValue(deploymentData, ['endpoints.tunnel_ui']);
      const modelInfo = {
        name: getSafeValue(deploymentData, ['model_name', 'modelName'], 'Unknown Model'),
        id: getSafeValue(deploymentData, ['model_id', 'modelId', 'huggingface_id'], 'unknown'),
        hardware: getSafeValue(deploymentData, ['hardware_name', 'hardwareName'], 'Unknown Hardware'),
        status: getSafeValue(deploymentData, ['status'], 'unknown'),
        created_at: getSafeValue(deploymentData, ['created_at', 'createdAt']),
        tunnelUrl: tunnelUi, // Use tunnel_ui as the primary URL
        apiEndpoint: tunnelUi ? `${tunnelUi}/api/v1/chat/completions` : null,
        containerId: getSafeValue(deploymentData, ['containerId', 'container_id']),
        deploymentId: getSafeValue(deploymentData, ['deployment_id', 'external_id', 'deploymentId']),
        endpoints: deploymentData.endpoints || {},
      };
      
      // Set initial modelInfo immediately for faster UI rendering
      setUsageData(prev => ({
        stats: prev?.stats || {
          total_requests: 0,
          total_tokens: 0,
          active_users: 0,
          endpoints: [],
          last_used: null,
          users: [],
        },
        model: modelInfo
      }));
      
      // Later set up real-time listener for ongoing updates
      const unsubscribe = onSnapshot(q, (usageSnapshot) => {
        // Skip updates if component unmounted
        if (!mountedRef.current) return;
        
        // Extract usage data
        const usageStats = {
          total_requests: 0,
          total_tokens: 0,
          active_users: 0,
          endpoints: [],
          last_used: null,
          users: [],
        };
        
        // Process usage data
        usageSnapshot.forEach((doc) => {
          const data = doc.data();
          
          usageStats.total_requests += data.request_count || 0;
          usageStats.total_tokens += data.token_count || 0;
          
          // Add unique endpoints
          if (data.endpoint && !usageStats.endpoints.includes(data.endpoint)) {
            usageStats.endpoints.push(data.endpoint);
          }
          
          // Track unique users
          if (data.userId && !usageStats.users.includes(data.userId)) {
            usageStats.users.push(data.userId);
          }
          
          // Update last used time
          if (data.timestamp && (!usageStats.last_used || data.timestamp > usageStats.last_used)) {
            usageStats.last_used = data.timestamp;
          }
        });
        
        // Set active users count
        usageStats.active_users = usageStats.users.length;
        
        // Update the full usage data with both model info and latest stats
        setUsageData({
          stats: usageStats,
          model: modelInfo,
        });
      });
      
      // Return unsubscribe function
      return unsubscribe;
    } catch (err) {
      console.error("Error fetching usage data:", err);
      setNotification({
        type: 'error',
        message: `Failed to load usage data: ${err.message}`
      });
      return () => {}; // Return empty function in case of error
    }
  }, []);
  
  // Start log streaming
  const startLogStream = useCallback(async () => {
    if (!selectedDeployment || logStreamActive) return;
    
    try {
      console.log(`Starting log stream for deployment: ${selectedDeployment.id}`);
      
      // Get the deployment ID
      const deploymentId = selectedDeployment?.id;
      
      if (!deploymentId) {
        console.error("Cannot create log stream: No deployment ID available");
        return;
      }
      
      // Use HTTP URL for WebSocket conversion
      const httpUrl = `${API_BASE_URL}/api/v1/deployments/${deploymentId}/logs/stream`;
      // Convert to WebSocket URL
      const wsUrl = httpUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      
      console.log(`Using logs WebSocket URL: ${wsUrl}`);
      
      // Create WebSocket connection
      const socket = new WebSocket(wsUrl);
      console.log(`WebSocket connection being established to: ${wsUrl}`);
      
      // Connection opened
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setLogStreamActive(true);
      });
      
      // Listen for messages
      socket.addEventListener('message', (event) => {
        try {
          const logData = JSON.parse(event.data);
          console.log("Stream received log:", logData);
          
          // Format the log data
          const formattedLog = {
            id: logData.id || `log-${Date.now()}`,
            timestamp: logData.timestamp ? new Date(logData.timestamp).getTime() : Date.now(),
            content: logData.message || logData.content || JSON.stringify(logData),
            level: logData.level || 'info'
          };
          
          setLogs((currentLogs) => {
            // Add new log to the top (assuming newer logs first)
            const newLogs = [formattedLog, ...currentLogs];
            // Keep only the latest 200 logs to prevent excessive memory usage
            return newLogs.slice(0, 200);
          });
          
          // Auto-scroll to the latest log
          if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
          }
        } catch (error) {
          console.error("Error processing log message:", error);
        }
      });
      
      // Listen for errors
      socket.addEventListener('error', (event) => {
        console.error("WebSocket error:", event);
        setLogStreamActive(false);
      });
      
      // Listen for connection closing
      socket.addEventListener('close', (event) => {
        console.log("WebSocket connection closed:", event);
        setLogStreamActive(false);
      });
      
      // Store the socket reference
      logStreamRef.current = socket;
      
    } catch (err) {
      console.error("Failed to start log stream:", err);
      setNotification({
        type: 'error',
        message: `Failed to start log stream: ${err.message}`
      });
    }
  }, [selectedDeployment, logStreamActive]);
  
  // Function to fetch deployment logs
  const fetchDeploymentLogs = useCallback(async (deploymentIdParam) => {
    try {
      // Only show loading indicator if we don't have logs already
      if (logs.length === 0) {
        setIsLoadingLogs(true);
      }
      
      console.log(`Fetching logs for deployment: ${deploymentIdParam}`);
      
      // Get the deployment ID
      const deploymentId = selectedDeployment?.id;
      
      if (!deploymentId) {
        console.error("Cannot fetch logs: No deployment ID available");
        setLogs([]);
              setIsLoadingLogs(false);
              return;
      }
      
      // Use the simplified logs endpoint path
      const logsUrl = `${API_BASE_URL}/api/v1/deployments/${deploymentId}/logs`;
      console.log(`Using logs RESTful URL: ${logsUrl}`);
      
      try {
        console.log(`Sending fetch request to: ${logsUrl}`);
            const response = await fetch(logsUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'bypass-tunnel-reminder': 'true'
              }
            });
        
        console.log(`Logs endpoint response status: ${response.status}`);
            
            if (response.ok) {
              const data = await response.json();
          console.log(`Successfully fetched logs from endpoint: ${logsUrl}`, data);
              
              // Format logs to match expected structure
              const formattedLogs = Array.isArray(data) ? data : (data.logs || []);
              
              const processedLogs = formattedLogs.map((log, index) => ({
                id: log.id || `log-${index}`,
                timestamp: log.timestamp ? new Date(log.timestamp).getTime() : Date.now(),
                content: log.message || log.content || JSON.stringify(log),
                level: log.level || 'info'
              }));
              
              setLogs(processedLogs);
              setIsLoadingLogs(false);
              return;
            } else {
          console.warn(`Failed to fetch logs: ${response.status}`);
          // Try to read the error response
          try {
            const errorText = await response.text();
            console.warn(`Error response: ${errorText}`);
          } catch (e) {
            console.warn(`Could not read error response: ${e.message}`);
          }
            }
          } catch (error) {
        console.warn(`Error fetching logs: ${error.message}`);
        }
        
      // If we get here, the fetch failed
      console.log('Failed to fetch logs, showing empty logs');
        setLogs([]);
      setIsLoadingLogs(false);
      
      // Start log streaming if needed
      if (!logStreamActive && activeTab === 'logs') {
        startLogStream();
      }
    } catch (err) {
      console.error("Error in log fetching wrapper:", err);
      setIsLoadingLogs(false);
    }
  }, [logs.length, selectedDeployment, logStreamActive, activeTab, startLogStream]);
  
  // Fetch all user deployments
  useEffect(() => {
    async function fetchDeployments() {
      try {
        setIsLoading(true);
        
        // Get current user
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.error("No user logged in");
          setError("You must be logged in to view deployments");
          setIsLoading(false);
          return;
        }
        
        console.log(`Setting up real-time deployments for user: ${user.uid}`);
        
        // Create real-time listener for deployments
        const deploymentsRef = collection(db, 'deployments');
        // Query deployments where userId matches the current user
        const q = query(
          deploymentsRef, 
          where('userId', '==', user.uid)
        );
        
        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log(`Raw snapshot contains ${snapshot.docs.length} documents`);
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log('Document:', {
              id: doc.id,
              data: data,
              userId: data.userId,
              status: data.status,
              model_name: data.model_name,
              hardware_name: data.hardware_name,
              created_at: data.created_at
            });
          });
          
          const deployments = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            deployments.push({
              id: doc.id,
              ...data
            });
          });
          
          console.log('Final deployments array:', deployments);
          setDeployedModels(deployments);
          setIsLoading(false);
        }, (error) => {
          console.error("Error in real-time listener:", error);
          setError(`Failed to load deployments: ${error.message}`);
          setIsLoading(false);
        });
        
        // Return cleanup function to unsubscribe when component unmounts
        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching deployments:", err);
        setError("Failed to load deployments");
      } finally {
        setIsLoading(false);
      }
    }
    
    const unsubscribe = fetchDeployments();
    // Clean up on unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);
  
  // Set up the mount ref for cleanup
  useEffect(() => {
    // Reset mounted ref on mount
    mountedRef.current = true;
    
    // Clean up on unmount
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch logs when a deployment is selected
  useEffect(() => {
    if (!selectedDeployment) {
      setLogs([]);
      setUsageData(null);
      // Cleanup log stream if active
      if (logStreamRef.current) {
        logStreamRef.current.close();
        logStreamRef.current = null;
        setLogStreamActive(false);
      }
      return;
    }
    
    // Fetch usage data with real-time updates
    fetchUsageData(selectedDeployment.id).then(unsubscribeFunc => {
      // Store unsubscribe function for cleanup
      return () => {
        if (unsubscribeFunc && typeof unsubscribeFunc === 'function') {
          unsubscribeFunc();
        }
      };
    });
    
    // Don't fetch logs here - we'll do it in the activeTab effect
  }, [selectedDeployment, fetchUsageData]);
  
  // Auto-hide notification after timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // React to tab changes to load data as needed
  useEffect(() => {
    if (selectedDeployment && activeTab === 'logs') {
      // Start logs streaming automatically when logs tab is active
      if (!logStreamActive) {
        startLogStream();
      }
      
      // Fetch initial logs if needed
      if (logs.length === 0) {
        fetchDeploymentLogs(selectedDeployment.id);
      }
    } else if (activeTab !== 'logs' && logStreamActive) {
      // Stop streaming when leaving logs tab
      stopLogStream();
    }
  }, [activeTab, selectedDeployment, logs.length, fetchDeploymentLogs, startLogStream, logStreamActive, stopLogStream]);

  // Render overview tab content
  const renderOverviewContent = () => {
    return (
      <div className="p-6 space-y-6 overflow-auto">
        {/* Deployment Info */}
        <div className={`p-5 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-sm font-semibold mb-3">Deployment Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Model Name</p>
              <p className="text-sm font-medium truncate">{selectedDeployment.data?.modelId || selectedDeployment.model_name || 'Unknown Model'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(selectedDeployment.status)}`}></span>
                <p className="text-sm capitalize">{selectedDeployment.status}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Creation Date</p>
              <p className="text-sm">
                {selectedDeployment.data?.createdAt?.toDate 
                  ? formatTimestamp(selectedDeployment.data.createdAt.toDate()) 
                  : selectedDeployment.created_at 
                    ? formatTimestamp(new Date(selectedDeployment.created_at)) 
                    : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Hardware Type</p>
              <p className="text-sm">{selectedDeployment.hardware_name || 'Standard'}</p>
            </div>
          </div>
        </div>
        
        {/* Safe access to endpoints.tunnel_ui */}
        {(selectedDeployment.endpoints?.tunnel_ui || selectedDeployment.data?.endpoints?.tunnel_ui) && (
          <div className={`p-5 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className="text-sm font-semibold mb-4">API Base URL</h3>
            
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-4 border border-gray-700">
              <div className="font-mono text-[11px] text-green-400 break-all">
                {selectedDeployment.endpoints?.tunnel_ui || selectedDeployment.data?.endpoints?.tunnel_ui}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render API tab content
  const renderApiContent = () => {
    if (!usageData || !usageData.model) {
      return <ApiSkeleton darkMode={darkMode} />;
    }
    
    const { model } = usageData;
    
    // Use tunnel_ui instead of tunnel_url
    const tunnelUi = model.endpoints?.tunnel_ui;
    const apiBaseUrl = tunnelUi?.replace(/\/$/, ''); // Remove trailing slash if present
    
    // Define our API endpoints with detailed descriptions
    const apiEndpoints = [
      {
        name: 'Chat Completions',
        path: '/api/v1/chat/completions',
        url: apiBaseUrl ? `${apiBaseUrl}/api/v1/chat/completions` : null,
        description: 'Generate chat completions from the model using ChatGPT-like conversation format with roles.',
        method: 'POST',
        parameters: [
          { name: 'model', type: 'string', description: 'ID of the model to use', required: true },
          { name: 'messages', type: 'array', description: 'Array of message objects with "role" and "content"', required: true },
          { name: 'temperature', type: 'number', description: 'Sampling temperature (0-2)', required: false, default: '0.7' },
          { name: 'max_tokens', type: 'integer', description: 'Maximum number of tokens to generate', required: false },
          { name: 'stream', type: 'boolean', description: 'Stream partial results as they become available', required: false, default: 'false' }
        ]
      },
      {
        name: 'Completions',
        path: '/api/v1/completions',
        url: apiBaseUrl ? `${apiBaseUrl}/api/v1/completions` : null,
        description: 'Generate text completions from the model using prompt-based format.',
        method: 'POST',
        parameters: [
          { name: 'model', type: 'string', description: 'ID of the model to use', required: true },
          { name: 'prompt', type: 'string', description: 'Text prompt to complete', required: true },
          { name: 'temperature', type: 'number', description: 'Sampling temperature (0-2)', required: false, default: '0.7' },
          { name: 'max_tokens', type: 'integer', description: 'Maximum number of tokens to generate', required: false },
          { name: 'stream', type: 'boolean', description: 'Stream partial results as they become available', required: false, default: 'false' }
        ]
      },
      {
        name: 'Embeddings',
        path: '/api/v1/embeddings',
        url: apiBaseUrl ? `${apiBaseUrl}/api/v1/embeddings` : null,
        description: 'Get vector embeddings for input text for use in search, clustering, etc.',
        method: 'POST',
        parameters: [
          { name: 'model', type: 'string', description: 'ID of the model to use', required: true },
          { name: 'input', type: 'string or array', description: 'Text to embed', required: true }
        ]
      },
      {
        name: 'Tokenize',
        path: '/api/v1/tokenize',
        url: apiBaseUrl ? `${apiBaseUrl}/api/v1/tokenize` : null,
        description: 'Convert text to tokens and get token count information.',
        method: 'POST',
        parameters: [
          { name: 'text', type: 'string', description: 'Text to tokenize', required: true }
        ]
      }
    ];
    
    // Define code examples for each language
    const getExample = (endpoint) => {
      const examples = {
        curl: `curl ${endpoint.url} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "bypass-tunnel-reminder: true" \\
  -d '{
    "model": "${model.id}",
    ${endpoint.name === 'Chat Completions' ? 
      `"messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Hello, what can you help me with today?" }
    ],` 
    : 
    endpoint.name === 'Completions' ? 
      `"prompt": "Once upon a time",` 
    : 
    endpoint.name === 'Embeddings' ? 
      `"input": "The quick brown fox jumps over the lazy dog",` 
    :
    `"text": "Hello, world!",`
    }
    "temperature": 0.7
  }'`,
        
        python: `import requests

url = "${endpoint.url}"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "bypass-tunnel-reminder": "true"
}
payload = {
    "model": "${model.id}",
    ${endpoint.name === 'Chat Completions' ? 
      `"messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, what can you help me with today?"}
    ],` 
    : 
    endpoint.name === 'Completions' ? 
      `"prompt": "Once upon a time",` 
    : 
    endpoint.name === 'Embeddings' ? 
      `"input": "The quick brown fox jumps over the lazy dog",` 
    :
    `"text": "Hello, world!",`
    }
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
        
        javascript: `fetch("${endpoint.url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "bypass-tunnel-reminder": "true"
  },
  body: JSON.stringify({
    model: "${model.id}",
    ${endpoint.name === 'Chat Completions' ? 
      `messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello, what can you help me with today?" }
    ],` 
    : 
    endpoint.name === 'Completions' ? 
      `prompt: "Once upon a time",` 
    : 
    endpoint.name === 'Embeddings' ? 
      `input: "The quick brown fox jumps over the lazy dog",` 
    :
    `text: "Hello, world!",`
    }
    temperature: 0.7
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error:", error));`
      };
      
      return examples;
    };
    
    return (
      <div className="p-6 space-y-6 overflow-auto">
        {/* Introduction */}
        <div className={`p-5 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-sm font-semibold mb-3">API Overview</h3>
          <p className="text-xs mb-3">
            Access your deployed model through our RESTful API endpoints. These endpoints allow you to generate text completions, 
            chat completions, embeddings, and tokenize text with your model.
          </p>
        </div>
        
        {/* API Endpoints */}
        <div className="space-y-5">
          {apiEndpoints.map((endpoint, index) => (
            <div key={index} className={`rounded-lg shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">{endpoint.name}</h3>
                  <span className={`px-2 py-1 text-[10px] font-mono rounded ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    {endpoint.method} {endpoint.path}
                  </span>
                </div>
                <p className="text-xs mt-2 text-gray-500">{endpoint.description}</p>
              </div>
              
              <div className="p-4">
                <h4 className="text-xs font-medium mb-2">Parameters</h4>
                <div className="overflow-x-auto">
                  <table className={`w-full text-[11px] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <thead className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      <tr>
                        <th className="text-left py-1 pr-4 font-medium">Name</th>
                        <th className="text-left py-1 pr-4 font-medium">Type</th>
                        <th className="text-left py-1 pr-4 font-medium">Required</th>
                        <th className="text-left py-1 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.parameters.map((param, i) => (
                        <tr key={i} className={i % 2 === 0 ? (darkMode ? 'bg-gray-750' : 'bg-gray-50') : ''}>
                          <td className="py-1.5 pr-4 font-mono">{param.name}</td>
                          <td className="py-1.5 pr-4">{param.type}</td>
                          <td className="py-1.5 pr-4">
                            {param.required ? (
                              <span className="text-amber-500">Required</span>
                            ) : (
                              <span className="text-gray-500">Optional</span>
                            )}
                          </td>
                          <td className="py-1.5">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Code Examples */}
                <div className="mt-4">
                  <h4 className="text-xs font-medium mb-2">Code Examples</h4>
                  
                  <div className="rounded-lg overflow-hidden border divide-y divide-x-0 mb-3 
                  ${darkMode ? 'border-gray-700 divide-gray-700' : 'border-gray-200 divide-gray-200'}">
                    <div className="flex divide-x ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}">
                      <button 
                        onClick={() => setActiveLanguage('curl')}
                        className={`flex-1 py-1 text-xs ${
                          activeLanguage === 'curl' 
                            ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                            : darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                        } font-medium`}
                      >
                        cURL
                      </button>
                      <button 
                        onClick={() => setActiveLanguage('python')}
                        className={`flex-1 py-1 text-xs ${
                          activeLanguage === 'python' 
                            ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                            : darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                        } font-medium`}
                      >
                        Python
                      </button>
                      <button 
                        onClick={() => setActiveLanguage('javascript')}
                        className={`flex-1 py-1 text-xs ${
                          activeLanguage === 'javascript' 
                            ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600'
                            : darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                        } font-medium`}
                      >
                        JavaScript
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-900 to-black rounded-b-lg p-3 border-t-0 overflow-x-auto">
                      <pre className="font-mono text-[10px] text-green-400 whitespace-pre">
                        {activeLanguage === 'curl' && getExample(endpoint).curl}
                        {activeLanguage === 'python' && getExample(endpoint).python}
                        {activeLanguage === 'javascript' && getExample(endpoint).javascript}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render console tab content (interactive interface)
  const renderConsoleContent = () => {
    if (!usageData || !usageData.model) {
      return <ConsoleSkeleton darkMode={darkMode} />;
    }
    
    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!prompt.trim() || isGenerating) return;
      
      // Get the API endpoint - specifically use tunnel_ui
      const apiBaseUrl = usageData.model.endpoints?.tunnel_ui?.replace(/\/$/, ''); // Remove trailing slash if present
      const modelId = usageData.model.id;
      
      // Add user message to chat UI immediately for chat mode
      if (consoleMode === 'chat') {
        // Add user message to chat UI immediately
        const updatedMessages = [
          ...chatMessages,
          { role: 'user', content: prompt }
        ];
        setChatMessages(updatedMessages);
        setPrompt(''); // Clear input immediately for better UX
        setIsGenerating(true); // Only set generating AFTER showing user message
      } else {
        // For completions mode, just set generating flag
        setIsGenerating(true);
      }
      
      if (!apiBaseUrl) {
        // If no API endpoint is available, use simulated responses
        simulateResponse();
        return;
      }
      
      // Configure headers for API request
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'bypass-tunnel-reminder': 'true'
      };
      
      // Use the actual API endpoint based on the console mode
      if (consoleMode === 'chat') {
        // We already added user message to UI and set prompt to empty
        const updatedMessages = [
          ...chatMessages,
          { role: 'user', content: prompt }
        ];
        
        // Prepare request body for chat completions
        const requestBody = {
          model: modelId,
          messages: updatedMessages,
          temperature: temperature,
          max_tokens: maxTokens,
          stream: streamResponse
        };
        
        if (streamResponse) {
          // Stream mode - process response as it arrives
          fetch(`${apiBaseUrl}/api/v1/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`API responded with status ${response.status}`);
            }
            
            // Create streaming assistant message with empty content
            const assistantMessage = { role: 'assistant', content: '' };
            setChatMessages([...updatedMessages, assistantMessage]);
            
            // Get a reader from the response body stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // Read the stream
            function readStream() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  setIsGenerating(false);
                  return;
                }
                
                // Decode the chunk and split by lines
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                // Process each line (each line is an SSE event)
                lines.forEach(line => {
                  // SSE format: each message starts with "data: "
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    
                    // Skip "[DONE]" message which indicates end of stream
                    if (data === '[DONE]') return;
                    
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.choices && parsed.choices[0]?.delta?.content) {
                        // Update the latest message content by appending the new token
                        setChatMessages(messages => {
                          const updatedMessages = [...messages];
                          const lastMessage = updatedMessages[updatedMessages.length - 1];
                          lastMessage.content += parsed.choices[0].delta.content;
                          return updatedMessages;
                        });
                      }
                    } catch (e) {
                      console.error('Error parsing streaming data:', e);
                    }
                  }
                });
                
                // Continue reading
                readStream();
              }).catch(err => {
                console.error('Error reading stream:', err);
                setIsGenerating(false);
              });
            }
            
            readStream();
          })
          .catch(error => {
            console.error('Error calling chat completions API:', error);
            // Show error in chat
            setChatMessages([
              ...updatedMessages,
              { 
                role: 'assistant', 
                content: `Error: ${error.message}. Please try again or check the API endpoint.` 
              }
            ]);
            setIsGenerating(false);
          });
        } else {
          // Non-streaming mode (existing code)
        fetch(`${apiBaseUrl}/api/v1/chat/completions`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.choices && data.choices[0] && data.choices[0].message) {
            // Add API response to chat
            setChatMessages([
              ...updatedMessages,
              data.choices[0].message
            ]);
          } else {
            throw new Error('Unexpected API response format');
          }
        })
        .catch(error => {
          console.error('Error calling chat completions API:', error);
          // Show error in chat
          setChatMessages([
            ...updatedMessages,
            { 
              role: 'assistant', 
              content: `Error: ${error.message}. Please try again or check the API endpoint.` 
            }
          ]);
        })
        .finally(() => {
          setIsGenerating(false);
        });
        }
      } else {
        // Text completion mode
        const requestBody = {
          model: modelId,
          prompt: prompt,
          temperature: temperature,
          max_tokens: maxTokens,
          stream: streamResponse
        };
        
        if (streamResponse) {
          // Stream mode for text completions
          fetch(`${apiBaseUrl}/api/v1/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`API responded with status ${response.status}`);
            }
            
            // Create an initial completion response object
            const initialResponse = {
              id: `cmpl-${Date.now()}`,
              created: Date.now(),
              model: modelId,
              choices: [{ text: '', finish_reason: null }],
              usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
            };
            setCompletionResponse(initialResponse);
            setPrompt(''); // Clear prompt immediately for better UX
            
            // Get a reader from the response body stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // Read the stream
            function readStream() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  // Update finish reason when stream is complete
                  setCompletionResponse(prev => {
                    const updatedResponse = {...prev};
                    updatedResponse.choices[0].finish_reason = 'stop';
                    return updatedResponse;
                  });
                  setIsGenerating(false);
                  return;
                }
                
                // Decode the chunk and split by lines
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                // Process each line
                lines.forEach(line => {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') return;
                    
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.choices && parsed.choices[0]?.text) {
                        // Append the new token to the completion
                        setCompletionResponse(prev => {
                          const updatedResponse = {...prev};
                          updatedResponse.choices[0].text += parsed.choices[0].text;
                          return updatedResponse;
                        });
                      }
                    } catch (e) {
                      console.error('Error parsing streaming data:', e);
                    }
                  }
                });
                
                // Continue reading
                readStream();
              }).catch(err => {
                console.error('Error reading stream:', err);
                setIsGenerating(false);
              });
            }
            
            readStream();
          })
          .catch(error => {
            // Error handling as before
            console.error('Error calling completions API:', error);
            setCompletionResponse({
              id: `error-${Date.now()}`,
              created: Date.now(),
              model: modelId,
              choices: [
                {
                  text: `Error: ${error.message}. Please try again or check the API endpoint.`,
                  finish_reason: 'error'
                }
              ],
              usage: {
                prompt_tokens: prompt.length / 4,
                completion_tokens: 0,
                total_tokens: prompt.length / 4
              }
            });
            setIsGenerating(false);
          });
        } else {
          // Non-streaming mode (existing code)
        fetch(`${apiBaseUrl}/api/v1/completions`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setCompletionResponse(data);
          setPrompt(''); // Clear prompt after success
        })
        .catch(error => {
          console.error('Error calling completions API:', error);
          // Show error in completion response
          setCompletionResponse({
            id: `error-${Date.now()}`,
            created: Date.now(),
            model: modelId,
            choices: [
              {
                text: `Error: ${error.message}. Please try again or check the API endpoint.`,
                finish_reason: 'error'
              }
            ],
            usage: {
              prompt_tokens: prompt.length / 4,
              completion_tokens: 0,
              total_tokens: prompt.length / 4
            }
          });
        })
        .finally(() => {
          setIsGenerating(false);
        });
        }
      }
    };
    
    // Fallback function for simulated responses when no API is available
    const simulateResponse = () => {
      if (consoleMode === 'chat') {
        // Add user message to chat (already done above)
        const updatedMessages = [...chatMessages, { role: 'user', content: prompt }];
        
        // Simulate assistant response after a brief delay
        setTimeout(() => {
          setChatMessages([
            ...updatedMessages,
            { 
              role: 'assistant', 
              content: `This is a simulated response for your prompt: "${prompt}". In a real implementation, this would call your deployed model API endpoint.` 
            }
          ]);
          setIsGenerating(false);
        }, 1200);
      } else {
        // Text completion mode
        // Simulate completion response
        setTimeout(() => {
          setCompletionResponse({
            id: `cmpl-${Math.random().toString(36).substr(2, 10)}`,
            created: Date.now(),
            model: usageData.model.id,
            choices: [
              {
                text: `${prompt} ... [This is a simulated text completion. In a real implementation, your deployed model would generate a completion for the provided prompt.]`,
                finish_reason: 'length'
              }
            ],
            usage: {
              prompt_tokens: prompt.length / 4,
              completion_tokens: 40,
              total_tokens: prompt.length / 4 + 40
            }
          });
          setPrompt(''); // Clear prompt after success
          setIsGenerating(false);
        }, 1200);
      }
    };
    
    return (
      <div className="p-4 h-full flex flex-col">
        {/* Console header area */}
        <div className={`p-4 rounded-t-lg shadow-md ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-white border border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Model Playground
            </h3>
            
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`px-3 py-1 text-xs font-medium rounded-full flex items-center transition-colors ${
                darkMode 
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-500/30'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Configure
            </button>
          </div>
          
          {/* Tab Switching */}
          <div className="flex p-1 bg-opacity-40 rounded-lg bg-gray-700/10 w-fit mb-4">
            <button
              onClick={() => setConsoleMode('chat')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                consoleMode === 'chat' 
                  ? darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 shadow-sm' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chat Completions
            </button>
            <button
              onClick={() => setConsoleMode('completions')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                consoleMode === 'completions' 
                  ? darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 shadow-sm' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Text Completions
            </button>
          </div>
        </div>
        
        {/* Configuration panel - slides in from right */}
        <div className={`fixed inset-y-0 right-0 w-72 bg-opacity-98 shadow-xl transform transition-all duration-300 z-40 flex flex-col
          ${showConfigPanel ? 'translate-x-0' : 'translate-x-full'}
          ${darkMode ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'}`}
        >
          <div className="p-4 border-b flex items-center justify-between flex-shrink-0 bg-opacity-90 backdrop-blur-sm
            ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}">
            <h3 className="text-sm font-medium">Configuration</h3>
            <button 
              onClick={() => setShowConfigPanel(false)}
              className={`p-1 rounded-full hover:bg-opacity-80 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-6 overflow-y-auto flex-grow">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium">Temperature</label>
                <span className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-mono`}>{temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className={`w-full h-1.5 appearance-none cursor-pointer rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700' 
                    : 'bg-gray-200'
                }`}
                style={{
                  background: darkMode 
                    ? `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${temperature * 50}%, rgb(55, 65, 81) ${temperature * 50}%, rgb(55, 65, 81) 100%)`
                    : `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${temperature * 50}%, rgb(229, 231, 235) ${temperature * 50}%, rgb(229, 231, 235) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] mt-1 text-gray-500">
                <span>Precise</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium">Max Tokens</label>
                <span className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-mono`}>{maxTokens}</span>
              </div>
              <input
                type="range"
                min="1"
                max="4096"
                step="1"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className={`w-full h-1.5 appearance-none cursor-pointer rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700' 
                    : 'bg-gray-200'
                }`}
                style={{
                  background: darkMode 
                    ? `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${maxTokens/4096*100}%, rgb(55, 65, 81) ${maxTokens/4096*100}%, rgb(55, 65, 81) 100%)`
                    : `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${maxTokens/4096*100}%, rgb(229, 231, 235) ${maxTokens/4096*100}%, rgb(229, 231, 235) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] mt-1 text-gray-500">
                <span>Short</span>
                <span>Medium</span>
                <span>Long</span>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="flex items-center space-x-2 text-xs cursor-pointer">
                <div className={`relative inline-block w-10 h-5 transition-colors duration-200 ease-in-out rounded-full 
                  ${streamResponse ? (darkMode ? 'bg-blue-600' : 'bg-blue-500') : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`}>
                  <input 
                    type="checkbox" 
                    checked={streamResponse}
                    onChange={(e) => setStreamResponse(e.target.checked)}
                    className="sr-only"
                  />
                  <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform
                    ${streamResponse ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </div>
                <span>Stream Response</span>
              </label>
            </div>
            
            <div className="pt-4">
              <h4 className="text-xs font-medium mb-2">Model Information</h4>
              <div className="text-[10px] space-y-1.5">
                <div className="flex">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} w-20`}>Model:</span>
                  <span className="font-mono">{usageData.model.name}</span>
                </div>
                <div className="flex">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} w-20`}>ID:</span>
                  <span className="font-mono">{usageData.model.id.substring(0, 16)}...</span>
                </div>
                <div className="flex">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} w-20`}>Hardware:</span>
                  <span className="font-mono">{usageData.model.hardware}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`p-4 border-t flex-shrink-0 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setShowConfigPanel(false)}
              className={`w-full py-2 text-xs font-medium rounded-md transition-colors ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Apply Settings
            </button>
          </div>
        </div>
        
        {/* Overlay when config panel is open */}
        {showConfigPanel && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            onClick={() => setShowConfigPanel(false)}
          />
        )}
        
        {/* Interactive console area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Chat messages or completion display */}
          <div className={`flex-1 p-4 overflow-y-auto ${
            darkMode 
              ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-l border-r border-gray-700' 
              : 'bg-gradient-to-b from-gray-50 to-white border-l border-r border-gray-200'
          }`}>
            {consoleMode === 'chat' ? (
              // Chat mode
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`${
                      message.role === 'user' 
                        ? 'ml-auto' 
                        : ''
                    } max-w-[85%] animate-fade-in`}
                  >
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user' 
                        ? darkMode 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                          : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white' 
                        : message.role === 'system'
                          ? darkMode
                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 border border-gray-700'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                          : darkMode 
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 border border-gray-700' 
                            : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <div className="text-[10px] font-medium mb-1 opacity-80 flex items-center">
                        {message.role === 'assistant' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
                            <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
                            <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
                            <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
                            <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
                            <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
                          </svg>
                        )}
                        {message.role === 'user' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )}
                        {message.role === 'system' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                          </svg>
                        )}
                        {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                      </div>
                      <div className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="max-w-[85%] animate-fade-in">
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      darkMode 
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 border border-gray-700' 
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}>
                      <div className="text-[10px] font-medium mb-2 opacity-80 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
                          <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
                          <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
                          <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
                          <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
                          <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
                        </svg>
                        Assistant
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Completions mode
              <div>
                {completionResponse ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className={`p-4 rounded-lg shadow-sm ${
                      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                      <div className="text-[10px] font-medium mb-2 opacity-70">Completion Result</div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{completionResponse.choices[0].text}</p>
                    </div>
                    
                    <div className={`p-3 rounded-lg text-[10px] flex flex-wrap gap-3 ${
                      darkMode ? 'bg-gray-800/50 text-gray-400 border border-gray-700' : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      <div>Model: <span className="font-mono">{completionResponse.model}</span></div>
                      <div>Tokens: <span className="font-mono">{completionResponse.usage.total_tokens}</span></div>
                      <div>Finish Reason: <span className="font-mono">{completionResponse.choices[0].finish_reason}</span></div>
                      <div>ID: <span className="font-mono">{completionResponse.id}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="w-16 h-16 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full opacity-20">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        <line x1="9" y1="10" x2="15" y2="10"></line>
                        <line x1="12" y1="7" x2="12" y2="13"></line>
                      </svg>
                    </div>
                    <div className="text-xs text-center max-w-xs">
                      Enter a prompt and submit to generate a completion
                    </div>
                  </div>
                )}
                
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded">
                    <div className="flex items-center space-x-2 bg-gray-900/80 text-white px-4 py-2 rounded-lg">
                      <RefreshCw className="animate-spin h-4 w-4" />
                      <span className="text-xs">Generating...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className={`p-4 rounded-b-lg shadow-md ${
            darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-t border-gray-700' : 'bg-white border-t border-gray-200'
          }`}>
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  placeholder={consoleMode === 'chat' 
                    ? "Type your message here..." 
                    : "Enter text to complete..."
                  }
                  rows="2"
                  className={`w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none transition-shadow resize-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400' 
                      : 'border border-gray-300 focus:ring-1 focus:ring-blue-500 bg-white placeholder-gray-400'
                  }`}
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                  isGenerating || !prompt.trim()
                    ? darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                    : darkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-md'
                }`}
              >
                {isGenerating ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  // Render logs tab content
  const renderLogsContent = () => {
    return (
      <div className="p-4 h-full overflow-auto flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-medium flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            Deployment Logs
          </h4>
          
          <div className="flex items-center">
            {/* Auto-streaming indicator */}
            <div className={`flex items-center px-3 py-1.5 rounded-md text-xs ${
              logStreamActive 
                ? darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600' 
                : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              {logStreamActive ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span>Live Streaming</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              )}
            </div>
            
            {/* Manual refresh button */}
            <button
              onClick={() => fetchDeploymentLogs(selectedDeployment.id)}
              disabled={isLoadingLogs}
              className={`ml-2 p-1.5 rounded-full ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } flex items-center`}
              title="Refresh logs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Logs content */}
        <div
          ref={logContainerRef}
          className={`font-mono text-[11px] leading-relaxed overflow-y-auto flex-1 p-4 rounded-lg ${
            darkMode ? 'bg-black text-gray-300' : 'bg-gray-900 text-gray-200'
          }`}
        >
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <div key={log.id || idx} className="mb-1.5 leading-tight">
                <span className={`${darkMode ? 'text-green-400' : 'text-green-400'}`}>
                  {new Date(log.timestamp).toLocaleTimeString()} &gt;
                </span>{' '}
                <span className={
                  log.level === 'error' || log.content?.includes('ERROR')
                    ? 'text-red-400'
                    : log.level === 'warning' || log.content?.includes('WARNING')
                    ? 'text-yellow-400'
                    : ''
                }>
                  {log.content || log.message || JSON.stringify(log)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-gray-500 text-xs">
              {isLoadingLogs ? (
                <div className="flex justify-center items-center py-2">
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  <span>Loading logs...</span>
                </div>
              ) : (
                <>No logs available. {logStreamActive ? 'Waiting for new logs...' : ''}</>
              )}
            </div>
          )}

          {logStreamActive && logs.length > 0 && (
            <div className="w-full flex items-center justify-center mt-2 mb-1 border-t border-gray-700 pt-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              <span className="text-xs text-green-400">Live streaming</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();
      case 'api':
        return renderApiContent();
      case 'console':
        return renderConsoleContent();
      case 'logs':
        return renderLogsContent();
      default:
        return renderOverviewContent();
    }
  };

  // Handle initiating deployment deletion
  const initiateDeleteDeployment = (deployment, event) => {
    // Prevent the card click event from triggering
    if (event) {
      event.stopPropagation();
    }
    
    // If no specific deployment was passed, use the currently selected deployment
    const deploymentToRemove = deployment || selectedDeployment;
    
    if (!deploymentToRemove?.id) {
      console.error("Cannot initiate delete: No deployment ID");
      setNotification({
        type: 'error',
        message: 'Cannot delete: No deployment ID found'
      });
      return;
    }
    
    // Store the deployment to delete
    setDeploymentToDelete(deploymentToRemove);
    setShowDeleteConfirmation(true);
    console.log(`Initiating deletion for deployment: ${deploymentToRemove.id}`);
  };
  
  // Handle deployment deletion
  const handleDeleteDeployment = async () => {
    // Use the stored deployment to delete, fallback to selectedDeployment if needed
    const deployment = deploymentToDelete || selectedDeployment;
    
    if (!deployment?.id) {
      console.error("Cannot delete: No deployment ID");
      setNotification({
        type: 'error',
        message: 'Cannot delete: No deployment ID found'
      });
      return;
    }
    
    try {
      setIsDeleting(true);
      const deploymentId = deployment.id;
      const deploymentName = deployment.model_name || 'Unknown Model';
      console.log(`Starting deletion process for deployment: ${deploymentId} (${deploymentName})`);
      
      // Stop log streaming if active
      if (logStreamActive) {
        stopLogStream();
      }
      
      // Update the deployment status to "deleting" in UI
      setDeployedModels(prev => 
        prev.map(model => 
          model.id === deploymentId
            ? { ...model, status: 'deleting' } 
            : model
        )
      );
      
      // Update the selectedDeployment if it's the one being deleted
      if (selectedDeployment && selectedDeployment.id === deploymentId) {
        setSelectedDeployedModel(prev => ({
          ...prev,
          status: 'deleting'
        }));
      }
      
      // Add a small delay to show the deleting status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get a direct reference to the document
      const deploymentRef = doc(db, 'deployments', deploymentId);
      console.log(`Deleting document from Firebase with ref: ${deploymentRef.path}`);
      
      // Delete directly from Firebase collection
      await deleteDoc(deploymentRef);
      console.log(`Deployment ${deploymentId} deleted successfully from Firebase`);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Deployment "${deploymentName}" deleted successfully.`
      });
      
      // Remove the deleted deployment from the list
      setDeployedModels(prev => prev.filter(model => model.id !== deploymentId));
      
      // Clear the selection if it was the one being deleted
      if (selectedDeployment && selectedDeployment.id === deploymentId) {
        setSelectedDeployedModel(null);
      }
    } catch (err) {
      console.error("Error deleting deployment:", err);
      // Show error notification with more details
      setNotification({
        type: 'error',
        message: `Failed to delete deployment: ${err.message || 'Unknown error'}`
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setDeploymentToDelete(null);
    }
  };
  
  // Get status color based on deployment status
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'running':
        return {
          dot: 'bg-green-500',
          bg: darkMode ? 'bg-green-500/20' : 'bg-green-100',
          text: darkMode ? 'text-green-300' : 'text-green-600'
        };
      case 'queued':
        return {
          dot: 'bg-amber-500',
          bg: darkMode ? 'bg-amber-500/20' : 'bg-amber-100',
          text: darkMode ? 'text-amber-300' : 'text-amber-600'
        };
      case 'stopped':
        return {
          dot: 'bg-yellow-500',
          bg: darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100',
          text: darkMode ? 'text-yellow-300' : 'text-yellow-600'
        };
      case 'deleting':
        return {
          dot: 'bg-purple-500',
          bg: darkMode ? 'bg-purple-500/20' : 'bg-purple-100',
          text: darkMode ? 'text-purple-300' : 'text-purple-600'
        };
      case 'failed':
        return {
          dot: 'bg-red-500',
          bg: darkMode ? 'bg-red-500/20' : 'bg-red-100',
          text: darkMode ? 'text-red-300' : 'text-red-600'
        };
      default:
        return {
          dot: 'bg-gray-500',
          bg: darkMode ? 'bg-gray-500/20' : 'bg-gray-100',
          text: darkMode ? 'text-gray-300' : 'text-gray-600'
        };
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (logStreamRef.current) {
        logStreamRef.current.close();
      }
    };
  }, []);

  // Auto-scroll logs to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current && logs.length > 0) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  // Add resize handler for logs panel
  useEffect(() => {
    const handleLogsResize = (e) => {
      if (!logsResizeRef.current?.dataset.resizing) return;
      
      // Calculate width from the right edge of the screen
      const containerWidth = document.body.clientWidth;
      // Set min and max widths for the panel
      const newWidth = Math.max(350, Math.min(800, containerWidth - e.clientX));
      setLogsPanelWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      if (logsResizeRef.current) {
        logsResizeRef.current.dataset.resizing = '';
      }
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleLogsResize);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleLogsResize);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Add a function to toggle panel expansion
  const togglePanelExpansion = () => {
    if (isExpanded) {
      // Contract the panel to default size
      setLogsPanelWidth(null);
      setIsExpanded(false);
    } else {
      // Expand the panel to maximum reasonable size
      const maxWidth = Math.min(800, document.body.clientWidth * 0.7);
      setLogsPanelWidth(maxWidth);
      setIsExpanded(true);
    }
  };

  // Add tabs UI renderer
  const renderTabs = () => {
    // Define all tabs
    const allTabs = [
      { id: 'overview', label: 'Overview', icon: Info },
      { id: 'api', label: 'API', icon: Upload },
      { id: 'console', label: 'Console', icon: Code },
      { id: 'logs', label: 'Logs', icon: Terminal },
    ];
    
    // Filter tabs based on deployment status
    const tabs = selectedDeployment?.status === 'active' 
      ? allTabs 
      : allTabs.filter(tab => tab.id === 'logs');
    
    return (
      <div className={`flex w-full border-b ${darkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center justify-center
                flex-1
                px-4 py-3
                text-xs font-medium
                transition-all duration-200
                border-b-2
                ${isActive 
                  ? darkMode 
                    ? 'text-blue-400 border-blue-500 bg-blue-900/20' 
                    : 'text-blue-600 border-blue-500 bg-blue-50'
                  : darkMode 
                    ? 'text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header with title */}
      <div
        className={`sticky top-0 py-1.5 px-3 border-b z-10 ${
          darkMode
            ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800'
            : 'border-gray-300 bg-gradient-to-r from-white to-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Your Deployments</h2>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div 
          className={`fixed top-2 right-2 z-50 py-2 px-3 rounded-md shadow-lg max-w-xs flex items-center transition-all text-[11px] ${
            notification.type === 'error' 
              ? darkMode ? 'bg-red-800 text-white' : 'bg-red-100 text-red-800 border border-red-200' 
              : darkMode ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800 border border-green-200'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          ) : (
            <Check className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          )}
          <p className="text-[11px]">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto p-0.5 opacity-70 hover:opacity-100"
          >
            <XCircle className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
          <RefreshCw className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-500'} animate-spin mb-3`} />
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading deployments...
          </p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
          <XCircle className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-500'} mb-3`} />
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`px-3 py-1 rounded text-xs font-medium ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state for no deployments */}
      {!isLoading && !error && deployedModels.length === 0 && (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
          <div className={`text-center max-w-md mx-auto p-8 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
            <div className="mb-6 flex justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
                <div className="relative">
                  <Cpu className={`h-10 w-10 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
                </div>
              </div>
            </div>
            <h3 className={`text-xl font-medium mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Your AI Adventure Awaits
            </h3>
            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Deploy your first AI model in just a few clicks. Explore our curated collection of powerful models ready for your next project.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('activate-catalog'))}
              className={`w-full py-3 px-4 rounded-lg transition-all font-medium ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20'
              } flex items-center justify-center hover:shadow-xl hover:transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="mr-2">Explore Models</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-4 flex justify-center">
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                <Info className="h-3 w-3 mr-1" />
                <span>No credit card required to get started</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Deployments list - Ultra compact cards */}
      {!isLoading && !error && deployedModels.length > 0 && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {deployedModels.map((dm) => {
              const statusColors = getStatusColor(dm.status);
              const isSelected = selectedDeployment?.id === dm.id;
              
              return (
                <div
                  key={dm.id}
                  className={`relative overflow-hidden rounded border ${isSelected ? 'ring-1 ring-blue-500' : ''} shadow-sm transition-all hover:shadow-md ${
                    darkMode
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500'
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-500'
                  } cursor-pointer group`}
                  onClick={() => setSelectedDeployedModel(dm)}
                >
                  {/* Status indicator circle in top-right */}
                  <div className="absolute top-1.5 right-1.5 flex items-center">
                    <div className={`h-2 w-2 rounded-full ${statusColors.dot} mr-1 animate-pulse`}></div>
                    <span className={`px-1 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text} text-[9px] font-medium`}>
                      {dm.status.charAt(0).toUpperCase() + dm.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Delete button - appears on hover */}
                  <div 
                    className={`absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity 
                      ${darkMode ? 'bg-red-800/40 hover:bg-red-700/60' : 'bg-red-100 hover:bg-red-200'} 
                      p-0.5 rounded-full cursor-pointer z-10`}
                    onClick={(e) => initiateDeleteDeployment(dm, e)}
                    title="Delete deployment"
                  >
                    <Trash className={`h-2.5 w-2.5 ${darkMode ? 'text-red-300' : 'text-red-500'}`} />
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full opacity-10 bg-gradient-to-tr from-blue-500 to-purple-600"></div>
                  
                  <div className="p-2.5">
                    {/* Model name and icon */}
                    <div className="flex items-center mb-1.5">
                      <div className={`p-1 rounded-md mr-1.5 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Cpu className={`h-3 w-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium leading-tight">{dm.modelId || 'Unknown Model'}</h3>
                        <p className={`text-[9px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                          {dm.apiName || 'API not specified'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Deployment details */}
                    <div className={`text-[9px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} space-y-0.5`}>
                      <div className="flex items-center">
                        <span className="mr-1 text-[8px] uppercase opacity-70">ID:</span>
                        <span className={`font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{dm.id.substring(0, 8)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1 text-[8px] uppercase opacity-70">Created:</span>
                        <span>{dm.createdAt ? new Date(dm.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</span>
                      </div>
                      {dm.memory_usage && (
                        <div className="flex items-center">
                          <span className="mr-1 text-[8px] uppercase opacity-70">Memory:</span>
                          <span>{dm.memory_usage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Sliding Logs Panel - Fix the structure for proper scrolling */}
      <div 
        ref={logsPanelRef}
        style={{ width: logsPanelWidth ? `${logsPanelWidth}px` : undefined }}
        className={`fixed inset-y-0 right-0 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-opacity-95 shadow-xl transform transition-all duration-300 z-30 flex flex-col
          ${selectedDeployment ? 'translate-x-0' : 'translate-x-full'}
          ${darkMode ? 'bg-gray-900' : 'bg-white'} border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        {/* Resize handle with expand/collapse button */}
        {selectedDeployment && (
          <div className="absolute top-0 left-0 bottom-0 flex flex-col items-center z-40">
            {/* Resize handle */}
            <div
              ref={logsResizeRef}
              className={`absolute top-0 left-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 z-40 ${
                darkMode ? 'bg-gray-700 hover:bg-blue-600 active:bg-blue-700' : 'bg-gray-200'
              }`}
              onMouseDown={(e) => {
                logsResizeRef.current.dataset.resizing = 'true';
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                e.preventDefault();
              }}
            ></div>
            
            {/* Expand/collapse button */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 -left-6 p-1 rounded-l flex items-center justify-center cursor-pointer ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={togglePanelExpansion}
              title={isExpanded ? "Collapse panel" : "Expand panel"}
            >
              {isExpanded ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </div>
          </div>
        )}
      
        {selectedDeployment && (
          <>
            {/* Panel Header - Fixed */}
            <div className={`p-3 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedDeployedModel(null)}
                  className={`p-1.5 mr-2 rounded-full hover:bg-opacity-80 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-medium truncate max-w-[180px]">
                  {selectedDeployment.model_id || selectedDeployment.model_name || 'Deployment Details'}
                </h3>
              </div>
              
              <button
                onClick={() => initiateDeleteDeployment(selectedDeployment)}
                disabled={isDeleting}
                className={`p-1 rounded text-[10px] ${
                  darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } text-white flex items-center`}
                title="Delete deployment"
              >
                <Trash className="w-3 h-3 mr-1" />
                <span>Delete</span>
              </button>
            </div>
            
            {/* Tab Navigation - Fixed */}
            <div className="flex-shrink-0">
              {renderTabs()}
            </div>
            
            {/* Tab Content Container - Scrollable */}
            <div className="flex-grow overflow-y-auto">
              {renderTabContent()}
            </div>
          </>
        )}
      </div>
      
      {/* Dark overlay when panel is open */}
      {selectedDeployment && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-20"
          onClick={() => setSelectedDeployedModel(null)}
        />
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className={`p-4 rounded-lg shadow-xl max-w-xs w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-sm font-medium mb-2">Delete Deployment</h3>
            <p className={`mb-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete <span className="font-medium">{deploymentToDelete?.model_name || 'this deployment'}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setDeploymentToDelete(null);
                }}
                disabled={isDeleting}
                className={`px-3 py-1 text-[10px] rounded ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeployment}
                disabled={isDeleting}
                className={`px-3 py-1 text-[10px] rounded ${
                  darkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } flex items-center`}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="animate-spin h-3 w-3 mr-1" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="h-3 w-3 mr-1" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DeploymentDetails.propTypes = {
  darkMode: PropTypes.bool,
  selectedDeployment: PropTypes.object,
  setSelectedDeployedModel: PropTypes.func
};

export default DeploymentDetails;