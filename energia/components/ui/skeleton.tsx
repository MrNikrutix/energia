import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-300 rounded ${className}`}>
      {/* Placeholder for loading content */}
    </div>
  );
};

export default Skeleton;