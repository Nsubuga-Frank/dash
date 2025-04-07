import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import toast from 'react-hot-toast';
import db from '../firebase/config';
import PodCard from './PodCard';

const PodGrid = forwardRef(({ userId, darkMode, onLaunchNewPod, refreshingExternal = false }, ref) => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [terminatingPods, setTerminatingPods] = useState(new Set());

  // Expose fetchPods to parent component
  useImperativeHandle(ref, () => ({
    fetchPods
  }));

  useEffect(() => {
    console.log("[PodGrid] User ID:", userId);
    fetchPods();
  }, [userId]);

  const fetchPods = async () => {
    console.log("[PodGrid] Starting to fetch pods from container_subscriptions...");
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
      console.error("[PodGrid] Error fetching pods:", error);
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
  
      if (response.ok || response.status === 404) {
        // Handle success or already deleted
        const subscriptionRef = doc(db, 'container_subscriptions', subscriptionId);
        await updateDoc(subscriptionRef, {
          status: 'terminated',
          terminated_at: new Date().toISOString()
        });
        await fetchPods();
        toast.success("Container terminated successfully!");
      } else {
        throw new Error(responseData.detail?.message || 'Failed to terminate container');
      }
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

  return (
    <div className="w-full">
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : pods.length === 0 ? (
        // Enhanced empty state with better illustration and CTA
        <div className={`
          flex flex-col items-center justify-center py-16 px-6 text-center
          border-2 rounded-xl
          ${darkMode ? 'border-gray-700 bg-gray-800/20' : 'border-gray-200 bg-gray-50/80'}
        `}>
          <div className={`
            p-4 rounded-full mb-4
            ${darkMode ? 'bg-violet-900/30' : 'bg-violet-50'}
          `}>
            <svg 
              className={`w-12 h-12 ${darkMode ? 'text-violet-400' : 'text-violet-500'}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            No Compute Pods Yet
          </h3>
          
          <p className={`text-base mb-6 max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You don't have any active compute pods yet. Launch your first instance to start 
            building and deploying your applications.
          </p>
          
          <button
            onClick={onLaunchNewPod}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg text-base font-medium
              bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm hover:shadow
            `}
          >
            <Plus className="w-5 h-5" />
            <span>Launch New Instance</span>
          </button>
          
          <div className={`mt-8 grid grid-cols-3 gap-4 max-w-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex flex-col items-center text-center">
              <div className={`p-2 rounded-lg mb-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                  <path d="M12 7v5l3 3"></path>
                </svg>
              </div>
              <span className="text-xs font-medium">Quick Deploy</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`p-2 rounded-lg mb-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <span className="text-xs font-medium">Multiple OS Options</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`p-2 rounded-lg mb-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 10h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"></path>
                </svg>
              </div>
              <span className="text-xs font-medium">GPU & CPU Options</span>
            </div>
          </div>
        </div>
      ) : (
        // Grid of pod cards - 5 per row with vertical spacing
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-0 w-full">
          {pods.map((pod) => (
            <PodCard 
              key={pod.id}
              pod={pod} 
              darkMode={darkMode}
              onTerminate={(podId) => terminateSubscription(podId, pod.id)}
              isTerminating={terminatingPods.has(pod.podId)}
              compact={true}
            />
          ))}
        </div>
      )}
    </div>
  );
});

PodGrid.propTypes = {
  userId: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  onLaunchNewPod: PropTypes.func,
  refreshingExternal: PropTypes.bool
};

PodGrid.displayName = 'PodGrid';

export default PodGrid; 