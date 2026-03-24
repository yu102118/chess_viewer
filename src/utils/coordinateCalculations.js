/**
 * Calculates coordinate label display parameters based on board pixel size.
 *
 * @param {number} boardSize - Board width/height in pixels
 * @returns {{ fontSize: number, borderSize: number, fontWeight: number, offset: number }}
 */
export function getCoordinateParams(boardSize) {
  const borderSize = Math.round(Math.max(18, Math.min(800, boardSize * 0.05)));
  const fontSize = Math.round(Math.max(10, Math.min(480, borderSize * 0.72)));
  return {
    fontSize: fontSize,
    borderSize: borderSize,
    fontWeight: 600,
    offset: Math.round(borderSize / 2)
  };
}
/**
 * @param {number} borderSize
 * @param {number} squareSize
 * @param {number} index
 * @returns {number} Center pixel of the square at the given index
 */
function getCellCenter(borderSize, squareSize, index) {
  const start = Math.round(borderSize + index * squareSize);
  const end = Math.round(borderSize + (index + 1) * squareSize);
  return Math.round((start + end) / 2);
}
/**
 * Measures text ascent/descent from the canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} sample - Sample character to measure
 * @param {number} fontSize
 * @returns {{ ascent: number, descent: number, height: number }}
 */
function getTextMetrics(ctx, sample, fontSize) {
  const metrics = ctx.measureText(sample);
  let ascent = fontSize * 0.8;
  if (Number.isFinite(metrics.actualBoundingBoxAscent)) {
    ascent = metrics.actualBoundingBoxAscent;
  }
  let descent = fontSize * 0.2;
  if (Number.isFinite(metrics.actualBoundingBoxDescent)) {
    descent = metrics.actualBoundingBoxDescent;
  }
  const height = ascent + descent;
  return {
    ascent: ascent,
    descent: descent,
    height: height
  };
}
/**
 * @param {number} centerY
 * @param {{ ascent: number, descent: number }} metrics
 * @returns {number} Baseline Y position
 */
function getBaselineFromCenter(centerY, metrics) {
  return Math.round(centerY + (metrics.ascent - metrics.descent) / 2);
}
/**
 * Draws rank and file coordinate labels onto a canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} squareSize - Pixel size of one square
 * @param {number} borderSize - Width of the coordinate border area
 * @param {boolean} flipped - Whether the board is flipped
 * @param {number} boardSize - Total board pixel size (excluding border)
 * @param {boolean} [forExport=false] - Use black text for export output
 * @param {boolean} [displayWhite=true] - Use white text for dark backgrounds
 * @param {number} [boardStartY] - Y offset of the board origin
 */
export function drawCoordinates(
  ctx,
  squareSize,
  borderSize,
  flipped,
  boardSize,
  forExport,
  displayWhite,
  boardStartY
) {
  if (forExport === undefined) {
    forExport = false;
  }
  if (displayWhite === undefined) {
    displayWhite = true;
  }
  const coordParams = getCoordinateParams(boardSize);
  const fontSize = coordParams.fontSize;
  const fontWeight = coordParams.fontWeight;
  let effectiveBorder = borderSize;
  if (effectiveBorder === null || effectiveBorder === undefined) {
    effectiveBorder = coordParams.borderSize;
  }
  let boardY;
  if (boardStartY !== null && boardStartY !== undefined) {
    boardY = boardStartY;
  } else if (forExport) {
    boardY = 0;
  } else {
    boardY = effectiveBorder;
  }
  ctx.save();
  ctx.font =
    fontWeight +
    ' ' +
    fontSize +
    'px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  if (forExport) {
    ctx.fillStyle = '#000000';
  } else if (displayWhite) {
    ctx.fillStyle = '#ffffff';
  } else {
    ctx.fillStyle = '#000000';
  }
  ctx.textRendering = 'optimizeLegibility';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const rankMetrics = getTextMetrics(ctx, '8', fontSize);
  const fileMetrics = getTextMetrics(ctx, 'g', fontSize);
  for (let row = 0; row < 8; row++) {
    let rank;
    if (flipped) {
      rank = row + 1;
    } else {
      rank = 8 - row;
    }
    const squareTop = boardY + row * squareSize;
    const squareBottom = boardY + (row + 1) * squareSize;
    const centerY = Math.round((squareTop + squareBottom) / 2);
    const yPos = getBaselineFromCenter(centerY, rankMetrics);
    const xPos = Math.round(effectiveBorder * 0.5);
    ctx.fillText(rank.toString(), xPos, yPos);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (let col = 0; col < 8; col++) {
    let fileIndex;
    if (flipped) {
      fileIndex = 7 - col;
    } else {
      fileIndex = col;
    }
    const file = String.fromCharCode(97 + fileIndex);
    const xPos = getCellCenter(effectiveBorder, squareSize, col);
    const bottomCenter = Math.round(
      boardY + boardSize + effectiveBorder * 0.55
    );
    const yPos = getBaselineFromCenter(bottomCenter, fileMetrics);
    ctx.fillText(file, xPos, yPos);
  }
  ctx.restore();
}
