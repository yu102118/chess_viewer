import React from 'react';
import BoardSquare from '../BoardSquare';

/**
 * Custom memo comparator — performs a shallow board comparison to avoid deep-equal
 * on every render. Falls back to stringifying flattened rows when the board reference changes.
 * @param {Object} prevProps - Previous props
 * @param {Object} nextProps - Next props
 * @returns {boolean} True if the component should NOT re-render
 */
function arePropsEqual(prevProps, nextProps) {
  if (prevProps.board === nextProps.board) {
    return (
      prevProps.lightSquare === nextProps.lightSquare &&
      prevProps.darkSquare === nextProps.darkSquare &&
      prevProps.flipped === nextProps.flipped &&
      prevProps.pieceImages === nextProps.pieceImages
    );
  }

  try {
    const prevFlat = (prevProps.board || []).flat().join(',');
    const nextFlat = (nextProps.board || []).flat().join(',');

    return (
      prevFlat === nextFlat &&
      prevProps.lightSquare === nextProps.lightSquare &&
      prevProps.darkSquare === nextProps.darkSquare &&
      prevProps.flipped === nextProps.flipped &&
      prevProps.pieceImages === nextProps.pieceImages
    );
  } catch {
    return false;
  }
}

/**
 * Renders the 8×8 chess board grid by mapping each cell to a BoardSquare.
 * @param {Object} props
 * @param {string[][]} props.board - 8×8 board array of FEN piece characters
 * @param {string} props.lightSquare - Hex color for light squares
 * @param {string} props.darkSquare - Hex color for dark squares
 * @param {Object} props.pieceImages - Map of piece keys to preloaded Image elements
 * @param {boolean} [props.flipped] - Whether the board should be rendered flipped
 * @returns {JSX.Element}
 */
const BoardGrid = React.memo(function BoardGrid(props) {
  const { board, lightSquare, darkSquare, pieceImages } = props;

  return (
    <div className="grid grid-cols-8 gap-0">
      {Array.from({ length: 64 }).map((_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const isLight = (row + col) % 2 === 0;
        const piece = board[row]?.[col] || '';

        return (
          <BoardSquare
            key={`square-${row}-${col}`}
            piece={piece}
            isLight={isLight}
            lightSquare={lightSquare}
            darkSquare={darkSquare}
            pieceImages={pieceImages}
            row={row}
            col={col}
          />
        );
      })}
    </div>
  );
}, arePropsEqual);

BoardGrid.displayName = 'BoardGrid';

export default BoardGrid;
