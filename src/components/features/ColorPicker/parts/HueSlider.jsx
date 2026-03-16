import { memo, useCallback, useMemo, useState } from 'react';

/**
 * @param {Object} props
 * @returns {JSX.Element}
 */
const HueSlider = memo(
  function HueSlider({ value: _value, onChange, getCurrentHue }) {
    const [isDragging, setIsDragging] = useState(false);
    const currentHue = getCurrentHue();
    const getCurrentColor = useCallback((hue) => {
      return `hsl(${hue}, 100%, 50%)`;
    }, []);
    const getColorName = useCallback((hue) => {
      if (hue < 30 || hue >= 330) return 'Red';
      if (hue < 90) return 'Yellow';
      if (hue < 150) return 'Green';
      if (hue < 210) return 'Cyan';
      if (hue < 270) return 'Blue';
      return 'Magenta';
    }, []);
    const handleMouseDown = useCallback(() => setIsDragging(true), []);
    const handleMouseUp = useCallback(() => setIsDragging(false), []);
    const degreeMarkers = useMemo(() => [0, 60, 120, 180, 240, 300, 360], []);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
            <svg
              className="w-4 h-4 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            Hue Rotation
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full border-2 border-border shadow-lg transition-all duration-200 relative"
              style={{
                background: getCurrentColor(currentHue),
                transform: isDragging ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isDragging
                  ? `0 0 20px ${getCurrentColor(currentHue)}80`
                  : '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {isDragging && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-50"
                  style={{
                    background: getCurrentColor(currentHue)
                  }}
                />
              )}
            </div>
            <div className="flex items-center gap-1 bg-gradient-to-br from-surface-elevated to-bg px-3 py-1.5 rounded-lg border border-border shadow-md">
              <span className="text-base font-bold text-text-primary font-mono">
                {Math.round(currentHue)}
              </span>
              <span className="text-xs text-text-muted font-semibold">°</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative h-14 rounded-xl overflow-hidden border-2 border-border shadow-inner bg-bg">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={currentHue}
              onChange={onChange}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              className="hue-slider w-full h-full appearance-none cursor-pointer bg-transparent relative z-10"
            />
          </div>

          <div className="flex justify-between mt-2.5 px-1">
            {degreeMarkers.map((degree) => (
              <div key={degree} className="flex flex-col items-center">
                <div
                  className={`h-2 rounded-full transition-all ${Math.abs(currentHue - degree) < 10 ? 'w-0.5 bg-accent' : 'w-px bg-border'}`}
                />
                <span
                  className={`text-[10px] font-mono mt-1 transition-colors ${Math.abs(currentHue - degree) < 10 ? 'text-accent font-bold' : 'text-text-muted'}`}
                >
                  {degree}°
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-text-muted bg-surface-elevated/50 rounded-lg px-3 py-2 border border-border/50">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: getCurrentColor(currentHue)
            }}
          />
          <span className="font-semibold">{getColorName(currentHue)}</span>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted">
            HSL({Math.round(currentHue)}, 100%, 50%)
          </span>
        </div>

        <style>{`
          .hue-slider {
            background: linear-gradient(to right, hsl(0, 100%, 50%) 0%, hsl(60, 100%, 50%) 17%,
              hsl(120, 100%, 50%) 33%, hsl(180, 100%, 50%) 50%, hsl(240, 100%, 50%) 67%,
              hsl(300, 100%, 50%) 83%, hsl(360, 100%, 50%) 100%);
          }
          .hue-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 32px; height: 32px; border-radius: 50%;
            background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
            border: 3px solid rgb(var(--color-bg)); cursor: grab;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7), 0 0 0 3px rgb(var(--color-accent) / 0.4),
              inset 0 2px 4px rgba(255, 255, 255, 0.3);
            transition: all 0.2s ease;
          }
          .hue-slider::-webkit-slider-thumb:hover {
            transform: scale(1.25);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.8), 0 0 0 4px rgb(var(--color-accent) / 0.6),
              inset 0 2px 4px rgba(255, 255, 255, 0.5);
          }
          .hue-slider::-webkit-slider-thumb:active {
            cursor: grabbing; transform: scale(1.2);
          }
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
          .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.getCurrentHue() === nextProps.getCurrentHue();
  }
);
HueSlider.displayName = 'HueSlider';
export default HueSlider;
