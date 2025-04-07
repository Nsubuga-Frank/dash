import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { FaMicrochip } from 'react-icons/fa';
import DeploymentConfig from './DeploymentConfig';
import HardwareCard from './HardwareCard';
import LoginModal from './LoginModal';
import db from './firebase/config';

const GPUSelectionApp = ({ darkMode, onNavChange, typeFilter = 'all', verificationFilter = 'all', resources: externalResources }) => {
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [minerMappings, setMinerMappings] = useState({});
  const [resources, setResources] = useState(externalResources || []);
  const deploymentConfigRef = useRef(null);
  const [minerStates, setMinerStates] = useState({});
  const [resourcesWithStates, setResourcesWithStates] = useState([]);
  const [verifiedMiners, setVerifiedMiners] = useState({});
  const [activeSubscriptions, setActiveSubscriptions] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Add auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Filter resources based on selected filters
  const filteredResources = resourcesWithStates.filter(resource => {
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'gpu' && resource.gpu_specs) ||
      (typeFilter === 'cpu' && !resource.gpu_specs);
    
    const matchesVerification = verificationFilter === 'all' ||
      (verificationFilter === 'verified' && resource.isVerifiedMiner) ||
      (verificationFilter === 'unverified' && !resource.isVerifiedMiner);
    
    return matchesType && matchesVerification;
  });

  // Always fetch miner states and mappings for monitoring
  useEffect(() => {
    const unsubMiners = onSnapshot(
      collection(db, "miners"),
      (snapshot) => {
        const newMappings = {};
        const newVerifiedMiners = {};
        
        snapshot.forEach((docSnap) => {
          const minerId = docSnap.id;
          const data = docSnap.data();
          
          newVerifiedMiners[minerId] = data.status === "verified";
          
          if (Array.isArray(data.compute_resources)) {
            data.compute_resources.forEach((resourceId) => {
              newMappings[resourceId] = minerId;
            });
          }
        });
        
        setMinerMappings(newMappings);
        setVerifiedMiners(newVerifiedMiners);
      },
      (error) => {
        console.error("Error fetching miners:", error);
      }
    );
    return () => unsubMiners();
  }, []);

  // Fetch resources only if no external resources provided
  useEffect(() => {
    if (externalResources) {
      setResources(externalResources);
      return;
    }

    const unsubscribeResources = onSnapshot(
      collection(db, 'compute_resources'),
      (snapshot) => {
        const resources = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setResources(resources);
      },
      (error) => {
        console.error('[GPUSelectionApp] Error fetching compute resources:', error);
      }
    );

    return () => {
      unsubscribeResources();
    };
  }, [externalResources]);

  // Always monitor resource availability
  useEffect(() => {
    const unsubscribeAvailability = onSnapshot(
      collection(db, 'resource_availability'),
      (snapshot) => {
        const availabilityData = {};
        snapshot.docs.forEach((doc) => {
          availabilityData[doc.id] = doc.data();
        });
      },
      (error) => {
        console.error('[GPUSelectionApp] Error fetching resource availability:', error);
      }
    );

    return () => {
      unsubscribeAvailability();
    };
  }, []);

  // Always monitor miner states
  useEffect(() => {
    const unsubMinerStates = onSnapshot(
      collection(db, 'miner_states'),
      (snapshot) => {
        const newMinerStates = {};
        snapshot.forEach((docSnap) => {
          newMinerStates[docSnap.id] = docSnap.data();
        });
        setMinerStates(newMinerStates);
      },
      (error) => {
        console.error('[GPUSelectionApp] Error fetching miner_states:', error);
      }
    );
    return () => unsubMinerStates();
  }, []);

  // Always monitor subscriptions
  useEffect(() => {
    const unsubSubscriptions = onSnapshot(
      collection(db, 'container_subscriptions'),
      (snapshot) => {
        const subsMapping = {};
        snapshot.docs.forEach((doc) => {
          const subData = doc.data();
          if (subData.status === "active") {
            subsMapping[subData.resource_id] = "active";
          }
        });
        setActiveSubscriptions(subsMapping);
      },
      (error) => {
        console.error('[GPUSelectionApp] Error fetching container_subscriptions:', error);
      }
    );
    return () => unsubSubscriptions();
  }, []);

  // Combine resources with their states
  useEffect(() => {
    const combined = resources.map((resource) => {
      const minerId = minerMappings[resource.id];
      const minerState = minerId ? minerStates[minerId] : null;
      const subscription_status = activeSubscriptions[resource.id] || "inactive";
      const isVerifiedMiner = minerId ? verifiedMiners[minerId] || false : false;
      
      return {
        ...resource,
        minerId: minerId || 'N/A',
        minerState: minerState || { current_status: 'unknown' },
        availability: {
          total_capacity: resource.cpu_specs?.total_cpus || 0,
          available_capacity: 0,
          total_storage: parseFloat(resource.storage?.capacity) || 0,
          available_storage: 0,
          active_allocations: 0,
          status: minerState?.current_status || 'unavailable'
        },
        currentStatus: minerState?.current_status || 'unknown',
        subscription_status,
        isVerifiedMiner
      };
    });
    setResourcesWithStates(combined);
  }, [resources, minerMappings, minerStates, activeSubscriptions, verifiedMiners]);

  const handleResourceSelection = (resourceId, showModal = false) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Only set selectedResourceId if showModal flag is true, otherwise don't track selection
    if (showModal) {
      setSelectedResourceId(resourceId);
      
      // If showModal flag is true, scroll to the deployment config section
      if (deploymentConfigRef.current) {
        deploymentConfigRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Add handler for navigation events from DeploymentConfig
  const handleNavChange = (destination) => {
    // If destination is empty string, just clear selection
    if (destination === '') {
      setSelectedResourceId(null);
    } else if (onNavChange) {
      // Otherwise pass to parent
      onNavChange(destination);
    }
  };

  const currentResource = resourcesWithStates.find(
    resource => resource.id === selectedResourceId
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 dark:bg-gray-800 rounded-lg">
                <FaMicrochip className="mx-auto text-4xl mb-3 text-gray-400 dark:text-gray-600" />
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No {typeFilter !== 'all' ? `${typeFilter.toUpperCase()} ` : ''}
                  {verificationFilter !== 'all' ? `${verificationFilter} ` : ''}
                  resources available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredResources.map((resource) => (
                  <HardwareCard
                    key={resource.id}
                    hardware={resource}
                    onSelect={handleResourceSelection}
                    darkMode={darkMode}
                    currentStatus={resource.currentStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {currentResource && (
          <div ref={deploymentConfigRef}>
            <DeploymentConfig
              onNavChange={handleNavChange}
              selectedResource={currentResource}
              minerMappings={minerMappings}
              darkMode={darkMode}
              selectedKey={selectedKey}
              setSelectedKey={setSelectedKey}
            />
          </div>
        )}

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

GPUSelectionApp.propTypes = {
  darkMode: PropTypes.bool,
  onNavChange: PropTypes.func,
  typeFilter: PropTypes.oneOf(['all', 'gpu', 'cpu']),
  verificationFilter: PropTypes.oneOf(['all', 'verified', 'unverified']),
  resources: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    gpu_specs: PropTypes.object,
    isVerifiedMiner: PropTypes.bool,
    // Add other resource properties as needed
  }))
};

export default GPUSelectionApp;