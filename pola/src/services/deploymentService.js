import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../data/firebase.js';

// API URL for the deployment service - update to the localtunnel URL or your actual domain
const API_BASE_URL = 'https://aphrodite-engine.onrender.com';

/**
 * Helper function to log API responses
 * @param {string} endpoint - The API endpoint
 * @param {Response} response - The fetch Response object
 * @param {Object} data - The parsed response data
 * @param {string} method - The HTTP method used
 */
const logApiResponse = async (endpoint, response, data, method = 'GET') => {
  const responseHeaders = {};
  response.headers.forEach((value, name) => {
    responseHeaders[name] = value;
  });

  console.group(`API Response: ${method} ${endpoint}`);
  console.log('Status:', response.status, response.statusText);
  console.log('Headers:', responseHeaders);
  console.log('Response data:', data);
  
  if (!response.ok) {
    console.error('Error response:', data);
  }
  
  console.groupEnd();
  
  // Add to logs collection if we want to keep a history
  try {
    await addDoc(collection(db, 'api_logs'), {
      endpoint,
      method,
      status: response.status,
      statusText: response.statusText,
      timestamp: serverTimestamp(),
      success: response.ok,
      data: data ? JSON.stringify(data) : null
    });
  } catch (logError) {
    console.warn('Could not save API log to Firestore:', logError);
  }
};

/**
 * Helper function to make API requests with logging
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Add default headers to bypass localtunnel authentication
  options.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'bypass-tunnel-reminder': 'true',
    ...(options.headers || {})
  };
  
  console.group(`API Request: ${method} ${url}`);
  console.log('Options:', {
    ...options,
    body: options.body ? JSON.parse(options.body) : undefined
  });
  
  try {
    const response = await fetch(url, options);
    let data;
    
    // Clone the response before reading it to avoid the "body stream already read" error
    const responseClone = response.clone();
    
    try {
      // Try to parse as JSON first
      data = await response.json();
    } catch (parseError) {
      console.warn('Response is not JSON:', parseError);
      
      // If JSON parsing fails, use the cloned response to get text
      const text = await responseClone.text();
      console.log('Response as text:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
      // Check if the response is HTML (could be an error page)
      if (text.trim().startsWith('<')) {
        data = { 
          html: true,
          error: 'Response was HTML instead of JSON',
          status: response.status,
          statusText: response.statusText 
        };
      } else {
        data = { text };
      }
    }
    
    // Use responseClone for logging instead of the already-read response
    await logApiResponse(endpoint, responseClone, data, method);
    
    if (!response.ok) {
      // Special handling for network authentication errors (HTTP 511)
      if (response.status === 511) {
        throw new Error(
          "Network authentication required. The localtunnel service may need authentication or have expired. " +
          "Please check your network connection and tunnel status."
        );
      }
      
      // Properly handle error details from the API response
      if (data.detail) {
        // Handle array of error details
        if (Array.isArray(data.detail)) {
          const errorMessages = data.detail.map(err => 
            typeof err === 'object' ? JSON.stringify(err) : err
          ).join('; ');
          const error = new Error(`API Error: ${errorMessages}`);
          error.rawDetail = data.detail; // Preserve original error details
          throw error;
        }
        // Handle string error detail
        else if (typeof data.detail === 'string') {
          const error = new Error(`API Error: ${data.detail}`);
          error.rawDetail = data.detail;
          throw error;
        }
      }
      
      const error = new Error(data.detail || data.message || data.error || `API request failed: ${response.status}`);
      error.rawResponse = data; // Store the full error response
      error.status = response.status;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Request failed:', error);
    console.groupEnd();
    throw error;
  }
};

/**
 * Monitor a deployment until it reaches a terminal state (active or failed)
 * @param {string} deploymentId - The Firestore deployment document ID
 * @param {string} externalId - The external deployment ID from the API
 * @param {function} onStatusChange - Optional callback for status updates
 * @returns {Promise<Object>} - Final deployment status
 */
