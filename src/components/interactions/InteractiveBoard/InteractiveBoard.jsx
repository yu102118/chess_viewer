import { memo, useCallback, useMemo, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from '@/constants';
import { DroppableSquare } from '@/components/interactions';
import { areBoardsEqual } from '@/utils';

/**
 * Drag-and-drop chess board built on react-dnd.
 * Renders 64 DroppableSquare cells and dispatches piece-drop events to the parent.
 * @param {Object} props
 * @param {string[][]} props.board - 8×8 board array of FEN piece characters
 * @param {string} props.lightSquare - Hex color for light squares
 * @param {string} props.darkSquare - Hex color for dark squares
 * @param {Object} props.pieceImages - Map of piece keys to preloaded Image elements
 * @param {boolean} props.isLoading - Whether piece images are still loading
 * @param {boolean} [props.flipped] - Whether the board is rendered from Black's perspective
 * @param {Function} [props.onPieceDrop] - Called with `(piece, fromRow, fromCol, toRow, toCol, isFromPalette)`
 * @param {Function} [props.onPieceRemove] - Called when a piece is dropped on the trash zone
 * @returns {JSX.Element}
 */
const InteractiveBoard = memo(
  ({
    board,
    lightSquare,
    darkSquare,
    pieceImages,
    isLoading,
    flipped,
    onPieceDrop,
    onPieceRemove: _onPieceRemove
  }) => {
    const boardRef = useRef(null);

    const handleDrop = useCallback(
      (piece, fromRow, fromCol, toRow, toCol, isFromPalette) => {
        if (onPieceDrop) {
          onPieceDrop(piece, fromRow, fromCol, toRow, toCol, isFromPalette);
        }
      },
      [onPieceDrop]
    );

    // Drop zone wrapper
    const [, boardDropRef] = useDrop(
      () => ({
        accept: ItemTypes.PIECE,
        collect: (monitor) => ({
          isOver: monitor.isOver({ shallow: true })
        })
      }),
      []
    );

    // Combine refs
    const setRefs = useCallback(
      (node) => {
        boardRef.current = node;
        boardDropRef(node);
      },
      [boardDropRef]
    );

    // Generate squares with proper display order based on flip state
    const squares = useMemo(() => {
      const result = [];

      for (let displayRow = 0; displayRow < 8; displayRow++) {
        for (let displayCol = 0; displayCol < 8; displayCol++) {
          // Calculate actual board indices based on flip state
          const actualRow = flipped ? 7 - displayRow : displayRow;
          const actualCol = flipped ? 7 - displayCol : displayCol;

          // Determine square color (a1 is dark, h1 is light)
          const isLight = (actualRow + actualCol) % 2 === 0;
          const piece = board[actualRow]?.[actualCol] || '';

          // Get piece image
          let pieceImage = null;
          if (piece) {
            const color = piece === piece.toUpperCase() ? 'w' : 'b';
            const pieceKey = color + piece.toUpperCase();
            pieceImage = pieceImages[pieceKey];
          }

          result.push(
            <DroppableSquare
              key={`square-${actualRow}-${actualCol}`}
              row={actualRow}
              col={actualCol}
              piece={piece}
              isLight={isLight}
              lightColor={lightSquare}
              darkColor={darkSquare}
              pieceImage={pieceImage}
              onDrop={handleDrop}
              isLoading={isLoading}
            />
          );
        }
      }

      return result;
    }, [
      board,
      lightSquare,
      darkSquare,
      pieceImages,
      isLoading,
      flipped,
      handleDrop
    ]);

    return (
      <div
        ref={setRefs}
        className="grid grid-cols-8 grid-rows-8 gap-0 overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          width: '100%',
          height: '100%',
          zIndex: 1,
          contain: 'layout style paint',
          borderRadius: '0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      >
        {squares}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      areBoardsEqual(prevProps.board, nextProps.board) &&
      prevProps.lightSquare === nextProps.lightSquare &&
      prevProps.darkSquare === nextProps.darkSquare &&
      prevProps.pieceImages === nextProps.pieceImages &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.flipped === nextProps.flipped &&
      prevProps.onPieceDrop === nextProps.onPieceDrop
    );
  }
);

InteractiveBoard.displayName = 'InteractiveBoard';

export default InteractiveBoard;
