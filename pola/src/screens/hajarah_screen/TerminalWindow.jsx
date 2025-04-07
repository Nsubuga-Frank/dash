import React, { useState } from 'react';
import { ChevronRightIcon, CheckCircleIcon, CopyIcon, ClipboardIcon } from 'lucide-react';

const TerminalWindow = ({ children, title, onCopy, copied }) => (
  <div className="bg-gray-900 rounded-lg overflow-hidden">
    <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
      <span className="text-gray-200">{title}</span>
      <button 
        className="text-gray-400 hover:text-white transition-colors"
        onClick={onCopy}
      >
        {copied ? 
          <CheckCircleIcon className="w-5 h-5" /> : 
          <CopyIcon className="w-5 h-5" />
        }
      </button>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const ResourceCard = ({ title, specs, selected, onSelect }) => (
  <div 
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
    }`}
    onClick={onSelect}
  >
    <h4 className="font-semibold text-lg mb-3">{title}</h4>
    <div className="space-y-2">
      {Object.entries(specs).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="text-gray-600">{key}:</span>
          <span className="font-medium">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const StepIndicator = ({ step, totalSteps }) => (
  <div className="relative mb-8">
    <div className="absolute h-1 bg-gray-200 w-full rounded">
      <div 
        className="absolute h-full bg-blue-500 rounded transition-all duration-500"
        style={{ width: `${(step / totalSteps) * 100}%` }}
      />
    </div>
    <div className="relative flex justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div 
          key={index}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            index <= step ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          {index + 1}
        </div>
      ))}
    </div>
  </div>
);

const PolarisDocs = () => {
  const [copiedStates, setCopiedStates] = useState({});
  const [activeTab, setActiveTab] = useState('becomeMiner');
  const [selectedResource, setSelectedResource] = useState(null);
  const [setupStep, setSetupStep] = useState(0);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resourceTypes = {
    cpu: {
      title: "CPU Node",
      specs: {
        "Processor": "Intel Xeon Platinum",
        "Cores": "32 Cores",
        "RAM": "128GB",
        "Storage": "4TB NVMe"
      }
    },
    gpu: {
      title: "GPU Node",
      specs: {
        "GPU": "NVIDIA A100",
        "VRAM": "80GB",
        "RAM": "256GB",
        "Storage": "8TB NVMe"
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Polaris Compute Subnet</h1>
      
      <p className="text-gray-700 mb-8">
        A decentralized computing marketplace where individuals can share computing resources and earn rewards through a secure, validated network.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Network Participants</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">Miners</h3>
          <p className="text-gray-700">
            Individuals who provide computing resources (GPU, CPU, memory) to the network. Miners earn rewards by sharing their hardware's computational power through secure Docker containers. Each miner's performance is continuously validated to ensure reliable service.
          </p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
          <h3 className="font-bold text-green-800 mb-2">Validators</h3>
          <p className="text-gray-700">
            Network nodes that verify and score miners' performance. Validators generate challenges, monitor resource availability, and ensure the network's integrity by validating miners' claims about their computing resources.
          </p>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('becomeMiner')}
            className={`px-6 py-2 text-sm font-medium rounded-md shadow-sm ${
              activeTab === 'becomeMiner'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            Become Miner
          </button>
          <button
            onClick={() => setActiveTab('runMiner')}
            className={`px-6 py-2 text-sm font-medium rounded-md shadow-sm ${
              activeTab === 'runMiner'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            Run Miner Program
          </button>
          <button
            onClick={() => setActiveTab('monitorMiner')}
            className={`px-6 py-2 text-sm font-medium rounded-md shadow-sm ${
              activeTab === 'monitorMiner'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            Monitor Miner Program
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'becomeMiner' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Select Your Resource Type</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(resourceTypes).map(([key, resource]) => (
                    <ResourceCard
                      key={key}
                      {...resource}
                      selected={selectedResource === key}
                      onSelect={() => setSelectedResource(key)}
                    />
                  ))}
                </div>
                {selectedResource && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Estimated Earnings (Based on 90% Uptime)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-sm text-gray-600">Daily</div>
                        <div className="text-lg font-bold">${selectedResource === 'cpu' ? '48.00' : '84.00'}</div>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-sm text-gray-600">Weekly</div>
                        <div className="text-lg font-bold">${selectedResource === 'cpu' ? '336.00' : '588.00'}</div>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-sm text-gray-600">Monthly</div>
                        <div className="text-lg font-bold">${selectedResource === 'cpu' ? '1,440.00' : '2,520.00'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Installation Guide</h3>
                <StepIndicator step={setupStep} totalSteps={3} />
                
                <div className="space-y-6">
                  <div className={setupStep >= 0 ? 'opacity-100' : 'opacity-50'}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                      <h4 className="font-semibold">Install Polaris CLI</h4>
                    </div>
                    <TerminalWindow 
                      title="Terminal"
                      onCopy={() => handleCopy("npm install -g polaris-cli", "install")}
                      copied={copiedStates.install}
                    >
                      <div className="flex items-center">
                        <span className="text-pink-400 mr-2">></span>
                        <code className="text-gray-200">npm install -g polaris-cli</code>
                      </div>
                    </TerminalWindow>
                  </div>

                  <div className={setupStep >= 1 ? 'opacity-100' : 'opacity-50'}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                      <h4 className="font-semibold">Configure Resources</h4>
                    </div>
                    <TerminalWindow
                      title="Configuration"
                      onCopy={() => handleCopy(selectedResource ? JSON.stringify(resourceTypes[selectedResource].specs, null, 2) : "", "config")}
                      copied={copiedStates.config}
                    >
                      <pre className="text-gray-200 text-sm">
                        {selectedResource ? 
                          JSON.stringify(resourceTypes[selectedResource].specs, null, 2) :
                          "Select a resource type to view configuration"
                        }
                      </pre>
                    </TerminalWindow>
                  </div>

                  <div className={setupStep >= 2 ? 'opacity-100' : 'opacity-50'}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                      <h4 className="font-semibold">Start Mining</h4>
                    </div>
                    <TerminalWindow
                      title="Terminal"
                      onCopy={() => handleCopy("polaris start --mode miner", "start")}
                      copied={copiedStates.start}
                    >
                      <div className="flex items-center">
                        <span className="text-pink-400 mr-2">></span>
                        <code className="text-gray-200">polaris start --mode miner</code>
                      </div>
                    </TerminalWindow>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setSetupStep(Math.max(0, setupStep - 1))}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    disabled={setupStep === 0}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setSetupStep(Math.min(2, setupStep + 1))}
                    className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                    disabled={setupStep === 2}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'runMiner' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Resource Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>CPU Usage</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory</span>
                      <span className="font-medium">12.4GB / 16GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network</span>
                      <span className="font-medium">1.2 GB/s</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Network Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Connected Peers</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Block Height</span>
                      <span className="font-medium">#12,345,678</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sync Status</span>
                      <span className="text-green-600 font-medium">Synchronized</span>
                    </div>
                  </div>
                </div>
              </div>

              <TerminalWindow
                title="Live Logs"
                onCopy={() => {}}
              >
                <div className="space-y-1 text-sm font-mono">
                  <div className="text-gray-400">[2024-01-20 10:30:45] Starting Polaris miner...</div>
                  <div className="text-gray-400">[2024-01-20 10:30:46] Connecting to network...</div>
                  <div className="text-green-400">[2024-01-20 10:30:47] Successfully connected to network</div>
                  <div className="text-gray-400">[2024-01-20 10:30:48] Initializing resources...</div>
                  <div className="text-gray-400">[2024-01-20 10:30:49] Verifying configuration...</div>
                  <div className="text-green-400">[2024-01-20 10:30:50] Resource verification complete</div>
                  <div className="text-gray-400">[2024-01-20 10:30:51] Starting validation process...</div>
                  <div className="text-green-400">[2024-01-20 10:30:52] Miner node active and ready</div>
                  <div className="text-blue-400">[2024-01-20 10:30:53] Waiting for compute tasks...</div>
                </div>
              </TerminalWindow>
            </div>
          )}

          {activeTab === 'monitorMiner' && (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-lg text-white">
                  <h3 className="text-sm opacity-90 mb-1">Network Health</h3>
                  <p className="text-2xl font-bold">98.5%</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-4 rounded-lg text-white">
                  <h3 className="text-sm opacity-90 mb-1">Active Tasks</h3>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-4 rounded-lg text-white">
                  <h3 className="text-sm opacity-90 mb-1">Daily Earnings</h3>
                  <p className="text-2xl font-bold">$48.50</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Task #12345 completed</span>
                    </div>
                    <span className="text-sm text-gray-500">2 mins ago</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>New task assigned</span>
                    </div>
                    <span className="text-sm text-gray-500">5 mins ago</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span>Validation check passed</span>
                    </div>
                    <span className="text-sm text-gray-500">12 mins ago</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Resource Utilization</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>CPU Usage</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Memory</span>
                      <span>64%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Storage</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PolarisDocs;