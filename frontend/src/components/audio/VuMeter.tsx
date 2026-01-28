import React from 'react';

interface VuMeterProps {
  level: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showPeak?: boolean;
  className?: string;
}

/**
 * VU Meter component for displaying audio levels
 */
export const VuMeter: React.FC<VuMeterProps> = ({
  level,
  size = 'md',
  orientation = 'horizontal',
  showPeak = false,
  className = '',
}) => {
  // Clamp level between 0 and 100
  const clampedLevel = Math.max(0, Math.min(100, level));
  
  // Determine color based on level
  const getColor = () => {
    if (clampedLevel > 85) return '#EF4444'; // Red - clipping
    if (clampedLevel > 60) return '#F59E0B'; // Orange - loud
    if (clampedLevel > 30) return '#22C55E'; // Green - good
    return '#22C55E'; // Green - quiet
  };

  // Size configurations
  const sizes = {
    sm: { height: 4, width: 40 },
    md: { height: 6, width: 60 },
    lg: { height: 8, width: 80 },
  };

  const { height, width } = sizes[size];

  if (orientation === 'vertical') {
    return (
      <div 
        className={`relative bg-white/10 rounded-full overflow-hidden ${className}`}
        style={{ width: height, height: width }}
        data-testid="vu-meter-vertical"
      >
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-75 rounded-full"
          style={{
            height: `${clampedLevel}%`,
            backgroundColor: getColor(),
            boxShadow: clampedLevel > 60 ? `0 0 8px ${getColor()}` : 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-white/10 rounded-full overflow-hidden ${className}`}
      style={{ height, width }}
      data-testid="vu-meter"
    >
      <div
        className="absolute top-0 left-0 bottom-0 transition-all duration-75 rounded-full"
        style={{
          width: `${clampedLevel}%`,
          backgroundColor: getColor(),
          boxShadow: clampedLevel > 60 ? `0 0 8px ${getColor()}` : 'none',
        }}
      />
      {showPeak && clampedLevel > 85 && (
        <div 
          className="absolute top-0 right-0 bottom-0 w-1 bg-red-500 animate-pulse"
        />
      )}
    </div>
  );
};

/**
 * Segmented VU Meter (like classic hardware meters)
 */
export const VuMeterSegmented: React.FC<VuMeterProps> = ({
  level,
  size = 'md',
  className = '',
}) => {
  const clampedLevel = Math.max(0, Math.min(100, level));
  const segments = 10;
  const activeSegments = Math.ceil((clampedLevel / 100) * segments);

  const getSegmentColor = (index: number) => {
    if (index >= 8) return '#EF4444'; // Red
    if (index >= 6) return '#F59E0B'; // Orange
    return '#22C55E'; // Green
  };

  const segmentSize = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const gap = 1;

  return (
    <div 
      className={`flex gap-[1px] items-end ${className}`}
      data-testid="vu-meter-segmented"
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm transition-all duration-75"
          style={{
            width: segmentSize,
            height: segmentSize + (i * 1.5),
            backgroundColor: i < activeSegments ? getSegmentColor(i) : 'rgba(255,255,255,0.1)',
            boxShadow: i < activeSegments && i >= 6 ? `0 0 4px ${getSegmentColor(i)}` : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default VuMeter;
