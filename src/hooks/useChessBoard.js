import { useMemo } from 'react';

import { logger, parseFEN } from '@/utils';
import { createEmptyBoard } from '@/utils/boardUtils';

/**
 * Parses a FEN string into a 2D board array for display.
 *
 * @param {string} fen - FEN string
 * @returns {{ board: string[][], positionStats: Object }}
 */
export function useChessBoard(fen) {
  const board = useMemo(() => {
    if (!fen || typeof fen !== 'string' || fen.trim() === '') {
      return createEmptyBoard();
    }
    try {
      const parsed = parseFEN(fen);
      if (!Array.isArray(parsed) || parsed.length !== 8) {
        logger.warn(
          'parseFEN returned invalid board, falling back to empty board'
        );
        return createEmptyBoard();
      }
      return parsed;
    } catch (error) {
      logger.error('Failed to parse FEN in useChessBoard:', error);
      return createEmptyBoard();
    }
  }, [fen]);
  return board;
}
