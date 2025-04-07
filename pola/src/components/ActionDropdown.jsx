/* eslint-disable react/prop-types */
import { BarChart2, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

const ActionDropdown = ({ onViewMetrics, onRename, onTerminate, clusterStatus, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleDropdownClick = () => {
        setIsOpen(!isOpen);
    };
    
    const handleClickOutside = () => {
        setIsOpen(false);
    };
    
    const isActive = clusterStatus === 'Running' || clusterStatus === 'Deploying';
    
    return (
        <div className="relative inline-block">
            <button
                onClick={handleDropdownClick}
                className={`p-0.5 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <MoreHorizontal className={`w-2.5 h-2.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={handleClickOutside}
                    />
                    <div className={`absolute right-0 mt-1 w-36 rounded shadow-lg border z-20 py-0.5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {onViewMetrics && (
                            <button
                                onClick={() => {
                                    onViewMetrics();
                                    setIsOpen(false);
                                }}
                                className={`w-full px-2 py-0.5 text-[9px] text-left flex items-center gap-1 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                disabled={!isActive}
                            >
                                <BarChart2 className="w-2.5 h-2.5" strokeWidth={1.5} />
                                View Metrics
                            </button>
                        )}
                        
                        {onRename && (
                            <button
                                onClick={() => {
                                    onRename();
                                    setIsOpen(false);
                                }}
                                className={`w-full px-2 py-0.5 text-[9px] text-left flex items-center gap-1 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <Edit className="w-2.5 h-2.5" strokeWidth={1.5} />
                                Rename
                            </button>
                        )}
                        
                        {onTerminate && (
                            <button
                                onClick={() => {
                                    onTerminate();
                                    setIsOpen(false);
                                }}
                                className={`w-full px-2 py-0.5 text-[9px] text-left flex items-center gap-1 ${
                                    isActive 
                                        ? darkMode 
                                            ? 'text-red-300 hover:bg-red-900/30' 
                                            : 'text-red-600 hover:bg-red-50' 
                                        : darkMode 
                                            ? 'text-gray-500 cursor-not-allowed' 
                                            : 'text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!isActive}
                            >
                                <Trash2 className="w-2.5 h-2.5" strokeWidth={1.5} />
                                {isActive ? 'Terminate' : 'Terminated'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ActionDropdown;