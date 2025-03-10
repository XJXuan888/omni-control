import React, { useState, useEffect } from 'react';
import CameraDisplay from './components/CameraDisplay';
import ControlButtons from './components/ControlButtons';
import ObjectInput from './components/ObjectInput';
import MessageBox from './components/MessageBox';
import './App.css';

function startWS() {
  const isSecure = window.location.protocol === "https:";
  const wsProtocol = isSecure ? "wss" : "ws";
  const ws = new WebSocket(`${wsProtocol}://${window.location.host}/`)
  console.log("WebSocket initialized:", ws);
  return ws
}

const ws = window.ws = startWS()
let ws_listener = undefined

function App() {
  const [messages, setMessages] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [searchObject, setSearchObject] = useState('');
  const welcomeShown = React.useRef(false);
  const [boxes, setBoxes] = useState([]);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  const toggleBoundingBoxes = () => {
    setShowBoundingBoxes(prev => !prev);
  };

  if (ws_listener !== undefined)
    ws.removeEventListener("message", ws_listener)
  ws_listener = m => {
    const [image_id, ...data] = JSON.parse(m.data)
    console.log(image_id)
    fetch(`/var/${image_id}`)
      .then(response => response.blob()) // Get the image as a blob
      .then(blob => {
        const objectURL = URL.createObjectURL(blob);
        setImageSrc(objectURL);
      })
      .catch(error => {
        console.error('Error fetching the image:', error);
      });

    setBoxes(data)
  }
  ws.addEventListener("message", ws_listener)

  // Function to add messages to the message box
  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const [isControllerActive, setIsControllerActive] = useState(true);

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

    ws.send(JSON.stringify(action) + "\n");
    ws.send("Controller: x:-0.00 y:0.00" + "\n");
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
      console.log("Boxes received:", boxes);
      console.log("Searching for:", searchObject);

      // Check if the object exists in the detections
      const boxLabels = boxes.map(box => box?.[0]);
      console.log("Available labels:", boxLabels);

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
        <CameraDisplay imageSrc={imageSrc} detections={showBoundingBoxes ? boxes : []} />
        <ControlButtons onMove={handleMove} />
        <button className="toggle-bbox-button" onClick={toggleBoundingBoxes}>
          {showBoundingBoxes ? "Hide Bounding Boxes" : "Show Bounding Boxes"}
        </button>
        <ObjectInput setSearchObject={handleSearchObject} />
      </div>
    </div>
  );
}

export default App;
