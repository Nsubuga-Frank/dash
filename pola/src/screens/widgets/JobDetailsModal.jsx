import { Info, X } from 'lucide-react';
import React, { useState } from 'react';
import ComputeRequirements from './ComputeRequirements';
import RegistrationForm from './RegistrationForm';
import SuccessView from './SuccessView';

const JobDetailsModal = ({ onClose, darkMode = false, job }) => {
  const [registrationStep, setRegistrationStep] = useState(0);
  const [formData, setFormData] = useState({
    walletKey: '',
    huggingfaceRepo: '',
    username: '',
    location: '',
  });

  const handleSubmit = (data) => {
    setFormData(data);
    setRegistrationStep(2);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const prizes = [
    { place: '1st', amount: job.rewards.first },
    { place: '2nd', amount: job.rewards.second },
    { place: '3rd', amount: job.rewards.third }
  ];

  const requirements = [
    "Valid Hugging Face account and repository",
    "Compute resources meeting minimum requirements",
    "Wallet for receiving rewards",
    "Stable internet connection"
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className={`relative rounded-xl shadow-xl w-full mx-auto animate-modal-scale ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        style={{ maxWidth: '56rem', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 p-4 flex items-center justify-between rounded-t-xl z-10 border-b ${
          darkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Job Details
          </h2>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 4rem)' }}>
          <div className="p-4 sm:p-6">
            {registrationStep === 0 && (
              <>
                {/* Basic Info and Rewards Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className={`font-medium mb-4 ${
                      darkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Job ID', value: job.id },
                        { label: 'Base Model', value: job.modelId },
                        { label: 'Dataset', value: job.datasetId, subtext: `${job.datasetSize}GB` },
                        { label: 'Duration', value: `${job.duration} days` },
                        { label: 'Period', value: `${job.startDate} - ${job.endDate}` }
                      ].map(item => (
                        <div key={item.label}>
                          <div className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {item.label}
                          </div>
                          <div className={`font-medium ${
                            darkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {item.value}
                          </div>
                          {item.subtext && (
                            <div className={`text-sm ${
                              darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {item.subtext}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rewards */}
                  <div>
                    <h3 className={`font-medium mb-4 ${
                      darkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      Rewards
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Total Prize Pool
                        </div>
                        <div className={`font-medium text-lg ${
                          darkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {parseInt(job.rewards.first) + parseInt(job.rewards.second) + parseInt(job.rewards.third)} τ
                        </div>
                      </div>
                      {prizes.map((prize, index) => (
                        <div key={prize.place} className="flex items-center gap-2">
                          <span className="text-xl">{['🥇', '🥈', '🥉'][index]}</span>
                          <div>
                            <div className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {prize.place} Place
                            </div>
                            <div className={`font-medium ${
                              darkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {prize.amount} τ
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compute Requirements */}
                <div className="mb-8">
                  <h3 className={`font-medium mb-4 ${
                    darkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    Compute Requirements
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ComputeRequirements 
                      title="Minimum Requirements"
                      requirements={job.requirements.min}
                      isMinimum={true}
                      darkMode={darkMode}
                    />
                    <ComputeRequirements 
                      title="Recommended Specifications"
                      requirements={job.requirements.recommended}
                      isMinimum={false}
                      darkMode={darkMode}
                    />
                  </div>
                  <div className={`mt-3 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Note: Training performance and completion time may vary based on your hardware specifications
                  </div>
                </div>

                {/* Additional Requirements */}
                <div className={`rounded-lg p-4 mb-6 ${
                  darkMode ? 'bg-blue-950/50' : 'bg-blue-50'
                }`}>
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className={`font-medium mb-2 ${
                        darkMode ? 'text-blue-400' : 'text-blue-900'
                      }`}>
                        Additional Requirements
                      </h4>
                      <ul className={`text-sm space-y-1 ${
                        darkMode ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        {requirements.map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  onClick={() => setRegistrationStep(1)}
                  className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                    transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Register for this Job
                </button>
              </>
            )}
            
            {registrationStep === 1 && (
              <RegistrationForm 
                onSubmit={handleSubmit}
                job={job}
                darkMode={darkMode}
              />
            )}

            {registrationStep === 2 && (
              <SuccessView 
                job={job}
                formData={formData}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalScale {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-modal-scale {
          animation: modalScale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default JobDetailsModal;