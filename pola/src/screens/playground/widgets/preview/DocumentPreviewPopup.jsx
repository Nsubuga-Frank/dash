import { getDownloadURL, ref } from 'firebase/storage';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { storage } from '../../../firebase/config';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const DocumentPreviewPopup = ({ document, onClose, darkMode }) => {
  const [publicUrl, setPublicUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (document?.path) {
      setLoadingUrl(true);
      getDownloadURL(ref(storage, document.path))
        .then(setPublicUrl)
        .catch(error => {
          console.error('PDF URL Error:', { error, document });
          setUrlError('Unable to load document.');
        })
        .finally(() => setLoadingUrl(false));
    }
  }, [document]);

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageChange = (offset) => {
    setPageNumber(prevPage => 
      Math.max(1, Math.min(prevPage + offset, numPages || prevPage))
    );
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-4xl mx-4 p-6 rounded-lg shadow-2xl ${
        darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="prose max-w-none">
          <h2 className={`text-2xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {document.name}
          </h2>

          <div className={`overflow-y-auto max-h-[70vh] ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {loadingUrl && <p>Loading document...</p>}
            {urlError && <p className="text-red-500">{urlError}</p>}
            {publicUrl && (
              <div className="flex flex-col items-center">
                <Document
                  file={publicUrl}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  loading={<p>Loading PDF...</p>}
                  error={<p>Error loading PDF. Please try again.</p>}
                >
                  <Page 
                    pageNumber={pageNumber}
                    className="mb-4"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>

                {numPages && (
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handlePageChange(-1)}
                      disabled={pageNumber <= 1}
                      className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>
                      Page {pageNumber} of {numPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pageNumber >= numPages}
                      className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewPopup;