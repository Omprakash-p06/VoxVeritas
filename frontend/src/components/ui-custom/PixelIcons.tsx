// Pixel art style icons using SVG

interface PixelIconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Pixelated Terminal/Computer Icon
export function PixelTerminal({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Monitor frame */}
      <rect x="2" y="3" width="20" height="16" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Screen */}
      <rect x="4" y="5" width="16" height="10" fill="currentColor" opacity="0.2"/>
      {/* Prompt symbol */}
      <rect x="6" y="8" width="3" height="2" fill="currentColor"/>
      <rect x="6" y="11" width="6" height="2" fill="currentColor"/>
      {/* Stand */}
      <rect x="10" y="19" width="4" height="2" fill="currentColor"/>
      <rect x="8" y="21" width="8" height="2" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Upload Icon
export function PixelUpload({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Box */}
      <rect x="4" y="10" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Arrow up */}
      <rect x="10" y="2" width="4" height="10" fill="currentColor"/>
      <rect x="6" y="6" width="3" height="3" fill="currentColor"/>
      <rect x="15" y="6" width="3" height="3" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Chat/Message Icon
export function PixelChat({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Bubble */}
      <rect x="2" y="3" width="20" height="14" rx="0" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Tail */}
      <rect x="4" y="17" width="4" height="3" fill="currentColor"/>
      <rect x="2" y="20" width="3" height="2" fill="currentColor"/>
      {/* Lines */}
      <rect x="5" y="7" width="10" height="2" fill="currentColor" opacity="0.6"/>
      <rect x="5" y="11" width="6" height="2" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

// Pixelated Shield/Security Icon
export function PixelShield({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Shield outline */}
      <path 
        d="M12 2 L20 6 L20 12 Q20 18 12 22 Q4 18 4 12 L4 6 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Checkmark */}
      <rect x="8" y="11" width="3" height="2" fill="currentColor"/>
      <rect x="10" y="9" width="2" height="2" fill="currentColor"/>
      <rect x="12" y="7" width="4" height="2" fill="currentColor"/>
    </svg>
  );
}

// Pixelated File/Document Icon
export function PixelFile({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Page */}
      <rect x="4" y="2" width="12" height="18" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Folded corner */}
      <rect x="14" y="2" width="6" height="6" fill="currentColor" opacity="0.3"/>
      <rect x="16" y="2" width="2" height="2" fill="currentColor"/>
      <rect x="18" y="4" width="2" height="2" fill="currentColor"/>
      {/* Lines */}
      <rect x="6" y="10" width="8" height="2" fill="currentColor" opacity="0.5"/>
      <rect x="6" y="14" width="6" height="2" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

// Pixelated Microphone Icon
export function PixelMic({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Mic body */}
      <rect x="9" y="3" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Base */}
      <rect x="7" y="12" width="10" height="3" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Stand */}
      <rect x="11" y="15" width="2" height="4" fill="currentColor"/>
      <rect x="7" y="19" width="10" height="2" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Send Icon
export function PixelSend({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Arrow */}
      <polygon 
        points="3,12 18,6 18,10 21,10 21,14 18,14 18,18" 
        fill="currentColor"
      />
    </svg>
  );
}

// Pixelated User Icon
export function PixelUser({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Head */}
      <rect x="8" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Body */}
      <rect x="4" y="14" width="16" height="8" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// Pixelated Bot/AI Icon
