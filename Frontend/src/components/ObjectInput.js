import React, { useState } from 'react';

function ObjectInput({ setSearchObject }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchObject(input);  // Pass input to parent component (App.js)
    setInput('');
  };

  return (
    <div className="object-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter object to search or type 'help' for help"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ObjectInput;
