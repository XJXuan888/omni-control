import { useState, useEffect, useRef } from 'react';
import CameraDisplay from './components/CameraDisplay';
import ControlButtons from './components/ControlButtons';
import ObjectInput from './components/ObjectInput';
import MessageBox from './components/MessageBox';
import LidarMap from './components/LidarDisplay';

import './App.css';

function startWS() {
  const isSecure = window.location.protocol === "https:";
  const wsProtocol = isSecure ? "wss" : "ws";
  const ws = new WebSocket(`${wsProtocol}://${window.location.host}/`)
  console.log("WebSocket initialized:", ws);
  return ws
}

const ws = window.ws = startWS()

function App() {
  const [messages, setMessages] = useState([]);
  // const [imageSrc, setImageSrc] = useState(null);
  const [searchObject, setSearchObject] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [lidarpoints, setLidarPoints] = useState([]);
  const [isControllerActive, setIsControllerActive] = useState(true);
  const [robotHeading, setRobotHeading] = useState(0.0);
  const welcomeShown = useRef(false);

  // useEffect(() => {
  //   const controller = new AbortController();
  //   let currentUrl = null;
  
  //   const fetchImage = async () => {
  //     try {
  //       const res = await fetch(`http://192.168.1.52:8085/image?t=${Date.now()}`, {
  //         signal: controller.signal,
  //         credentials: 'omit' // Avoid sending cookies
  //       });
        
  //       const blob = await res.blob();
  //       const newUrl = URL.createObjectURL(blob);
        
  //       setImageSrc(prev => {
  //         if (prev) URL.revokeObjectURL(prev);
  //         return newUrl;
  //       });
  //     } catch (err) {
  //       if (err.name !== 'AbortError') {
  //         console.error("Fetch error:", err);
  //       }
  //     }
  //   };
  
  //   // Initial fetch + periodic updates
  //   fetchImage();
  //   const interval = setInterval(fetchImage, 200);
    
  //   return () => {
  //     controller.abort();
  //     clearInterval(interval);
  //     if (imageSrc) URL.revokeObjectURL(imageSrc);
  //   };
  // }, []);

  const toggleBoundingBoxes = () => {
    setShowBoundingBoxes(prev => !prev);
  };

  useEffect(() => {
    function listener(msg) {
      try {
        const [msg_type, ...payload] = JSON.parse(msg.data);
        //console.log("Parsed WebSocket message:", JSON.parse(msg.data));
        if (msg_type in hooks) hooks[msg_type](...payload);
      } catch (e) {
        // console.error(e);
      }
    }
    ws.addEventListener("message", listener)
    return () => ws.removeEventListener("message", listener);
  })

  const hooks = {
    image(data) {
      setBoxes(data)
    },
    laser(buffer) {
      // Decode the base64 string to binary data
      const binaryData = atob(buffer);  // Converts base64 string to binary (string of characters)

      // Create a typed array to store the data (e.g., Float32Array for 32-bit floats)
      const byteArray = new Uint8Array(binaryData.length);

      // Populate the byte array
      for (let i = 0; i < binaryData.length; i++) {
        byteArray[i] = binaryData.charCodeAt(i);
      }

      // Now you can convert the byteArray to a typed array (e.g., Float32Array)
      const dataView = new DataView(byteArray.buffer);
      const pointcloud = new Float32Array(dataView.buffer);

      // The floatArray now contains the decoded array of points
      setLidarPoints(pointcloud)
    },
    rotation(data) {
      setRobotHeading((data?.x ?? 0.0) * 180 / Math.PI)
    }
  }

  // Function to add messages to the message box
  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleMove = (action) => {
    if (action.includes("x:2 y:2") || action.includes("Button Clicked") || action.includes("Key Press:")) {
      setIsControllerActive(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "User", text: "Request Stop" },
        { sender: "System", text: "Received: Request Stop" },
      ]);
      // ws.send(JSON.stringify(action) + "\n");
      return;
    }

    if (action.startsWith("Controller:") && isControllerActive) {
      setMessages((prevMessages) => {
        if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].text.startsWith("Movement: Controller:")) {
          // Replace the last message instead of adding a new one
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = { sender: "User", text: `Movement: ${action}` };
          return updatedMessages;
        } else {
          // Add new message if no previous controller message
          return [...prevMessages, { sender: "User", text: `Movement: ${action}` }];
        }
      });
      // ws.send(JSON.stringify(action) + "\n");
    }

    else if (action.startsWith("Controller:") && !isControllerActive) {
      // Only activate the controller if action is non-zero
      if (action !== "Controller: x:0.00 y:0.00") {
        setIsControllerActive(true); // Reactivate controller
        setMessages((prevMessages) => {
          if (action !== "Controller: x:0.00 y:0.00") {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = { sender: "User", text: `Movement: ${action}` };
            return updatedMessages;
          }
          return prevMessages;
        });
      }
    }

    else if (!action.includes("x:0 y:0") && !action.includes("x:0.00 y:0.00")) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "User", text: `Movement: ${action}` },
        { sender: "System", text: `Received: ${action}` },
      ]);
      // ws.send(JSON.stringify(action) + "\n");
    }
    const message = JSON.stringify(action) + "\n"
    ws.send(message);
    console.log("WS <<", message);
  };


  // Handle object search input
  const handleSearchObject = (object) => {
    if (object.toLowerCase() === 'help') {
      addMessage("System", "💡 Here are some tips to get you started!");
      addMessage("System", "👉 Use the control buttons to move the robot: Up, Down, Left, Right, and Stop.");
      addMessage("System", "🔍 Type an object name in the search bar to find it (e.g., 'traffic light').");
      addMessage("System", "❗ Type 'help' anytime for instructions like these.");
      return;
    }

    setSearchObject(object);
    addMessage("User", `Find Object: ${object}`);
    addMessage("System", `Received: Searching for ${object}...`);
  };

  useEffect(() => {
    if (!welcomeShown.current) {
      addMessage("System", "Welcome to Rover Master Robot Control System! 🤖🚀  ");
      addMessage("System", "You can control the robot's movements, search for objects, and much more!");
      addMessage("System", "Use the control buttons to guide the robot and the search bar to find objects.");
      welcomeShown.current = true;
    }
  }, []);

  // Simulate object detection (replace with actual logic)
  useEffect(() => {
    if (searchObject) {
      // Check if the object exists in the detections
      const boxLabels = boxes.map(box => box?.[0]);
      const objectFound = boxLabels.some(label => label && label.toLowerCase() === searchObject.toLowerCase());

      addMessage("System", objectFound ? `✅ Object "${searchObject}" found!` : `❌ Object "${searchObject}" not found.`);
      setSearchObject("");
    }
  }, [searchObject, boxes]);

  return (
    <div className="App">
      <MessageBox messages={messages} />
      <div className="content">
        <h1>Robot Control System</h1>
        <CameraDisplay detections={showBoundingBoxes ? boxes : []} />
        <ControlButtons onMove={handleMove} />

        <button className="toggle-bbox-button" onClick={toggleBoundingBoxes}>
          {showBoundingBoxes ? "Hide Bounding Boxes" : "Show Bounding Boxes"}
        </button>

        <ObjectInput setSearchObject={handleSearchObject} />
        <LidarMap points={lidarpoints} onMove={handleMove} heading={robotHeading} />
      </div>
    </div>
  );
}

export default App;
