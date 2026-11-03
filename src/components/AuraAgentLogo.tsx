import React from 'react';

interface AuraAgentLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withGlow?: boolean;
}

export const AuraAgentLogo: React.FC<AuraAgentLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  withGlow = true,
}) => {
  const sizeMap = {
    sm: { icon: 26, textAura: 'text-base', textAgent: 'text-base' },
    md: { icon: 34, textAura: 'text-xl', textAgent: 'text-xl' },
    lg: { icon: 46, textAura: 'text-2xl', textAgent: 'text-2xl' },
    xl: { icon: 64, textAura: 'text-4xl', textAgent: 'text-4xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Faceted Triangle Logo Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        {withGlow && (
          <div
            className="absolute inset-0 blur-md opacity-40 -z-10 pointer-events-none rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(168,85,247,0.4) 60%, transparent 100%)',
            }}
          />
        )}
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Left Arm: Electric Cyan to Deep Blue */}
            <linearGradient id="auraLeftArm" x1="60" y1="10" x2="10" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="35%" stopColor="#00A3FF" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* Right Arm: Electric Violet to Neon Magenta */}
            <linearGradient id="auraRightArm" x1="60" y1="10" x2="110" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="25%" stopColor="#818CF8" />
              <stop offset="55%" stopColor="#A855F7" />
              <stop offset="85%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            {/* Center Inner Fold: Faceted Origami Violet/Cyan */}
            <linearGradient id="auraInnerFold" x1="35" y1="70" x2="85" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="40%" stopColor="#7C3AED" />
              <stop offset="80%" stopColor="#C026D3" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>

            {/* Bottom Inner Shadow / Ambient Depth */}
            <linearGradient id="auraFoldShadow" x1="60" y1="70" x2="60" y2="102" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#581C87" stopOpacity="0.2" />
            </linearGradient>

            <filter id="auraDropShadow" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Group with subtle shadow */}
          <g filter="url(#auraDropShadow)">
            {/* Left Arm of the 'A' */}
            <path
              d="M 60 10 
                 L 43 28 
                 L 14 88 
                 L 26 98 
                 L 50 82 
                 L 64 56 
                 L 60 10 Z"
              fill="url(#auraLeftArm)"
            />

            {/* Right Arm of the 'A' */}
            <path
              d="M 60 10 
                 L 64 56 
                 L 75 80 
                 L 96 98 
                 L 106 88 
                 L 77 28 
                 L 60 10 Z"
              fill="url(#auraRightArm)"
            />

            {/* Inner Angular Fold / Crossbar Facet */}
            <path
              d="M 38 78 
                 L 60 62 
                 L 82 78 
                 L 68 85 
                 L 60 81 
                 L 52 85 Z"
              fill="url(#auraInnerFold)"
            />

            {/* Secondary Inner Geometric Peak for 3D depth */}
            <path
              d="M 60 62 
                 L 68 85 
                 L 60 96 
                 L 52 85 Z"
              fill="url(#auraFoldShadow)"
            />
          </g>
        </svg>
      </div>

      {/* Brand Typography: "Aura" (White) + "Agent" (Cyan) */}
      {showText && (
        <div className="flex items-baseline font-sans tracking-tight font-extrabold leading-none">
          <span className={`${currentSize.textAura} text-white drop-shadow-sm`}>Aura</span>
          <span
            className={`${currentSize.textAgent} text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] ml-0.5`}
          >
            Agent
          </span>
        </div>
      )}
    </div>
  );
};
