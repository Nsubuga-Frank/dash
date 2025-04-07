import {
    ScrollText,
    ServerCog,
    Terminal
} from 'lucide-react';
import React, { useState } from 'react';

const PodDetailsTabs = ({ pod, darkMode }) => {
    const [activeTab, setActiveTab] = useState('specs');

    // Reuse existing components from the previous implementation
    const renderSpecsAndUsageContent = () => {
        if (!pod.resourceDetails || !pod) return null;

        const specs =
            pod.resourceDetails.resource_type === 'GPU' 
                ? pod.resourceDetails.gpu_specs 
                : pod.resourceDetails.cpu_specs;
        if (!specs) return null;

        const renderSpec = (label, value) => {
            if (!value) return null;
            return (
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">{label}:</span>
                    <span>{value}</span>
                </div>
            );
        };

        return (
            <div className="grid grid-cols-2 gap-4 text-sm">
                {pod.resourceDetails.resource_type === 'GPU' ? (
                    <>
                        {renderSpec('GPU Model', specs.name)}
                        {renderSpec('Memory', specs.memory)}
                        {renderSpec('Architecture', specs.architecture)}
                        {renderSpec('CUDA Cores', specs.cuda_cores)}
                    </>
                ) : (
                    <>
                        {renderSpec('CPU Model', specs.cpu_name)}
                        {renderSpec('Cores/Socket', specs.cores_per_socket)}
                        {renderSpec('Clock Speed', `${specs.cpu_max_mhz}MHz`)}
                    </>
                )}
                {renderSpec('RAM', pod.resourceDetails.ram)}

                {pod.resourceType && (
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="ml-2">{pod.resourceType}</span>
                    </div>
                )}
                {pod.minerLocation && (
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Location:</span>
                        <span className="ml-2">{pod.minerLocation}</span>
                    </div>
                )}
                {pod.timeRemaining > 0 && (
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Time Remaining:</span>
                        <span className="ml-2">{pod.timeRemaining}h</span>
                    </div>
                )}
                {pod.hourlyPrice > 0 && (
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Price:</span>
                        <span className="ml-2">${pod.hourlyPrice}/hr</span>
                    </div>
                )}
            </div>
        );
    };

    const renderLogsContent = () => (
        <div
            className={`h-64 overflow-auto rounded-lg ${
                darkMode ? 'bg-black' : 'bg-white'
            } p-4 font-mono text-sm`}
        >
            <div className="text-gray-400">[INFO] Pod initialized</div>
            <div className="text-gray-400">[INFO] Starting services...</div>
            <div className="text-gray-400">[DEBUG] Checking system resources...</div>
            <div className="text-gray-400">[INFO] All systems operational</div>
        </div>
    );

    const renderTerminalContent = () => (
        <div
            className={`h-64 rounded-lg ${
                darkMode ? 'bg-black' : 'bg-white'
            } p-4 overflow-auto`}
        >
            <code className="text-green-500">$ _</code>
            <div className="mt-2 text-sm text-gray-300 dark:text-gray-600">
                Welcome to the terminal! Type your commands here.
            </div>
        </div>
    );

    const tabs = [
        { 
            id: 'specs', 
            label: 'Specifications & Usage', 
            icon: ServerCog, 
            content: renderSpecsAndUsageContent() 
        },
        { 
            id: 'logs', 
            label: 'Logs', 
            icon: ScrollText, 
            content: renderLogsContent() 
        },
        { 
            id: 'terminal', 
            label: 'Terminal', 
            icon: Terminal, 
            content: renderTerminalContent() 
        }
    ];

    return (
        <div>
            {/* Tabs Header */}
            <div className="flex bg-gray-100 rounded-lg p-1 space-x-1 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 
                            flex 
                            items-center 
                            justify-center 
                            gap-2
                            py-2 
                            px-4 
                            rounded-md 
                            transition-all 
                            duration-300 
                            ease-in-out 
                            ${activeTab === tab.id 
                                ? 'bg-white text-black shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-200 hover:text-black'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div 
                className={`
                    rounded-lg 
                    p-4 
                    ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
                    border
                `}
            >
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default PodDetailsTabs;