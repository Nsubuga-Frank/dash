// widgets/LibrariesModal.jsx
import { Alert } from '@mui/material';
import { FolderPlus, Library, Loader2, X } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';
import { useUserLibraries } from '../hooks/useUserLibraries';

export default function LibrariesModal({
  darkMode,
  onClose,
  onLibraryClick,
  onCreateNewLibrary,
}) {
  const { libraries, loading, error } = useUserLibraries();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCreateLibrary = async () => {
    try {
      await onCreateNewLibrary();
      toast.success('Library created successfully! 🎉', {
        duration: 3000,
        style: {
          background: darkMode ? '#1F2937' : '#fff',
          color: darkMode ? '#fff' : '#000',
          border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
        },
      });
      onClose();
    } catch (error) {
      toast.error('Failed to create library. Please try again.', {
        duration: 3000,
        style: {
          background: darkMode ? '#1F2937' : '#fff',
          color: darkMode ? '#fff' : '#000',
          border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
        },
      });
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className={`${
          darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
        } rounded-xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 ease-in-out`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
          } rounded-t-xl`}
        >
          <div className="flex items-center space-x-3">
            <Library
              className={`w-5 h-5 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <h2 className="text-xl font-bold">Document Libraries</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 max-h-[60vh] overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          ) : libraries.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No libraries found. Create a new one to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {libraries.map((lib) => (
                <button
                  key={lib.id}
                  className={`w-full flex items-center justify-between p-3 ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  } rounded-lg transition-colors duration-200`}
                  onClick={() => onLibraryClick(lib)}
                >
                  <div className="flex items-center gap-2">
                    <Library className="h-4 w-4" />
                    <span className="text-sm">{lib.libraryName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      {lib.documents.length} docs
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t text-center ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <button
            onClick={handleCreateLibrary}
            className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg transition-colors duration-200 ${
              darkMode
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <FolderPlus className="h-4 w-4" />
            <span className="text-sm">Create New Library</span>
          </button>
        </div>
      </div>
    </div>
  );
}