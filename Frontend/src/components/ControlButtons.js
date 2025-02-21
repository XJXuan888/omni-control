import React, { useEffect } from 'react';

const ControlButtons = ({ onMove }) => {
  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          onMove('Move Forward');
          break;
        case 'ArrowLeft':
          onMove('Turn Left');
          break;
        case 'ArrowDown':
          onMove('Move Backward');
          break;
        case 'ArrowRight':
          onMove('Turn Right');
          break;
        case ' ': 
          onMove('Stop');
          break;
        default:
          break;
      }
    };

    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onMove]);

  return (
    <div className="control-buttons">
      <button
        className="control-button up"
        onClick={() => onMove('Move Forward')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00ffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
      <button
        className="control-button left"
        onClick={() => onMove('Turn Left')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00ffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="control-button down"
        onClick={() => onMove('Move Backward')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00ffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </button>
      <button
        className="control-button right"
        onClick={() => onMove('Turn Right')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00ffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      <button
        className="control-button stop"
        onClick={() => onMove('Stop')}
      >
        Stop
      </button>
    </div>
  );
};

export default ControlButtons;