export const monitorDeploymentUntilComplete = async (deploymentId, externalId, onStatusChange = null) => {
  console.log(`Starting deployment monitor for ${deploymentId} (external ID: ${externalId})`);
  
  // Maximum time to monitor (15 minutes)
  const MAX_MONITOR_TIME = 15 * 60 * 1000; 
  const startTime = Date.now();
  
  // Track last checked timestamp to reduce database writes
  let lastStatusUpdate = '';
  
  return new Promise((resolve) => {
    const checkStatus = async () => {
      try {
        // Check if we've exceeded max monitor time
        if (Date.now() - startTime > MAX_MONITOR_TIME) {
          console.log(`Deployment monitor timed out after ${MAX_MONITOR_TIME/1000} seconds`);
          await updateDoc(doc(db, 'deployments', deploymentId), {
            status: 'timeout',
            updated_at: serverTimestamp()
          });
          resolve({ status: 'timeout', deployment_id: deploymentId });
          return;
        }
        
        // Call the API to check status using our apiRequest helper
        try {
          const statusData = await apiRequest(`/api/v1/deployments/${externalId}/status`);
          
          // Updated to match our response structure
          const currentStatus = statusData.status;
          
          // If status has changed since last update
          if (currentStatus !== lastStatusUpdate) {
            console.log(`Deployment status updated: ${currentStatus}`);
            lastStatusUpdate = currentStatus;
            
            // Update Firestore deployment document with our fields
            await updateDoc(doc(db, 'deployments', deploymentId), {
              status: currentStatus,
              tunnelUrl: statusData.tunnel_url || null,
              containerId: statusData.container_id || null,
              endpoints: statusData.endpoints || {},
              updated_at: serverTimestamp()
            });
            
            // Add a new status record
            await addDoc(collection(db, 'deployment_status'), {
              deployment_id: deploymentId,
              external_id: externalId,
              status: currentStatus,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
              tunnel_url: statusData.tunnel_url || null
            });
            
            // Call the callback if provided
            if (onStatusChange) {
              onStatusChange(currentStatus, statusData);
            }
            
            // If we've reached a terminal state, create user_model if status is active
            if (currentStatus === 'active') {
              try {
                // Get the full deployment document
                const deploymentDoc = await getDoc(doc(db, 'deployments', deploymentId));
                
                if (deploymentDoc.exists()) {
                  const deployment = deploymentDoc.data();
                  
                  // Create an entry in user_models collection with our API fields
                  await addDoc(collection(db, 'user_models'), {
                    userId: deployment.userId,
                    deployment_id: externalId,
                    model_id: deployment.model_id,
                    model_name: deployment.model_name,
                    tunnel_url: statusData.tunnel_url,
                    endpoints: statusData.endpoints || {},
                    created_at: serverTimestamp(),
                    logs_id: externalId,
                    status: 'active'
                  });
                  
                  console.log(`Created user_model entry for deployment ${deploymentId}`);
                }
              } catch (error) {
                console.error('Error creating user_model:', error);
              }
            }
          }
          
          // If we've reached a terminal state, resolve the promise
          if (currentStatus === 'active' || currentStatus === 'failed') {
            console.log(`Deployment reached terminal state: ${currentStatus}`);
            resolve({ status: currentStatus, statusData });
            return;
          }
        } catch (apiError) {
          console.error(`Error checking deployment status: ${apiError.message}`);
        }
        
        // Continue monitoring
        setTimeout(checkStatus, 5000); // Check every 5 seconds
      } catch (error) {
        console.error('Error monitoring deployment:', error);
        setTimeout(checkStatus, 10000); // Retry after error with longer delay
      }
    };
    
    // Start checking immediately
    checkStatus();
  });
};

/**
 * Deploy a new model instance
 * 
 * @param {Object} model - The model to deploy
 * @param {Object} hardware - The hardware to use for deployment
 * @param {Object} [options] - Additional deployment options
 * @returns {Promise<Object>} - Deployment result with ID and status
 */
