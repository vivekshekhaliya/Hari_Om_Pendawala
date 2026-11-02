import React from 'react';

export default function VegBadge({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 p-0.5 border',
    md: 'w-4.5 h-4.5 p-0.5 border-1.5',
    lg: 'w-6 h-6 p-1 border-2',
  };

  const dotClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div
      title="100% Pure Vegetarian"
      className={`inline-flex items-center justify-center border-green-600 rounded bg-white shrink-0 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <div className={`rounded-full bg-green-600 ${dotClasses[size] || dotClasses.md}`} />
    </div>
  );
}
