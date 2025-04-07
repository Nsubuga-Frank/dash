import { Activity, AlertTriangle, CheckCircle, Cpu, Database, Download, Info, MemoryStick, Server, Terminal, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { getDeployment } from '../services/deploymentService';
import { streamDeploymentLogs, subscribeToDeploymentEvents, subscribeToDeploymentLogs } from '../services/logsService';

/**
 * DeploymentMonitor component for displaying real-time logs and status
 * of a model deployment
 */
const DeploymentMonitor = ({ 
  deploymentId, 
  externalDeploymentId,
  darkMode, 
  onClose 
}) => {
  const [deployment, setDeployment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('logs');
  const [streamStatus, setStreamStatus] = useState('disconnected');
  const [usage, setUsage] = useState({
    cpu: '0%',
    memory: '0 GB',
    gpu: 'N/A'
  });
  
  const streamRef = useRef(null);
  const logsEndRef = useRef(null);

  // Fetch deployment details
  useEffect(() => {
    const fetchDeployment = async () => {
      try {
        const deploymentData = await getDeployment(deploymentId);
        if (deploymentData) {
          setDeployment(deploymentData);
        }
      } catch (error) {
        console.error('Error fetching deployment:', error);
      }
    };
    
    fetchDeployment();
  }, [deploymentId]);

  // Subscribe to logs from Firebase
  useEffect(() => {
    if (!externalDeploymentId) return;
    
    const unsubscribe = subscribeToDeploymentLogs(externalDeploymentId, (newLogs) => {
      setLogs(newLogs);
    });
    
    return () => unsubscribe();
  }, [externalDeploymentId]);

  // Subscribe to events from Firebase
  useEffect(() => {
    if (!externalDeploymentId) return;
    
    const unsubscribe = subscribeToDeploymentEvents(externalDeploymentId, (newEvents) => {
      setEvents(newEvents);
      
      // Extract latest metadata for usage info
      const metadataEvent = newEvents.find(event => event.event_type === 'metadata');
      if (metadataEvent && metadataEvent.data) {
        setUsage({
          cpu: metadataEvent.data.cpu_usage || '0%',
          memory: metadataEvent.data.memory_usage || '0 GB',
          gpu: metadataEvent.data.gpu_usage || 'N/A'
        });
      }
    });
    
    return () => unsubscribe();
  }, [externalDeploymentId]);

  // Start streaming logs when deployment details are available
  useEffect(() => {
    // Only start streaming if we have the deployment with SSH config
    if (!deployment || !deployment.ssh_config || !externalDeploymentId) return;
    
    setStreamStatus('connecting');
    
    const stream = streamDeploymentLogs(
      externalDeploymentId,
      deployment.ssh_config,
      // Log callback
      (logData) => {
        console.log('Live log received:', logData);
      },
      // Metadata callback
      (metadataData) => {
        console.log('Live metadata received:', metadataData);
        setUsage({
          cpu: metadataData.cpu_usage || '0%',
          memory: metadataData.memory_usage || '0 GB',
          gpu: metadataData.gpu_usage || 'N/A'
        });
      },
      // Info callback
      (infoData) => {
        console.log('Live deployment info received:', infoData);
      },
      // Error callback
      (error) => {
        console.error('Stream error:', error);
        setStreamStatus('error');
      }
    );
    
    // Store the reference so we can clean up
    streamRef.current = stream;
    setStreamStatus('connected');
    
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }
      setStreamStatus('disconnected');
    };
  }, [deployment, externalDeploymentId]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current && activeTab === 'logs') {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    // Handle different timestamp formats
    const date = timestamp instanceof Date 
      ? timestamp 
      : typeof timestamp === 'string' 
        ? new Date(timestamp)
        : timestamp.toDate ? timestamp.toDate() : new Date();
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (!deployment) return null;
    
    const status = deployment.status;
    
    let Icon = Info;
    let bgColor = darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
    let textColor = darkMode ? 'text-blue-300' : 'text-blue-600';
    
    if (status === 'active') {
      Icon = CheckCircle;
      bgColor = darkMode ? 'bg-green-900/20' : 'bg-green-50';
      textColor = darkMode ? 'text-green-300' : 'text-green-600';
    } else if (status === 'failed') {
      Icon = AlertTriangle;
      bgColor = darkMode ? 'bg-red-900/20' : 'bg-red-50';
      textColor = darkMode ? 'text-red-300' : 'text-red-600';
    } else if (status === 'starting' || status === 'downloading' || status === 'initializing') {
      Icon = Download;
      bgColor = darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
      textColor = darkMode ? 'text-yellow-300' : 'text-yellow-600';
    }
    
    return (
      <div className={`flex items-center p-2 rounded ${bgColor} ${textColor} text-xs mb-3`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        <span className="font-medium capitalize">{status}</span>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black/50' : 'bg-black/30'}`}>
      <div className={`w-full max-w-4xl max-h-[85vh] rounded-lg shadow-xl overflow-hidden ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold flex items-center">
              <Terminal className="w-4 h-4 mr-1.5" />
              Deployment Monitor
              {streamStatus === 'connected' && (
                <span className={`ml-2 flex items-center text-xs ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-10 ${
              darkMode ? 'hover:bg-white' : 'hover:bg-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex h-[calc(85vh-3rem)]">
          {/* Sidebar with info */}
          <div className={`w-64 border-r p-3 flex-shrink-0 overflow-y-auto ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <h3 className="text-sm font-medium mb-2">Deployment Info</h3>
            
            {getStatusIndicator()}
            
            {deployment && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Model</div>
                  <div className="text-sm font-medium">{deployment.model_name || deployment.model_id || 'Unknown Model'}</div>
                  <div className="text-xs mt-0.5 opacity-70">{deployment.api_name}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hardware</div>
                  <div className="text-sm font-medium">{deployment.hardware_name || 'Unknown Hardware'}</div>
                  <div className="text-xs mt-0.5 opacity-70">{deployment.resource_type || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deployment ID</div>
                  <div className="text-xs font-mono opacity-70 break-words">{externalDeploymentId || 'N/A'}</div>
                </div>
                
                {deployment.container_id && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Container</div>
                    <div className="text-xs font-mono opacity-70">{deployment.container_id}</div>
                  </div>
                )}
                
                {deployment.api_url && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">API Endpoint</div>
                    <div className="text-xs font-mono break-all opacity-70">{deployment.api_url}</div>
                    <a
                      href={deployment.api_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-1 inline-block text-xs px-2 py-1 rounded ${
                        darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                    >
                      Open API
                    </a>
                  </div>
                )}
                
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resource Usage</div>
                  <div className={`grid grid-cols-1 gap-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <div className="flex items-center text-xs">
                      <Cpu className="w-3 h-3 mr-1.5 opacity-70" />
                      <span>CPU: {usage.cpu}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <MemoryStick className="w-3 h-3 mr-1.5 opacity-70" />
                      <span>Memory: {usage.memory}</span>
                    </div>
                    {usage.gpu !== 'N/A' && (
                      <div className="flex items-center text-xs">
                        <Server className="w-3 h-3 mr-1.5 opacity-70" />
                        <span>GPU: {usage.gpu}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Timestamps</div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="opacity-70">Created:</span>{' '}
                      <span>{deployment.created_at ? formatTimestamp(deployment.created_at) : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="opacity-70">Updated:</span>{' '}
                      <span>{deployment.updated_at ? formatTimestamp(deployment.updated_at) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {deployment.metadata && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Metadata</div>
                    <div className="text-xs opacity-70 break-words">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(deployment.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {['logs', 'events', 'metrics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? darkMode 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-blue-500 text-blue-600'
                      : darkMode
                        ? 'border-transparent hover:text-gray-300 text-gray-400'
                        : 'border-transparent hover:text-gray-600 text-gray-500'
                  }`}
                >
                  {tab === 'logs' && <Terminal className="w-3.5 h-3.5 inline mr-1.5" />}
                  {tab === 'events' && <Database className="w-3.5 h-3.5 inline mr-1.5" />}
                  {tab === 'metrics' && <Activity className="w-3.5 h-3.5 inline mr-1.5" />}
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'logs' && (
                <div className={`h-full overflow-y-auto p-3 font-mono text-xs leading-relaxed ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center opacity-70">
                        <Terminal className="w-8 h-8 mx-auto mb-2" />
                        <p>No logs available yet</p>
                        <p className="text-xs mt-1">
                          {streamStatus === 'connected' 
                            ? 'Waiting for logs...' 
                            : 'Connect to stream to view live logs'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={log.id || index} className="mb-0.5">
                        <span className={darkMode ? 'text-green-400' : 'text-green-600'}>
                          {formatTimestamp(log.timestamp)} &gt;
                        </span>{' '}
                        <span className={`${
                          log.content?.toLowerCase().includes('error')
                            ? darkMode ? 'text-red-400' : 'text-red-600'
                            : log.content?.toLowerCase().includes('warn')
                              ? darkMode ? 'text-yellow-400' : 'text-yellow-600'
                              : 'text-inherit'
                        }`}>
                          {log.content}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              )}
              
              {activeTab === 'events' && (
                <div className={`h-full overflow-y-auto p-3 ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  {events.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center opacity-70">
                        <Database className="w-8 h-8 mx-auto mb-2" />
                        <p>No events available yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.map((event, index) => (
                        <div 
                          key={event.id || index} 
                          className={`p-2 rounded-lg text-xs ${
                            darkMode ? 'bg-gray-700' : 'bg-white'
                          }`}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium capitalize">{event.event_type}</span>
                            <span className="opacity-70">{formatTimestamp(event.timestamp)}</span>
                          </div>
                          <pre className={`text-xs overflow-x-auto whitespace-pre-wrap ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'metrics' && (
                <div className={`h-full overflow-y-auto p-3 ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <div className="text-center opacity-70 mt-8">
                    <Activity className="w-8 h-8 mx-auto mb-2" />
                    <p>Metrics visualization coming soon</p>
                    <div className="mt-4 flex items-center justify-center space-x-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} w-64`}>
                        <div className="text-xs font-medium mb-1">CPU Usage</div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: usage.cpu.replace('%', '') + '%' }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1 text-right">{usage.cpu}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} w-64`}>
                        <div className="text-xs font-medium mb-1">Memory Usage</div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1 text-right">{usage.memory}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stream status indicator */}
            <div className={`border-t p-2 flex justify-between items-center ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center text-xs">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  streamStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  streamStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  streamStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="opacity-70">
                  Status: <span className="capitalize">{streamStatus}</span>
                </span>
              </div>
              <div className="text-xs opacity-70">
                {logs.length} log entries • {events.length} events
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DeploymentMonitor.propTypes = {
  deploymentId: PropTypes.string.isRequired,
  externalDeploymentId: PropTypes.string,
  darkMode: PropTypes.bool,
  onClose: PropTypes.func.isRequired
};

DeploymentMonitor.defaultProps = {
  darkMode: false,
  externalDeploymentId: null
};

export default DeploymentMonitor; 