import React, { useState, useRef, useEffect, useCallback } from "react";

const scale = 0.45;
const canvas_height = 1080 * scale;
const canvas_width = 1440 * scale;

const CameraDisplay = ({ detections = [] }) => {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const requestRef = useRef(null);
    const [boxes, setBoxes] = useState([]);
    const [isStreaming, setIsStreaming] = useState(true);

    // Process detections into scaled boxes
    useEffect(() => {
        const scaledBoxes = detections.map(([label, x1, y1, x2, y2, confidence]) => ({
            id: `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            label,
            x: x1 * canvas_width,
            y: y1 * canvas_height,
            width: (x2 - x1) * canvas_width,
            height: (y2 - y1) * canvas_height,
            confidence,
        }));
        setBoxes(scaledBoxes);
    }, [detections]);

    // Draw image and boxes on canvas
    const drawFrame = useCallback(() => {
        if (!canvasRef.current || !imgRef.current?.src) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

        // Draw boxes directly on canvas for better performance
        boxes.forEach(box => {
            const boxColor = box.confidence < 0.3 ? "red" :
                box.confidence < 0.6 ? "yellow" : "green";

            ctx.strokeStyle = boxColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            ctx.fillStyle = boxColor === "green" ? "rgba(0, 255, 0, 0.2)" :
                boxColor === "yellow" ? "rgba(255, 255, 0, 0.2)" :
                    "rgba(255, 0, 0, 0.2)";
            ctx.fillRect(box.x, box.y, box.width, box.height);

            // Draw label
            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.fillText(
                `${box.label} (${(box.confidence * 100).toFixed(1)}%)`,
                box.x,
                box.y - 5
            );
        });
    }, [boxes]);

    // Image stream handling
    useEffect(() => {
        if (!isStreaming) return;

        let lastUpdate = 0;
        const minInterval = 33;
        let retryTimeout = null;
        let retryCount = 0;
        const maxRetryCount = 5;
        /** @type {Array<AbortController>} */
        let ac_pool = [];

        const fetchImage = async () => {
            if (!isStreaming) return;

            const now = Date.now();
            if (now - lastUpdate < minInterval) {
                requestRef.current = requestAnimationFrame(fetchImage);
                return;
            }

            const ac = new AbortController();
            ac_pool.push(ac)

            try {
                const res = await fetch(`http://${location.hostname}:8085/image?t=${now}`, {
                    signal: ac.signal,
                    priority: 'high'
                });

                if (!res.ok) {
                    ac_pool = ac_pool.filter(_ => _ !== ac);
                    throw new Error(`HTTP ${res.status}`)
                } else {
                    while (ac_pool.length > 0) {
                        const _  = ac_pool.shift()
                        if (_ !== ac) _.abort();
                        else break;
                    }
                }

                const blob = await res.blob();
                const newUrl = URL.createObjectURL(blob);

                if (imgRef.current) {
                    // Clean up previous image URL
                    const oldSrc = imgRef.current.src;

                    imgRef.current.onload = () => {
                        // Only revoke old URL after new image loads
                        if (oldSrc && oldSrc.startsWith('blob:')) {
                            URL.revokeObjectURL(oldSrc);
                        }

                        drawFrame();
                        lastUpdate = Date.now();
                        retryCount = 0; // Reset retry count on success

                        if (isStreaming) {
                            requestRef.current = requestAnimationFrame(fetchImage);
                        }
                    };

                    imgRef.current.onerror = () => {
                        // Clean up the URL if image fails to load
                        URL.revokeObjectURL(newUrl);
                        console.error("Failed to load image");
                        scheduleRetry();
                    };

                    imgRef.current.src = newUrl;
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Fetch error:', err);
                    scheduleRetry();
                }
            }
        };

        // Implement exponential backoff for retries
        const scheduleRetry = () => {
            if (retryCount >= maxRetryCount) {
                console.error("Max retries reached, stopping attempts");
                setIsStreaming(false);
                return;
            }

            clearTimeout(retryTimeout);
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); 
            retryCount++;

            retryTimeout = setTimeout(() => {
                if (isStreaming) {
                    requestRef.current = requestAnimationFrame(fetchImage);
                }
            }, delay);
        };

        requestRef.current = requestAnimationFrame(fetchImage);

        return () => {
            cancelAnimationFrame(requestRef.current);
            clearTimeout(retryTimeout);
            for (const ac of ac_pool) ac.abort();
            if (imgRef.current?.src && imgRef.current.src.startsWith('blob:')) {
                URL.revokeObjectURL(imgRef.current.src);
            }
        };
    }, [isStreaming, drawFrame]);

    return (
        <div style={{
            position: "relative",
            width: canvas_width,
            height: canvas_height,
            backgroundColor: "black",
            borderRadius: "15px 15px 0 0",
            border: "3px solid #00ffff",
            boxShadow: "0 0 20px #00ffff",
            overflow: "hidden"
        }}>
            {/* Hidden image element for loading */}
            <img
                ref={imgRef}
                alt="stream source"
                style={{ display: 'none' }}
            />

            {/* Canvas for drawing */}
            <canvas
                ref={canvasRef}
                width={canvas_width}
                height={canvas_height}
            />
        </div>
    );
};

export default CameraDisplay;