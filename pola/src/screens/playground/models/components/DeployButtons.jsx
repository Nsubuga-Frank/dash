import React from "react";

const getDeployButton = (deploymentStatus, darkMode, onDeploy, onRetry) => {
  // Common button classes for consistent mobile-friendly sizing
  const baseButtonClasses = "w-full sm:w-auto min-h-[28px] sm:min-h-[32px]";
  const baseContentClasses = "flex items-center justify-center sm:justify-start gap-1.5";
  const baseTextClasses = "text-[10px] sm:text-xs font-medium whitespace-nowrap";
  const baseIconClasses = "w-3 h-3 sm:w-3.5 sm:h-3.5";

  switch (deploymentStatus) {
    case "retrying":
      return (
        <div
          className={`
            ${baseButtonClasses} ${baseContentClasses}
            px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
            ${darkMode ? "bg-blue-500/10" : "bg-blue-50"}
            transition-all duration-500 ease-in-out
          `}
        >
          <div className="relative">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-blue-200 opacity-25" />
            <div className="absolute inset-0">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
                style={{ animationDuration: "0.8s" }}
              />
            </div>
            <div className="absolute inset-0 animate-ping opacity-30">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-blue-400" />
            </div>
          </div>
          <span className={`${baseTextClasses} ${darkMode ? "text-blue-400" : "text-blue-600"} animate-pulse`}>
            Retrying...
          </span>
        </div>
      );

    case "deploying":
      return (
        <div
          className={`
            ${baseButtonClasses} ${baseContentClasses}
            px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
            ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}
            transition-all duration-500 ease-in-out group
          `}
        >
          <div className="relative">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-gray-200 opacity-25" />
            <div className="absolute inset-0">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin"
                style={{ animationDuration: "1s" }}
              />
            </div>
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`${baseTextClasses} ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Deploying
            </span>
            <span className="flex space-x-0.5 sm:space-x-1">
              <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        </div>
      );

    case "completed":
      return (
        <div
          className={`
            ${baseButtonClasses} ${baseContentClasses}
            px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
            ${darkMode ? "bg-green-500/10" : "bg-green-50"}
            transition-all duration-300 ease-in-out
          `}
        >
          <div className="relative">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
              <svg
                className={`${baseIconClasses} ${darkMode ? "text-green-400" : "text-green-500"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 animate-scale-down opacity-40">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-400" />
            </div>
          </div>
          <span className={`${baseTextClasses} ${darkMode ? "text-green-400" : "text-green-600"}`}>
            Deployed
          </span>
        </div>
      );

    case "failed":
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          className={`
            ${baseButtonClasses} ${baseContentClasses}
            px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
            ${darkMode ? "bg-red-500/10 hover:bg-red-500/20" : "bg-red-50 hover:bg-red-100"}
            transition-all duration-300 ease-in-out group
          `}
        >
          <div className="relative">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
              <svg
                className={`
                  ${baseIconClasses}
                  ${darkMode ? "text-red-400" : "text-red-500"}
                  transition-transform group-hover:rotate-180 duration-500
                `}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <span
            className={`
              ${baseTextClasses}
              ${darkMode ? "text-red-400 group-hover:text-red-300" : "text-red-600 group-hover:text-red-700"}
              transition-colors duration-300
            `}
          >
            Retry
          </span>
        </button>
      );

    default:
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeploy();
          }}
          className={`
            ${baseButtonClasses} ${baseContentClasses}
            px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
            ${darkMode ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"}
            transition-all duration-300 ease-in-out group
          `}
        >
          <span
            className={`
              ${baseTextClasses}
              ${darkMode ? "text-blue-400 group-hover:text-blue-300" : "text-blue-600 group-hover:text-blue-700"}
              transition-colors duration-300
            `}
          >
            Deploy
          </span>
          <svg
            className={`
              ${baseIconClasses} transform transition-transform duration-300 group-hover:translate-x-1
              ${darkMode ? "text-blue-400 group-hover:text-blue-300" : "text-blue-600 group-hover:text-blue-700"}
            `}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      );
  }
};

export default getDeployButton;