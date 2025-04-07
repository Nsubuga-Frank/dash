import { motion } from 'framer-motion';
import { Cpu, Download, Network, Server, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import DownloadConfirmPopup from '../../../components/DownloadConfirmPopup';
import { getAppDownloadInfo } from '../../../services/downloadService';

// Dialog component for displaying details
const DetailDialog = ({ isOpen, onClose, block, darkMode }) => {
  const [downloadPopupOpen, setDownloadPopupOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [downloadFileInfo, setDownloadFileInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!isOpen) return null;

  const handleDownloadClick = async (platform) => {
    try {
      setIsLoading(true);
      setSelectedPlatform(platform);
      
      // Only Windows and Linux are currently supported
      if (platform === 'MacOS') {
        alert('MacOS download is coming soon!');
        setIsLoading(false);
        return;
      }
      
      // Get download info from Firebase Storage
      const fileInfo = await getAppDownloadInfo(platform);
      setDownloadFileInfo(fileInfo);
      setDownloadPopupOpen(true);
    } catch (error) {
      console.error(`Error preparing download for ${platform}:`, error);
      alert(`Failed to prepare download: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Dialog content */}
        <motion.div
          className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full shadow-xl overflow-hidden`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header with blue gradient instead of emerald */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{block.dialogTitle}</h2>
              <button 
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-5`}>
              {block.dialogDescription}
            </p>
            
            {/* Features list */}
            <div className="space-y-3 mb-6">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Key Features</h3>
              <ul className="space-y-2">
                {block.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-2 flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Download section - show only for "Intelligence" */}
            {block.type === 'intelligence' && (
              <div className="space-y-3">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Download</h3>
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  {['Windows', 'MacOS', 'Linux'].map((platform) => (
                    <button 
                      key={platform}
                      disabled={isLoading}
                      onClick={() => handleDownloadClick(platform)}
                      className={`flex items-center px-3 py-2 
                        ${darkMode ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} 
                        rounded-lg text-sm transition-colors
                        ${isLoading && selectedPlatform === platform ? 'opacity-75 cursor-wait' : ''}
                        ${platform === 'MacOS' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {isLoading && selectedPlatform === platform ? (
                        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      <span>{platform}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 flex justify-end`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 
                ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} 
                rounded-lg text-sm transition-colors`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Download confirmation popup */}
      <DownloadConfirmPopup 
        isOpen={downloadPopupOpen}
        onClose={() => setDownloadPopupOpen(false)}
        fileInfo={downloadFileInfo}
        darkMode={darkMode}
      />
    </>
  );
};

// Detail Dialog PropTypes
DetailDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  block: PropTypes.shape({
    type: PropTypes.string.isRequired,
    dialogTitle: PropTypes.string.isRequired,
    dialogDescription: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  darkMode: PropTypes.bool
};

DetailDialog.defaultProps = {
  darkMode: false
};

// Main InfographicStack component
const InfographicStack = ({ darkMode }) => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  
  // Block data with detailed information
  const blocks = [
    {
      type: 'network',
      icon: Network,
      label: "Network",
      description: "Blockchain network",
      dialogTitle: "Polaris Networks",
      dialogDescription: "Our powerful CLI, proprietary token and network infrastructure",
      features: [
        "Proprietary token system",
        "CLI-driven network control",
        "Decentralized infrastructure",
        "Network security protocols"
      ],
      color: "bg-blue-600" // Changed color
    },
    {
      type: 'compute',
      icon: Server,
      label: "Compute",
      description: "Rent a GPU, CPU, Mac and more",
      dialogTitle: "Garage Cloud Platform (GCP)",
      dialogDescription: "Contribute your compute resources and earn rewards in $tao, $comai and soon more. Self-host with confidence - our incentivized network ensures reliability and security.",
      features: [
        "Earn rewards in $tao and $comai",
        "Self-host with confidence",
        "Incentivized network reliability",
        "Secure resource contribution"
      ],
      color: "bg-purple-600" // Changed color
    },
    {
      type: 'intelligence',
      icon: Cpu,
      label: "AI Studio",
      description: "Deploy models, Inference, agents",
      dialogTitle: "AI Studio",
      dialogDescription: "Deploy models to Polaris, or use an API key to access our suite of inference and agentic tools",
      features: [
        "Model deployment to Polaris",
        "API access for inference",
        "Suite of agentic tools",
        "Advanced model customization"
      ],
      color: "bg-indigo-600" // Changed color
    }
  ];
  
  // Handle opening and closing the dialog
  const openDialog = (block) => {
    setSelectedBlock(block);
  };
  
  const closeDialog = () => {
    setSelectedBlock(null);
  };

  return (
    <div className="mt-4">
      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {blocks.map((block, index) => (
          <motion.div
            key={index}
            className={`
              rounded-xl overflow-hidden cursor-pointer
              ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
              shadow-md hover:shadow-xl transition-all min-h-[180px]
              border-2 ${darkMode ? 'border-gray-700 hover:border-blue-500' : 'border-gray-200 hover:border-blue-400'}
              relative
            `}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            onClick={() => openDialog(block)}
          >
            <div className="p-6">
              {/* Icon - using the block's specific color */}
              <div className={`${block.color} p-3 rounded-lg inline-block mb-4`}>
                <block.icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {block.label}
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`}>
                {block.description}
              </p>
            </div>
            
            {/* Pulse effect on the corner */}
            <div className="absolute top-2 right-2">
              <span className={`
                flex h-2 w-2 relative
              `}>
                <span className={`
                  animate-ping absolute inline-flex h-full w-full rounded-full 
                  ${block.color.replace('bg-', 'bg-').replace('-600', '-400')} opacity-75
                `}></span>
                <span className={`
                  relative inline-flex rounded-full h-2 w-2 
                  ${block.color}
                `}></span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Detail dialog */}
      {selectedBlock && (
        <DetailDialog 
          isOpen={!!selectedBlock} 
          onClose={closeDialog} 
          block={selectedBlock}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Add PropTypes for InfographicStack
InfographicStack.propTypes = {
  darkMode: PropTypes.bool
};

InfographicStack.defaultProps = {
  darkMode: false
};

export default InfographicStack; 