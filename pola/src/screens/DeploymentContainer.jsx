import { getAuth } from 'firebase/auth';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Code2, Globe, Terminal, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import AuthModal from '../auth/AuthModal';
import db from './firebase/config';
import SSHKeyManagement from './widgets/SSHKeyManagement';

const DeploymentContainer = ({
  darkMode,
  selectedKey,
  onSelectKey,
  costBreakdown,
  onDeploy,
  isDeploying = false,
  isLoggedIn = true,
}) => {
  const [activeConnection, setActiveConnection] = useState("options");
  const [showSSH, setShowSSH] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sshKeys, setSSHKeys] = useState([]);
  const [error, setError] = useState(null);
  const [isAddingKey, setIsAddingKey] = useState(false);

  const auth = getAuth();

  const connectionMethods = [
    {
      id: "ssh",
      name: "SSH Connection",
      icon: Terminal,
      description: "Secure Shell access for direct server control",
    },
    {
      id: "jupyter",
      name: "Jupyter Notebook",
      icon: Code2,
      description: "Interactive Python development environment",
      comingSoon: true,
    },
    {
      id: "api",
      name: "API Access",
      icon: Globe,
      description: "Programmatic access via REST API",
      comingSoon: true,
    },
  ];

  // Fetch SSH keys for the logged in user
  useEffect(() => {
    const fetchSSHKeys = async () => {
      if (!auth.currentUser) {
        setSSHKeys([]);
        return;
      }
      
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists() && userSnap.data().ssh_keys) {
          setSSHKeys(userSnap.data().ssh_keys);
        }
      } catch (error) {
        console.error('Error fetching SSH keys:', error);
        setError('Failed to load SSH keys');
      }
    };

    fetchSSHKeys();
  }, [auth.currentUser]);

  // Handle adding new SSH key
  const handleAddKey = async (keyName, publicKey) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }
  
    if (!keyName.trim() || !publicKey.trim()) {
      setError('Both key name and public key are required');
      return;
    }
  
    setIsAddingKey(true);
    setError(null);
  
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const newKey = {
        name: keyName,
        public_key: publicKey,
        created_at: new Date().toISOString()
      };
  
      await updateDoc(userDocRef, {
        ssh_keys: arrayUnion(newKey)
      });
  
      setSSHKeys([...sshKeys, newKey]);
      setIsAddingKey(false);
    } catch (error) {
      console.error('Error adding SSH key:', error);
      setError('Failed to add SSH key');
      setIsAddingKey(false);
    }
  };

  // Handle SSH key management
  const handleSSHClick = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowSSH(true);
  };

  // Handle authentication success
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowSSH(true);
  };

  // Handle key selection
  const handleKeySelect = (key) => {
    onSelectKey(key);
    setShowSSH(false);
  };

  return (
    <>
      <div className={`rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} p-6 space-y-6`}>
        {/* Cost Breakdown Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-violet-500" />
            <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
              Cost Breakdown
            </h3>
          </div>
          <div className={`rounded-lg ${darkMode ? "bg-gray-900" : "bg-gray-50"} p-4 space-y-2`}>
            <div className="flex justify-between text-sm">
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Compute</span>
              <span className={darkMode ? "text-gray-200" : "text-gray-900"}>
                ${costBreakdown?.compute?.toFixed(2) || "0.00"}/hr
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Network</span>
              <span className={darkMode ? "text-gray-200" : "text-gray-900"}>
                ${costBreakdown?.network?.toFixed(2) || "0.00"}/hr
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-700">
              <div className="flex justify-between font-medium">
                <span className={darkMode ? "text-white" : "text-gray-900"}>Total</span>
                <span className={darkMode ? "text-white" : "text-gray-900"}>
                  ${((costBreakdown?.compute || 0) + (costBreakdown?.network || 0)).toFixed(2)}/hr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Methods Section */}
        <div className="space-y-3">
          <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
            Access Method
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {connectionMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => {
                  if (!method.comingSoon) {
                    setActiveConnection(method.id);
                    if (method.id === 'ssh') {
                      handleSSHClick();
                    }
                  }
                }}
                className={`relative rounded-lg p-3 transition-all ${
                  method.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                } ${
                  activeConnection === method.id
                    ? `ring-2 ring-violet-500 ${darkMode ? "bg-violet-500/10" : "bg-violet-50"}`
                    : darkMode
                    ? "bg-gray-900 hover:bg-gray-700"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md bg-violet-600 flex items-center justify-center">
                    <method.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{method.name}</h4>
                    {method.comingSoon && (
                      <span className="text-xs text-violet-500">Coming Soon</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {method.description}
                  </p>
                  {method.id === 'ssh' && (
                    <div className={`w-full py-1.5 px-2 rounded bg-violet-500/10 text-violet-500 text-xs font-medium`}>
                      {selectedKey ? selectedKey.name : isLoggedIn ? "Select Key" : "Sign in to add keys"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deploy Button */}
        <button
          onClick={onDeploy}
          disabled={isDeploying || (activeConnection === 'ssh' && !selectedKey)}
          className={`w-full py-3 rounded-lg font-medium text-white ${
            isDeploying || (activeConnection === 'ssh' && !selectedKey)
              ? "bg-violet-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700"
          } transition-colors relative overflow-hidden`}
        >
          {isDeploying && (
            <div className="absolute inset-0 flex items-center justify-center bg-violet-600">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <span className={isDeploying ? "opacity-0" : "opacity-100"}>
            {!isLoggedIn
              ? "Sign in to Launch"
              : isDeploying
              ? "Deploying Resource..."
              : "Launch Resource"}
          </span>
        </button>
      </div>

      {/* SSH Key Management */}
      {showSSH && (
        <SSHKeyManagement
          darkMode={darkMode}
          sshKeys={sshKeys}
          onSelect={handleKeySelect}
          onAddKey={handleAddKey}
          error={error}
          isAddingKey={isAddingKey}
          isLoggedIn={isLoggedIn}
          onClose={() => setShowSSH(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        darkMode={darkMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default DeploymentContainer;