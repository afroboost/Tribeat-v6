import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface HostMicControlProps {
  gain: number;
  isMuted: boolean;
  onGainChange: (gain: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

export const HostMicControl: React.FC<HostMicControlProps> = ({
  gain,
  isMuted,
  onGainChange,
  onMuteToggle,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Mute Button */}
      <button
        onClick={onMuteToggle}
        className={`
          p-2 rounded-lg transition-all
          ${isMuted 
            ? 'text-red-400 bg-red-500/10 border border-red-500/30' 
            : 'text-white/70 bg-white/5 border border-white/10 hover:bg-white/10'
          }
        `}
        title={isMuted ? 'Réactiver le micro' : 'Couper le micro'}
      >
        {isMuted ? (
          <MicOff size={18} strokeWidth={1.5} />
        ) : (
          <Mic size={18} strokeWidth={1.5} />
        )}
      </button>

      {/* Gain Slider (expandable) */}
      <div 
        className={`
          flex items-center gap-2 overflow-hidden transition-all duration-200
          ${isExpanded ? 'w-28 opacity-100' : 'w-0 opacity-0'}
        `}
      >
        <Slider
          value={[isMuted ? 0 : gain]}
          min={0}
          max={100}
          step={1}
          onValueChange={([val]) => onGainChange(val)}
          disabled={isMuted}
          className="mic-gain-slider"
        />
        <span className="text-xs text-white/50 w-8 text-right">
          {isMuted ? '0' : gain}%
        </span>
      </div>
    </div>
  );
};

export default HostMicControl;
