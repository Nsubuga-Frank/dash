import { Code, Cpu, Eye, Image, Info, Mic, Network, Terminal } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDeploymentStatus } from "../../hooks/useDeploymentStatus";
import { providerIcons } from "../data/models";
import getDeployButton from "./DeployButtons";

const getModelTypeLabel = (type) => {
  const typeMap = {
    text_generation: "Text Generation",
    speech_recognition: "Speech Recognition",
    text_to_speech: "Text to Speech",
    code_generation: "Code Generation",
    vision_language: "Vision Language",
  };
  return typeMap[type] || type;
};

const getIconForCapability = (type) => {
  switch (type) {
    case "text_generation": return Terminal;
    case "code_generation": return Code;
    case "vision_language": return Eye;
    case "text_to_image": return Image;
    case "text_embeddings": return Network;
    case "speech_recognition": return Mic;
    case "text_to_speech": return Mic;
    case "tgi": return Cpu;
    default: return Terminal;
  }
};

const ModelCard = ({
  model,
  currentUser,
  darkMode = false,
  onRetry,
  onDeploy,
  onDeployedModelClick,
  isDeploying // passed from parent; true only for the card that is deploying
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("right");
  const infoButtonRef = useRef(null);
  const hoverCardRef = useRef(null);
  const firebaseStatus = useDeploymentStatus(model?.name, currentUser?.uid);
  // If this card's isDeploying prop is true, override firebaseStatus with "deploying"
  const status = isDeploying ? "deploying" : firebaseStatus;
  const isTextGeneration = model.capabilities?.some((cap) => cap.type === "text_generation");
  const isDeployed = status === "completed";
  const isDeployingFinal = status === "deploying";
  const isInteractive = isTextGeneration && !isDeployingFinal;

  useEffect(() => {
    if (isHovering && infoButtonRef.current) {
      const buttonRect = infoButtonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const hoverCardWidth = 384;
      if (buttonRect.right + hoverCardWidth + 8 > windowWidth) {
        setTooltipPosition("left");
      } else {
        setTooltipPosition("right");
      }
    }
  }, [isHovering]);

  if (!model) return null;

  const handleCardClick = () => {
    if (!isTextGeneration || isDeployingFinal) return;
    if (isDeployed) {
      onDeployedModelClick?.(model);
    } else {
      onDeploy?.(model);
    }
  };

  const handleGPUClick = (e) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  return (
    <div
      className={`
        relative rounded-md border transition-all duration-200 flex flex-col
        min-h-[100px] w-full max-w-xs mx-auto sm:max-w-none
        ${isInteractive ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-90"}
        ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
        ${isDeployed ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
      `}
      onClick={handleCardClick}
    >
      {/* Beta Badge - Top-right corner with ribbon style */}
      <div className="absolute -top-2 -right-2 z-30 group">
        <div className={`
          px-2 py-0.5 flex items-center justify-center text-[9px] font-bold 
          bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
          text-white rounded shadow-sm rotate-12 hover:rotate-0
          transition-all duration-300 uppercase tracking-wider
          whitespace-nowrap
        `}>
          Beta
        </div>
        <div className={`
          absolute top-full right-0 mt-1 px-2 py-1 rounded text-xs
          bg-gray-800 text-white whitespace-nowrap opacity-0 group-hover:opacity-100
          transition-opacity duration-200 z-50 shadow-lg
          w-48 text-center pointer-events-none
        `}>
          <p className="text-[9px]">This model deployment is currently in beta testing</p>
        </div>
      </div>
      {!isTextGeneration && (
        <div className="absolute inset-0 bg-black/60 rounded-md flex items-center justify-center z-10">
          <div className="bg-gray-800/90 px-2 py-0.5 rounded-full">
            <span className="text-gray-300 text-xs font-medium">Coming Soon</span>
          </div>
        </div>
      )}
      <div className="p-2 space-y-1.5 flex-grow">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-5 h-5 shrink-0 rounded flex items-center justify-center text-xs"
              style={{
                backgroundColor:
                  (providerIcons[model.provider?.toLowerCase()]?.color ?? "#000") + "15",
              }}
            >
              <span
                style={{
                  color: providerIcons[model.provider?.toLowerCase()]?.color,
                }}
              >
                {model.provider?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <h3 className={`text-xs font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              {model.name}
            </h3>
          </div>
          <div className="relative">
            <button
              ref={infoButtonRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className={`p-1 rounded-full hover:bg-gray-100 transition-colors z-20 shrink-0 ${darkMode ? "hover:bg-gray-700" : ""}`}
            >
              <Info size={14} className={darkMode ? "text-gray-400" : "text-gray-500"} />
            </button>
            {isHovering && (
              <div
                ref={hoverCardRef}
                style={{
                  left: tooltipPosition === "right" ? "100%" : "auto",
                  right: tooltipPosition === "left" ? "100%" : "auto",
                }}
                className={`absolute top-0 h-auto w-96 rounded-lg shadow-lg border p-2 z-30 ${tooltipPosition === "right" ? "ml-2" : "mr-2"} ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="flex gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-md ${darkMode ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}
                      >
                        {model.model_type || "General Purpose"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {[
                        { label: "Parameters", value: model.specifications?.parameters },
                        { label: "Context", value: model.specifications?.contextsize },
                        { label: "Precision", value: model.specifications?.precision },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {item.label}:
                          </span>
                          <span className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {[
                        { label: "CPU", value: model.requirements?.cpu },
                        { label: "RAM", value: model.requirements?.ram },
                        { label: "Storage", value: model.requirements?.storage + " GB" },
                        { label: "GPU", value: model.requirements?.gpu },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {item.label}:
                          </span>
                          <span className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {model.capabilities?.map((cap, idx) => {
            const Icon = getIconForCapability(cap.type);
            return (
              <div
                key={idx}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"}`}
              >
                <Icon size={10} className={darkMode ? "text-gray-400" : "text-gray-500"} />
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {getModelTypeLabel(cap.type)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className={`
          border-t p-2 rounded-b-md flex flex-col sm:flex-row items-stretch sm:items-center
          justify-between gap-1.5 mt-auto
          ${darkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-100 bg-blue-50"}
        `}
      >
        <button
          onClick={handleGPUClick}
          className={`
            flex items-center justify-center sm:justify-start gap-1 px-2 py-1
            rounded-full text-[10px] transition-colors z-20 w-full sm:w-auto
            ${darkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-600/80" : "bg-white text-gray-700 hover:bg-gray-50"}
          `}
        >
          <Cpu size={10} className={darkMode ? "text-gray-300" : "text-gray-500"} />
          <span>{model.requirements?.gpu}</span>
        </button>
        <div className="w-full sm:w-auto">
          {getDeployButton(status, darkMode, onDeploy, onRetry)}
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
