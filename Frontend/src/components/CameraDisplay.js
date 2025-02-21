import React, { useState, useRef, useEffect } from "react";

const original_height = 1080;
const original_width = 1440;
const scale = 0.45;

const CameraDisplay = ({ detections = [] }) => {
    const [boxes, setBoxes] = useState([]);

    useEffect(() => {
        if (!detections || detections.length === 0) return;

        const scaledBoxes = detections.map(([label, x1, y1, x2, y2, confidence]) => ({
            id: `${label}-${Math.random()}`,
            label,
            x: Math.round(x1 * 1000) / 1000,
            y: Math.round(y1 * 1000) / 1000,
            width: Math.round((x2 - x1) * 1000) / 1000,
            height: Math.round((y2 - y1) * 1000) / 1000,
            confidence: Math.round(confidence * 1000) / 1000,
        }));

        setBoxes(scaledBoxes);
    }, [detections]);

    return (
        <div style={{ 
            position: "relative", 
            width: original_width * scale, 
            height: original_height * scale,
            backgroundColor: "black",
        }}>
            {boxes.length > 0 &&
                boxes.map((box) => {
                    const scaledX = box.x * scale;
                    const scaledY = box.y * scale;
                    const scaledWidth = box.width * scale;
                    const scaledHeight = box.height * scale;
    
                    return (
                        <div
                            key={box.id}
                            style={{
                                position: "absolute",
                                top: `${scaledY}px`,
                                left: `${scaledX}px`,
                                width: `${scaledWidth}px`,
                                height: `${scaledHeight}px`,
                                border: "2px solid green",
                                backgroundColor: "rgba(0, 255, 0, 0.2)",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: "-20px",
                                    left: "0px",
                                    backgroundColor: "green",
                                    color: "white",
                                    padding: "2px 4px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                }}
                            >
                                {box.label} ({(box.confidence * 100).toFixed(1)}%)
                            </div>
                        </div>
                    );
                })}
        </div>
    );
    
};

export default CameraDisplay;
