import React from 'react';
import ModelCard from './ModelCard';

const ModelGrid = ({ 
  models, 
  currentUser, 
  setSelectedModel, 
  darkMode, 
  getModelDeploymentStatus,
  onDeployedModelClick,
  isDeploying // this is deployingModelId from MainContent
}) => {
  const sortedModels = [...models].sort((a, b) => {
    const aHasTextGen = a.capabilities.some(cap => cap.type === 'text_generation');
    const bHasTextGen = b.capabilities.some(cap => cap.type === 'text_generation');
    return bHasTextGen - aHasTextGen;
  });

  const handleModelClick = (model) => {
    const status = getModelDeploymentStatus(model);
    if (status === "completed") {
      onDeployedModelClick?.(model);
    } else {
      setSelectedModel(model);
    }
  };

  return (
    <div
      className={`
        flex-1
        overflow-y-auto
        p-8
        px-5
        pt-8
        ${darkMode ? 'scrollbar-dark bg-gray-900' : 'scrollbar-light bg-gray-100'}
      `}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedModels.map((model) => {
          const status = getModelDeploymentStatus(model);
          const modelIdentifier = model.name;
          const thisIsDeploying = isDeploying === model.name;
          return (
            <ModelCard
              key={modelIdentifier}
              currentUser={currentUser}
              model={model}
              onDeploy={() => handleModelClick(model)}
              onRetry={() => setSelectedModel(model)}
              onDeployedModelClick={() => onDeployedModelClick?.(model)}
              darkMode={darkMode}
              isDeploying={thisIsDeploying}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ModelGrid;
