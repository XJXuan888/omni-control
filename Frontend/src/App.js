import React, { useState, useEffect } from 'react';
import CameraDisplay from './components/CameraDisplay';
import ControlButtons from './components/ControlButtons';
import ObjectInput from './components/ObjectInput';
import MessageBox from './components/MessageBox';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [searchObject, setSearchObject] = useState('');
  const welcomeShown = React.useRef(false);
  const detections = [
    ["traffic light", 1302.5496826171875, 0.7404270172119141, 1439.48291015625, 133.2143096923828, 0.255513072013855],
  ];

  // Function to add messages to the message box
  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  // Handle movement button clicks
  const handleMove = (action) => {
    addMessage("User", `${action} button clicked`);
    addMessage("System", `Received: ${action}`);
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
      const objectFoundInDetection = detections.some((detection) => detection[0].toLowerCase() === searchObject.toLowerCase());

      // Add appropriate message based on whether the object is found
      if (objectFoundInDetection) {
        setTimeout(() => {
          addMessage("System", `Object "${searchObject}" found!`);
          setSearchObject(null);
        }, 500);  // Delay the message to simulate the system response
      } else {
        setTimeout(() => {
          addMessage("System", `Object "${searchObject}" not found.`);
          setSearchObject(null);
        }, 500);  // Delay the message to simulate the system response
      }
    }
  }, [searchObject, detections]);

  return (
    <div className="App">
      <MessageBox messages={messages} />
      <div className="content">
        <h1>Robot Control System</h1>
        <CameraDisplay detections={detections} />
        <ControlButtons onMove={handleMove} />
        <ObjectInput setSearchObject={handleSearchObject} />
      </div>
    </div>
  );
}

export default App;
