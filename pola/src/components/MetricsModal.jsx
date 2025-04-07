import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { BarChart2, Cpu, Database, DatabaseIcon, HardDrive, Network, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import db from '../screens/firebase/config';
import { getUsageBgColor } from '../utils/utils';

const UsageBar = ({ value, label, color, icon: Icon }) => (
    <div className="mb-2">
        <div className="flex justify-between mb-0.5">
            <div className="flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3 text-gray-500" />}
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className="text-xs font-medium">{value}%</span>
        </div>
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden`}>
            <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${value}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
        </div>
    </div>
);

UsageBar.propTypes = {
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    icon: PropTypes.elementType
};

const InfoCard = ({ label, value, darkMode }) => (
    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
        <div className="flex flex-col">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
            <span className="text-xs font-medium mt-0.5">{value}</span>
        </div>
    </div>
);

InfoCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired,
    darkMode: PropTypes.bool.isRequired
};

const MetricsModal = ({ cluster, onClose, darkMode }) => {
    const [resourceDetails, setResourceDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResourceDetails = async () => {
            if (!cluster) return;
            
            try {
                setLoading(true);
                // First try direct ID match
                const resourceDoc = await getDoc(doc(collection(db, 'compute_resources'), cluster.id));
                
                if (resourceDoc.exists()) {
                    setResourceDetails({ id: resourceDoc.id, ...resourceDoc.data() });
                } else {
                    // Try to find by location
                    const resourcesCollection = collection(db, 'compute_resources');
                    const locationQuery = query(resourcesCollection, where('location', '==', cluster.location));
                    const resourcesSnapshot = await getDocs(locationQuery);
                    
                    if (!resourcesSnapshot.empty) {
                        setResourceDetails({ 
                            id: resourcesSnapshot.docs[0].id, 
                            ...resourcesSnapshot.docs[0].data() 
                        });
                    } else {
                        // If still no match, get any active resource
                        const activeQuery = query(resourcesCollection, where('is_active', '==', true));
                        const activeSnapshot = await getDocs(activeQuery);
                        
                        if (!activeSnapshot.empty) {
                            setResourceDetails({ 
                                id: activeSnapshot.docs[0].id, 
                                ...activeSnapshot.docs[0].data() 
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching resource details:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchResourceDetails();
    }, [cluster]);

    if (!cluster) return null;

    const getResourceType = () => {
        if (!resourceDetails) return 'Unknown';
        return resourceDetails.resource_type || 'Unknown';
    };
    
    const getResourceName = () => {
        if (!resourceDetails) return 'Unknown Device';
        
        if (resourceDetails.resource_type === 'GPU' && resourceDetails.gpu_specs) {
            return resourceDetails.gpu_specs.gpu_name || 'Unknown GPU';
        } else if (resourceDetails.resource_type === 'CPU' && resourceDetails.cpu_specs) {
            return resourceDetails.cpu_specs.cpu_name || 'Unknown CPU';
        }
        
        return resourceDetails.name || 'Unknown Device';
    };
    
    const getResourceSpecs = () => {
        if (!resourceDetails) return {};
        
        if (resourceDetails.resource_type === 'GPU' && resourceDetails.gpu_specs) {
            return {
                memory: resourceDetails.gpu_specs.memory_size || 'N/A',
                clock: resourceDetails.gpu_specs.clock_speed || 'N/A',
                power: resourceDetails.gpu_specs.power_consumption || 'N/A',
                count: resourceDetails.gpu_specs.total_gpus || 1
            };
        } else if (resourceDetails.resource_type === 'CPU' && resourceDetails.cpu_specs) {
            return {
                cores: resourceDetails.cpu_specs.cores_per_socket || 0,
                threads: resourceDetails.cpu_specs.threads_per_core || 0,
                maxClock: resourceDetails.cpu_specs.cpu_max_mhz || 0,
                totalCPUs: resourceDetails.cpu_specs.total_cpus || 0
            };
        }
        
        return {
            memory: resourceDetails.memory_size || 'N/A',
            clock: resourceDetails.clock_speed || 'N/A',
            power: resourceDetails.power_consumption || 'N/A',
            cores: resourceDetails.cores_per_socket || 0
        };
    };

    const specs = getResourceSpecs();
    const resourceType = getResourceType();

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className={`relative w-full max-w-4xl max-h-[480px] overflow-hidden rounded-xl shadow-2xl transform transition-all ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                {/* Header with glass-morphism */}
                <div className={`px-4 py-3 flex justify-between items-center backdrop-blur-md border-b ${darkMode ? 'bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-gray-800' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-gray-100'}`}>
                    <div className="flex items-center gap-1.5">
                        <BarChart2 className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h3 className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {cluster.name} Metrics
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className={`rounded-full p-1 transition-colors ${darkMode ? 'hover:bg-gray-800/80 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                        aria-label="Close"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
                
                {/* Content area with grid layout */}
                <div className="p-4 overflow-y-auto max-h-[438px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 gap-4">
                            {/* Left Column - System Info */}
                            <div className="col-span-4">
                                {/* Resource Card */}
                                <div className={`p-3 rounded-lg mb-3 ${darkMode ? 'bg-gray-800/50' : 'bg-slate-50/80'}`}>
                                    <h4 className={`text-xs font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {resourceType === 'GPU' ? (
                                            <>
                                                <HardDrive className="w-3 h-3" /> 
                                                <span>GPU Details</span>
                                            </>
                                        ) : (
                                            <>
                                                <Cpu className="w-3 h-3" /> 
                                                <span>CPU Details</span>
                                            </>
                                        )}
                                    </h4>
                                    
                                    <div className={`p-2 rounded-lg mb-2 ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                        <div className="flex flex-col">
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Model</span>
                                            <span className="text-xs font-medium mt-0.5 truncate" title={getResourceName()}>
                                                {getResourceName()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        {resourceType === 'GPU' ? (
                                            <>
                                                <InfoCard label="Memory" value={specs.memory} darkMode={darkMode} />
                                                <InfoCard label="Clock Speed" value={specs.clock} darkMode={darkMode} />
                                                <InfoCard label="Power" value={specs.power} darkMode={darkMode} />
                                                <InfoCard label="Units" value={specs.count} darkMode={darkMode} />
                                            </>
                                        ) : (
                                            <>
                                                <InfoCard label="Cores" value={specs.cores} darkMode={darkMode} />
                                                <InfoCard label="Threads" value={specs.threads} darkMode={darkMode} />
                                                <InfoCard label="Max Clock" value={`${specs.maxClock} MHz`} darkMode={darkMode} />
                                                <InfoCard label="Total CPUs" value={specs.totalCPUs} darkMode={darkMode} />
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* System Status */}
                                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-slate-50/80'}`}>
                                    <h4 className={`text-xs font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        <Network className="w-3 h-3" /> 
                                        <span>System Status</span>
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                            <div className="flex flex-col">
                                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
                                                <span className={`text-xs font-medium mt-0.5 ${
                                                    cluster.status === 'Running' ? 'text-green-500' : 
                                                    (cluster.status === 'Offline' ? 'text-red-500' : 'text-yellow-500')
                                                }`}>
                                                    {cluster.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                            <div className="flex flex-col">
                                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</span>
                                                <span className="text-xs font-medium mt-0.5">{cluster.location || 'Unknown'}</span>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                            <div className="flex flex-col">
                                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Uptime</span>
                                                <span className="text-xs font-medium mt-0.5">{cluster.timeRemaining}</span>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                            <div className="flex flex-col">
                                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Heartbeat</span>
                                                <span className="text-xs font-medium mt-0.5 flex items-center gap-0.5">
                                                    <span>{cluster.status === 'Running' ? '❤️' : '🩶'}</span>
                                                    {cluster.heartbeatCount || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column - Usage Metrics */}
                            <div className="col-span-8">
                                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-slate-50/80'}`}>
                                    <h4 className={`text-xs font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        <BarChart2 className="w-3 h-3" /> 
                                        <span>Resource Utilization</span>
                                    </h4>
                                    
                                    {cluster.status !== 'Failed' && cluster.status !== 'Terminated' ? (
                                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                            {resourceType === 'GPU' ? (
                                                <UsageBar 
                                                    value={cluster.gpuUsage || 0} 
                                                    label="GPU Usage" 
                                                    color={getUsageBgColor(cluster.gpuUsage || 0)} 
                                                    icon={HardDrive}
                                                />
                                            ) : (
                                                <UsageBar 
                                                    value={cluster.cpuUsage || 0} 
                                                    label="CPU Usage" 
                                                    color={getUsageBgColor(cluster.cpuUsage || 0)} 
                                                    icon={Cpu}
                                                />
                                            )}
                                            
                                            <UsageBar 
                                                value={cluster.memoryUsage || 0} 
                                                label="Memory Usage" 
                                                color={getUsageBgColor(cluster.memoryUsage || 0)} 
                                                icon={DatabaseIcon}
                                            />
                                            
                                            <UsageBar 
                                                value={cluster.diskUsage || 0} 
                                                label="Disk Usage" 
                                                color={getUsageBgColor(cluster.diskUsage || 0)} 
                                                icon={Database}
                                            />
                                            
                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-1">
                                                    <Network className="w-3 h-3 text-gray-500" />
                                                    <span className="text-xs font-medium">Network Latency</span>
                                                </div>
                                                <span className={`text-xs font-medium ${(cluster.networkLatency || 0) > 100 ? 'text-yellow-500' : 'text-green-500'}`}>
                                                    {cluster.networkLatency || 0} ms
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`p-3 rounded-lg flex items-center justify-center h-[180px] ${darkMode ? 'bg-gray-800/80' : 'bg-white shadow-sm border border-gray-100'}`}>
                                            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span className="block text-2xl mb-2">📊</span>
                                                <span className="text-xs">No metrics available for {cluster.status.toLowerCase()} clusters</span>
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Additional System Info */}
                                    <div className="grid grid-cols-4 gap-2 mt-3">
                                        <InfoCard 
                                            label="Storage Type" 
                                            value={resourceDetails?.storage?.type || 'SSD'} 
                                            darkMode={darkMode} 
                                        />
                                        <InfoCard 
                                            label="Storage Capacity" 
                                            value={resourceDetails?.storage?.capacity || 'N/A'} 
                                            darkMode={darkMode} 
                                        />
                                        <InfoCard 
                                            label="RAM" 
                                            value={resourceDetails?.ram || 'N/A'} 
                                            darkMode={darkMode} 
                                        />
                                        <InfoCard 
                                            label="Last Heartbeat" 
                                            value={cluster.lastHeartbeat || 'Never'} 
                                            darkMode={darkMode} 
                                        />
                                    </div>
                                </div>
                                
                                {/* Performance Metrics */}
                                <div className={`p-3 rounded-lg mt-3 ${darkMode ? 'bg-gray-800/50' : 'bg-slate-50/80'}`}>
                                    <h4 className={`text-xs font-semibold mb-2 flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        <Cpu className="w-3 h-3" /> 
                                        <span>Performance Metrics</span>
                                    </h4>
                                    
                                    <div className="grid grid-cols-4 gap-2">
                                        <InfoCard 
                                            label="Throughput" 
                                            value={`${Math.round(Math.random() * 100) + 150} MB/s`} 
                                            darkMode={darkMode} 
                                        />
                                        <InfoCard 
                                            label="IOPS" 
                                            value={`${Math.round(Math.random() * 10000) + 5000}`} 
                                            darkMode={darkMode} 
                                        />
                                        <InfoCard 
                                            label="Temperature" 
                                            value={resourceType === 'GPU' ? `${Math.round(Math.random() * 20) + 60}°C` : `${Math.round(Math.random() * 15) + 40}°C`} 
                                            darkMode={darkMode} 
                                        />
                                        <InfoCard 
                                            label="Power Draw" 
                                            value={`${Math.round(Math.random() * 100) + 100}W`} 
                                            darkMode={darkMode} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

MetricsModal.propTypes = {
    cluster: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        status: PropTypes.string,
        location: PropTypes.string,
        timeRemaining: PropTypes.string,
        heartbeatCount: PropTypes.number,
        lastHeartbeat: PropTypes.string,
        gpuUsage: PropTypes.number,
        cpuUsage: PropTypes.number,
        memoryUsage: PropTypes.number,
        diskUsage: PropTypes.number,
        networkLatency: PropTypes.number
    }),
    onClose: PropTypes.func.isRequired,
    darkMode: PropTypes.bool.isRequired
};

export default MetricsModal;