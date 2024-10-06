import React from 'react';

const CustomAlert = ({ message, type = 'error' }) => (
  <div className={`p-4 mb-4 text-sm rounded-lg ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} role="alert">
    <span className="font-medium">{type === 'error' ? 'Error! ' : 'Success! '}</span>{message}
  </div>
);

export default CustomAlert;