export const deployModel = async (model, hardware, options = {}) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;
    
    console.log('Current user state:', {
      isLoggedIn: !!user,
      userId: user?.uid,
      email: user?.email
    });
    
    if (!user) {
      throw new Error('You must be logged in to deploy a model');
    }
    
    // Get the complete model information from huggingface collection if we have a model id
    let huggingfaceModel = null;
    
    if (model.id && !model.huggingface_id) {
      try {
        // Fetch the model from huggingface collection to get complete details
        const modelRef = doc(db, 'huggingface', model.id);
        const modelDoc = await getDoc(modelRef);
        
        if (modelDoc.exists()) {
          huggingfaceModel = { id: modelDoc.id, ...modelDoc.data() };
          
          console.log('Retrieved huggingface model details:', {
            document_uid: modelDoc.id, // Log the document UID explicitly
            name: huggingfaceModel.name,
            huggingface_model_id: huggingfaceModel.huggingface_id || '' // Original HF ID if available
          });
        } else {
          console.warn('Model not found in huggingface collection:', model.id);
        }
      } catch (fetchError) {
        console.error('Error fetching huggingface model:', fetchError);
        // Continue with deployment using the provided model info
      }
    }
    
    // SSH configuration (for remote deployment)
    const ssh_config = options?.ssh_config;
    // const ssh_config = options?.ssh_config || {
    //   host: "24.83.13.62",
    //   username: "tang",
    //   port: 15000,
    //   password: "Yogptcommune1"
    // };
    
    // Prepare deployment data - updated to match our API structure
    const deploymentData = {
      model_id: (model.huggingface_id || model.id || model.model_id || '').toLowerCase(),
      user_id: user.uid,
      api_name: options?.api_name || model.api_name || `${model.name || 'Model'} API`,
      ssh_config: ssh_config,
      auto_restart: options?.auto_restart || true,
      hardware_id: hardware?.id || hardware?.hardware_id || 'gpu_1',
      model_name: model.name || 'Unknown Model'
    };
    
    // If we retrieved the huggingface model, use its details
    if (huggingfaceModel) {
      deploymentData.model_name = huggingfaceModel.name || model.name;
    }
    
    // Log deployment data for debugging, without sensitive information
    console.log('Deploying model with data:', {
      model_id: deploymentData.model_id,
      user_id: deploymentData.user_id,
      api_name: deploymentData.api_name,
      auto_restart: deploymentData.auto_restart,
      hardware_id: deploymentData.hardware_id
    });
    
    try {
      // Make the API call - the backend will handle all Firestore operations
      const apiResponse = await startDeployment(deploymentData);
      
      // Log the complete API response
      console.log('API deployment response:', apiResponse);
      
      // Return the success response with deployment details
      return {
        id: apiResponse.deployment_id,
        deployment_id: apiResponse.deployment_id,
        external_id: apiResponse.deployment_id,
        status: apiResponse.status || 'queued',
        progress: apiResponse.progress || 0,
        model_id: deploymentData.model_id,
        model_name: deploymentData.model_name,
        success: true,
        api_response: apiResponse
      };
    } catch (apiError) {
      // Log the error with full details
      console.error('API deployment failed:', apiError);
      console.error('Raw error details:', apiError.rawDetail || apiError.rawResponse || {});
      
      // Return detailed error information
      return {
        success: false,
        error: apiError.message,
        rawDetail: apiError.rawDetail || null,
        rawResponse: apiError.rawResponse || null,
        status: apiError.status || 422,
        stack: apiError.stack
      };
    }
  } catch (error) {
    console.error('Error deploying model:', error);
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
};

/**
 * Start the actual deployment via API
 * @param {Object} deploymentData - The deployment configuration
 */
const startDeployment = async (deploymentData) => {
  try {
    // Create a safe copy for logging without sensitive info
    const safeData = { ...deploymentData };
    if (safeData.ssh_config && safeData.ssh_config.password) {
      safeData.ssh_config = { ...safeData.ssh_config, password: '********' };
    }
    
    console.group('=== API DEPLOYMENT REQUEST ===');
    console.log('URL:', `${API_BASE_URL}/api/v1/deploy`);
    console.log('Method: POST');
    console.log('Headers:', { 'Content-Type': 'application/json' });
    console.log('Payload:', JSON.stringify(safeData, null, 2));
    console.groupEnd();
    
    try {
      // Make API call to the deployment service - updated endpoint
      return await apiRequest('/api/v1/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deploymentData)
      });
    } catch (apiError) {
      // If there's a tunnel or network issue, provide more helpful error
      if (apiError.message.includes('Network authentication required') || 
          apiError.message.includes('tunnel') ||
          apiError.message.includes('HTML instead of JSON')) {
        console.error('Deployment API connection issue:');
        console.error(`1. Check if localtunnel at ${API_BASE_URL} is running`);
        console.error('2. Verify your network can reach the API server');
        console.error('3. The API server may need to be restarted');
        
        throw new Error(
          "Can't connect to deployment API. Possible causes: " +
          "1) API tunnel expired or needs authentication, " +
          "2) Network issues, or " +
          "3) API server is down. " +
          "Please check your connection and the API server status."
        );
      }
      
      // Log detailed error information
      console.error('Deployment API error details:', {
        message: apiError.message,
        status: apiError.status,
        rawDetail: apiError.rawDetail || null,
        rawResponse: apiError.rawResponse || null
      });
      
      throw apiError;
    }
  } catch (error) {
    console.error('Error starting deployment:', error);
    throw error;
  }
};

