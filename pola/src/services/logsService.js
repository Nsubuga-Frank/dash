import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../data/firebase.js';

// The base URL should match your deployment API
const API_URL = 'https://c389-24-83-13-62.ngrok-free.app';

/**
 * Opens an SSE connection to the logs stream API for a deployment
 * @param {string} deploymentId - The ID of the deployment in the API
 * @param {object} sshConfig - The SSH configuration for the deployment
 * @param {function} onLogReceived - Callback for each log event
 * @param {function} onMetadataReceived - Callback for metadata events
 * @param {function} onInfoReceived - Callback for deployment info events
 * @param {function} onError - Callback for errors
 * @returns {object} - The EventSource object and a close function
 */
export const streamDeploymentLogs = (
  deploymentId,
  sshConfig,
  onLogReceived,
  onMetadataReceived,
  onInfoReceived,
  onError
) => {
  try {
    // Build the query params from the SSH config
    const params = new URLSearchParams({
      username: sshConfig.username || 'admin',
      host: sshConfig.host || 'localhost',
      port: sshConfig.port || 22,
      timestamps: true
    });
    
    // Add password if available (normally should be handled more securely)
    if (sshConfig.password) {
      params.append('password', sshConfig.password);
    }
    
    // Create the SSE URL
    const sseUrl = `${API_URL}/api/v1/deployments/${deploymentId}/logs/stream?${params.toString()}`;
    
    console.log('Opening SSE connection to:', sseUrl);
    
    // Create the EventSource for SSE
    const eventSource = new EventSource(sseUrl);
    
    // Set up event handlers
    eventSource.addEventListener('deployment_info', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Deployment info:', data);
        if (onInfoReceived) onInfoReceived(data);
        storeDeploymentEvent(deploymentId, 'deployment_info', data);
      } catch (error) {
        console.error('Error parsing deployment info:', error);
      }
    });
    
    eventSource.addEventListener('metadata', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Metadata received:', data);
        if (onMetadataReceived) onMetadataReceived(data);
        storeDeploymentEvent(deploymentId, 'metadata', data);
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }
    });
    
    eventSource.addEventListener('log', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Log received:', data);
        if (onLogReceived) onLogReceived(data);
        storeDeploymentLog(deploymentId, data);
      } catch (error) {
        console.error('Error parsing log:', error);
      }
    });
    
    eventSource.addEventListener('error', (error) => {
      console.error('SSE connection error:', error);
      if (onError) onError(error);
    });
    
    // Return the event source and a close function
    return {
      eventSource,
      close: () => {
        console.log('Closing SSE connection');
        eventSource.close();
      }
    };
  } catch (error) {
    console.error('Error setting up log stream:', error);
    if (onError) onError(error);
    return {
      close: () => {}
    };
  }
};

/**
 * Store a deployment log event in Firebase
 * @param {string} deploymentId - The ID of the deployment
 * @param {object} logData - The log data
 */
const storeDeploymentLog = async (deploymentId, logData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No user logged in, skipping log storage');
      return;
    }
    
    await addDoc(collection(db, 'deployment_logs'), {
      deployment_id: deploymentId,
      user_id: user.uid,
      timestamp: logData.timestamp ? new Date(logData.timestamp) : serverTimestamp(),
      content: logData.content,
      created_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error storing deployment log:', error);
  }
};

/**
 * Store a deployment event (info or metadata) in Firebase
 * @param {string} deploymentId - The ID of the deployment
 * @param {string} eventType - The type of event
 * @param {object} eventData - The event data
 */
const storeDeploymentEvent = async (deploymentId, eventType, eventData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No user logged in, skipping event storage');
      return;
    }
    
    await addDoc(collection(db, 'deployment_events'), {
      deployment_id: deploymentId,
      user_id: user.uid,
      event_type: eventType,
      data: eventData,
      timestamp: serverTimestamp()
    });
    
    // If this is metadata, also update the deployment record
    if (eventType === 'metadata' || eventType === 'deployment_info') {
      const deploymentsRef = collection(db, 'deployments');
      const q = query(
        deploymentsRef,
        where('external_deployment_id', '==', deploymentId)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const deploymentDoc = snapshot.docs[0];
        const deploymentRef = doc(db, 'deployments', deploymentDoc.id);
        
        // Update with the latest metadata
        await updateDoc(deploymentRef, {
          metadata: eventData,
          updated_at: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error storing deployment event:', error);
  }
};

/**
 * Get logs for a deployment with real-time updates
 * @param {string} deploymentId - The ID of the deployment
 * @param {function} onUpdate - Callback for log updates
 * @returns {function} - Unsubscribe function
 */
export const subscribeToDeploymentLogs = (deploymentId, onUpdate) => {
  const logsRef = collection(db, 'deployment_logs');
  const q = query(
    logsRef,
    where('deployment_id', '==', deploymentId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onUpdate(logs);
  });
};

/**
 * Get events for a deployment with real-time updates
 * @param {string} deploymentId - The ID of the deployment
 * @param {function} onUpdate - Callback for event updates
 * @returns {function} - Unsubscribe function
 */
export const subscribeToDeploymentEvents = (deploymentId, onUpdate) => {
  const eventsRef = collection(db, 'deployment_events');
  const q = query(
    eventsRef,
    where('deployment_id', '==', deploymentId),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onUpdate(events);
  });
};

/**
 * Get the logs for a deployment
 * @param {string} deploymentId - The external deployment ID
 * @returns {Promise<Array>} - Array of logs
 */
export const getDeploymentLogs = async (deploymentId) => {
  try {
    const logsRef = collection(db, 'deployment_logs');
    const q = query(
      logsRef,
      where('deployment_id', '==', deploymentId),
      orderBy('timestamp', 'asc')
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
  } catch (error) {
    console.error('Error getting deployment logs:', error);
    throw error;
  }
};

/**
 * Update the status of a deployment
 * @param {string} deploymentId - The external deployment ID
 * @param {string} status - The new status
 * @param {object} [metadata] - Additional metadata to update
 */
export const updateDeploymentStatus = async (deploymentId, status, metadata = {}) => {
  try {
    // Find the internal deployment document that references this external ID
    const deploymentsRef = collection(db, 'deployments');
    const q = query(deploymentsRef, where('external_deployment_id', '==', deploymentId));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.warn(`No deployment found with external ID: ${deploymentId}`);
      return;
    }
    
    // Update each matching deployment (should be just one)
    for (const docSnapshot of snapshot.docs) {
      const deploymentRef = doc(db, 'deployments', docSnapshot.id);
      await updateDoc(deploymentRef, {
        status,
        updated_at: serverTimestamp(),
        ...(metadata.container_id && { container_id: metadata.container_id }),
        ...(metadata && { metadata })
      });
    }
  } catch (error) {
    console.error('Error updating deployment status:', error);
    throw error;
  }
};

export default {
  streamDeploymentLogs,
  subscribeToDeploymentLogs,
  subscribeToDeploymentEvents
}; 