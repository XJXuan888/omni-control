import React, { useState, useRef, useEffect } from "react";

const original_height = 1080;
const original_width = 1440;
const scale = 0.45;

const CameraDisplay = ({ imageSrc, detections = [] }) => {
    const canvasRef = useRef(null);
    const [boxes, setBoxes] = useState([]);
    useEffect(() => {
        const scaledBoxes = detections.map(([label, x1, y1, x2, y2, confidence]) => ({
            id: `${label}-${Math.random()}`,
            label,
            x: x1 * scale,
            y: y1 * scale,
            width: (x2 - x1) * scale,
            height: (y2 - y1) * scale,
            confidence,
        }));
        setBoxes(scaledBoxes);
    }, [detections]);

    useEffect(() => {
        if (imageSrc) {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");

                // Clear the previous drawing
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = imageSrc;
        }
    }, [imageSrc, boxes]);

    return (
        <div style={{
            position: "relative",
            width: original_width * scale,
            height: original_height * scale,
            backgroundColor: "black",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            borderTop: "3px solid #00ffff",
            borderLeft: "3px solid #00ffff",
            borderRight: "3px solid #00ffff",
        }}>
            <canvas
                ref={canvasRef}
                width={original_width * scale}
                height={original_height * scale}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px",
                    boxShadow: "0 0 20px #00ffff",
                }}
            />
            {boxes.length > 0 &&
                boxes.map((box) => {
                    const scaledX = box.x;
                    const scaledY = box.y;
                    const scaledWidth = box.width;
                    const scaledHeight = box.height;
                    let boxColor = "green";
                    if (box.confidence < 0.3) {
                        boxColor = "red";
                    } else if (box.confidence < 0.6) {
                        boxColor = "yellow";
                    }

                    return (
                        <div
                            key={box.id}
                            style={{
                                position: "absolute",
                                top: `${scaledY}px`,
                                left: `${scaledX}px`,
                                width: `${scaledWidth}px`,
                                height: `${scaledHeight}px`,
                                border: `2px solid ${boxColor === "green" ? "green" : boxColor === "yellow" ? "yellow" : "red"}`,
                                backgroundColor: boxColor === "green" ? "rgba(0, 255, 0, 0.2)" :
                                    boxColor === "yellow" ? "rgba(255, 255, 0, 0.2)" :
                                        "rgba(255, 0, 0, 0.2)",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: "-20px",
                                    left: "0px",
                                    backgroundColor: boxColor === "green" ? "rgba(0, 255, 0, 0.2)" :
                                        boxColor === "yellow" ? "rgba(255, 255, 0, 0.2)" :
                                            "rgba(255, 0, 0, 0.2)",
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
