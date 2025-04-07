// NewLibraryModal.jsx
import { AlertTriangle, FolderPlus, Loader2, Upload, X, XCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { createUserLibrary } from '../services/libraryService';

const NewLibraryModal = ({ darkMode, onClose, onSubmit }) => {
  const [libraryName, setLibraryName] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const maxDocs = 3; // Maximum number of documents allowed

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (documents.length === 0 || !libraryName || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Prepare form data for upload
      const formData = new FormData();
      documents.forEach(file => formData.append('documents', file));

      // Upload documents to Flask endpoint
      const response = await fetch('https://polaris-ai-tool.onrender.com/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      const uploadedDocuments = result.uploaded_documents;
      
      // Create user library with the uploaded document IDs
      await createUserLibrary(libraryName, uploadedDocuments);

      // Optionally handle additional onSubmit logic if provided
      if (onSubmit) {
        await onSubmit({ libraryName, documents });
      }

      onClose();
    } catch (error) {
      console.error('Error during submission:', error);
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (documents.length >= maxDocs) {
      alert(`Maximum of ${maxDocs} documents allowed`);
      return;
    }

    let newFiles = files.filter(file => allowedTypes.includes(file.type));

    if (documents.length + newFiles.length > maxDocs) {
      alert(`Maximum of ${maxDocs} documents allowed. Some files were not added.`);
      newFiles = newFiles.slice(0, maxDocs - documents.length);
    }

    if (newFiles.length !== files.length) {
      alert('Only PDF and DOC/DOCX files are allowed');
    }

    setDocuments(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files || []);

    if (documents.length >= maxDocs) {
      alert(`Maximum of ${maxDocs} documents allowed`);
      return;
    }

    let validFiles = files.filter(file => allowedTypes.includes(file.type));

    if (documents.length + validFiles.length > maxDocs) {
      alert(`Maximum of ${maxDocs} documents allowed. Some files were not added.`);
      validFiles = validFiles.slice(0, maxDocs - documents.length);
    }

    if (validFiles.length !== files.length) {
      alert('Only PDF and DOC/DOCX files are allowed');
    }

    setDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`${
          darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
        } rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-in-out max-h-[90vh] flex flex-col`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          } rounded-t-xl`}
        >
          <div className="flex items-center space-x-3">
            <FolderPlus className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            <h2 className="text-xl font-bold">Create New Library</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Library Name */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Library Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                placeholder="Enter library name"
                disabled={isSubmitting}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-600'
                } focus:outline-none focus:ring-1 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload Documents (PDF, DOC/DOCX) <span className="text-red-500">*</span>
              </label>

              {/* Note about maximum documents */}
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Maximum of three documents allowed.
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDrop={!isSubmitting ? handleDrop : undefined}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  disabled={isSubmitting}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Choose a file or drag & drop it here
                </p>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-2 inline-flex items-center px-4 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </button>
              </div>

              {/* Selected Files List */}
              {documents.length > 0 && (
                <div className={`mt-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 ${
                        index !== 0 ? (darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200') : ''
                      }`}
                    >
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className={`p-1 rounded-full hover:bg-gray-700`}
                        >
                          <XCircle className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {documents.length === 0 && (
                <p className="text-red-500 text-sm">At least one document is required</p>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={documents.length === 0 || !libraryName || isSubmitting}
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg ${
                documents.length === 0 || !libraryName || isSubmitting
                  ? 'bg-green-700/50 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800'
              } text-white inline-flex items-center`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default NewLibraryModal;
