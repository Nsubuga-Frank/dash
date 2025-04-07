import {
    Bell,
    MoreHorizontal,
    Pencil,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ActionDropdown = ({ onRename, onTerminate, clusterStatus, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDropdownClick = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={handleDropdownClick}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
                <MoreHorizontal className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={handleClickOutside}
                    />
                    <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-20 py-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button
                            onClick={onRename}
                            className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Pencil className="w-4 h-4" strokeWidth={1.5} />
                            Rename
                        </button>
                        <button
                            onClick={onTerminate}
                            className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 ${clusterStatus === 'Running' || clusterStatus === 'Deploying' 
                                ? `${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-50'}` 
                                : `${darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'}`}`}
                            disabled={clusterStatus !== 'Running' && clusterStatus !== 'Deploying'}
                        >
                            <XCircle className="w-4 h-4" strokeWidth={1.5} />
                            Terminate
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const ClusterDashboard = ({darkMode}) => {
    useEffect(() => {
        console.log("Mode: ", darkMode);
    }, [darkMode]);
    const initialClusters = [
        {
            status: 'Running',
            name: 'Mega cluster testing redis',
            timeRemaining: '68 Hrs 44 Mins',
            gpu: { type: 'Ryzen 7000', count: 'x32' },
            clusterType: 'Mega Cluster'
        },
        {
            status: 'Failed',
            name: 'Testing new QTY',
            timeRemaining: '68 Hrs 44 Mins',
            gpu: { type: 'RTX 3090', count: 'x7' },
            incident: true
        },
        {
            status: 'Running',
            name: 'TESTNET HK',
            timeRemaining: '56 Hrs 22 Mins',
            gpu: { type: 'RTX 4090', count: 'x2' }
        },
        {
            status: 'Failed',
            name: 'taiwo mega cluster connectivity 1',
            timeRemaining: '49 Hrs 23 Mins',
            gpu: { type: 'M2 ULTRA', count: 'x55' },
            clusterType: 'Mega Cluster',
            incident: true
        },
        {
            status: 'Deploying',
            name: 'taiwo mega cluster connectivity 2',
            timeRemaining: '12 Hrs 13 Sec',
            gpu: { type: 'M2 ULTRA', count: 'x69' },
            clusterType: 'Mega Cluster'
        },
        {
            status: 'Running',
            name: 'taiwo mega cluster connectivity 3',
            timeRemaining: '12 Hrs 21 Mins',
            gpu: { type: 'Ryzen 7000', count: 'x1' }
        },
        {
            status: 'Deploying',
            name: 'Latitude.sh test',
            timeRemaining: '12 Hrs 13 Sec',
            gpu: { type: 'M2 ULTRA', count: 'x1' }
        }
    ];
    
    const [clusters, setClusters] = useState(initialClusters);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Show All');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
    };

    const handleTerminate = (index) => {
        setClusters((prevClusters) =>
            prevClusters.map((cluster, i) =>
                i === index && (cluster.status === 'Running' || cluster.status === 'Deploying')
                    ? { ...cluster, status: 'Terminated' }
                    : cluster
            )
        );
    };

    const handleRename = (index) => {
        const newName = prompt("Enter new name for the cluster:");
        if (newName) {
            setClusters((prevClusters) =>
                prevClusters.map((cluster, i) =>
                    i === index ? { ...cluster, name: newName } : cluster
                )
            );
        }
    };

    const filteredClusters = clusters.filter(cluster => {
        const matchesSearch = cluster.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Show All' || cluster.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className={`min-h-screen max-w-full w-full p-4 rounded-lg shadow-lg ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} sm:p-6 lg:p-10`}>
            {/* Top Navigation */}
            <div className={`max-w-full pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="w-full mx-auto">
                    {/* Primary Nav */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-14 space-y-4 sm:space-y-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">POLARIS</span>
                            <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} hidden sm:inline`}>/</span>
                            <span className={`font-medium hidden sm:inline ${darkMode ? 'text-gray-400' : ''}`}>CLOUD</span>
                        </div>

                        {/* Right side */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Balance:</span>
                                <span className="text-sm font-medium">$USDC 17.23</span>
                            </div>

                            <button className={`w-full sm:w-auto px-4 py-1.5 border rounded-lg text-sm flex items-center gap-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-900'}`}>
                                Reload with Pay
                            </button>

                            <button className={`w-full sm:w-auto px-4 py-1.5 border rounded-lg text-sm flex items-center gap-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-900'}`}>
                                Deploy Cluster
                                <span className="text-xs">▼</span>
                            </button>

                            <button className={`p-1.5 rounded-lg relative ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                <Bell className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                            </button>

                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <span className="text-sm">👤</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 mb-4">
                    <h1 className="text-xl font-semibold mb-2">Clusters</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Fast, Simple, Scalable, & Accelerated GPU clusters focused on Simplicity, Speed, & Affordability.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                    <input
                        type="text"
                        placeholder="Search"
                        className={`w-full sm:max-w-xs p-2 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200'}`}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />

                    <div className="flex gap-2 text-sm overflow-x-auto">
                        {['Show All', 'Running', 'Failed', 'Deploying', 'Terminated'].map((status) => (
                            <button
                                key={status}
                                className={`px-3 py-1 whitespace-nowrap rounded-full ${statusFilter === status 
                                    ? `${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}` 
                                    : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}`}
                                onClick={() => handleStatusChange(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cluster Table */}
                <div className="mt-6 overflow-x-auto">
                    <table className={`w-full min-w-[500px] border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <thead className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'} text-sm`}>
                            <tr>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Cluster Name</th>
                                <th className="text-left p-4">Compute Hrs Remaining</th>
                                <th className="text-left p-4">CPUs/GPUs</th>
                                <th className="text-left p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClusters.map((cluster, index) => (
                                <tr key={index} className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${cluster.status === 'Running' ? 'bg-green-500' :
                                                    cluster.status === 'Failed' ? 'bg-red-500' :
                                                        cluster.status === 'Terminated' ? 'bg-gray-500' :
                                                            'bg-gray-400'
                                                }`}></span>
                                            <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>{cluster.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{cluster.name}</span>
                                            {cluster.incident && (
                                                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                                                    <span className="text-red-500">⚠</span>
                                                    Ongoing Incident
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">{cluster.timeRemaining}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{cluster.gpu.type}</span>
                                            <span className="text-xs text-gray-500">{cluster.gpu.count}</span>
                                            {cluster.clusterType && (
                                                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}>
                                                    {cluster.clusterType}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <ActionDropdown
                                            onRename={() => handleRename(index)}
                                            onTerminate={() => handleTerminate(index)}
                                            clusterStatus={cluster.status}
                                            darkMode={darkMode}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClusterDashboard;
