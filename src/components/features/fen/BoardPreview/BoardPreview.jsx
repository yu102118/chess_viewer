import { memo } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Star } from 'lucide-react';

/**
 * Interactive board preview with playback controls and favorite toggles.
 * @param {Object} props
 * @param {string[]} props.validFens - Array of FEN strings to cycle through
 * @param {number} props.currentIndex - Index of the currently displayed FEN
 * @param {string} props.currentFen - FEN string at `currentIndex`
 * @param {Object} props.boardState - Current board state object
 * @param {Object} props.currentTheme - Theme colors for the board
 * @param {Object} props.pieceImages - Map of piece keys to preloaded images
 * @param {boolean} props.imagesLoading - Whether images are still loading
 * @param {string[]} props.favorites - Array of favorited FEN strings
 * @param {boolean} props.isPlaying - Whether auto-play is active
 * @param {number} props.interval - Auto-play interval in ms
 * @param {number[]} props.intervalOptions - Available interval options
 * @param {boolean} props.showIntervalMenu - Whether the interval selection dropdown is open
 * @param {Function} props.onSetInterval - Called with a new interval value
 * @param {Function} props.onToggleIntervalMenu - Toggles the interval dropdown
 * @param {Function} props.onTogglePlay - Toggles playback on/off
 * @param {Function} props.onPrevious - Moves to the previous FEN
 * @param {Function} props.onNext - Moves to the next FEN
 * @param {Function} props.onSetIndex - Jumps to a specific index
 * @returns {JSX.Element|null}
 */
const BoardPreview = memo(
  ({
    validFens,
    currentIndex,
    currentFen,
    boardState,
    currentTheme,
    pieceImages,
    imagesLoading,
    favorites,
    isPlaying,
    interval,
    intervalOptions,
    showIntervalMenu,
    onSetInterval,
    onToggleIntervalMenu,
    onTogglePlay,
    onPrevious,
    onNext,
    onSetIndex
  }) => {
    if (validFens.length === 0) {
      return null;
    }

    return (
      <div className="bg-gray-800/50 border border-gray-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={onToggleIntervalMenu}
                className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 border border-gray-700 hover:bg-gray-800 transition-colors"
                aria-label="Select slideshow interval"
                aria-expanded={showIntervalMenu}
              >
                <span className="text-xs text-gray-400">Interval:</span>
                <span className="text-sm font-semibold text-white">
                  {interval}s
                </span>
              </button>
              {showIntervalMenu && (
                <div
                  className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden min-w-[100px]"
                  role="menu"
                >
                  {intervalOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onSetInterval(option.value)}
                      className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                        interval === option.value
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      role="menuitem"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onTogglePlay}
              disabled={validFens.length < 2}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              aria-label={isPlaying ? 'Pause slideshow' : 'Start slideshow'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        <div className="relative bg-gray-900 rounded-lg border border-gray-700 p-6">
          <div className="text-center mb-4">
            <div className="inline-block bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <span className="text-sm text-gray-400">Position </span>
              <span className="text-lg font-bold text-white">
                {currentIndex + 1}
              </span>
              <span className="text-sm text-gray-400">
                {' '}
                of {validFens.length}
              </span>
            </div>
          </div>

          <div
            className="mx-auto aspect-square max-w-lg"
            role="img"
            aria-label={`Chess board showing position ${currentIndex + 1}`}
          >
            <div className="grid grid-cols-8 gap-0 overflow-hidden shadow-2xl rounded-lg">
              {Array.from({ length: 64 }).map((_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const isLight = (row + col) % 2 === 0;
                const piece = boardState[row]?.[col] || '';
                return (
                  <div
                    key={`sq-${row}-${col}`}
                    className="aspect-square flex items-center justify-center relative"
                    style={{
                      backgroundColor: isLight
                        ? currentTheme.light
                        : currentTheme.dark,
                      outline: '1px solid transparent'
                    }}
                  >
                    {piece && pieceImages[piece] && !imagesLoading && (
                      <img
                        src={pieceImages[piece].src}
                        alt={piece}
                        className="w-[85%] h-[85%] object-contain"
                        draggable="false"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              {favorites[currentFen] && (
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              )}
              <p className="text-xs font-mono text-gray-400 break-all max-w-xl">
                {currentFen}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={onPrevious}
              disabled={validFens.length < 2}
              className="p-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded-lg transition-colors"
              aria-label="Previous position"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex gap-2" role="tablist">
              {validFens.map((fenVal, idx) => (
                <button
                  key={fenVal}
                  onClick={() => onSetIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-blue-500 w-8'
                      : 'bg-gray-600 hover:bg-gray-500 w-2.5'
                  }`}
                  aria-label={`Go to position ${idx + 1}`}
                  aria-selected={idx === currentIndex}
                  role="tab"
                />
              ))}
            </div>
            <button
              onClick={onNext}
              disabled={validFens.length < 2}
              className="p-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:cursor-not-allowed rounded-lg transition-colors"
              aria-label="Next position"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

BoardPreview.displayName = 'BoardPreview';

export default BoardPreview;
