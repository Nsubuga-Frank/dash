import { AlertTriangle, Bot, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { useDeployments } from '../../../../context/DeploymentContext';
import { auth } from '../../../firebase/config';
import { getDeploymentTunnelUrl } from '../../hooks/firebaseDeployments';
import ModelDeployment from './ModelDeployment';
import ModelGrid from './ModelGrid';
import DeployedModel from './models/DeployedMdel';
import DeploymentTable from './models/DeploymentTable';

// Error Alert Component
const ErrorAlert = ({ message, onClose }) => (
  <div className="px-8 pt-4">
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 relative">
      <button onClick={onClose} className="absolute right-2 top-2 text-red-400 hover:text-red-600">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>{message}</span>
      </div>
    </div>
  </div>
);

function MainContent({ 
  darkMode, 
  isExpanded,
  activeSection, 
  isRightExpanded, 
  models, 
  setActiveSection,
  isLoadingModels = false,
  catalogueView
}) {
  const [selectedModel, setSelectedModel] = useState(null);
  const [deployedModel, setDeployedModel] = useState(null);
  const [deploymentError, setDeploymentError] = useState(null);
  const [tunnelUrl, setTunnelUrl] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const { activeDeployment, deployments } = useDeployments();
  const [user] = useAuthState(auth);

  useEffect(() => {
    console.log("MainContent: catalogueView =", catalogueView);
  }, [catalogueView]);

  // If deployments view is active, render DeploymentTable.
  if (catalogueView === 'deployments') {
    return (
      <DeploymentTable
        currentUser={user}
        activeSection={activeSection}
        darkMode={darkMode}
        isExpanded={isExpanded}
        isRightExpanded={isRightExpanded}
        onBack={() => {}}
        setActiveSection={setActiveSection} 
      />
    );
  }

  // Render deployed model view
  if (deployedModel) {
    return (
      <DeployedModel
        model={deployedModel}
        tunnelUrl={tunnelUrl}
        userId={user.uid}
        darkMode={darkMode}
        isExpanded={isExpanded}
        isRightExpanded={false}
        onBack={() => {
          setDeployedModel(null);
          setTunnelUrl(null);
        }}
        onError={(error) => setDeploymentError(error)}
      />
    );
  }

  // Render model deployment view
  if (selectedModel) {
    return (
      <ModelDeployment
        model={selectedModel}
        darkMode={darkMode}
        isExpanded={isExpanded}
        isRightExpanded={isRightExpanded}
        onBack={() => setSelectedModel(null)}
        onError={(error) => setDeploymentError(error)}
        isDeploying={isDeploying}
        setIsDeploying={setIsDeploying}
      />
    );
  }

  // Render main catalogue view (ModelGrid or empty state)
  return (
    <main className={`fixed top-16 bottom-16 
      ${isExpanded ? 'left-60' : 'left-20'} 
      ${isRightExpanded ? 'right-64' : 'right-14'} 
      ${darkMode ? 'bg-[#1b212c]' : 'bg-white'} 
      transition-all duration-300 rounded-md shadow-lg 
      ${darkMode ? 'border border-gray-800' : 'border border-gray-200'} 
      flex flex-col overflow-hidden`}
    >
      <div className="flex-none px-8 py-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-t-md">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
          <h1 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}>
            Model Catalogue
            
            {/* Interactive Beta Flag */}
            <div className="group relative inline-block">
              <div className={`
                relative overflow-hidden px-2.5 py-0.5 rounded-full text-xs font-bold
                bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                text-white shadow-lg hover:shadow-xl transition-all duration-300
                hover:scale-105 cursor-pointer
              `}
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease infinite'
              }}>
                <span className="relative z-10">BETA</span>
                <div className="absolute top-0 left-0 w-full h-full">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white/30"
                      style={{
                        width: Math.floor(Math.random() * 4 + 2) + 'px',
                        height: Math.floor(Math.random() * 4 + 2) + 'px',
                        top: Math.floor(Math.random() * 100) + '%',
                        left: Math.floor(Math.random() * 100) + '%',
                        animation: `particle${i + 1} ${Math.floor(Math.random() * 2 + 2)}s linear infinite`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Tooltip */}
              <div className={`
                absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg z-50
                bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100
                transition-all duration-300 pointer-events-none shadow-xl
                w-64 text-center
              `}>
                <p className="mb-1 font-semibold">Polaris AI Studio is in beta</p>
                <p className="text-gray-300 text-[10px]">We're constantly improving our platform. Your feedback helps us build a better experience!</p>
              </div>
            </div>
          </h1>
        </div>
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Deploy state-of-the-art AI models with enterprise-grade infrastructure
        </p>
      </div>

      {deploymentError && (
        <ErrorAlert 
          message={deploymentError} 
          onClose={() => setDeploymentError(null)} 
        />
      )}

      {isLoadingModels ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading available models...
            </p>
          </div>
        </div>
      ) : models?.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <Bot size={48} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No Models Available
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                There are currently no models available in the catalogue.
                Please check back later or contact support if you believe this is an error.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ModelGrid
          models={models}
          currentUser={user}
          isDeploying={isDeploying}
          setSelectedModel={setSelectedModel}
          darkMode={darkMode}
          getModelDeploymentStatus={(model) => {
            if (!activeDeployment) {
              const existingDeployment = deployments?.find(d => d.modelId === model.name && d.userId === user?.uid);
              return existingDeployment?.status || 'idle';
            }
            return model.name === activeDeployment.modelId ? activeDeployment.status : 'idle';
          }}
          onDeployedModelClick={(model) => {
            (async () => {
              try {
                console.log("Clicking deployed model:", model);
                const url = await getDeploymentTunnelUrl(model.name, user.uid);
                console.log("Got tunnel URL:", url);
                if (url) {
                  setTunnelUrl(url);
                  setDeployedModel(model);
                } else {
                  setDeploymentError("No active deployment URL found for this model");
                }
              } catch (err) {
                console.error("Error fetching deployment details:", err, err.stack);
                setDeploymentError("Failed to fetch deployment details: " + err.message);
              }
            })();
          }}
          onRetry={(model) => setSelectedModel(model)}
        />
      )}

      <style jsx global>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Beta label animations */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes particle1 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-10px) translateX(10px); opacity: 0; }
        }
        
        @keyframes particle2 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-15px) translateX(-5px); opacity: 0; }
        }
        
        @keyframes particle3 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-7px) translateX(15px); opacity: 0; }
        }
        
        @keyframes particle4 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-12px) translateX(-10px); opacity: 0; }
        }
        
        @keyframes particle5 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-9px) translateX(8px); opacity: 0; }
        }
      `}</style>
    </main>
  );
}

export default MainContent;