/**
 * Check the status of a deployment
 * @param {string} deploymentId - The internal deployment ID
 * @returns {Promise<Object>} - The deployment status
 */
export const checkDeploymentStatus = async (deploymentId) => {
  try {
    // Get the deployment from Firestore
    const deploymentDoc = await getDoc(doc(db, 'deployments', deploymentId));
    
    if (!deploymentDoc.exists()) {
      throw new Error('Deployment not found');
    }
    
    const deployment = deploymentDoc.data();
    
    // Check external status if we have an external ID
    if (deployment.external_id || deployment.deployment_id) {
      try {
        const externalId = deployment.external_id || deployment.deployment_id;
        // Use our apiRequest helper
        const statusData = await apiRequest(`/api/v1//deployments/${externalId}/status`);
        
        // Update Firestore with the latest status - updated field names
        await updateDoc(doc(db, 'deployments', deploymentId), {
          status: statusData.status,
          tunnelUrl: statusData.tunnel_url || deployment.tunnelUrl,
          containerId: statusData.container_id || deployment.containerId,
          endpoints: statusData.endpoints || deployment.endpoints || {},
          updated_at: serverTimestamp()
        });
        
        return {
          status: statusData.status,
          model_id: deployment.model_id,
          tunnel_url: statusData.tunnel_url || deployment.tunnelUrl,
          deployment_id: externalId,
          created_at: deployment.created_at,
          updated_at: new Date(),
          container_id: statusData.container_id || deployment.containerId || null,
          endpoints: statusData.endpoints || deployment.endpoints || {}
        };
      } catch (apiError) {
        console.error('Error fetching external status:', apiError);
        // Continue using local status if API call fails
      }
    } else {
      console.log('No external_id available for deployment', deploymentId);
    }
    
    // Return local status if external check failed or wasn't available
    return {
      status: deployment.status,
      model_id: deployment.model_id,
      tunnel_url: deployment.tunnelUrl,
      deployment_id: deployment.external_id || deployment.deployment_id,
      created_at: deployment.created_at,
      updated_at: deployment.updated_at,
      container_id: deployment.containerId || null,
      endpoints: deployment.endpoints || {}
    };
  } catch (error) {
    console.error('Error checking deployment status:', error);
    throw error;
  }
};

/**
 * Get all deployments for the current user
 * @returns {Promise<Array>} - Array of user's deployments
 */
export const getUserDeployments = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not logged in');
    }
    
    // Option 1: Use our API to get deployments by user - matches our endpoint
    try {
      const deployments = await apiRequest(`/api/v1//deployments?userId=${user.uid}`);
      return deployments;
    } catch (apiError) {
      console.error('Error fetching deployments from API:', apiError);
      // Fall back to Firestore if API fails
    }
    
    // Option 2: Use Firestore directly as fallback
    const deploymentsRef = collection(db, 'deployments');
    const q = query(deploymentsRef, where('userId', '==', user.uid), orderBy('created_at', 'desc'));
    
    const snapshot = await getDocs(q);
    const deployments = [];
    
    snapshot.forEach((doc) => {
      deployments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return deployments;
  } catch (error) {
    console.error('Error getting user deployments:', error);
    throw error;
  }
};

/**
 * Get user models with logs
 * @param {boolean} includeLogs - Whether to include logs
 * @returns {Promise<Array>} - Array of user models
 */
