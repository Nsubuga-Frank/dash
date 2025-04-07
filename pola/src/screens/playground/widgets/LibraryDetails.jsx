import { FileText } from 'lucide-react';
import React, { useState } from 'react';
import DocumentPreviewPopup from './preview/DocumentPreviewPopup';

const cleanDocumentName = (filename) => {
  let cleaned = filename.replace(/^[a-f0-9-]{20,}_?/, '');
  cleaned = decodeURIComponent(cleaned);
  cleaned = cleaned
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '')
    .replace(/^[-_\s]+/, '')
    .replace(/[-_\s]+$/, '');
  return cleaned;
};

export default function LibraryDetails({
  darkMode,
  library,
  selectedDocument,
  onDocumentSelect,
}) {
  const [previewDocument, setPreviewDocument] = useState(null); // State for document preview

  if (!library) return null;

  // Log the entire document and library when a document is selected
  const handleDocumentSelect = (doc) => {
    console.log('Selected document:', doc);
    console.log('Library context:', library);
    onDocumentSelect(doc);
  };

  // Log the entire document and library when the preview button is clicked
  const handlePreviewClick = (doc) => {
    console.log('Preview button clicked for document:', doc);
    console.log('Library context:', library);
    setPreviewDocument(doc);
  };

  return (
    <div className="p-4 py-0 border-b border-gray-300">
      {/* Flex container for heading and documents row without justify-between */}
      <div className="flex items-center">
        <h2
          className={`text-md font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Documents in {library.libraryName}
        </h2>

        {/* Documents container */}
        <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar ml-4">
          {/* "All Documents" bubble */}
          <div
            onClick={() => handleDocumentSelect(null)}
            title="View all documents"
            className={`flex-shrink-0 flex items-center gap-1 p-1 border rounded-lg cursor-pointer ${
              darkMode
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            } ${
              selectedDocument === null
                ? 'border-blue-500'
                : 'border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">All Documents</span>
          </div>

          {/* Individual document bubbles */}
          {library.documents?.map((doc) => {
            const cleanName = cleanDocumentName(doc.name);
            return (
              <div
                key={doc.id}
                onClick={() => handleDocumentSelect(doc)}
                title={cleanName}
                className={`flex-shrink-0 flex items-center gap-1 p-1 border rounded-lg cursor-pointer hover:border-gray-400 ${
                  darkMode
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                } ${
                  selectedDocument?.id === doc.id
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs truncate max-w-[100px]">{cleanName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected document display with cleaned name and preview button */}
      {selectedDocument && (
        <div className={`mt-2 text-sm flex items-center gap-2 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span>Selected: {cleanDocumentName(selectedDocument.name)}</span>
          {/* Preview button */}
          <button
            onClick={() => handlePreviewClick(selectedDocument)}
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Preview
          </button>
        </div>
      )}

      {/* Document Preview Popup */}
      {previewDocument && (
        <DocumentPreviewPopup
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
          darkMode={darkMode}
          library={library} // Pass the library to the popup
        />
      )}
    </div>
  );
}