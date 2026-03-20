import {
  BOARD_THEMES,
  STANDARD_PRESETS_COUNT,
  STORAGE_KEYS,
  WOOD_PRESET
} from '@/constants';

/**
 * Builds the default preset list from built-in board themes.
 *
 * @returns {Object[]} Default preset objects
 */
export function getDefaultPresets() {
  const themes = Object.entries(BOARD_THEMES).slice(
    0,
    STANDARD_PRESETS_COUNT - 1
  );
  return [
    WOOD_PRESET,
    ...themes.map(([_key, t], i) => ({
      id: `preset-${i + 1}`,
      name: t.name,
      light: t.light,
      dark: t.dark,
      isDefault: true,
      isDeletable: true
    }))
  ];
}
/**
 * Loads saved presets from localStorage, ensuring the Wood preset is always first.
 *
 * @returns {Object[]} Loaded or default presets
 */
export function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESETS);
    if (raw) {
      const loaded = JSON.parse(raw);
      const hasWood = loaded.some((p) => p.id === WOOD_PRESET.id);
      if (!hasWood)
        return [WOOD_PRESET, ...loaded.filter((p) => p.id !== WOOD_PRESET.id)];
      return loaded;
    }
  } catch {
    return getDefaultPresets();
  }
  return getDefaultPresets();
}
/**
 * Saves presets to localStorage.
 *
 * @param {Object[]} presets
 */
export function savePresets(presets) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  } catch {
    return;
  }
}
/**
 * Reads a square color from localStorage, stripping surrounding quotes.
 *
 * @param {string} key - localStorage key
 * @param {string} fallback - Value to return on error or missing key
 * @returns {string}
 */
export function readSquare(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? v.replace(/"/g, '') : fallback;
  } catch {
    return fallback;
  }
}
