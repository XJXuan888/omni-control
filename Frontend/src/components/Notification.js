import React from 'react';

const Notification = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="notification">
      <p>{message}</p>
    </div>
  );
};

export default Notification;