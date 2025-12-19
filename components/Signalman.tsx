
import React from 'react';
import { SemaphorePosition } from '../types';

interface SignalmanProps {
  leftPos: SemaphorePosition;
  rightPos: SemaphorePosition;
  size?: number;
  className?: string;
  animate?: boolean;
}

const Signalman: React.FC<SignalmanProps> = ({ 
  leftPos, 
  rightPos, 
  size = 300, 
  className = "",
  animate = true 
}) => {
  // Map 0-7 to degrees (Clockwise from South)
  const getAngle = (pos: SemaphorePosition) => pos * 45 + 180;

  const Flag = ({ angle, side }: { angle: number, side: 'left' | 'right' }) => {
    const rotation = animate ? "transition-all duration-300 ease-in-out" : "";
    const isRest = angle === 180; // Both arms down

    return (
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '100px 100px' }} className={rotation}>
        {/* Arm */}
        <line x1="100" y1="100" x2="100" y2="40" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        {/* Flag Pole */}
        <line x1="100" y1="40" x2="100" y2="10" stroke="#475569" strokeWidth="3" />
        {/* Flag (Red/Yellow Split) */}
        {!isRest && (
          <path 
            d="M 100 10 L 80 25 L 100 40 Z" 
            fill="#ef4444" 
            stroke="#b91c1c"
            strokeWidth="0.5"
          />
        )}
        {!isRest && (
          <path 
            d="M 100 10 L 120 25 L 100 40 Z" 
            fill="#facc15" 
            stroke="#a16207"
            strokeWidth="0.5"
          />
        )}
      </g>
    );
  };

  return (
    <div className={`flex justify-center items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" className="drop-shadow-lg">
        {/* Body */}
        <circle cx="100" cy="70" r="15" fill="#1e293b" /> {/* Head */}
        <path d="M 85 90 L 115 90 L 120 150 L 80 150 Z" fill="#1e293b" /> {/* Torso */}
        <rect x="85" y="150" width="10" height="40" rx="2" fill="#334155" /> {/* Leg L */}
        <rect x="105" y="150" width="10" height="40" rx="2" fill="#334155" /> {/* Leg R */}
        
        {/* Uniform Details */}
        <line x1="100" y1="90" x2="100" y2="150" stroke="white" strokeWidth="1" strokeDasharray="2,2" />
        
        {/* Arms and Flags */}
        <Flag angle={getAngle(leftPos)} side="left" />
        <Flag angle={getAngle(rightPos)} side="right" />
      </svg>
    </div>
  );
};

export default Signalman;
