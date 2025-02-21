import React, { useEffect, useRef } from 'react';
import './MessageBox.css';

function MessageBox({ messages }) {
  const messageBoxRef = useRef(null);  // Reference for the message box

  useEffect(() => {
    // Scroll to the bottom of the message box whenever messages change
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);  // This effect will run every time the messages change

  return (
    <div className="message-box-container">
      <div className="message-box" ref={messageBoxRef}>
        <div className="message-box-header">
          Message Box
        </div>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === "User" ? "user" : "system"}`}>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessageBox; 