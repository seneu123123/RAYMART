import React from "react";

interface AshLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

/**
 * Official ALYN SHIR (ASH) Isometric Cube Monogram Logo
 * Left face: 'A'
 * Top face: 'S'
 * Right face: 'H'
 * Forming the 3D isometric cube brand emblem.
 */
export const AshLogo: React.FC<AshLogoProps> = ({
  className = "w-9 h-9",
  size,
  showGlow = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={style}
    >
      {showGlow && (
        <div className="absolute inset-0 rounded-xl bg-cyan-400/25 blur-md -z-10 animate-pulse" />
      )}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(6,182,212,0.35)]"
      >
        <defs>
          <linearGradient id="ashCyan" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="ashFaceTop" x1="100" y1="20" x2="100" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <linearGradient id="ashFaceLeft" x1="30" y1="65" x2="96" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="ashFaceRight" x1="104" y1="65" x2="170" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>

        {/* --- TOP FACE: S --- */}
        {/* Isometric 'S' constructed of three interlocking folded segments on the top rhombus */}
        <g fill="url(#ashFaceTop)">
          {/* S Top stroke & right hook */}
          <path
            d="M 60,44 
               L 100,21 
               L 165,58 
               L 142,71 
               L 100,47 
               L 60,70 
               L 37,57 Z"
          />
          {/* S Middle diagonal crossbar */}
          <path
            d="M 65,73 
               L 107,49 
               L 135,65 
               L 93,89 Z"
          />
          {/* S Bottom stroke & left hook */}
          <path
            d="M 58,100 
               L 35,87 
               L 100,50 
               L 140,73 
               L 140,97 
               L 100,74 
               L 58,98 Z"
          />
        </g>

        {/* --- LEFT FACE: A --- */}
        {/* Isometric 'A' with outer left leg, inner vertical leg, top peak, and crossbar */}
        <g fill="url(#ashFaceLeft)">
          {/* Main frame of 'A' with cutouts for inner eye and bottom legs */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 31,64 
               L 95,101 
               L 95,174 
               L 75,162 
               L 75,134 
               L 51,120 
               L 51,148 
               L 31,136 Z
               
               M 51,104 
               L 75,118 
               L 75,90 
               L 51,76 Z"
          />
        </g>

        {/* --- RIGHT FACE: H --- */}
        {/* Isometric 'H' with left vertical pillar, right vertical pillar, and middle slanted crossbar */}
        <g fill="url(#ashFaceRight)">
          <path
            d="M 105,101 
               L 125,89 
               L 125,123 
               L 149,109 
               L 149,75 
               L 169,64 
               L 169,136 
               L 149,148 
               L 149,124 
               L 125,138 
               L 125,174 
               L 105,162 Z"
          />
        </g>
      </svg>
    </div>
  );
};

export default AshLogo;
