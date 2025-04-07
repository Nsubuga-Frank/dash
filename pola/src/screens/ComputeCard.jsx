// ComputeCard.jsx

import {
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Copy,
    Cpu, // Ensure 'Gpu' is imported correctly
    Server
} from 'lucide-react';
import React, { useState } from 'react';

const ComputeCard = ({ container, darkMode }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text:', err);
      });
  };

  return (
    <div 
      className={`rounded-xl border transition-all duration-200 ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      } ${expanded ? 'shadow-lg' : 'hover:shadow-md'}`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
              {container.resourceType.toUpperCase() === 'GPU' ? (
                <Server className="w-5 h-5 text-violet-500" />
              ) : (
                <Cpu className="w-5 h-5 text-violet-500" />
              )}
            </div>
            <div>
              <h3 className="font-medium flex items-center gap-2">
                {container.resourceName}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                  ${container.status.toLowerCase() === 'active' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-yellow-50 text-yellow-600'}`}
                >
                  {container.status}
                </span>
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ID: {container.containerId?.substring(0, 12)}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {/* Connection Details */}
          {container.connection && (
            <div className={`rounded-lg border ${
              darkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h4 className="font-medium">Connection Details</h4>
              </div>
              <div className="p-4 space-y-3">
                {container.connection.sshCommand && (
                  <div>
                    <label className="block text-xs font-medium mb-1">SSH Command</label>
                    <div className="flex items-center gap-2">
                      <code className={`flex-1 px-3 py-1.5 rounded text-sm font-mono
                        ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                      >
                        {container.connection.sshCommand}
                      </code>
                      <button
                        onClick={() => handleCopy(container.connection.sshCommand, 'ssh')}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Copy SSH Command"
                      >
                        {copied === 'ssh' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {container.connection.password && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Password</label>
                    <div className="flex items-center gap-2">
                      <code className={`flex-1 px-3 py-1.5 rounded text-sm font-mono
                        ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                      >
                        {container.connection.password}
                      </code>
                      <button
                        onClick={() => handleCopy(container.connection.password, 'pwd')}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Copy Password"
                      >
                        {copied === 'pwd' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Ports */}
                {container.connection.ports && Object.keys(container.connection.ports).length > 0 && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Ports</label>
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(container.connection.ports).map(([name, port]) => (
                        <div key={name} className="flex items-center gap-2">
                          <span className="text-sm">{name}:</span>
                          <code className={`px-2 py-1 rounded text-sm font-mono
                            ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                          >
                            {port}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resource Specifications */}
          {container.resourceSpecs && Object.keys(container.resourceSpecs).length > 0 && (
            <div className={`mt-4 rounded-lg border ${
              darkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h4 className="font-medium">Resource Specifications</h4>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                {Object.entries(container.resourceSpecs).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-500 dark:text-gray-400">
                      {key.replace(/_/g, ' ').toLowerCase()}:
                    </span>
                    <span className="ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Remaining */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Time Remaining:
            </span>
            <span className="font-medium">
              {container.timeRemaining > 0 ? `${container.timeRemaining}h` : 'Expired'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputeCard;