export function PixelBot({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Head */}
      <rect x="5" y="6" width="14" height="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Antenna */}
      <rect x="11" y="2" width="2" height="4" fill="currentColor"/>
      <rect x="9" y="2" width="6" height="2" fill="currentColor"/>
      {/* Eyes */}
      <rect x="8" y="10" width="3" height="3" fill="currentColor"/>
      <rect x="13" y="10" width="3" height="3" fill="currentColor"/>
      {/* Body */}
      <rect x="7" y="18" width="10" height="4" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// Pixelated Trash/Delete Icon
export function PixelTrash({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Lid */}
      <rect x="6" y="3" width="12" height="3" fill="currentColor"/>
      <rect x="9" y="1" width="6" height="2" fill="currentColor"/>
      {/* Body */}
      <rect x="5" y="7" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Lines */}
      <rect x="9" y="10" width="2" height="8" fill="currentColor" opacity="0.5"/>
      <rect x="13" y="10" width="2" height="8" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

// Pixelated Check Icon
export function PixelCheck({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="4" y="12" width="4" height="4" fill="currentColor"/>
      <rect x="8" y="14" width="4" height="4" fill="currentColor"/>
      <rect x="12" y="10" width="4" height="4" fill="currentColor"/>
      <rect x="16" y="6" width="4" height="4" fill="currentColor"/>
      <rect x="14" y="8" width="2" height="2" fill="currentColor"/>
    </svg>
  );
}

// Pixelated X/Close Icon
export function PixelX({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="4" y="4" width="4" height="4" fill="currentColor"/>
      <rect x="8" y="8" width="4" height="4" fill="currentColor"/>
      <rect x="12" y="12" width="4" height="4" fill="currentColor"/>
      <rect x="16" y="16" width="4" height="4" fill="currentColor"/>
      <rect x="16" y="4" width="4" height="4" fill="currentColor"/>
      <rect x="12" y="8" width="4" height="4" fill="currentColor"/>
      <rect x="4" y="16" width="4" height="4" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Database/Storage Icon
export function PixelDatabase({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Cylinder */}
      <ellipse cx="12" cy="5" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="4" y="5" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="12" cy="19" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Middle line */}
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

// Pixelated Warning Icon
export function PixelWarning({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Triangle */}
      <polygon 
        points="12,2 22,20 2,20" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      {/* Exclamation */}
      <rect x="10" y="8" width="4" height="6" fill="currentColor"/>
      <rect x="10" y="16" width="4" height="3" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Play Icon
export function PixelPlay({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      <polygon 
        points="4,4 20,12 4,20" 
        fill="currentColor"
      />
    </svg>
  );
}

// Pixelated Pause Icon
export function PixelPause({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="5" y="4" width="5" height="16" fill="currentColor"/>
      <rect x="14" y="4" width="5" height="16" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Refresh/Reload Icon
export function PixelRefresh({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Arrow circle */}
      <path 
        d="M20 12 A8 8 0 1 1 12 4" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      {/* Arrow head */}
      <polygon 
        points="20,4 20,10 14,4" 
        fill="currentColor"
      />
    </svg>
  );
}

// Pixelated Filter Icon
export function PixelFilter({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Funnel */}
      <polygon 
        points="2,4 22,4 14,12 14,18 10,22 10,12" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

// Pixelated Folder Icon
export function PixelFolder({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Folder tab */}
      <rect x="2" y="4" width="8" height="4" fill="currentColor" opacity="0.5"/>
      {/* Folder body */}
      <rect x="2" y="7" width="20" height="14" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// Pixelated Chevron Down Icon
export function PixelChevronDown({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="4" y="6" width="4" height="4" fill="currentColor"/>
      <rect x="8" y="10" width="4" height="4" fill="currentColor"/>
      <rect x="12" y="10" width="4" height="4" fill="currentColor"/>
      <rect x="16" y="6" width="4" height="4" fill="currentColor"/>
      <rect x="10" y="14" width="4" height="4" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Chevron Up Icon
export function PixelChevronUp({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x="10" y="6" width="4" height="4" fill="currentColor"/>
      <rect x="4" y="10" width="4" height="4" fill="currentColor"/>
      <rect x="8" y="10" width="4" height="4" fill="currentColor"/>
      <rect x="12" y="10" width="4" height="4" fill="currentColor"/>
      <rect x="16" y="10" width="4" height="4" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Volume/Sound Icon
export function PixelVolume({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Speaker */}
      <rect x="4" y="8" width="6" height="8" fill="currentColor"/>
      <polygon 
        points="10,8 16,4 16,20 10,16" 
        fill="currentColor"
      />
    </svg>
  );
}

// Pixelated Clock/Time Icon
export function PixelClock({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Circle */}
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Hands */}
      <rect x="11" y="6" width="2" height="7" fill="currentColor"/>
      <rect x="11" y="11" width="5" height="2" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Download Icon
export function PixelDownload({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Arrow down */}
      <rect x="10" y="4" width="4" height="10" fill="currentColor"/>
      <rect x="6" y="12" width="3" height="3" fill="currentColor"/>
      <rect x="15" y="12" width="3" height="3" fill="currentColor"/>
      {/* Base */}
      <rect x="4" y="18" width="16" height="3" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Settings/Gear Icon
export function PixelSettings({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Center */}
      <rect x="9" y="9" width="6" height="6" fill="currentColor"/>
      {/* Spokes */}
      <rect x="11" y="3" width="2" height="4" fill="currentColor"/>
      <rect x="11" y="17" width="2" height="4" fill="currentColor"/>
      <rect x="3" y="11" width="4" height="2" fill="currentColor"/>
      <rect x="17" y="11" width="4" height="2" fill="currentColor"/>
    </svg>
  );
}

// Pixelated Hard Drive/Storage Icon
export function PixelHardDrive({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Drive body */}
      <rect x="3" y="6" width="18" height="12" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* LED */}
      <rect x="16" y="15" width="3" height="2" fill="currentColor"/>
      {/* Label area */}
      <rect x="5" y="8" width="8" height="6" fill="currentColor" opacity="0.2"/>
    </svg>
  );
}

// Pixelated CPU/Chip Icon
export function PixelCpu({ className = '', size = 24 }: PixelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      shapeRendering="crispEdges"
    >
      {/* Chip body */}
      <rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"/>
      {/* Pins */}
      <rect x="8" y="3" width="2" height="3" fill="currentColor"/>
      <rect x="14" y="3" width="2" height="3" fill="currentColor"/>
      <rect x="8" y="18" width="2" height="3" fill="currentColor"/>
      <rect x="14" y="18" width="2" height="3" fill="currentColor"/>
      <rect x="3" y="8" width="3" height="2" fill="currentColor"/>
      <rect x="18" y="8" width="3" height="2" fill="currentColor"/>
      <rect x="3" y="14" width="3" height="2" fill="currentColor"/>
      <rect x="18" y="14" width="3" height="2" fill="currentColor"/>
    </svg>
  );
}
