import React from 'react';

interface FallbackAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export const FallbackAnimation: React.FC<FallbackAnimationProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`animate-fadeIn ${className}`}
      style={{
        animation: 'fadeIn 0.5s ease-in-out'
      }}
    >
      {children}
    </div>
  );
};
