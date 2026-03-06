import { Checkbox } from '@/components/ui';
import { QUALITY_PRESETS } from '@/constants';

/**
 * Coordinate and frame display toggles for the chess board.
 * @param {Object} props
 * @param {boolean} props.showCoords - Whether coordinates are rendered on the board
 * @param {Function} props.setShowCoords - Toggles coordinate display
 * @param {boolean} props.showCoordinateBorder - Whether the coordinate border is shown
 * @param {Function} props.setShowCoordinateBorder - Toggles coordinate border
 * @param {boolean} [props.showThinFrame] - Whether a thin frame around the board is shown
 * @param {Function} props.setShowThinFrame - Toggles thin frame
 * @param {number} [props.exportQuality=16] - Current export quality/scale multiplier
 * @returns {JSX.Element}
 */
const DisplayOptions = ({
  showCoords,
  setShowCoords,
  showCoordinateBorder,
  setShowCoordinateBorder,
  showThinFrame,
  setShowThinFrame,
  exportQuality = 16
}) => {
  const preset = QUALITY_PRESETS.find((p) => p.value === exportQuality);
  const isBorderForced = preset?.forceCoordinateBorder || false;
  const isSocialMode = preset?.mode === 'social';
  const isPrintMode = preset?.mode === 'print';
  const canShowFrame =
    isPrintMode && (exportQuality === 8 || exportQuality === 16);

  const effectiveBorderState = isBorderForced || showCoordinateBorder;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-text-secondary mb-3">
        Display Options
      </label>

      <Checkbox
        checked={showCoords}
        onChange={(e) => setShowCoords(e.target.checked)}
        label="Show Coordinates"
      />

      {showCoords && (
        <div className="ml-0">
          <Checkbox
            checked={effectiveBorderState}
            onChange={(e) => {
              if (!isBorderForced) {
                setShowCoordinateBorder(e.target.checked);
              }
            }}
            disabled={isBorderForced}
            label={
              <span className="flex items-center gap-2">
                Coordinate Border
                {isBorderForced && (
                  <span className="text-xs text-warning font-normal">
                    (Required for {exportQuality}× export)
                  </span>
                )}
              </span>
            }
          />
          {isSocialMode && (
            <p className="text-xs text-text-muted mt-1 ml-6">
              Border is required for social/zoom export modes (24×, 32×)
            </p>
          )}
        </div>
      )}

      {canShowFrame && (
        <Checkbox
          checked={showThinFrame || false}
          onChange={(e) => setShowThinFrame(e.target.checked)}
          label={
            <span className="flex items-center gap-2">
              Thin Frame
              <span className="text-xs text-text-muted font-normal">
                (8× and 16× only)
              </span>
            </span>
          }
        />
      )}
    </div>
  );
};

export default DisplayOptions;
