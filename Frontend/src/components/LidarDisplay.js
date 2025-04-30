import React from "react";
import { useState } from 'react';
import "./LidarDisplay.css";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const LidarMap = ({ points = [], heading = 0, onMove }) => {
  const containerSize = 400;
  const headerHeight = 25;
  const plotAreaSize = containerSize - headerHeight;
  const [sliderValue, setSliderValue] = useState(5.00);
  const scale = (plotAreaSize / 2) / sliderValue;
  const centerX = containerSize / 2;
  const centerY = headerHeight + (plotAreaSize / 2);


  const handleSliderChange = (value) => {
    setSliderValue(Math.round(value * 100) / 100);
  };

  const handlePointClick = (originalX, originalY) => {
    const action = `Target location designated at x: ${originalX}, y: ${originalY}`;
    if (onMove) onMove(action);
    console.log("lidar action: ", action)
  };

  // Convert points to SVG coordinates (relative to center)
  const svgPoints = [];
  for (let i = 0; i < points.length; i += 2) {
    if (i + 1 < points.length) {
      const originalX = points[1];
      const originalY = points[i + 1];
      const x = points[i] * scale;
      const y = points[i + 1] * scale;
      svgPoints.push(
        <circle
          key={`point-${Math.floor(i / 2)}`}
          cx={(-y).toFixed(4)}
          cy={(-x).toFixed(4)}
          r={1.5}
          fill="red"
          className="lidar-point"
          onClick={() => handlePointClick(originalX, originalY)}
        />
      );
    }
  }

  // Arrow configuration
  const arrowSize = 24;
  const arrowPoints = [
    [0, -arrowSize],      // Tip
    [+0.6 * arrowSize, 0.4 * arrowSize],
    [0, 0],
    [-0.6 * arrowSize, 0.4 * arrowSize],
  ].map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="lidar-map-container">

      <div className="lidar-map-header">
        Lidar Map (Range: {sliderValue.toFixed(2)}m)
        <div className="slider-container">
          <Slider min={0} max={10} step={0.01} value={sliderValue} onChange={handleSliderChange} />
        </div>
      </div>
      <div className="lidar-wrapper">
        <svg
          width={containerSize}
          height={containerSize}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
          className="lidar-svg"
        >
          {/* Static grid lines */}
          <line x1={centerX} y1={headerHeight} x2={centerX} y2={containerSize} stroke="#555" strokeWidth="1" />
          <line x1={0} y1={centerY} x2={containerSize} y2={centerY} stroke="#555" strokeWidth="1" />

          {/* Rotating group (points + robot) */}
          <g transform={`translate(${centerX},${centerY})`}>
            <g transform={`rotate(${heading.toFixed(4)})`}>
              {/* LIDAR points (already relative to center) */}
              {svgPoints}
              {/* Robot indicator */}
              <polygon
                points={arrowPoints}
                fill="#000"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default LidarMap;