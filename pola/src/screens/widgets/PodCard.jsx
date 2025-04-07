import { AlertTriangle, ChevronDown, ChevronUp, Cpu, ExternalLink, Info, Key, Server, Terminal } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaHdd, FaMemory, FaMicrochip } from 'react-icons/fa';

const PodCard = ({ pod, darkMode = false, onTerminate, isTerminating = false, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetails]);

  // Create styled toast for terminated pods
  const showTerminatedToast = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-xs bg-red-600 text-white shadow-lg rounded-md pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 p-2.5">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <p className="text-xs font-medium">This pod has been terminated and cannot be accessed.</p>
            </div>
          </div>
          <div className="border-l border-red-500 relative">
            {/* Countdown indicator */}
            <div 
              className="absolute inset-0 bg-red-500 bg-opacity-20" 
              style={{ 
                animation: 'toast-countdown 4s linear forwards',
                transformOrigin: 'top'
              }}
            />
            <button
              onClick={() => toast.dismiss(t.id)}
              className="h-full p-2.5 flex items-center justify-center relative"
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <style>{`
            @keyframes toast-countdown {
              from { transform: scaleY(1); }
              to { transform: scaleY(0); }
            }
          `}</style>
        </div>
      ),
      { duration: 4000, position: 'top-center' }
    );
  };

  // Create styled toast for successful termination
  const showSuccessTerminationToast = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-xs bg-green-600 text-white shadow-lg rounded-md pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 p-2.5">
            <div className="flex items-center">
              <svg 
                className="w-4 h-4 mr-1.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-xs font-medium">Container terminated successfully!</p>
            </div>
          </div>
          <div className="border-l border-green-500 relative">
            {/* Countdown indicator */}
            <div 
              className="absolute inset-0 bg-green-500 bg-opacity-20" 
              style={{ 
                animation: 'toast-countdown 4s linear forwards',
                transformOrigin: 'top'
              }}
            />
            <button
              onClick={() => toast.dismiss(t.id)}
              className="h-full p-2.5 flex items-center justify-center relative"
            >
              <svg 
                className="w-3 h-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ),
      { duration: 4000, position: 'top-center' }
    );
  };

  const { podId, status, timeRemaining, connection, subscriptionDetails, terminatedAt } = pod || {};

  const host = connection?.host || 'N/A';
  const sshPort = connection?.ssh_port || 'N/A';
  const username = connection?.username || 'N/A';
  const sshCommand = `ssh -i ~/.ssh/compute_key -p ${sshPort} ${username}@${host}`;

  const specs = subscriptionDetails?.specs || {};
  const computeType = specs.compute || 'Unknown';
  const cores = specs.compute === 'GPU' 
    ? (specs.cuda_cores ? `${specs.cuda_cores} CUDA Cores` : 'N/A') 
    : (specs.cpu_specs?.total_cpus ? `${specs.cpu_specs.total_cpus} Cores` : 'N/A');
  const storage = specs.storage || 'N/A';
  const ram = specs.ram || 'N/A';
  
  // Format processor name in the same way as HardwareCard
  const getProcessorName = () => {
    const isGPU = computeType === 'GPU';
    
    if (isGPU && specs.gpu_specs?.gpu_name) {
      return specs.gpu_specs.gpu_name
        .replace(/Intel\(R\) Xeon\(R\)/i, 'Xeon')
        .replace(/CPU @ /i, '@')
        .replace(/AMD/i, '')
        .trim();
    } else if (!isGPU && specs.cpu_specs?.cpu_name) {
      return specs.cpu_specs.cpu_name
        .replace(/Intel\(R\) Xeon\(R\)/i, 'Xeon')
        .replace(/CPU @ /i, '@')
        .replace(/AMD/i, '')
        .trim();
    }
    return 'Unknown Processor';
  };
  
  const processorName = getProcessorName();
  
  const hourlyPrice = subscriptionDetails?.hourly_price || 0;

  // Format termination time if available
  const formattedTerminationTime = terminatedAt ? new Date(terminatedAt).toLocaleString() : 'N/A';

  // Check if this pod should be hidden due to "Unknown" in its name
  if (processorName.toLowerCase().includes('unknown')) {
    return null; // Don't render this pod
  }

  // Determine if the pod is terminated
  const isTerminated = status === 'terminated';

  // Define card style based on whether it's compact or regular
  const cardStyle = compact 
    ? `
      w-64 h-full relative rounded-lg border shadow transition-all duration-200
      ${isTerminated
        ? (darkMode 
            ? 'bg-orange-950/20 border-orange-900/50 text-orange-200 cursor-not-allowed opacity-80' 
            : 'bg-orange-50 border-orange-200 text-orange-800 cursor-not-allowed opacity-80')
        : darkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-100 hover:border-violet-700 cursor-pointer' 
          : 'bg-white border-gray-200 text-gray-900 hover:border-violet-500 cursor-pointer'
      }
      p-1.5 space-y-1 hover:shadow-md text-sm
    `
    : `
      w-64 relative rounded-xl border shadow-md transition-all duration-300 
      ${isTerminated
        ? (darkMode 
            ? 'bg-orange-950/20 border-orange-900/50 text-orange-200 cursor-not-allowed opacity-80' 
            : 'bg-orange-50 border-orange-200 text-orange-800 cursor-not-allowed opacity-80')
        : darkMode 
          ? 'bg-gray-900 border-gray-800 text-gray-100 hover:border-violet-700 cursor-pointer' 
          : 'bg-white border-gray-200 text-gray-900 hover:border-violet-500 cursor-pointer'
      }
      p-3 mb-3 text-sm
    `;

  const connectionDetailsClasses = `
    rounded-lg border p-3 space-y-2 
    ${isTerminated
      ? (darkMode
          ? 'bg-orange-950 border-orange-900 text-orange-200'
          : 'bg-orange-50 border-orange-200 text-orange-800')
      : darkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-200' 
        : 'bg-gray-50 border-gray-200 text-gray-800'}
  `;

  const specContainerStyle = darkMode 
    ? "bg-gray-700 rounded px-1 py-0.5 flex items-center gap-1"
    : "bg-gray-200 rounded px-1 py-0.5 flex items-center gap-1";

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleToggleDetails = (e) => {
    e.stopPropagation();
    if (isTerminated) {
      showTerminatedToast();
      return;
    }
    
    if (showDetails) {
      // Start exit animation
      setIsExiting(true);
      // Wait for animation to complete before actually removing from DOM
      setTimeout(() => {
        setShowDetails(false);
        setIsExiting(false);
      }, 300);
    } else {
      setShowDetails(true);
    }
  };

  const handleTerminateClick = (e) => {
    e.stopPropagation();
    setShowTerminateConfirm(true);
  };

  const handleConfirmTerminate = (e) => {
    e.stopPropagation();
    setShowTerminateConfirm(false);
    // Close the details modal immediately after confirming termination
    setShowDetails(false);
    
    // Show success termination toast
    showSuccessTerminationToast();
    
    // Call the termination function
    onTerminate(podId);
  };

  const handleCancelTerminate = (e) => {
    e.stopPropagation();
    setShowTerminateConfirm(false);
  };

  // Compute type icon selection
  const ComputeIcon = computeType === 'GPU' ? Server : Cpu;
  const iconColor = computeType === 'GPU' ? 'text-amber-600' : 'text-violet-600';

  // Add this for modal animation
  const getModalAnimation = () => {
    if (isExiting) {
      return 'opacity-0 scale-95';
    }
    return 'opacity-100 scale-100';
  };

  // Render compact version (similar to HardwareCard)
  if (compact) {
    return (
      <div 
        className={cardStyle}
        onClick={isTerminated ? showTerminatedToast : (isTerminating ? undefined : handleToggleDetails)}
        role="button" 
        tabIndex={isTerminated || isTerminating ? -1 : 0}
        aria-disabled={isTerminated || isTerminating}
        style={{ cursor: isTerminating ? 'not-allowed' : (isTerminated ? 'not-allowed' : 'pointer') }}
      >
        {/* Details modal - transformed into a popup */}
        {showDetails && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isExiting ? 'bg-opacity-0' : 'bg-opacity-60'
              }`}
              onClick={handleToggleDetails}
            ></div>
              <div 
                className={`
                relative max-h-[85vh] w-full xl:w-3/4 2xl:w-2/3 max-w-5xl rounded-xl shadow-xl 
                ${darkMode ? 'bg-gray-900 border border-gray-700 text-gray-100' : 'bg-white text-gray-900 border border-gray-200'}
                overflow-y-auto transform transition-all duration-300 ease-in-out
                ${getModalAnimation()}
                `}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
              <div className="sticky top-0 flex justify-between items-center p-3 border-b dark:border-gray-700 bg-inherit z-10">
                <h3 className="text-base font-semibold">Pod Details</h3>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleToggleDetails}
                  >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
              <div className="p-3 text-xs">
                  {/* Pod header with CPU icon and status */}
                <div className="flex items-center mb-3">
                  <div className={`p-1.5 rounded-lg mr-2 ${isTerminated 
                      ? (darkMode ? 'bg-orange-900' : 'bg-orange-100') 
                      : 'bg-gradient-to-br from-violet-100 to-indigo-100'}`}>
                    <ComputeIcon className={`w-4 h-4 ${isTerminated ? (darkMode ? 'text-orange-400' : 'text-orange-600') : iconColor}`} />
                    </div>
                    <div>
                    <h4 className="font-medium text-sm">{computeType} Pod</h4>
                    <p className="text-xs text-gray-500">{processorName}</p>
                    </div>
                  <div className={`ml-auto py-0.5 px-2 rounded-full text-2xs font-medium
                      ${isTerminated 
                        ? (darkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700')
                        : (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')}
                    `}>
                      {isTerminated ? 'Terminated' : 'Active'}
                    </div>
                  </div>
                  
                  {/* Specs grid - same structure for both states */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                    <div>
                    <p className="text-2xs text-gray-500">Compute</p>
                    <p className="font-medium text-xs">{cores}</p>
                    </div>
                    <div>
                    <p className="text-2xs text-gray-500">Memory</p>
                    <p className="font-medium text-xs">{ram}</p>
                    </div>
                    <div>
                    <p className="text-2xs text-gray-500">Storage</p>
                    <p className="font-medium text-xs">{storage}</p>
                    </div>
                    <div>
                    <p className="text-2xs text-gray-500">Price</p>
                    <div className="flex justify-start items-center">
                      <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-[11px] font-medium`}>
                        ${hourlyPrice}/hr
                      </span>
                    </div>
                    </div>
                    <div>
                    <p className="text-2xs text-gray-500">{isTerminated ? 'Terminated' : 'Time Remaining'}</p>
                    <p className="font-medium text-xs">
                        {isTerminated 
                          ? formattedTerminationTime
                          : `${timeRemaining} hrs remaining`
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Connection Section - same for both states */}
                  <div className="border rounded-lg overflow-hidden">
                  <div className="p-2 border-b dark:border-gray-700">
                      <div className="flex items-center space-x-1">
                      <Terminal className="w-3 h-3 text-green-500" />
                      <span className="font-medium text-xs">Connection</span>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                      <div>
                        <p className="text-2xs text-gray-500">Host:</p>
                        <p className="font-mono text-2xs">{host}</p>
                      </div>
                      <div>
                        <p className="text-2xs text-gray-500">Port:</p>
                        <p className="font-mono text-2xs">{sshPort}</p>
                      </div>
                      <div>
                        <p className="text-2xs text-gray-500">User:</p>
                        <p className="font-mono text-2xs">{username}</p>
                      </div>
                    </div>

                    <div className="p-1.5 rounded bg-gray-800 text-green-300 font-mono text-2xs overflow-x-auto whitespace-nowrap">
                      <code className="break-all">{sshCommand}</code>
                    </div>
                    
                    <div className="mt-2 text-2xs bg-gray-700 p-1.5 rounded">
                      <h5 className="font-medium mb-1.5 text-gray-300">SSH Key Path Guide</h5>
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-gray-300 font-medium">1. Find your existing SSH keys:</p>
                          <div className="mt-0.5 space-y-0.5">
                            <p className="flex items-center gap-1">
                              <span className="text-gray-400 w-14">Windows:</span>
                              <code className="text-green-300 text-[9px] bg-gray-800 px-1 py-0.5 rounded">dir %USERPROFILE%\.ssh</code>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="text-gray-400 w-14">macOS/Linux:</span>
                              <code className="text-green-300 text-[9px] bg-gray-800 px-1 py-0.5 rounded">ls -la ~/.ssh</code>
                            </p>
                            <p className="mt-0.5 text-gray-400 text-[9px] italic">Look for file pairs like <code className="text-green-300 bg-gray-800 px-1 py-0.5 rounded">id_rsa</code> (private key) and <code className="text-green-300 bg-gray-800 px-1 py-0.5 rounded">id_rsa.pub</code> (public key)</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-300 font-medium">2. Your private key path (for SSH connection):</p>
                          <div className="mt-0.5 space-y-0.5">
                            <p className="flex items-start gap-1">
                              <span className="text-gray-400 w-14">Windows:</span>
                              <code className="text-green-300 text-[9px] bg-gray-800 px-1 py-0.5 rounded">%USERPROFILE%\.ssh\id_rsa</code>
                            </p>
                            <p className="flex items-start gap-1">
                              <span className="text-gray-400 w-14">macOS/Linux:</span>
                              <code className="text-green-300 text-[9px] bg-gray-800 px-1 py-0.5 rounded">~/.ssh/id_rsa</code>
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-300 font-medium">3. Modify connection command:</p>
                          <p className="text-gray-400 text-[9px] mt-0.5">
                            Replace <code className="text-green-300 bg-gray-800 px-1 py-0.5 rounded">~/.ssh/compute_key</code> in the command above with your actual private key path
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-300 font-medium">4. For Windows PowerShell users:</p>
                          <p className="text-gray-400 text-[9px] mt-0.5">
                            Replace <code className="text-green-300 bg-gray-800 px-1 py-0.5 rounded">~</code> with <code className="text-green-300 bg-gray-800 px-1 py-0.5 rounded">$HOME</code> or use absolute path <code className="text-green-300 bg-gray-800 px-1 py-0.5 rounded">C:\Users\YourUsername\.ssh\id_rsa</code>
                          </p>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer - Buttons change based on state */}
              <div className="sticky bottom-0 flex justify-end space-x-2 p-2 border-t dark:border-gray-700 bg-inherit">
                  {!isTerminated && !isTerminating && (
                    <button
                      onClick={handleTerminateClick}
                    className="px-2 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800"
                    >
                      Terminate Pod
                    </button>
                  )}
                  {isTerminating && (
                  <div className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <div className="w-2.5 h-2.5 border-2 border-t-transparent border-red-500 rounded-full animate-spin" />
                      <span>Terminating...</span>
                    </div>
                  )}
                  <button 
                  className="px-2 py-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    onClick={handleToggleDetails}
                  >
                    Close
                  </button>
                </div>
                
                {/* Termination confirmation UI */}
                {showTerminateConfirm && (
                  <>
                  <div className="fixed inset-0 bg-black opacity-70 z-[10001]" onClick={handleCancelTerminate}></div>
                    <div 
                      className="fixed inset-0 flex items-center justify-center z-[10002]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={`
                      p-4 w-80 rounded-lg shadow-lg flex flex-col
                        ${darkMode 
                        ? 'bg-gray-900 border border-red-800 text-white' 
                        : 'bg-white border border-red-200 text-gray-800'}
                      transform transition-opacity duration-300
                      `}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="w-5 h-5" />
                          <h3 className="font-bold">Confirm Termination</h3>
                        </div>
                        <button
                          onClick={handleCancelTerminate}
                          className="p-1 rounded-full hover:bg-gray-700 text-gray-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        </div>
                        
                        <p className="text-sm mb-4">
                          Are you sure you want to terminate this compute pod? This action cannot be undone.
                        </p>
                        
                      <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-gray-700">
                          <button
                            onClick={handleCancelTerminate}
                            className={`
                              px-3 py-1 rounded-md text-xs font-medium
                              ${darkMode 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                            `}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleConfirmTerminate}
                            className={`
                              px-3 py-1 rounded-md text-xs font-medium
                              bg-red-600 text-white hover:bg-red-700
                            `}
                          >
                            Terminate
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-1.5 gap-2">
          <div className={`font-medium text-[11px] break-words leading-tight w-[65%] ${darkMode ? 'bg-gray-700/50' : 'bg-gray-200/80'} px-1.5 py-1 rounded`}>
            {processorName}
          </div>
          
          {/* Status Bar */}
          <div className={`border ${isTerminated
            ? (darkMode ? 'border-orange-700' : 'border-orange-300')
            : isTerminating 
              ? (darkMode ? 'border-red-700' : 'border-red-300')
              : (darkMode ? 'border-green-700' : 'border-green-300')
          } rounded text-[9px] px-1.5 py-0.5 inline-flex items-center ${
            isTerminated 
              ? (darkMode ? 'bg-orange-900' : 'bg-orange-50') 
              : isTerminating
                ? (darkMode ? 'bg-red-900' : 'bg-red-50')
                : (darkMode ? 'bg-green-900' : 'bg-green-50')
          }`}>
            {isTerminated ? 'Terminated' : isTerminating ? 'Terminating' : 'Active'}
          </div>
        </div>
        
        <div className="flex justify-start items-center">
          <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-[11px] font-medium`}>
            ${hourlyPrice}/hr
          </span>
        </div>

        <div className="space-y-1">
          <div className={`${specContainerStyle} hover:bg-opacity-70`}>
            <FaMemory className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
            <span className="text-xs">{ram}</span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className={`${specContainerStyle} hover:bg-opacity-70`}>
              <FaMicrochip className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
              <span className="text-xs">
                {cores.split(' ')[0]} {computeType === 'GPU' ? 'CUDA' : 'CPU'}
              </span>
            </div>

            <div className={`${specContainerStyle} hover:bg-opacity-70`}>
              <FaHdd className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={10} />
              <span className="text-xs">
                {storage}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-1 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {isTerminated 
              ? `Ended: ${formattedTerminationTime.split(',')[0]}`
              : `${timeRemaining} hrs remaining`}
          </span>
          {!isTerminated && (
          <button 
              className={`text-xs flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
            onClick={handleToggleDetails}
          >
            <span>Details</span>
            <ExternalLink className="w-2 h-2 ml-0.5" />
          </button>
          )}
        </div>
      </div>
    );
  }

  // Original non-compact version
  return (
    <div 
      className={cardStyle} 
      role="button" 
      tabIndex={isTerminated || isTerminating ? -1 : 0}
      aria-disabled={isTerminated || isTerminating}
      onClick={isTerminated ? showTerminatedToast : (isTerminating ? undefined : handleToggleExpand)}
      style={{ cursor: isTerminating ? 'not-allowed' : (isTerminated ? 'not-allowed' : 'pointer') }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center cursor-pointer">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${isTerminated 
            ? (darkMode ? 'bg-orange-900/30' : 'bg-orange-100') 
            : 'bg-gradient-to-br from-violet-100/50 to-indigo-100/50'}`}>
            <ComputeIcon className={`w-4 h-4 ${isTerminated ? (darkMode ? 'text-orange-400' : 'text-orange-600') : iconColor}`} />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className={`text-base font-semibold ${isTerminated ? (darkMode ? 'text-orange-300' : 'text-orange-700') : ''}`}>
                {computeType}: {processorName}
              </h3>
            </div>
            <p className={`text-sm ${isTerminated ? (darkMode ? 'text-orange-300/70' : 'text-orange-600/80') : 'text-gray-500'}`}>
              {isTerminated 
                ? `Terminated: ${formattedTerminationTime}`
                : `Remaining: ${timeRemaining} hrs`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onTerminate && !isTerminated && !isTerminating && !showTerminateConfirm && (
            <button
              onClick={handleTerminateClick}
              className={`
                px-3 py-1 rounded-md text-xs font-medium transition-all 
                ${darkMode 
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'}
              `}
              aria-label="Terminate Pod"
            >
              Terminate
            </button>
          )}

          {/* Termination confirmation UI - for full-size cards */}
          {showTerminateConfirm && (
            <>
              <div className="fixed inset-0 bg-black opacity-70 z-[10001]" onClick={handleCancelTerminate}></div>
              <div 
                className="fixed inset-y-0 right-0 z-[10002]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`
                  p-4 border-l w-80 h-full shadow-lg flex flex-col
                  ${darkMode 
                    ? 'bg-gray-900 border-red-800 text-white' 
                    : 'bg-white border-red-200 text-gray-800'}
                  transform transition-transform duration-300
                `}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-bold">Confirm Termination</h3>
                    </div>
                    <button
                      onClick={handleCancelTerminate}
                      className="p-1 rounded-full hover:bg-gray-700 text-gray-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-sm mb-auto py-4">
                    Are you sure you want to terminate this compute pod? This action cannot be undone.
                  </p>
                  
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={handleCancelTerminate}
                      className={`
                        px-3 py-1 rounded-md text-xs font-medium
                        ${darkMode 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmTerminate}
                      className={`
                        px-3 py-1 rounded-md text-xs font-medium
                        bg-red-600 text-white hover:bg-red-700
                      `}
                    >
                      Terminate
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {isTerminating && (
            <div className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700 flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-t-transparent border-red-500 rounded-full animate-spin" />
              <span>Terminating...</span>
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand();
            }}
            className={`
              p-1 rounded-full transition-all 
              ${darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'}
            `}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Specifications Section */}
          <div className={connectionDetailsClasses}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-500 text-xs">Compute:</span> 
                <p>{computeType} - {cores}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 text-xs">Storage:</span> 
                <p>{storage}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 text-xs">RAM:</span> 
                <p>{ram}</p>
              </div>
            </div>
          </div>

          {/* SSH Connection Details */}
          <div className={connectionDetailsClasses}>
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Terminal className="w-4 h-4 text-green-500" />
                <span className="font-medium text-xs">Connection</span>
              </div>
              
              <div className="text-xs space-y-1">
                <div className="flex">
                  <span className="font-medium text-gray-500 w-16">Host:</span>
                  <span>{host}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-500 w-16">Port:</span>
                  <span>{sshPort}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-500 w-16">User:</span>
                  <span>{username}</span>
                </div>
              </div>

              <div className={`
                mt-2 p-2 rounded-md 
                ${isTerminated
                  ? (darkMode 
                    ? 'bg-orange-900 text-orange-200' 
                    : 'bg-orange-100 text-orange-800')
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-green-50 text-gray-700'}
              `}>
                <div className="flex items-center space-x-1 mb-1">
                  <Info className={`w-3 h-3 ${isTerminated ? 'text-orange-500' : 'text-blue-500'}`} />
                  <span className="text-xs font-medium">SSH Key Paths:</span>
                </div>
                <ol className="list-decimal list-inside text-xs space-y-1">
                  <li>Locate your existing SSH keys</li>
                  <li>Use the following connection command:</li>
                </ol>
                <div className={`
                  mt-1 p-1 rounded-md font-mono text-xs overflow-x-auto whitespace-nowrap
                  ${isTerminated
                    ? (darkMode 
                      ? 'bg-orange-900 text-orange-300' 
                      : 'bg-orange-200 text-orange-800')
                    : darkMode 
                      ? 'bg-gray-800 text-green-300' 
                      : 'bg-green-100 text-green-800'}
                `}>
                  <code className="break-all">{sshCommand}</code>
                </div>
                <div className="text-xs mt-1 italic flex items-center space-x-1">
                  <Key className={`w-3 h-3 ${isTerminated ? (darkMode ? 'text-orange-500' : 'text-orange-600') : 'text-gray-500'}`} />
                  <span>SSH Key Paths:</span>
                </div>
                <div className="text-[9px] mt-1 space-y-0.5 pl-5">
                  <p><span className="font-semibold">Find keys:</span> <code className="px-1 bg-gray-700 rounded text-green-300">ls -la ~/.ssh</code> (Mac/Linux) or <code className="px-1 bg-gray-700 rounded text-green-300">dir %USERPROFILE%\.ssh</code> (Windows)</p>
                  <p><span className="font-semibold">Windows:</span> <code className="px-1 bg-gray-700 rounded text-green-300">%USERPROFILE%\.ssh\id_rsa</code> or <code className="px-1 bg-gray-700 rounded text-green-300">C:\Users\YourUsername\.ssh\id_rsa</code></p>
                  <p><span className="font-semibold">Mac/Linux:</span> <code className="px-1 bg-gray-700 rounded text-green-300">~/.ssh/id_rsa</code> or <code className="px-1 bg-gray-700 rounded text-green-300">/home/username/.ssh/id_rsa</code></p>
                  <p className="italic">Replace <code className="px-1 bg-gray-700 rounded text-green-300">~/.ssh/compute_key</code> in SSH command with your private key path</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PodCard.propTypes = {
  pod: PropTypes.shape({
    id: PropTypes.string,
    podId: PropTypes.string,
    status: PropTypes.string,
    timeRemaining: PropTypes.number,
    connection: PropTypes.object,
    subscriptionDetails: PropTypes.object,
    terminatedAt: PropTypes.string
  }),
  darkMode: PropTypes.bool,
  onTerminate: PropTypes.func,
  isTerminating: PropTypes.bool,
  compact: PropTypes.bool
};

export default PodCard;