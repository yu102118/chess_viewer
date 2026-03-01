/**
 * Global Piece Image Cache
 *
 * Chess piece images are loaded from the internet (Lichess server).
 * Loading the same images repeatedly wastes time and bandwidth.
 *
 * This cache stores loaded images so they can be reused instantly.
 * It's shared across all components — if one component loads the images,
 * all other components can use them without reloading.
 */

// The main cache: stores piece images for each style (e.g., 'cburnett', 'alpha')
const globalPieceCache = new Map();

// Tracks in-flight load promises so concurrent callers share the same request
// instead of each starting their own (replaces the spinning-setInterval pattern).
const loadingPromises = new Map();

// --- legacy helpers kept for backwards compatibility ---
// Tracks which styles are currently being loaded (prevents duplicate loads)
const loadingStyles = new Set();

/**
 * Get cached images for a piece style.
 *
 * @param {string} pieceStyle - The style name (e.g., 'cburnett')
 * @returns {Object|null} - The cached images, or null if not cached yet
 */
export function getCachedPieces(pieceStyle) {
  const cached = globalPieceCache.get(pieceStyle);
  if (cached) {
    return cached;
  }
  return null;
}

/**
 * Store images in the cache for a piece style.
 *
 * @param {string} pieceStyle - The style name
 * @param {Object} images - An object where keys are piece names and values are Image objects
 */
export function setCachedPieces(pieceStyle, images) {
  globalPieceCache.set(pieceStyle, images);
}

/**
 * Check if a piece style is currently being loaded by another component.
 *
 * @param {string} pieceStyle - The style name
 * @returns {boolean} - true if the style is currently loading
 */
export function isStyleLoading(pieceStyle) {
  return loadingStyles.has(pieceStyle);
}

/**
 * Mark a piece style as "currently loading".
 * This prevents other components from starting a duplicate load.
 *
 * @param {string} pieceStyle - The style name
 */
export function markStyleLoading(pieceStyle) {
  loadingStyles.add(pieceStyle);
}

/**
 * Mark a piece style as "finished loading".
 *
 * @param {string} pieceStyle - The style name
 */
export function markStyleLoaded(pieceStyle) {
  loadingStyles.delete(pieceStyle);
}

/**
 * Clear the entire cache. Use this sparingly — it forces all images
 * to be reloaded from the internet.
 */
export function clearPieceCache() {
  globalPieceCache.clear();
  loadingStyles.clear();
}

/**
 * Preload piece images for a specific style.
 * This loads all piece images ahead of time so they're ready when needed.
 *
 * @param {string} pieceStyle - The style name (e.g., 'cburnett')
 * @param {Object} PIECE_MAP - Object mapping piece keys to file names
 * @returns {Promise<Object>} - The loaded images
 */
export async function preloadPieceStyle(pieceStyle, PIECE_MAP) {
  // 1. Already cached — return immediately
  const cached = getCachedPieces(pieceStyle);
  if (cached) {
    return cached;
  }

  // 2. Load already in-flight — share the existing Promise instead of
  //    spinning a setInterval that blocks the main thread.
  if (loadingPromises.has(pieceStyle)) {
    return loadingPromises.get(pieceStyle);
  }

  // 3. Start a new load and register the Promise so all subsequent callers
  //    get the same reference.
  markStyleLoading(pieceStyle);

  const images = {};
  const keys = Object.keys(PIECE_MAP);

  const promise = Promise.all(
    keys.map(
      (key) =>
        new Promise(function (resolve) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          const url =
            'https://lichess1.org/assets/piece/' +
            pieceStyle +
            '/' +
            PIECE_MAP[key] +
            '.svg';

          img.onload = function () {
            images[key] = img;
            resolve();
          };

          img.onerror = function () {
            images[key] = null;
            resolve();
          };

          img.src = url;
        })
    )
  ).then(function () {
    setCachedPieces(pieceStyle, images);
    markStyleLoaded(pieceStyle);
    loadingPromises.delete(pieceStyle);
    return images;
  });

  loadingPromises.set(pieceStyle, promise);
  return promise;
}

// Module-level preload side effect removed.
// Eagerly loading pieces on every import (even on pages that don't show a board)
// wastes bandwidth and saturates the network right when the page is loading
// its own critical assets. Call preloadPieceStyle() explicitly from the
// component or page that actually renders a chess board.
