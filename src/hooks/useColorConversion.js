import { useCallback } from 'react';

/**
 * Provides memoized color conversion utilities.
 *
 * @returns {Object} Color conversion functions: hexToRgb, rgbToHex, rgbToHsv, hsvToRgb
 */
export const useColorConversion = () => {
  /**
   * Convert hex color string to RGB components.
   *
   * @param {string} hex - Hex color (e.g., '#ff0000')
   * @returns {Object|null} RGB object or null if invalid
   */
  const hexToRgb = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }, []);

  /**
   * Convert RGB components to hex color string.
   *
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {string} Hex color string
   */
  const rgbToHex = useCallback((r, g, b) => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = Math.max(0, Math.min(255, x)).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }, []);

  /**
   * Convert RGB to HSV (Hue, Saturation, Value).
   *
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {{ h: number, s: number, v: number }} HSV values
   */
  const rgbToHsv = useCallback((r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    let h = 0;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
  }, []);

  /**
   * Convert HSV to RGB.
   *
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} v - Value/Brightness (0-100)
   * @returns {{ r: number, g: number, b: number }} RGB values
   */
  const hsvToRgb = useCallback((h, s, v) => {
    h /= 360;
    s /= 100;
    v /= 100;
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        [r, g, b] = [v, t, p];
        break;
      case 1:
        [r, g, b] = [q, v, p];
        break;
      case 2:
        [r, g, b] = [p, v, t];
        break;
      case 3:
        [r, g, b] = [p, q, v];
        break;
      case 4:
        [r, g, b] = [t, p, v];
        break;
      case 5:
        [r, g, b] = [v, p, q];
        break;
      default:
        break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }, []);

  return {
    hexToRgb,
    rgbToHex,
    rgbToHsv,
    hsvToRgb
  };
};
