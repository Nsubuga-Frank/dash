import {
  BarChartHorizontal,
  BookOpen,
  Box,
  CircleDollarSign,
  Cpu,
  Database,
  Hexagon,
  Server
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Navigation sidebar component for AIStudio
 */
const Sidebar = ({ 
  darkMode, 
  activeSection, 
  activeComputeSection,
  activeNodesSection,
  activeSidebarItem,
  onSectionClick
}) => {
  // Define navigation sections for AI Studio
  const navigationSections = [
    {
      id: 'catalogue',
      label: 'Catalogue',
      icon: Database,
      comingSoon: false,
      description: 'Explore available models to deploy.'
    },
    {
      id: 'deployments',
      label: 'Deployments',
      icon: Server,
      comingSoon: false,
      description: 'View and manage your model deployments.'
    },
    {
      id: 'playground',
      label: 'Playground',
      icon: BookOpen,
      comingSoon: false,
      description: 'Interact with your deployed models in real-time.'
    },
    {
      id: 'readbuddy',
      label: 'Readbuddy',
      icon: BookOpen,
      comingSoon: false,
      description: 'Your intelligent reading companion and document analyzer.'
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: BarChartHorizontal,
      comingSoon: false,
      description: 'Analyze usage and performance metrics for your models.'
    },
  ];

  // Define navigation sections for the Compute tab
  const computeNavigationSections = [
    {
      id: 'instances',
      label: 'My Pods',
      icon: Box,
      comingSoon: false,
      description: 'Manage your compute pods.'
    },
    {
      id: 'hardware',
      label: 'Hardware',
      icon: Cpu,
      comingSoon: false,
      description: 'Browse available hardware options.'
    },
    {
      id: 'usage',
      label: 'Usage & Billing',
      icon: CircleDollarSign,
      comingSoon: false,
      description: 'Monitor resource usage and billing details.'
    }
  ];

  // Define nodes navigation sections
  const nodesNavigationSections = [
    {
      id: 'all',
      label: 'All',
      icon: Hexagon,
      comingSoon: false,
      description: 'View all nodes'
    },
    {
      id: 'verified',
      label: 'Verified',
      icon: Server,
      comingSoon: false,
      description: 'View verified nodes'
    },
    {
      id: 'notverified',
      label: 'Not Verified',
      icon: Server,
      comingSoon: false,
      description: 'View unverified nodes'
    }
  ];

  // Get the appropriate sections based on the active section
  const sections = activeSection === 'compute' 
    ? computeNavigationSections 
    : activeSection === 'nodes'
      ? nodesNavigationSections
      : navigationSections;

  // Get the active item based on the current section
  const activeItem = activeSection === 'compute' 
    ? activeComputeSection 
    : activeSection === 'nodes'
      ? activeNodesSection
      : activeSidebarItem;

  return (
    <div
      className={`w-44 flex-shrink-0 border-r-2 overflow-y-auto flex flex-col ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
      }`}
    >
      <div className="p-1.5 space-y-1 flex-grow">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-colors duration-200
              ${
                activeItem === section.id && !section.comingSoon
                  ? darkMode
                    ? 'bg-gradient-to-r from-blue-700/20 to-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                    : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 border-l-2 border-blue-500'
                  : darkMode
                  ? 'text-gray-400 hover:bg-gray-800/50'
                  : 'text-gray-600 hover:bg-gray-100/80'
              }`}
            onClick={() => onSectionClick(section)}
          >
            <div className="flex items-center gap-2">
              <section.icon className={`h-4 w-4 ${
                activeItem === section.id && !section.comingSoon
                  ? darkMode ? 'text-blue-400' : 'text-blue-500'
                  : darkMode ? 'text-gray-500' : 'text-gray-500'
              }`} />
              <span>{section.label}</span>
            </div>
            {section.comingSoon && (
              <span
                className={`text-[9px] px-1 py-0.5 rounded-full ${
                  darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                }`}
              >
                Soon
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Plan Selection buttons at bottom */}
      <div
        className={`mt-auto p-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="flex flex-col">
          <p className={`text-[10px] font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select Plan
          </p>
          <div className="flex w-full rounded-md overflow-hidden">
            <button
              className={`flex-1 py-1.5 text-[9px] font-medium transition-colors 
                ${darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Standard
            </button>
            <button
              className={`flex-1 py-1.5 text-[9px] font-medium transition-colors
                ${darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Premium
            </button>
            <button
              className={`flex-1 py-1.5 text-[9px] font-medium transition-colors
                ${darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Enterprise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  darkMode: PropTypes.bool,
  activeSection: PropTypes.string.isRequired,
  activeComputeSection: PropTypes.string.isRequired,
  activeNodesSection: PropTypes.string.isRequired,
  activeSidebarItem: PropTypes.string.isRequired,
  onSectionClick: PropTypes.func.isRequired
};

export default Sidebar; 