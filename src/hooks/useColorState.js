import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/utils/logger';

/**
 * Manages color picker modal state and user interactions.
 *
 * @param {string} initialValue - Initial hex color value
 * @returns {Object} Color state and interaction handlers
 */
export const useColorState = (initialValue) => {
  const [hexInput, setHexInput] = useState(initialValue);
  const [tempColor, setTempColor] = useState(initialValue);
  const [copiedText, setCopiedText] = useState('');
  const [activePalette, setActivePalette] = useState('basic');
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Select a color from the palette.
   *
   * @param {string} color - Hex color to select
   */
  const handleColorSelect = useCallback((color) => {
    setTempColor(color);
    setHexInput(color);
  }, []);

  /**
   * Generate and apply a random hex color.
   */
  const handleRandom = useCallback(() => {
    const randomColor =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    setTempColor(randomColor);
    setHexInput(randomColor);
  }, []);

  /**
   * Reset color to the original value.
   *
   * @param {string} originalValue - Original hex color to restore
   */
  const handleReset = useCallback((originalValue) => {
    setTempColor(originalValue);
    setHexInput(originalValue);
  }, []);

  /**
   * Copy text to clipboard and briefly show confirmation.
   *
   * @param {string} text - Text to copy to clipboard
   */
  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  }, []);

  /**
   * Toggle the color picker modal open/closed.
   */
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Close the color picker modal.
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    hexInput,
    setHexInput,
    tempColor,
    setTempColor,
    copiedText,
    activePalette,
    setActivePalette,
    isOpen,
    handleColorSelect,
    handleRandom,
    handleReset,
    handleCopy,
    toggleOpen,
    closeModal
  };
};
