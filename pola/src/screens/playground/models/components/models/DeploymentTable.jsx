import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { AlertCircle, ArrowLeft, Box, CheckCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '../../../../../lib/utils';
import db from '../../../../firebase/config';

// Import the DeploymentDetailsPanel component - you'll need to create this separately
import DeploymentDetailsPanel from './DeploymentDetailsPanel';

const DeploymentTable = ({
  currentUser,
  darkMode,
  isExpanded,
  isRightExpanded,
  setActiveSection,
  setSelectedChatModel,
  onBack
}) => {
  const [deployments, setDeployments] = useState([]);
  const [pollingDeployments, setPollingDeployments] = useState(new Set());
  const [selectedDeployment, setSelectedDeployment] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping deployment fetch');
      return;
    }

    console.log('Fetching deployments for user:', currentUser.uid);

    // Subscribe to monitor collection for realtime updates
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'monitor'),
        where('userId', '==', currentUser.uid)
      ),
      (snapshot) => {
        const deploys = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('Deployments fetched:', deploys.length);
        setDeployments(deploys);

        // Track which deployments are in polling state (for UI indicators)
        const newPollingDeployments = new Set();
        deploys.forEach(deployment => {
          if (deployment.status !== 'active' && deployment.status !== 'failed' && deployment.isPolling) {
            newPollingDeployments.add(deployment.id);
          }
        });
        setPollingDeployments(newPollingDeployments);

        // If we have a selected deployment, update its data
        if (selectedDeployment) {
          const updated = deploys.find(d => d.id === selectedDeployment.id);
          if (updated) {
            setSelectedDeployment(updated);
          }
        }
      },
      (error) => {
        console.error('Deployment fetching error:', error);
      }
    );

    return () => {
      console.log('Unsubscribing from deployments');
      unsubscribe();
    };
  }, [currentUser, selectedDeployment?.id]);

  // Format timestamp as "FEB 21, 2025 12:39 PM"
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate duration from createdAt to now or completed timestamp
  const calculateDuration = (deployment) => {
    if (!deployment.createdAt) return '-';

    const start = new Date(deployment.createdAt);

    if (isNaN(start.getTime())) {
      return 'Invalid date';
    }

    // If completed, use the deployment duration
    if (deployment.status === 'active' && deployment.deploymentDuration) {
      return `${deployment.deploymentDuration.toFixed(1)}s`;
    }

    // Otherwise calculate from now
    const end = new Date();
    const diffMs = end - start;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec}s`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;
    return `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}m`;
  };

  const getDeploymentUrl = (deployment) => {
    return deployment.tunnelUrl || (deployment.endpoints && deployment.endpoints.ui);
  };

  const getStatusBadge = (status, isPolling) => {
    let bgColor, textColor, icon;

    if (isPolling) {
      bgColor = darkMode ? 'bg-blue-800/30' : 'bg-blue-100';
      textColor = darkMode ? 'text-blue-400' : 'text-blue-800';
      icon = <Loader2 className="w-3 h-3 mr-1 animate-spin" />;
    } else {
      switch (status) {
        case 'active':
          bgColor = darkMode ? 'bg-green-800/30' : 'bg-green-100';
          textColor = darkMode ? 'text-green-400' : 'text-green-800';
          icon = <CheckCircle className="w-3 h-3 mr-1" />;
          break;
        case 'failed':
          bgColor = darkMode ? 'bg-red-800/30' : 'bg-red-100';
          textColor = darkMode ? 'text-red-400' : 'text-red-800';
          icon = <AlertCircle className="w-3 h-3 mr-1" />;
          break;
        default:
          bgColor = darkMode ? 'bg-yellow-800/30' : 'bg-yellow-100';
          textColor = darkMode ? 'text-yellow-400' : 'text-yellow-800';
          icon = <Clock className="w-3 h-3 mr-1" />;
      }
    }

    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        bgColor,
        textColor
      )}>
        {icon}
        {status}
      </span>
    );
  };

  const handleRowClick = (deployment) => {
    // Only show details panel for active deployments
    if (deployment.status === 'active') {
      setSelectedDeployment(deployment);
    }
  };

  const handleClosePanel = () => {
    setSelectedDeployment(null);
  };

  const handleOpenPlayground = () => {
    setActiveSection('Playground');
    console.log('Open playground for', selectedDeployment?.modelId);
  };

  return (
    <>
      <div className={cn(
        'fixed top-16 bottom-16 transition-all p-4 duration-300 rounded-md shadow flex flex-col overflow-hidden',
        isExpanded ? 'left-60' : 'left-20',
        isRightExpanded || selectedDeployment ? 'right-64' : 'right-14',
        darkMode ? 'bg-[#1b212c] border border-gray-800' : 'bg-white border-gray-200'
      )}>
        {/* Header */}
        <div
          className={cn(
            "flex items-center gap-1 cursor-pointer group",
            darkMode ? 'text-gray-300' : 'text-gray-600'
          )}
          onClick={onBack}
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-medium">Model Catalogue</span>
        </div>

        <hr className={cn('my-2', darkMode ? 'border-gray-700' : 'border-gray-200')} />

        {/* Title Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Clock className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={18} />
            <h1 className={cn(
              'text-lg font-semibold',
              darkMode ? 'text-white' : 'text-gray-800'
            )}>
              Deployment Monitor
            </h1>
          </div>
          <p className={cn('text-sm mt-1', darkMode ? 'text-gray-300' : 'text-gray-600')}>
            Track the status of your model deployments in real-time
          </p>
        </div>

        {/* Table */}
        <div className={cn(
          "rounded-lg border flex-1 overflow-hidden",
          darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={cn(
                  "border-b",
                  darkMode ? "border-gray-700" : "border-gray-200"
                )}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {deployments.map((deployment) => (
                  <tr
                    key={deployment.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      deployment.status === 'active' && "cursor-pointer",
                      deployment.id === selectedDeployment?.id
                        ? (darkMode ? "bg-gray-700/70" : "bg-blue-50")
                        : (darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50")
                    )}
                    onClick={() => handleRowClick(deployment)}
                  >
                    <td className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      {formatTimestamp(deployment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Box className={cn(
                          "w-4 h-4 mr-2",
                          darkMode ? "text-blue-400" : "text-blue-500"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          darkMode ? "text-gray-200" : "text-gray-700"
                        )}>
                          {deployment.modelId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(deployment.status, pollingDeployments.has(deployment.id))}
                    </td>
                    <td className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm",
                      darkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      {calculateDuration(deployment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {deployment.status === 'active' && getDeploymentUrl(deployment) && (
                        <a
                          href={getDeploymentUrl(deployment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center text-sm",
                            darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-600"
                          )}
                          onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the link
                        >
                          Open <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
                {deployments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className={cn(
                        "px-6 py-8 text-sm text-center",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      No deployments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Panel - conditionally rendered when a deployment is selected */}
      {selectedDeployment && (
        <DeploymentDetailsPanel
          deployment={selectedDeployment}
          darkMode={darkMode}
          onClose={handleClosePanel}
          onPlaygroundOpen={() => {
            setActiveSection('Playground');
          }}
        />
      )}
    </>
  );
};

export default DeploymentTable;