import { SupportAgent } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

const FeedbackButton = ({ darkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [key, setKey] = useState(0); // Key to force modal remount

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Increment key to force modal remount when reopened
    setKey(prevKey => prevKey + 1);
  };

  return (
    <>
      <div
        className="fixed right-0 top-[38%] -translate-y-1/2 z-40"
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className={`
            flex flex-col items-center gap-1
            py-2 px-1
            ${darkMode
              ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/90 hover:from-blue-500 hover:to-blue-400 text-white/95'
              : 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white'
            }
            transition-all duration-300 ease-in-out
            shadow-lg shadow-blue-500/20
            hover:shadow-blue-500/30
            hover:translate-x-0.5
            backdrop-blur-sm
            group
            relative
            overflow-hidden
            rounded-l-md
            w-6
          `}
        >
          {/* Subtle animated background effect */}
          <div className={`
            absolute inset-0 
            bg-gradient-to-r from-transparent via-white/5 to-transparent
            translate-x-[-200%] group-hover:translate-x-[200%]
            transition-transform duration-1000
          `}/>

          {/* Icon with subtle rotation on hover */}
          <SupportAgent 
            size={14}
            className="relative transition-transform duration-300 group-hover:scale-110"
            strokeWidth={2.5}
          />

          {/* Text always visible and vertical */}
          <span className="text-xs font-medium tracking-wide relative vertical-text">
            Feedback
          </span>
        </button>
      </div>

      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>

      {/* Conditionally render the FeedbackModal only if isModalOpen is true */}
      {isModalOpen && (
        <FeedbackModal
          key={key} // Key to force remount if needed
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          darkMode={darkMode}
        />
      )}
    </>
  );
};

FeedbackButton.propTypes = {
  darkMode: PropTypes.bool
};

export default FeedbackButton;
