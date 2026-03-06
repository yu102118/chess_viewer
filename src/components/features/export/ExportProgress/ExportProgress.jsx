import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import { FileImage, Pause, Play, XCircle } from 'lucide-react';

/**
 * Modal with a smoothly animated progress bar shown during batch or multi-format exports.
 * @param {Object} props
 * @param {boolean} props.isExporting - Whether an export is in progress
 * @param {number} props.progress - Export progress (0–100)
 * @param {string} [props.currentFormat] - The format currently being exported
 * @param {Function} props.onClose - Closes the modal
 * @param {Function} [props.onPause] - Pauses the export
 * @param {Function} [props.onResume] - Resumes a paused export
 * @param {Function} [props.onCancel] - Cancels the export
 * @param {boolean} [props.isPaused] - Whether the export is currently paused
 * @returns {JSX.Element}
 */
const ExportProgress = React.memo(
  ({
    isExporting,
    progress,
    currentFormat,
    onClose,
    onPause,
    onResume,
    onCancel,
    isPaused
  }) => {
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
      if (!isExporting || isPaused) return;

      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          if (prev >= progress) return progress;
          const diff = progress - prev;
          const increment = Math.max(2, Math.min(10, diff / 3));
          return Math.min(progress, prev + increment);
        });
      }, 50);

      return () => clearInterval(interval);
    }, [progress, isExporting, isPaused]);

    useEffect(() => {
      if (!isExporting) {
        setDisplayProgress(0);
      }
    }, [isExporting]);

    if (!isExporting) return null;

    const format = currentFormat || 'png';

    return (
      <Modal
        isOpen={isExporting}
        onClose={onClose || (() => {})}
        title={`Exporting ${format.toUpperCase()}`}
        icon={FileImage}
        iconColor="text-accent"
        maxWidth="max-w-md"
        showCloseButton={!!onClose}
        disableBackdropClick={true}
      >
        <div className="space-y-5">
          <p className="text-sm text-text-secondary">
            {isPaused ? '⏸ Paused' : 'Creating high-quality image...'}
          </p>

          <div className="space-y-3">
            <div
              className="relative h-2 bg-surface-elevated rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={displayProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-150 ease-linear overflow-hidden"
                style={{ width: `${displayProgress}%` }}
              >
                {!isPaused && (
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                )}
              </div>
            </div>
            <p className="text-center text-sm font-semibold text-text-primary">
              {Math.round(displayProgress)}% complete
            </p>
          </div>

          <div className="flex gap-3">
            {onPause && onResume && (
              <button
                onClick={isPaused ? onResume : onPause}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-elevated hover:bg-surface-hover border border-border rounded-lg transition-colors text-text-primary font-semibold text-sm"
                aria-label={isPaused ? 'Resume export' : 'Pause export'}
              >
                {isPaused ? (
                  <>
                    <Play
                      className="w-4 h-4"
                      strokeWidth={2.5}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause
                      className="w-4 h-4"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                    <span>Pause</span>
                  </>
                )}
              </button>
            )}

            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-error/10 hover:bg-error/20 border border-error/30 rounded-lg transition-colors text-error font-semibold text-sm"
                aria-label="Cancel export"
              >
                <XCircle
                  className="w-4 h-4"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </Modal>
    );
  }
);

ExportProgress.displayName = 'ExportProgress';

export default ExportProgress;
