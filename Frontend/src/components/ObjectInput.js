import React, { useState } from 'react';

function ObjectInput({ setSearchObject }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchObject(input);  // Pass input to parent component (App.js)
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default Enter behavior
      // Trigger the submit function programmatically when the Enter key is pressed
      document.querySelector('.object-input button').click();
    }
  };

  return (
    <div className="object-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter object to search or type 'help' for help"
        />
        <button 
          type="submit"
          onClick={handleSubmit} 
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ObjectInput;
