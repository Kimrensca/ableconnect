// src/Components/ui/button.jsx

import React from 'react';

export const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
