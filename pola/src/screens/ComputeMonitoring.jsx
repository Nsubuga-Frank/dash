import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Plus, RefreshCw, Server } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast'; // Changed to react-hot-toast
import db from './firebase/config';
import PodCard from './widgets/PodCard';

const ComputeMonitoring = ({ userId, darkMode, onNavChange }) => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [terminatingPods, setTerminatingPods] = useState(new Set());

  useEffect(() => {
    console.log("[ComputeMonitoring] User ID:", userId);
    fetchPods();
  }, [userId]);

  const fetchPods = async () => {
    console.log("[ComputeMonitoring] Starting to fetch pods from container_subscriptions...");
    setRefreshing(true);
    try {
      const podsQuery = query(
        collection(db, 'container_subscriptions'),
        where('user_id', '==', userId)
      );
      
      const podsSnapshot = await getDocs(podsQuery);
      
      const computePods = podsSnapshot.docs.map((docSnap) => {
        const subData = docSnap.data();
        let timeRemaining = 0;
        
        // Calculate remaining time if pod is not terminated
        if (subData.status !== 'terminated' && subData.expires_at) {
          const remainingMs = new Date(subData.expires_at).getTime() - Date.now();
          timeRemaining = Math.max(Math.floor(remainingMs / 3600000), 0);
        }

        return {
          id: docSnap.id,
          podId: subData.container_id,
          status: subData.status || 'pending',
          createdAt: subData.created_at,
          terminatedAt: subData.terminated_at,
          timeRemaining,
          connection: subData.container_info,
          subscriptionDetails: subData.subscription_details,
        };
      });

      // Filter out null pods and pods with "unknown" in their specs
      const validPods = computePods.filter((pod) => {
        if (!pod) return false;
        
        // Check if the pod specs contain "unknown"
        const cpuName = pod.subscriptionDetails?.specs?.compute === 'GPU' 
          ? (pod.subscriptionDetails?.specs?.gpu_specs?.gpu_name || '') 
          : (pod.subscriptionDetails?.specs?.cpu_specs?.cpu_name || '');
        
        // Filter out pods with "unknown" in their CPU/GPU name (case insensitive)
        return !cpuName.toLowerCase().includes('unknown');
      });
      
      setPods(validPods);
    } catch (error) {
      console.error("[ComputeMonitoring] Error fetching pods:", error);
      toast.error("Failed to fetch pods. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const terminateSubscription = async (podId, subscriptionId) => {
    try {
      setTerminatingPods(prev => new Set([...prev, podId]));
      
      // Find the pod to get the correct container ID
      const pod = pods.find(p => p.id === subscriptionId);
      if (!pod || !pod.connection) {
        throw new Error('Pod information not found');
      }
  
      // Use the container_id from container_info
      const actualContainerId = pod.connection.container_id;
      console.log(`Using actual container ID: ${actualContainerId} for subscription ${subscriptionId}`);
      
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
  
      const baseUrl = 'https://orchestrator-gekh.onrender.com'
  
      console.log(`Terminating pod ${actualContainerId} via ${baseUrl}`);
  
      const response = await fetch(`${baseUrl}/api/v1/containers/${actualContainerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      const responseData = await response.json().catch(() => ({ detail: { message: 'Unknown error' } }));
      console.log('Delete response:', response.status, responseData);
  
      // Only proceed with Firestore update if deletion was successful
      if (response.ok) {
        console.log('Container deleted successfully, updating Firestore...');
        const subscriptionRef = doc(db, 'container_subscriptions', subscriptionId);
        await updateDoc(subscriptionRef, {
          status: 'terminated',
          terminated_at: new Date().toISOString()
        });
        await fetchPods();
        toast.success("Container terminated successfully!");
        return;
      }
  
      // Handle 404 case - container might be already deleted
      if (response.status === 404) {
        console.log('Container not found on backend, might be already deleted');
        console.log('Checking container status in Firestore...');
        
        // Check current status in Firestore
        const subscriptionRef = doc(db, 'container_subscriptions', subscriptionId);
        const subscriptionDoc = await getDoc(subscriptionRef);
        
        if (subscriptionDoc.exists() && subscriptionDoc.data().status !== 'terminated') {
          console.log('Container not terminated in Firestore, updating status...');
          await updateDoc(subscriptionRef, {
            status: 'terminated',
            terminated_at: new Date().toISOString()
          });
          await fetchPods();
          toast.success("Container terminated successfully!");
        } else {
          console.log('Container already marked as terminated in Firestore');
        }
        return;
      }
  
      // If we get here, it's an error we should handle
      throw new Error(responseData.detail?.message || 'Failed to terminate container');
  
    } catch (error) {
      console.error('Error terminating subscription:', error);
      toast.error(`Failed to terminate subscription: ${error.message}`);
    } finally {
      setTerminatingPods(prev => {
        const newSet = new Set(prev);
        newSet.delete(podId);
        return newSet;
      });
    }
  };

  const handleExploreClick = () => {
    if (onNavChange) {
      onNavChange('compute');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Compute Pods
          </h1>
          <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Monitor and manage your active compute pods
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button
            onClick={fetchPods}
            className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center
              ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExploreClick}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
              bg-violet-600 hover:bg-violet-700 text-white text-sm sm:text-base`}
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Pod</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : pods.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {pods.map((pod) => (
            <PodCard 
              key={pod.id} 
              pod={pod} 
              darkMode={darkMode}
              onTerminate={() => terminateSubscription(pod.podId, pod.id)}
              isTerminating={terminatingPods.has(pod.podId)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4">
            <Server className="w-12 h-12 mx-auto text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium mb-2">No Active Pods</h3>
          <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You don&apos;t have any active compute pods.
          </p>
          <button
            onClick={fetchPods}
            className={`mt-4 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm sm:text-base`}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

// Add PropTypes validation
ComputeMonitoring.propTypes = {
  userId: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  onNavChange: PropTypes.func
};

export default ComputeMonitoring;