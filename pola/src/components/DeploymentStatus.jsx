import { AlertCircle, Check, Clock, Loader, Server, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

/**
 * Component to display the status of a model deployment
 */
const DeploymentStatus = ({ 
  status, 
  darkMode, 
  timestamp, 
  apiEndpoint,
  message,
  compact
}) => {
  const [timeAgo, setTimeAgo] = useState('');
  
  // Update the time ago string
  useEffect(() => {
    if (!timestamp) return;
    
    const updateTimeAgo = () => {
      const now = new Date();
      const deployTime = timestamp instanceof Date 
        ? timestamp 
        : new Date(timestamp);
      
      const diffInSeconds = Math.floor((now - deployTime) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeAgo('just now');
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        setTimeAgo(`${days} day${days > 1 ? 's' : ''} ago`);
      }
    };
    
    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 60000);
    
    return () => clearInterval(intervalId);
  }, [timestamp]);
  
  // Determine the status indicator
  const getStatusIndicator = () => {
    let Icon = Clock;
    let color = darkMode ? 'text-blue-400' : 'text-blue-600';
    let bgColor = darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
    let statusText = 'Pending';
    
    switch (status?.toLowerCase()) {
      case 'active':
      case 'running':
      case 'completed':
      case 'success':
        Icon = Check;
        color = darkMode ? 'text-green-400' : 'text-green-600';
        bgColor = darkMode ? 'bg-green-900/20' : 'bg-green-50';
        statusText = 'Active';
        break;
        
      case 'failed':
      case 'error':
        Icon = X;
        color = darkMode ? 'text-red-400' : 'text-red-600';
        bgColor = darkMode ? 'bg-red-900/20' : 'bg-red-50';
        statusText = 'Failed';
        break;
        
      case 'starting':
      case 'initializing':
      case 'downloading':
      case 'in_progress':
        Icon = Loader;
        color = darkMode ? 'text-yellow-400' : 'text-yellow-600';
        bgColor = darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
        statusText = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        break;
        
      case 'stopped':
        Icon = AlertCircle;
        color = darkMode ? 'text-gray-400' : 'text-gray-600';
        bgColor = darkMode ? 'bg-gray-900/20' : 'bg-gray-50';
        statusText = 'Stopped';
        break;
        
      default:
        statusText = status || 'Unknown';
        break;
    }
    
    return { Icon, color, bgColor, statusText };
  };
  
  const { Icon, color, bgColor, statusText } = getStatusIndicator();
  
  // Render a compact version if specified
  if (compact) {
    return (
      <div className={`inline-flex items-center ${color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        <span>{statusText}</span>
      </div>
    );
  }
  
  return (
    <div className={`rounded-md ${bgColor} p-3`}>
      <div className="flex items-start">
        <div className={`${color} mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${color}`}>
            {statusText}
            {timeAgo && <span className="ml-2 font-normal opacity-75">• {timeAgo}</span>}
          </h3>
          
          {message && (
            <div className={`mt-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </div>
          )}
          
          {apiEndpoint && (
            <div className="mt-2">
              <div className="flex items-center text-xs">
                <Server className="w-3 h-3 mr-1 opacity-70" />
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  API Endpoint:
                </span>
              </div>
              <div className="mt-1 p-1.5 rounded bg-black/10 dark:bg-white/5">
                <code className="text-xs font-mono break-all block">
                  {apiEndpoint}
                </code>
              </div>
              
              {status?.toLowerCase() === 'active' && (
                <a
                  href={apiEndpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 inline-block text-xs px-2 py-1 rounded ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Open API
                </a>
              )}
            </div>
          )}
          
          {['starting', 'initializing', 'downloading', 'in_progress'].includes(status?.toLowerCase()) && (
            <div className="mt-3">
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} animate-pulse rounded-full`} style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DeploymentStatus.propTypes = {
  status: PropTypes.string,
  darkMode: PropTypes.bool,
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date)
  ]),
  apiEndpoint: PropTypes.string,
  message: PropTypes.string,
  compact: PropTypes.bool
};

DeploymentStatus.defaultProps = {
  darkMode: false,
  compact: false
};

export default DeploymentStatus; 