export const getUserModels = async (includeLogs = false) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not logged in');
    }
    
    // Use our user-specific logs endpoint
    try {
      return await apiRequest(`/api/v1/user/${user.uid}/logs${includeLogs ? '?include_logs=true' : ''}`);
    } catch (apiError) {
      console.error('Error fetching from API:', apiError);
      
      // Fall back to Firestore if API fails
      const userModelsRef = collection(db, 'user_models');
      const q = query(
        userModelsRef,
        where('userId', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const models = [];
      
      snapshot.forEach((doc) => {
        models.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return models;
    }
  } catch (error) {
    console.error('Error getting user models:', error);
    throw error;
  }
};

/**
 * Get a specific deployment by ID
 * @param {string} deploymentId - The deployment ID
 * @returns {Promise<Object>} - The deployment details
 */
export const getDeploymentById = async (deploymentId) => {
  try {
    // Option 1: Try our direct API endpoint first
    try {
      return await apiRequest(`/api/v1/deployments/${deploymentId}`);
    } catch (apiError) {
      console.error('Error fetching from API:', apiError);
      // Fall back to Firestore if API fails
    }
    
    // Option 2: Use Firestore as fallback
    const deploymentDoc = await getDoc(doc(db, 'deployments', deploymentId));
    
    if (!deploymentDoc.exists()) {
      throw new Error('Deployment not found');
    }
    
    const deployment = {
      id: deploymentDoc.id,
      ...deploymentDoc.data()
    };
    
    // If we have an external ID, fetch the latest status
    if (deployment.external_id || deployment.deployment_id) {
      try {
        const externalId = deployment.external_id || deployment.deployment_id;
        const statusData = await apiRequest(`/api/v1/deployments/${externalId}/status`);
        
        // Merge external status with local data
        return {
          ...deployment,
          ...statusData
        };
      } catch (error) {
        console.error('Error fetching external deployment details:', error);
        // Continue with local data if external fetch fails
      }
    }
    
    return deployment;
  } catch (error) {
    console.error('Error getting deployment:', error);
    throw error;
  }
};

/**
 * Stop a running deployment
 * @param {string} deploymentId - The deployment ID
 * @returns {Promise<Object>} - Result of the stop operation
 */
export const stopDeployment = async (deploymentId) => {
  try {
    const deploymentDoc = await getDoc(doc(db, 'deployments', deploymentId));
    
    if (!deploymentDoc.exists()) {
      throw new Error('Deployment not found');
    }
    
    const deployment = deploymentDoc.data();
    const externalId = deployment.external_id || deployment.deployment_id;
    
    if (!externalId) {
      throw new Error('No external deployment ID found');
    }
    
    console.log('Stopping deployment:', externalId);
    
    // Make API call to stop the deployment
    const result = await apiRequest(`api/v1/deployments/${externalId}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Update status in Firestore
    await updateDoc(doc(db, 'deployments', deploymentId), {
      status: 'stopped',
      updated_at: serverTimestamp()
    });
    
    return {
      id: deploymentId,
      external_id: externalId,
      status: 'stopped',
      ...result
    };
  } catch (error) {
    console.error('Error stopping deployment:', error);
    throw error;
  }
};

/**
 * Get deployment logs for a specific deployment
 * @param {string} deploymentId - The deployment ID
 * @returns {Promise<Array>} - Array of log entries
 */
export const getDeploymentLogs = async (deploymentId) => {
  try {
    const deploymentDoc = await getDoc(doc(db, 'deployments', deploymentId));
    
    if (!deploymentDoc.exists()) {
      throw new Error('Deployment not found');
    }
    
    const deployment = deploymentDoc.data();
    const externalId = deployment.external_id || deployment.deployment_id;
    
    if (!externalId) {
      throw new Error('No external deployment ID found');
    }
    
    try {
      // Use our logs endpoint with our helper
      const responseData = await apiRequest(`api/v1/deployments/${externalId}/logs`);
      
      // Add response to the logs collection
      await addDoc(collection(db, 'api_logs'), {
        endpoint: `logs/${externalId}`,
        timestamp: serverTimestamp(),
        log_count: responseData.logs?.length || 0
      });
      
      // Handle different possible response formats based on our implementation
      if (responseData.logs && Array.isArray(responseData.logs)) {
        return responseData.logs.map((log, index) => ({
          id: `log_${index}`,
          timestamp: new Date().toISOString(),
          content: log,
          level: 'info'
        }));
      }
      
      return [];
    } catch (apiError) {
      console.error('Error fetching logs from API:', apiError);
      // Fall back to logs stored in Firestore
      
      const logsRef = collection(db, 'deployment_logs');
      const q = query(
        logsRef, 
        where('deployment_id', '==', deploymentId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const logs = [];
      
      snapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return logs;
    }
  } catch (error) {
    console.error('Error getting deployment logs:', error);
    throw error;
  }
};

/**
 * Get the log streaming URL for a deployment
 * @param {string} deploymentId - The deployment ID 
 * @returns {Promise<Object>} - Object with streaming URL and curl command
 */
export const getLogStreamingUrl = async (deploymentId) => {
  try {
    const deploymentDoc = await getDoc(doc(db, 'deployments', deploymentId));
    
    if (!deploymentDoc.exists()) {
      throw new Error('Deployment not found');
    }
    
    const deployment = deploymentDoc.data();
    const externalId = deployment.external_id || deployment.deployment_id;
    
    if (!externalId) {
      throw new Error('No external deployment ID found');
    }
    
    // Log that we're generating streaming URLs
    console.log('Generating streaming URLs for deployment:', externalId);
    
    // Construct the logs streaming URL based on our implementation
    const streamUrl = `${API_BASE_URL}api/v1/deployments/${externalId}/logs/stream`;
    const htmlViewerUrl = `${API_BASE_URL}/deployments/${externalId}/logs/html`;
    
    // Log the URLs we're returning
    console.log('Stream URL:', streamUrl);
    console.log('HTML Viewer URL:', htmlViewerUrl);
    
    return {
      deployment_id: externalId,
      stream_url: streamUrl,
      curl_command: `curl -N "${streamUrl}"`,
      html_viewer_url: htmlViewerUrl
    };
  } catch (error) {
    console.error('Error getting log streaming URL:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time log updates for a deployment using Server-Sent Events
 * @param {string} deploymentId - The deployment ID
 * @param {Function} onLogEvent - Callback for log events
 * @param {Function} onMetadataEvent - Callback for metadata events 
 * @param {Function} onError - Callback for errors
 * @returns {Object} - Object with close method to stop streaming
 */
export const subscribeToLogStream = async (deploymentId, onLogEvent, onMetadataEvent, onError) => {
  try {
    const deploymentDoc = await getDoc(doc(db, 'deployments', deploymentId));
    
    if (!deploymentDoc.exists()) {
      throw new Error('Deployment not found');
    }
    
    const deployment = deploymentDoc.data();
    const externalId = deployment.external_id || deployment.deployment_id;
    
    if (!externalId) {
      throw new Error('No external deployment ID found');
    }
    
    console.log('Setting up SSE connection for deployment:', externalId);
    
    // Use Server-Sent Events (SSE) for real-time streaming
    const eventUrl = `${API_BASE_URL}/deployments/${externalId}/logs/stream`;
    console.log('SSE URL:', eventUrl);
    
    const eventSource = new EventSource(eventUrl);
    
    // Handle connection events
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      
      // Log the connection to Firestore
      addDoc(collection(db, 'api_logs'), {
        endpoint: `logs/stream/${externalId}`,
        timestamp: serverTimestamp(),
        event: 'connection_opened',
        status: 'connected'
      });
      
      onMetadataEvent({
        type: 'connected',
        deployment_id: externalId,
        timestamp: new Date().toISOString()
      });
    };
    
    // Handle log events
    eventSource.addEventListener('log', (event) => {
      try {
        console.log('Received log event:', event.data);
        
        const data = JSON.parse(event.data);
        onLogEvent({
          timestamp: data.timestamp || new Date().toISOString(),
          content: data.content || "",
          id: `log_${Date.now()}`
        });
      } catch (error) {
        console.error('Error parsing log event:', error, event.data);
      }
    });
    
    // Handle metadata events
    eventSource.addEventListener('metadata', (event) => {
      try {
        console.log('Received metadata event:', event.data);
        
        const data = JSON.parse(event.data);
        onMetadataEvent({
          type: 'metadata',
          ...data
        });
      } catch (error) {
        console.error('Error parsing metadata event:', error, event.data);
      }
    });
    
    // Handle default message events
    eventSource.onmessage = (event) => {
      try {
        console.log('Received message event:', event.data);
        
        const data = JSON.parse(event.data);
        // Determine if this is a log or metadata
        if (data.content) {
          onLogEvent({
            timestamp: data.timestamp || new Date().toISOString(),
            content: data.content,
            id: `log_${Date.now()}`
          });
        } else {
          onMetadataEvent({
            type: 'unknown',
            ...data
          });
        }
      } catch (error) {
        console.error('Error parsing message event:', error, event.data);
      }
    };
    
    // Handle error events
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      
      // Log the error to Firestore
      addDoc(collection(db, 'api_logs'), {
        endpoint: `logs/stream/${externalId}`,
        timestamp: serverTimestamp(),
        event: 'connection_error',
        error: error.toString()
      });
      
      onError(error);
    };
    
    // Return control object
    return {
      close: () => {
        console.log('Closing SSE connection');
        eventSource.close();
        
        // Log the close to Firestore
        addDoc(collection(db, 'api_logs'), {
          endpoint: `logs/stream/${externalId}`,
          timestamp: serverTimestamp(),
          event: 'connection_closed'
        });
      }
    };
  } catch (error) {
    console.error('Error setting up log streaming:', error);
    onError(error);
    return {
      close: () => {}
    };
  }
};

/**
 * Generate a URL for viewing logs in the HTML viewer
 * @param {string} deploymentId - The deployment ID
 * @returns {string} - The HTML viewer URL
 */
export const getHtmlLogViewerUrl = (deploymentId) => {
  return `${API_BASE_URL}/api/v1/deployments/${deploymentId}/logs/html`;
};

/**
 * Get the URL for the user's HTML logs dashboard showing all deployments
 * @param {string} userId - The user ID
 * @returns {string} - The HTML dashboard URL
 */
export const getUserLogsDashboardUrl = (userId) => {
  return `${API_BASE_URL}/api/v1/user/${userId}/logs/html`;
};

/**
 * Test the deployed model with a sample query
 * @param {string} apiUrl - The model API URL
 * @param {string} modelId - The model ID
 * @param {string} message - The test message 
 * @returns {Promise<Object>} - The model's response
 */
export const testDeployedModel = async (apiUrl, modelId, message = "Hello! What model are you?") => {
  try {
    if (!apiUrl) {
      throw new Error('No API URL provided');
    }
    
    // Ensure the API URL has the correct format
    if (!apiUrl.startsWith('http')) {
      apiUrl = 'https://' + apiUrl;
    }
    
    const requestUrl = `${apiUrl}/v1/chat/completions`;
    const requestBody = {
      model: modelId, // Aphrodite requires the model parameter
      messages: [
        { role: "user", content: message }
      ],
      max_tokens: 100
    };
    
    console.group('Model Test Request');
    console.log('URL:', requestUrl);
    console.log('Headers:', { 'Content-Type': 'application/json', 'Accept': 'application/json', 'bypass-tunnel-reminder': 'true' });
    console.log('Body:', JSON.stringify(requestBody, null, 2));
    console.groupEnd();
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'bypass-tunnel-reminder': 'true'
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    // Log the model's response
    console.group('Model Test Response');
    console.log('Status:', response.status, response.statusText);
    console.log('Data:', responseData);
    console.groupEnd();
    
    // Log the test to Firestore
    try {
      await addDoc(collection(db, 'model_tests'), {
        model_id: modelId,
        api_url: apiUrl,
        prompt: message,
        response: JSON.stringify(responseData),
        status: response.status,
        timestamp: serverTimestamp(),
        success: response.ok
      });
    } catch (logError) {
      console.warn('Could not save model test to Firestore:', logError);
    }
    
    if (!response.ok) {
      throw new Error(`Test request failed: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error testing deployed model:', error);
    throw error;
  }
}; 