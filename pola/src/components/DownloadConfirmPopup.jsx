import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatFileSize } from '../services/downloadService';

const DownloadConfirmPopup = ({ isOpen, onClose, fileInfo, darkMode }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !fileInfo) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = fileInfo.url;
      link.download = fileInfo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Close the popup after a short delay
      setTimeout(() => {
        onClose();
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isDownloading ? onClose : undefined}
      />
      
      {/* Dialog content */}
      <motion.div
        className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full shadow-xl overflow-hidden`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header with blue gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Download Confirmation</h2>
            {!isDownloading && (
              <button 
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="mb-5">
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ready to download AI Studio
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You are about to download the following file:
            </p>
          </div>
          
          {/* File details */}
          <div className={`p-4 mb-5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} mr-3`}>
                <Download className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {fileInfo.name}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatFileSize(fileInfo.size)}
                </div>
              </div>
            </div>
          </div>
          
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            By downloading, you agree to the terms and conditions of the software.
          </p>
        </div>
        
        {/* Actions */}
        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 flex justify-end`}>
          {!isDownloading && (
            <>
              <button
                onClick={onClose}
                className={`px-4 py-2 mr-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg text-sm transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:opacity-90 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Now
              </button>
            </>
          )}
          
          {isDownloading && (
            <div className="px-4 py-2 text-sm text-center w-full flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting download...
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

DownloadConfirmPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fileInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired
  }),
  darkMode: PropTypes.bool
};

DownloadConfirmPopup.defaultProps = {
  darkMode: false
};

export default DownloadConfirmPopup; 