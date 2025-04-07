// DeploymentStatusPanel.js
import { AlertTriangle, ArrowLeft, CheckCircle, Loader, RefreshCw, Terminal, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { cn } from '../../../../lib/utils';

const DeploymentStatusPanel = ({ 
  darkMode, 
  deploymentId, 
  modelName, 
  onBack,
  isExpanded,
  isRightExpanded 
}) => {
  const [deploymentStatus, setDeploymentStatus] = useState({
    status: 'queued',
    progress: 0,
    logs: [],
    error: null,
    tunnelUrl: null,
    endpoints: null
  });
  const [pollInterval, setPollInterval] = useState(2000); // Start polling every 2 seconds

  useEffect(() => {
    if (!deploymentId) return;
    
    const fetchDeploymentStatus = async () => {
      try {
        const response = await fetch(`https://c389-24-83-13-62.ngrok-free.app/api/v1/deployments/${deploymentId}/status`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch deployment status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Deployment status:", data);
        
        // Update status and logs
        setDeploymentStatus(prev => ({
          ...prev,
          status: data.status,
          progress: data.progress || 0,
          tunnelUrl: data.tunnel_url,
          endpoints: data.endpoints,
          logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Status: ${data.status}, Progress: ${data.progress || 0}%`]
        }));
        
        // If model is active or failed, slow down polling
        if (data.status === 'active' || data.status === 'failed') {
          setPollInterval(10000); // Poll every 10 seconds
        }
        
        // If model is active, add final log
        if (data.status === 'active' && !prev.logs.some(log => log.includes('Deployment complete'))) {
          setDeploymentStatus(prev => ({
            ...prev,
            logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Deployment complete! Tunnel available at: ${data.tunnel_url}`]
          }));
        }
      } catch (error) {
        console.error("Error fetching deployment status:", error);
        setDeploymentStatus(prev => ({
          ...prev,
          error: error.message,
          logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Error: ${error.message}`]
        }));
      }
    };
    
    // Initial fetch
    fetchDeploymentStatus();
    
    // Set up polling
    const intervalId = setInterval(fetchDeploymentStatus, pollInterval);
    
    return () => clearInterval(intervalId);
  }, [deploymentId, pollInterval]);
  
  const getStatusBadge = () => {
    switch(deploymentStatus.status) {
      case 'queued':
        return (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full", 
                            darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700")}>
            <Loader size={14} className="animate-spin" />
            <span className="text-xs font-medium">Queued</span>
          </div>
        );
      case 'initializing':
      case 'preparing':
        return (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full", 
                            darkMode ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-600")}>
            <Loader size={14} className="animate-spin" />
            <span className="text-xs font-medium">Initializing</span>
          </div>
        );
      case 'active':
        return (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full", 
                            darkMode ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-600")}>
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Active</span>
          </div>
        );
      case 'failed':
        return (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full", 
                            darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600")}>
            <XCircle size={14} />
            <span className="text-xs font-medium">Failed</span>
          </div>
        );
      default:
        return (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full", 
                            darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700")}>
            <RefreshCw size={14} className="animate-spin" />
            <span className="text-xs font-medium">{deploymentStatus.status}</span>
          </div>
        );
    }
  };
  
  return (
    <div className={cn(
      'fixed top-16 bottom-16 transition-all p-4 duration-300 rounded-md shadow flex flex-col overflow-hidden',
      isExpanded ? 'left-60' : 'left-20',
      isRightExpanded ? 'right-64' : 'right-14',
      darkMode ? 'bg-[#1b212c] border border-gray-800' : 'bg-white border border-gray-200'
    )}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-inherit">
        <div
          onClick={onBack}
          className={cn(
            "flex items-center gap-1 cursor-pointer group",
            darkMode ? 'text-gray-300' : 'text-gray-600'
          )}
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-medium">Model Catalogue</span>
        </div>
        <hr className={cn('my-2', darkMode ? 'border-gray-700' : 'border-gray-200')} />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Deployment Info */}
        <div className={cn(
          "rounded-lg p-4 mb-4",
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
        )}>
          <div className="flex items-center justify-between mb-2">
            <h2 className={cn("text-base font-medium", darkMode ? "text-white" : "text-gray-800")}>
              Deploying {modelName}
            </h2>
            {getStatusBadge()}
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className={cn("text-xs", darkMode ? "text-gray-400" : "text-gray-500")}>
                  Deployment Progress
                </span>
                <span className={cn("text-xs font-medium", darkMode ? "text-gray-300" : "text-gray-700")}>
                  {deploymentStatus.progress}%
                </span>
              </div>
              <div className={cn("w-full h-2 rounded-full overflow-hidden", 
                                darkMode ? "bg-gray-700" : "bg-gray-200")}>
                <div 
                  className={cn("h-full rounded-full", darkMode ? "bg-blue-500" : "bg-blue-600")}
                  style={{ width: `${deploymentStatus.progress}%` }}
                />
              </div>
            </div>
            
            {deploymentStatus.tunnelUrl && (
              <div className="space-y-1">
                <span className={cn("text-xs", darkMode ? "text-gray-400" : "text-gray-500")}>
                  Deployment URL
                </span>
                <div className={cn(
                  "flex items-center p-2 rounded",
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                )}>
                  <a 
                    href={deploymentStatus.tunnelUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={cn(
                      "text-xs font-mono truncate",
                      darkMode ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"
                    )}
                  >
                    {deploymentStatus.tunnelUrl}
                  </a>
                </div>
              </div>
            )}
            
            {deploymentStatus.error && (
              <div className={cn(
                "flex items-center gap-2 p-3 rounded",
                darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"
              )}>
                <AlertTriangle size={16} />
                <span className="text-xs">{deploymentStatus.error}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Terminal/Logs Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1 mb-2">
            <Terminal size={14} className={darkMode ? "text-gray-400" : "text-gray-500"} />
            <h3 className={cn("text-sm font-medium", darkMode ? "text-gray-200" : "text-gray-700")}>
              Deployment Logs
            </h3>
          </div>
          
          <div className={cn(
            "flex-1 font-mono text-xs p-3 overflow-y-auto rounded",
            darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-800"
          )}>
            {deploymentStatus.logs.length > 0 ? (
              deploymentStatus.logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap mb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className={darkMode ? "text-gray-500" : "text-gray-400"}>
                Waiting for logs...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStatusPanel;