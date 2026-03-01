import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react';
import { validateFEN } from '@/utils';

const FENBatchContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useFENBatch = () => {
  const context = useContext(FENBatchContext);
  if (!context) {
    throw new Error('useFENBatch must be used within FENBatchProvider');
  }
  return context;
};

export const FENBatchProvider = ({ children }) => {
  const [batchList, setBatchList] = useState(() => {
    try {
      const saved = localStorage.getItem('fenBatchList');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('fenBatchList', JSON.stringify(batchList));
  }, [batchList]);

  const addToBatch = useCallback(
    (fen) => {
      if (!fen || !validateFEN(fen)) {
        return false;
      }
      const trimmedFen = fen.trim();

      // Use functional updater so this callback never closes over stale batchList,
      // giving it a stable reference that doesn't cause child re-renders.
      let added = false;
      setBatchList((prev) => {
        if (prev.includes(trimmedFen)) return prev;
        added = true;
        return [...prev, trimmedFen];
      });
      return added;
    },
    [] // stable — no batchList dependency
  );

  const removeFromBatch = useCallback((index) => {
    setBatchList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearBatch = useCallback(() => {
    setBatchList([]);
  }, []);

  const updateBatchItem = useCallback((index, newFen) => {
    if (!newFen || !validateFEN(newFen)) {
      return false;
    }
    setBatchList((prev) => {
      const updated = [...prev];
      updated[index] = newFen.trim();
      return updated;
    });
    return true;
  }, []);

  const value = {
    batchList,
    addToBatch,
    removeFromBatch,
    clearBatch,
    updateBatchItem
  };

  return (
    <FENBatchContext.Provider value={value}>
      {children}
    </FENBatchContext.Provider>
  );
};
