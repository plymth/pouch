import React from 'react';

const Button = ({ title, handleOnClick }) => {
  return (
    <button className="App__send-btn" onClick={() => handleOnClick()}>
      {title}
    </button>
  );
};

export default Button;
