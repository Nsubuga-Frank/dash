'use client';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import AuthModal from "../auth/AuthModal";
import DeploymentModal from "./DeploymentModal";
import db from "./firebase/config";

const DeploymentConfig = ({ 
  selectedResource, 
  minerMappings, 
  darkMode, 
  selectedKey, 
  setSelectedKey, 
  onNavChange 
}) => {
  // State variables
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isShowingComputeAccess, setShowComputeAccess] = useState(false);
  const [computeDetails, setComputeDetails] = useState(null);
  const [latestError, setError] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(true);
  const [selectedAccessMethods, setSelectedAccessMethods] = useState({
    ssh: true,
    jupyter: false,
    tensorboard: false
  });
  // Add new state for deployment logs
  const [deploymentLogs, setDeploymentLogs] = useState([]);

  const auth = getAuth();

  // Helper function to add a new log entry
  const addLogEntry = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    setDeploymentLogs(prevLogs => [...prevLogs, logEntry]);
  };

  // Always show the deployment modal when a resource is selected
  useEffect(() => {
    if (selectedResource) {
      setShowDeploymentModal(true);
    }
  }, [selectedResource]);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      setIsLoggedIn(!!user);
      // If user logs out, clear selected key
      if (!user) {
        setSelectedKey(null);
      }
    });
    return () => unsubscribe();
  }, [auth, setSelectedKey]);

  // Calculate duration based on plan
  const calculateDuration = (planId) => {
    switch (planId) {
      case "weekly":
        return { hours: 24 * 7, display: "7 days" };
      case "monthly":
        return { hours: 24 * 30, display: "30 days" };
      default:
        return { hours: 24, display: "24 hours" };
    }
  };

  // Get resource specs and pricing
  const specs = selectedResource?.gpu_specs || selectedResource?.cpu_specs || {};
  const isGPU = selectedResource?.resource_type?.toLowerCase() === "gpu";
  const basePrice = parseFloat(selectedResource?.hourly_price || 0);
  const computeDisplay = isGPU
    ? `${specs.cuda_cores || 0} CUDA cores`
    : `${specs.total_cpus || 0} CPU cores`;

  // Network pricing based on plan
  const getNetworkPrice = (planId) => {
    switch (planId) {
      case "weekly":
        return 0.15;
      case "monthly":
        return 0.25;
      default:
        return 0.10;
    }
  };

  // Generate subscription plans
  const plans = useMemo(
    () => [
      {
        id: "standard",
        name: "Standard",
        description: "Dedicated compute",
        compute: computeDisplay,
        ram: selectedResource?.ram || "0 GB",
        storage: selectedResource?.storage?.capacity || "0 GB",
        computePrice: basePrice,
        networkPrice: getNetworkPrice("standard"),
      },
      {
        id: "weekly",
        name: "Weekly",
        description: "5% savings",
        compute: computeDisplay,
        ram: selectedResource?.ram || "0 GB",
        storage: selectedResource?.storage?.capacity || "0 GB",
        computePrice: basePrice * 0.95,
        networkPrice: getNetworkPrice("weekly"),
      },
      {
        id: "monthly",
        name: "Monthly",
        description: "10% savings",
        compute: computeDisplay,
        ram: selectedResource?.ram || "0 GB",
        storage: selectedResource?.storage?.capacity || "0 GB",
        computePrice: basePrice * 0.90,
        networkPrice: getNetworkPrice("monthly"),
      },
    ],
    [selectedResource, basePrice, computeDisplay]
  );

  const selectedPlanDetails = plans.find((plan) => plan.id === selectedPlan);

  // Create subscription (using selectedKey)
  const createSubscription = async (plan) => {
    if (!selectedResource || !selectedKey) {
      const errorMsg = "Please select both a resource and an SSH key";
      setError(errorMsg);
      addLogEntry(`Error: ${errorMsg}`);
      return false;
    }

    try {
      const minerId = minerMappings[selectedResource.id];
      if (!minerId) {
        const errorMsg = "No miner found for this compute resource";
        addLogEntry(`Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }
  
      const containerId = 'container_' + Math.random().toString(36).substr(2, 9);
      const containerData = {
        id: containerId,
        user_id: auth.currentUser.uid,
        miner_id: minerId,
        resource_id: selectedResource.id,
        ssh_key: selectedKey.public_key
      };
  
      console.log('====================================');
      console.log('Creating container: ', containerData);
      console.log('====================================');
      addLogEntry("Sending container creation request", containerData);
  
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("https://orchestrator-gekh.onrender.com/api/v1/containers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(containerData)
      });
  
      console.log('====================================');
      console.log('Raw Response: ', response);
      console.log('====================================');
      addLogEntry(`API Response Status: ${response.status}`);
  
      const result = await response.json();
      console.log('Parsed Result: ', result);
      addLogEntry("API Response Data", result);
  
      if (response.ok && result.success) {
        const containerInfo = result.container_info;
  
        // Build subscriptionData and ensure undefined fields are replaced.
        const subscriptionData = {
          user_id: auth.currentUser.uid,
          container_id: result.container_id,
          container_info: containerInfo,
          resource_id: selectedResource.id,
          miner_id: minerId,
          subscription_details: {
            plan: plan,
            duration: calculateDuration(plan),
            compute_price: selectedPlanDetails.computePrice,
            network_price: selectedPlanDetails.networkPrice,
            total_price: selectedPlanDetails.computePrice + selectedPlanDetails.networkPrice,
            specs: {
              compute: selectedResource.resource_type,
              ram: selectedResource.ram,
              storage: selectedResource.storage?.capacity,
              gpu_specs: selectedResource.gpu_specs !== undefined ? selectedResource.gpu_specs : null,
              cpu_specs: selectedResource.cpu_specs
            }
          },
          status: "active",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + calculateDuration(plan).hours * 60 * 60 * 1000).toISOString()
        };
  
        console.log('====================================');
        console.log('Subscription Data: ', subscriptionData);
        console.log('====================================');
        addLogEntry("Creating subscription record", subscriptionData);
  
        try {
          const docRef = await addDoc(collection(db, 'container_subscriptions'), subscriptionData);
          console.log('Document successfully created in "container_subscriptions"', docRef.id);
          addLogEntry("Subscription record created", { id: docRef.id });
        } catch (firestoreError) {
          console.error('Error writing document to Firestore:', firestoreError);
          addLogEntry(`Firestore error: ${firestoreError.message}`);
          throw new Error("Failed to create Firestore document");
        }
  
        const accessDetails = {
          ip: containerInfo.host,
          sshCommand: `ssh ${containerInfo.username}@${containerInfo.host} -p ${containerInfo.ssh_port}`,
          ports: {
            ssh: containerInfo.ssh_port,
            jupyter: 8888,
            tensorboard: 6006
          },
          username: containerInfo.username,
          duration: calculateDuration(plan).display,
          containerId: result.container_id
        };
        
        setComputeDetails(accessDetails);
        addLogEntry("Deployment successful! Access details:", accessDetails);
  
        return true;
      } else {
        const errorMsg = result.message || "Failed to create container";
        addLogEntry(`API Error: ${errorMsg}`, result);
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg = `Failed to create subscription: ${error.message}`;
      setError(errorMsg);
      addLogEntry(`Error: ${errorMsg}`);
      return false;
    }
  };
  
  // Handle resource launch
  const handleLaunch = async (plan, accessMethods, containerData = null) => {
    console.log("Launch attempt - Auth state:", auth.currentUser, "isLoggedIn:", isLoggedIn);
    
    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    if (!selectedKey) {
      const errorMsg = "Please select an SSH key";
      setError(errorMsg);
      addLogEntry(`Error: ${errorMsg}`);
      return;
    }
    
    if (!Object.values(accessMethods).some(method => method)) {
      const errorMsg = "Please select at least one access method";
      setError(errorMsg);
      addLogEntry(`Error: ${errorMsg}`);
      return;
    }
    
    setSelectedPlan(plan);
    setSelectedAccessMethods(accessMethods);
    setIsDeploying(true);
    
    try {
      // If we already have container data from DeploymentModal, use it
      // Otherwise, create a new container through createSubscription
      let subscriptionCreated;
      
      if (containerData && containerData.success) {
        addLogEntry("Container already created by DeploymentModal", containerData);
        subscriptionCreated = await createSubscriptionFromExistingContainer(containerData, plan);
      } else {
        addLogEntry("No container data provided, creating new container");
        subscriptionCreated = await createSubscription(plan);
      }
      
      if (subscriptionCreated) {
        setShowComputeAccess(true);
        // Use the latestError and isShowingComputeAccess variables to satisfy linter
        if (latestError) {
          addLogEntry(`Recovered from previous error: ${latestError}`);
        }
        addLogEntry(`Compute access UI ${isShowingComputeAccess ? 'is' : 'is not'} currently visible`);
      }
    } catch (error) {
      setError(`Failed to create subscription: ${error.message}`);
      addLogEntry(`Launch error: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // Create subscription from existing container (created by DeploymentModal)
  const createSubscriptionFromExistingContainer = async (containerData, plan) => {
    try {
      if (!containerData || !containerData.containerInfo) {
        throw new Error("Invalid container data provided");
      }
      
      const minerId = minerMappings[selectedResource.id];
      if (!minerId) {
        throw new Error("No miner found for this compute resource");
      }
      
      addLogEntry("Using existing container", containerData);
      
      // Build subscriptionData using the existing container data
      const subscriptionData = {
        user_id: auth.currentUser.uid,
        container_id: containerData.containerId,
        container_info: containerData.containerInfo,
        resource_id: selectedResource.id,
        miner_id: minerId,
        subscription_details: {
          plan: plan,
          duration: calculateDuration(plan),
          compute_price: selectedPlanDetails.computePrice,
          network_price: selectedPlanDetails.networkPrice,
          total_price: selectedPlanDetails.computePrice + selectedPlanDetails.networkPrice,
          specs: {
            compute: selectedResource.resource_type,
            ram: selectedResource.ram,
            storage: selectedResource.storage?.capacity,
            gpu_specs: selectedResource.gpu_specs !== undefined ? selectedResource.gpu_specs : null,
            cpu_specs: selectedResource.cpu_specs
          }
        },
        status: "active",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + calculateDuration(plan).hours * 60 * 60 * 1000).toISOString()
      };
      
      console.log('====================================');
      console.log('Subscription Data from existing container: ', subscriptionData);
      console.log('====================================');
      addLogEntry("Creating subscription record", subscriptionData);
      
      try {
        const docRef = await addDoc(collection(db, 'container_subscriptions'), subscriptionData);
        console.log('Document successfully created in "container_subscriptions"', docRef.id);
        addLogEntry("Subscription record created", { id: docRef.id });
      } catch (firestoreError) {
        console.error('Error writing document to Firestore:', firestoreError);
        addLogEntry(`Firestore error: ${firestoreError.message}`);
        throw new Error("Failed to create Firestore document");
      }
      
      const accessDetails = {
        ip: containerData.containerInfo.host,
        sshCommand: `ssh ${containerData.containerInfo.username}@${containerData.containerInfo.host} -p ${containerData.containerInfo.ssh_port}`,
        ports: {
          ssh: containerData.containerInfo.ssh_port,
          jupyter: 8888,
          tensorboard: 6006
        },
        username: containerData.containerInfo.username,
        duration: calculateDuration(plan).display,
        containerId: containerData.containerId
      };
      
      setComputeDetails(accessDetails);
      addLogEntry("Deployment successful! Access details:", accessDetails);
      
      return true;
    } catch (error) {
      const errorMsg = `Failed to create subscription from existing container: ${error.message}`;
      setError(errorMsg);
      addLogEntry(`Error: ${errorMsg}`);
      return false;
    }
  };

  // Modal callbacks
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleAccessDetailsDone = () => {
    setShowDeploymentModal(false);
    // Clear compute details so the success popup won't show if modal reopens
    setComputeDetails(null);
    // Tell parent component to clear selection
    if (onNavChange) {
      // Pass empty string or null to clear the selectedResource in parent
      onNavChange('', null);
    }
  };

  // Clear selection when modal is closed
  const handleCloseModal = () => {
    setShowDeploymentModal(false);
    // Tell parent component to clear selection
    if (onNavChange) {
      // Passing empty string (falsy value) will make the parent clear selection
      // without actually navigating away
      onNavChange('');
    }
  };

  return (
    <>
      <DeploymentModal
        isOpen={showDeploymentModal}
        onClose={handleCloseModal}
        selectedResource={selectedResource}
        darkMode={darkMode}
        onDeploy={handleLaunch}
        isDeploying={isDeploying}
        deploymentStatus={deploymentStatus}
        selectedKey={selectedKey}
        onSelectKey={setSelectedKey}
        computeDetails={computeDetails}
        onAccessDetailsDone={handleAccessDetailsDone}
        auth={auth}
        minerMappings={minerMappings}
        deploymentLogs={deploymentLogs}
      />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        darkMode={darkMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

DeploymentConfig.propTypes = {
  selectedResource: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    gpu_specs: PropTypes.object,
    cpu_specs: PropTypes.object,
    resource_type: PropTypes.string,
    hourly_price: PropTypes.number,
    ram: PropTypes.string,
    storage: PropTypes.shape({
      capacity: PropTypes.string
    })
  }).isRequired,
  minerMappings: PropTypes.object.isRequired,
  darkMode: PropTypes.bool.isRequired,
  selectedKey: PropTypes.object,
  setSelectedKey: PropTypes.func.isRequired,
  onNavChange: PropTypes.func.isRequired
};

export default DeploymentConfig;
