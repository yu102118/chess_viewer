import { createContext } from 'react';

/**
 * Shared context object for FEN batch state.
 *
 * @type {import('react').Context<Object|null>}
 */
export const FENBatchContext = createContext(null);
