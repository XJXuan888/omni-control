import React, { useEffect, useState, useRef } from 'react';

const ControlButtons = ({ onMove }) => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const prevMoveRef = useRef({ x: 0, y: 0 });
  const lastInputRef = useRef('keyboard'); // Track last input source

  useEffect(() => {
    // Handle keyboard events
    const handleKeyDown = (event) => {
      const key = event.key;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        return;
      }
      event.preventDefault();
      setActiveKeys((prevKeys) => new Set(prevKeys.add(key)));
      lastInputRef.current = 'keyboard'; // Mark input as keyboard
      calculateAndMove(new Set(activeKeys));
    };

    const handleKeyUp = (event) => {
      const key = event.key;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        return;
      }
      event.preventDefault();
      setActiveKeys((prevKeys) => {
        const newKeys = new Set(prevKeys);
        newKeys.delete(key);
        return newKeys;
      });

      lastInputRef.current = 'keyboard'; // Mark input as keyboard
      calculateAndMove(new Set(activeKeys));
    };

    const calculateAndMove = (keys) => {
      let x = 0, y = 0;
      if (keys.has('ArrowUp')) y = -1;
      if (keys.has('ArrowDown')) y = 1;
      if (keys.has('ArrowLeft')) x = -1;
      if (keys.has('ArrowRight')) x = 1;
      if (keys.has(' ')) {
        x = 2;
        y = 2;
      }

      // Prevent redundant calls
      if (x !== prevMoveRef.current.x || y !== prevMoveRef.current.y) {
        const action = `Key Pressed: x:${x} y:${y}`;
        onMove(action);
        prevMoveRef.current = { x, y };
      }
    };

    // Handle gamepad events
    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        if (!gamepadConnected) setGamepadConnected(true);

        const xAxis = gamepad.axes[0]; // Left stick X-axis
        const yAxis = gamepad.axes[1]; // Left stick Y-axis

        // Dead zone threshold
        const normalizedX = Math.abs(xAxis) > 0.2 ? xAxis : 0;
        const normalizedY = Math.abs(yAxis) > 0.2 ? yAxis : 0;

        // Use gamepad input only if no keys are pressed
        if (activeKeys.size === 0) {
          lastInputRef.current = 'gamepad';
          if (normalizedX !== prevMoveRef.current.x || normalizedY !== prevMoveRef.current.y) {
            const action = `Controller: x:${normalizedX.toFixed(2)} y:${normalizedY.toFixed(2)}`;
            onMove(action);
            prevMoveRef.current = { x: normalizedX, y: normalizedY };
          }
        }
      } else {
        if (gamepadConnected) setGamepadConnected(false);
      }

      requestAnimationFrame(handleGamepadInput);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('gamepadconnected', () => setGamepadConnected(true));
    window.addEventListener('gamepaddisconnected', () => setGamepadConnected(false));

    requestAnimationFrame(handleGamepadInput);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys, gamepadConnected, onMove]);

  // Helper function for button clicks
  const handleButtonClick = (x, y) => {
    return () => {
      // Check if the new move is different from the previous one
      if (x !== prevMoveRef.current.x || y !== prevMoveRef.current.y) {
        const action = `Button Click: x:${x} y:${y}`;
        onMove(action);
        prevMoveRef.current = { x, y }; // Update previous move
      }
    };
  };

  return (
    <div>
      <div className='status'>
        🎮 Controller: {gamepadConnected ? 'Connected' : 'Not Connected'}
      </div>
      <div className="control-buttons">


        <button
          className={`control-button up ${activeKeys.has('ArrowUp') ? 'active' : ''}`}
          onClick={handleButtonClick(0, -1)}
        >
          ▲
        </button>
        <button
          className={`control-button left ${activeKeys.has('ArrowLeft') ? 'active' : ''}`}
          onClick={handleButtonClick(-1, 0)}
        >
          ◀
        </button>
        <button
          className={`control-button stop ${activeKeys.has(' ') ? 'active' : ''}`}
          onClick={handleButtonClick(2, 2)}
        >
          Stop
        </button>
        <button
          className={`control-button right ${activeKeys.has('ArrowRight') ? 'active' : ''}`}
          onClick={handleButtonClick(1, 0)}
        >
          ▶
        </button>
        <button
          className={`control-button down ${activeKeys.has('ArrowDown') ? 'active' : ''}`}
          onClick={handleButtonClick(0, 1)}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default ControlButtons;
