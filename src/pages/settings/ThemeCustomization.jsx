import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import { BOARD_THEMES } from '@/constants';
import { hexToRgb, rgbToHsv, hsvToRgb, rgbToHex } from '@/utils';
import {
  Check,
  Palette,
  Wand2,
  Pencil,
  Trash2,
  X,
  Plus,
  GripVertical,
  AlertTriangle
} from 'lucide-react';

const MAX_TOTAL_PRESETS = 48;
const STANDARD_PRESETS_COUNT = 19;
const RANK_GUTTER = 20;
const BOARD_SIZE_EXPR = 'min(52vh, 46vw)';
const CELL_SIZE_EXPR = `calc(${BOARD_SIZE_EXPR} / 8)`;

const STORAGE_KEYS = {
  PRESETS: 'chess-diagram-presets',
  SETTINGS: 'chess-diagram-settings',
  LIGHT_SQUARE: 'chess-light-square',
  DARK_SQUARE: 'chess-dark-square'
};

const WOOD_PRESET = {
  id: 'wood-default',
  name: 'Wood',
  light: '#d4af7a',
  dark: '#8b4513',
  isDefault: true,
  isDeletable: false,
  isEditable: false
};

/**
 * @returns {Array<Object>} Default theme presets including Wood
 */
function getDefaultPresets() {
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
 * @returns {Array<Object>} Loaded presets from localStorage or defaults
 */
function loadPresets() {
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
 * @param {Array<Object>} presets - Presets to persist
 * @returns {void}
 */
function savePresets(presets) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
  } catch {
    /* silent */
  }
}

/**
 * @param {string} key - localStorage key
 * @param {string} fallback - Fallback color value
 * @returns {string} Stored or fallback color
 */
function readSquare(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? v.replace(/"/g, '') : fallback;
  } catch {
    return fallback;
  }
}

/**
 * @param {Object} props
 * @param {string} props.light - Light square color
 * @param {string} props.dark - Dark square color
 * @returns {JSX.Element}
 */
const BoardPreview = memo(({ light, dark }) => {
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return (
    <div className="flex items-center justify-center min-h-0 h-full select-none">
      <div className="inline-flex flex-col">
        <div className="flex">
          <div
            className="flex flex-col flex-shrink-0"
            style={{ width: RANK_GUTTER }}
          >
            {ranks.map((n) => (
              <div
                key={n}
                className="flex items-center justify-center text-[12px] font-bold text-text-primary"
                style={{ height: CELL_SIZE_EXPR }}
              >
                {n}
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-8 overflow-hidden border border-border"
            style={{
              width: BOARD_SIZE_EXPR,
              height: BOARD_SIZE_EXPR,
              contain: 'strict'
            }}
          >
            {Array.from({ length: 64 }).map((_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isLight = (row + col) % 2 === 0;
              return (
                <div
                  key={`sq-${row}-${col}`}
                  className="transition-colors duration-200"
                  style={{
                    backgroundColor: isLight ? light : dark,
                    outline: '1px solid transparent'
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="flex" style={{ paddingLeft: RANK_GUTTER }}>
          {files.map((l) => (
            <div
              key={l}
              className="text-[12px] font-bold text-text-primary text-center mt-1"
              style={{ width: CELL_SIZE_EXPR }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
BoardPreview.displayName = 'BoardPreview';

/**
 * @param {Object} props
 * @param {Object} props.preset - Theme preset data
 * @param {boolean} props.isActive - Whether this preset is currently selected
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.editMode - Whether edit mode is active
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onRename - Rename handler
 * @param {string|null} props.dragOverId - ID of preset being dragged over
 * @param {Function} props.onDragStart - Drag start handler
 * @param {Function} props.onDragOver - Drag over handler
 * @param {Function} props.onDrop - Drop handler
 * @param {Function} props.onDragEnd - Drag end handler
 * @returns {JSX.Element}
 */
const PresetCard = memo(
  ({
    preset,
    isActive,
    onClick,
    editMode,
    onEdit,
    onDelete,
    onRename,
    dragOverId,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd
  }) => {
    const [hovered, setHovered] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [nameValue, setNameValue] = useState(preset.name);
    const inputRef = useRef(null);
    const isWood = preset.id === WOOD_PRESET.id;
    const canDelete = !isWood && preset.isDeletable !== false;
    const isDragTarget = dragOverId === preset.id;

    useEffect(() => {
      if (isRenaming && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isRenaming]);

    /**
     * @param {Event} e - Keydown event
     * @returns {void}
     */
    const handleRenameKeyDown = (e) => {
      if (e.key === 'Enter') {
        onRename(preset.id, nameValue.trim() || preset.name);
        setIsRenaming(false);
      } else if (e.key === 'Escape') {
        setNameValue(preset.name);
        setIsRenaming(false);
      }
    };

    /**
     * @returns {void}
     */
    const handleRenameBlur = () => {
      onRename(preset.id, nameValue.trim() || preset.name);
      setIsRenaming(false);
    };

    return (
      <div
        className={`relative transition-all duration-300 ${isDragTarget ? 'scale-95' : ''}`}
      >
        {isDragTarget && (
          <div className="absolute inset-0 border-2 border-dashed border-accent/60 rounded-lg bg-accent/5 z-10 pointer-events-none" />
        )}
        <button
          onClick={() => !editMode && onClick(preset)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          draggable={editMode}
          onDragStart={(e) => onDragStart?.(e, preset)}
          onDragOver={(e) => onDragOver?.(e, preset)}
          onDrop={(e) => onDrop?.(e, preset)}
          onDragEnd={onDragEnd}
          aria-label={
            isWood
              ? `${preset.name} theme (default, not editable)`
              : `Apply ${preset.name} theme`
          }
          title={
            isWood && editMode
              ? 'Default theme — cannot be edited or deleted'
              : undefined
          }
          className={`group relative rounded-lg transition-all duration-200 overflow-hidden w-full ${
            isActive
              ? 'ring-2 ring-accent shadow-md scale-[1.02]'
              : 'hover:scale-[1.03] hover:shadow-sm'
          } ${editMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <div className="relative overflow-hidden rounded-lg">
            <div className="flex w-full h-12" aria-hidden="true">
              <div
                className="flex-1 transition-colors duration-300"
                style={{ backgroundColor: preset.light }}
              />
              <div
                className="flex-1 transition-colors duration-300"
                style={{ backgroundColor: preset.dark }}
              />
            </div>
            {!editMode && (
              <div
                className="absolute inset-0 bg-black/60 flex items-center justify-center transition-transform duration-300"
                style={{
                  transform: hovered ? 'translateX(0)' : 'translateX(100%)'
                }}
              >
                <span className="text-white text-[10px] font-bold tracking-wide px-1 text-center">
                  {preset.name}
                </span>
              </div>
            )}
            {isActive && !editMode && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center shadow">
                <Check className="w-2.5 h-2.5 text-bg" strokeWidth={3} />
              </div>
            )}
          </div>
          {editMode && !isWood && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
                className="p-1 bg-white/20 hover:bg-white/30 rounded transition-all"
                aria-label={`Rename ${preset.name}`}
              >
                <Pencil className="w-2.5 h-2.5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(preset);
                }}
                className="p-1 bg-accent/80 hover:bg-accent rounded transition-all"
                aria-label={`Edit ${preset.name} colors`}
              >
                <Palette className="w-2.5 h-2.5 text-bg" />
              </button>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(preset.id);
                  }}
                  className="p-1 bg-error/80 hover:bg-error rounded transition-all"
                  aria-label={`Delete ${preset.name}`}
                >
                  <Trash2 className="w-2.5 h-2.5 text-white" />
                </button>
              )}
              <div className="p-1 text-white/60">
                <GripVertical className="w-2.5 h-2.5" />
              </div>
            </div>
          )}
          {editMode && isWood && hovered && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <div className="p-1 text-white/60">
                <GripVertical className="w-3 h-3" />
              </div>
            </div>
          )}
        </button>
        {editMode && isRenaming && (
          <div className="absolute inset-0 z-20 bg-surface rounded-lg border border-accent flex items-center p-1">
            <input
              ref={inputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              onBlur={handleRenameBlur}
              className="w-full text-xs font-semibold bg-transparent text-text-primary outline-none px-1"
              maxLength={20}
            />
          </div>
        )}
        {editMode && (
          <div className="text-[9px] text-text-muted text-center mt-0.5 truncate px-0.5 font-medium">
            {preset.name}
          </div>
        )}
      </div>
    );
  }
);
PresetCard.displayName = 'PresetCard';

/**
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether adding is disabled
 * @returns {JSX.Element}
 */
const AddPresetCard = memo(({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label="Add new theme"
    className={`group relative rounded-lg transition-all duration-200 overflow-hidden border-2 border-dashed ${
      disabled
        ? 'border-border/30 opacity-50 cursor-not-allowed'
        : 'border-border/60 hover:border-accent/60 hover:scale-[1.03]'
    }`}
  >
    <div className="flex w-full h-12 bg-surface items-center justify-center gap-1">
      <Plus className="w-3.5 h-3.5 text-text-muted/50 group-hover:text-accent transition-colors" />
      <span className="text-[10px] font-bold text-text-muted/50 group-hover:text-accent transition-colors">
        Add
      </span>
    </div>
  </button>
));
AddPresetCard.displayName = 'AddPresetCard';

/**
 * @param {Object} props
 * @param {string} props.currentLight - Current light square color
 * @param {string} props.currentDark - Current dark square color
 * @param {Function} props.onColorChange - Color change callback
 * @returns {JSX.Element}
 */
const ColorPickerPanel = memo(
  ({ currentLight, currentDark, onColorChange }) => {
    const [activeSquare, setActiveSquare] = useState('light');
    const canvasRef = useRef(null);
    const isDragging = useRef(false);
    const currentValue = activeSquare === 'light' ? currentLight : currentDark;
    const [tempColor, setTempColor] = useState(currentValue);

    useEffect(() => {
      setTempColor(currentValue);
    }, [currentValue]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width,
        h = canvas.height;
      const rgb = hexToRgb(tempColor);
      if (!rgb) return;
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const hueRgb = hsvToRgb(hsv.h, 100, 100);
      const gH = ctx.createLinearGradient(0, 0, w, 0);
      gH.addColorStop(0, 'white');
      gH.addColorStop(1, `rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b})`);
      ctx.fillStyle = gH;
      ctx.fillRect(0, 0, w, h);
      const gV = ctx.createLinearGradient(0, 0, 0, h);
      gV.addColorStop(0, 'rgba(0,0,0,0)');
      gV.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = gV;
      ctx.fillRect(0, 0, w, h);
    }, [tempColor]);

    /**
     * @param {MouseEvent} e - Mouse event from canvas
     * @returns {void}
     */
    const pickColorAt = useCallback(
      (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(
            canvas.width - 1,
            ((e.clientX - rect.left) / rect.width) * canvas.width
          )
        );
        const y = Math.max(
          0,
          Math.min(
            canvas.height - 1,
            ((e.clientY - rect.top) / rect.height) * canvas.height
          )
        );
        const ctx = canvas.getContext('2d');
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        const newColor = rgbToHex(r, g, b);
        setTempColor(newColor);
        if (activeSquare === 'light') onColorChange(newColor, currentDark);
        else onColorChange(currentLight, newColor);
      },
      [activeSquare, currentLight, currentDark, onColorChange]
    );

    const handleCanvasMouseDown = useCallback(
      (e) => {
        isDragging.current = true;
        pickColorAt(e);
      },
      [pickColorAt]
    );

    const handleCanvasMouseMove = useCallback(
      (e) => {
        if (isDragging.current) pickColorAt(e);
      },
      [pickColorAt]
    );

    const handleCanvasMouseUp = useCallback(() => {
      isDragging.current = false;
    }, []);

    useEffect(() => {
      window.addEventListener('mouseup', handleCanvasMouseUp);
      return () => window.removeEventListener('mouseup', handleCanvasMouseUp);
    }, [handleCanvasMouseUp]);

    /**
     * @param {Event} e - Range input change event
     * @returns {void}
     */
    const handleHueChange = useCallback(
      (e) => {
        const hue = parseFloat(e.target.value);
        const rgb = hexToRgb(tempColor);
        if (!rgb) return;
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        const newRgb = hsvToRgb(hue, hsv.s, hsv.v);
        const newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setTempColor(newColor);
        if (activeSquare === 'light') onColorChange(newColor, currentDark);
        else onColorChange(currentLight, newColor);
      },
      [tempColor, activeSquare, currentLight, currentDark, onColorChange]
    );

    /**
     * @returns {number} Current hue value 0-360
     */
    const getCurrentHue = useCallback(() => {
      const rgb = hexToRgb(tempColor);
      return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b).h : 0;
    }, [tempColor]);

    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 p-1 bg-surface rounded-lg border border-border">
          {['light', 'dark'].map((sq) => (
            <button
              key={sq}
              onClick={() => setActiveSquare(sq)}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                activeSquare === sq
                  ? 'bg-accent text-bg shadow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {sq.charAt(0).toUpperCase() + sq.slice(1)} Square
            </button>
          ))}
        </div>
        <div className="bg-surface rounded-lg p-2.5 border border-border">
          <canvas
            ref={canvasRef}
            width={240}
            height={150}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            className="w-full rounded-md cursor-crosshair border border-border/50"
            style={{ touchAction: 'none' }}
          />
        </div>
        <div className="bg-surface rounded-lg p-2.5 border border-border">
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span className="font-bold">Hue</span>
            <span className="font-mono bg-surface-elevated px-2 py-0.5 rounded text-[10px]">
              {Math.round(getCurrentHue())}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={getCurrentHue()}
            onChange={handleHueChange}
            className="w-full h-2.5 rounded-full cursor-pointer appearance-none"
            style={{
              background:
                'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
            }}
          />
        </div>
      </div>
    );
  }
);
ColorPickerPanel.displayName = 'ColorPickerPanel';

/**
 * @param {Object} props
 * @param {number} props.currentPage - Current page index (0-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change callback
 * @returns {JSX.Element|null}
 */
const PaginationDots = memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => (
        <button
          key={`page-dot-${pageNum}`}
          onClick={() => onPageChange(pageNum)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            pageNum === currentPage
              ? 'bg-accent w-5'
              : 'bg-border hover:bg-text-muted'
          }`}
          aria-label={`Go to page ${pageNum + 1}`}
        />
      ))}
    </div>
  );
});
PaginationDots.displayName = 'PaginationDots';

/**
 * @param {Object} props
 * @param {Array<Object>} props.existingPresets - Current preset list for duplicate checking
 * @param {string} props.light - Light square color of duplicate
 * @param {string} props.dark - Dark square color of duplicate
 * @param {Function} props.onRename - Keep both and rename callback
 * @param {Function} props.onMerge - Merge callback
 * @param {Function} props.onCancel - Cancel callback
 * @returns {JSX.Element}
 */
const DuplicateWarningDialog = memo(
  ({ light, dark, onRename, onMerge, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-xl border border-border p-6 max-w-sm w-full mx-4 shadow-xl animate-scaleIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Duplicate Theme
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              A theme with this color combination already exists.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mb-5">
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: light }}
          />
          <div
            className="flex-1 h-8 rounded"
            style={{ backgroundColor: dark }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onRename}
            className="w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent-hover text-bg text-sm font-semibold transition-all"
          >
            Keep Both (Rename)
          </button>
          <button
            onClick={onMerge}
            className="w-full py-2.5 px-4 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border text-text-secondary text-sm font-semibold transition-all"
          >
            Merge into Existing
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 rounded-lg text-text-muted text-xs font-medium hover:text-text-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
);
DuplicateWarningDialog.displayName = 'DuplicateWarningDialog';

/**
 * Theme Customization tab for the Settings page.
 * Manages board theme presets, custom color editing, and preset management.
 *
 * @returns {JSX.Element}
 */
const ThemeCustomization = memo(() => {
  const [savedLight, setSavedLight] = useState(() =>
    readSquare(STORAGE_KEYS.LIGHT_SQUARE, '#f0d9b5')
  );
  const [savedDark, setSavedDark] = useState(() =>
    readSquare(STORAGE_KEYS.DARK_SQUARE, '#b58863')
  );
  const [previewLight, setPreviewLight] = useState(savedLight);
  const [previewDark, setPreviewDark] = useState(savedDark);
  const [presets, setPresets] = useState(loadPresets);
  const [presetsBackup, setPresetsBackup] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState(null);
  const [draggedPreset, setDraggedPreset] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const gridRef = useRef(null);
  const dragStartX = useRef(null);

  const presetsPerPage = useMemo(() => {
    const cols = 5;
    const rows = 3;
    return cols * rows;
  }, []);

  const sortedPresets = useMemo(() => {
    const defaults = presets.filter((p) => p.isDefault);
    const customs = presets.filter((p) => !p.isDefault);
    return [...defaults, ...customs];
  }, [presets]);

  const totalPages = Math.min(
    2,
    Math.ceil((sortedPresets.length + (editMode ? 1 : 0)) / presetsPerPage)
  );
  const startIndex = currentPage * presetsPerPage;
  const endIndex = startIndex + presetsPerPage;
  const pageItems = sortedPresets.slice(startIndex, endIndex);

  const showAddCard =
    editMode &&
    (currentPage === totalPages - 1 ||
      (sortedPresets.length + 1 <= endIndex &&
        sortedPresets.length >= startIndex));
  const canAddPreset = sortedPresets.length < MAX_TOTAL_PRESETS;
  const hasChanges = previewLight !== savedLight || previewDark !== savedDark;

  /**
   * @returns {void}
   */
  const handleEnableEditMode = useCallback(() => {
    setPresetsBackup(JSON.parse(JSON.stringify(presets)));
    setEditMode(true);
    setShowColorPicker(false);
    setEditingPresetId(null);
    setIsAddingNew(false);
  }, [presets]);

  /**
   * @returns {void}
   */
  const handleCancelEditMode = useCallback(() => {
    if (presetsBackup) setPresets(presetsBackup);
    setPresetsBackup(null);
    setEditMode(false);
    setEditingPresetId(null);
    setShowColorPicker(false);
    setIsAddingNew(false);
    setPreviewLight(savedLight);
    setPreviewDark(savedDark);
  }, [presetsBackup, savedLight, savedDark]);

  /**
   * @returns {void}
   */
  const handleApplyChanges = useCallback(() => {
    savePresets(presets);
    localStorage.setItem(STORAGE_KEYS.LIGHT_SQUARE, previewLight);
    localStorage.setItem(STORAGE_KEYS.DARK_SQUARE, previewDark);
    setSavedLight(previewLight);
    setSavedDark(previewDark);
    setPresetsBackup(null);
    setEditMode(false);
    setEditingPresetId(null);
    setShowColorPicker(false);
    setIsAddingNew(false);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('storage'));
  }, [presets, previewLight, previewDark]);

  /**
   * @param {Object} preset - Preset to apply
   * @returns {void}
   */
  const handlePresetClick = useCallback(
    (preset) => {
      if (editMode) return;
      setPreviewLight(preset.light);
      setPreviewDark(preset.dark);
    },
    [editMode]
  );

  /**
   * @returns {void}
   */
  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LIGHT_SQUARE, previewLight);
    localStorage.setItem(STORAGE_KEYS.DARK_SQUARE, previewDark);
    savePresets(presets);
    setSavedLight(previewLight);
    setSavedDark(previewDark);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('storage'));
  }, [previewLight, previewDark, presets]);

  /**
   * @param {string} light - Light color
   * @param {string} dark - Dark color
   * @returns {void}
   */
  const handleCustomColorChange = useCallback((light, dark) => {
    setPreviewLight(light);
    setPreviewDark(dark);
  }, []);

  /**
   * @param {string} light - Light color
   * @param {string} dark - Dark color
   * @returns {void}
   */
  const handleEditColorChange = useCallback(
    (light, dark) => {
      setPreviewLight(light);
      setPreviewDark(dark);
      if (editingPresetId !== null) {
        setPresets((prev) =>
          prev.map((p) =>
            p.id === editingPresetId ? { ...p, light, dark } : p
          )
        );
      }
    },
    [editingPresetId]
  );

  /**
   * @param {Object} preset - Preset to edit
   * @returns {void}
   */
  const handleEditPreset = useCallback((preset) => {
    setEditingPresetId(preset.id);
    setPreviewLight(preset.light);
    setPreviewDark(preset.dark);
    setShowColorPicker(true);
    setIsAddingNew(false);
  }, []);

  /**
   * @param {string} id - Preset ID to delete
   * @returns {void}
   */
  const handleDeletePreset = useCallback((id) => {
    if (id === WOOD_PRESET.id) return;
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /**
   * @param {string} id - Preset ID to rename
   * @param {string} newName - New name for the preset
   * @returns {void}
   */
  const handleRenamePreset = useCallback((id, newName) => {
    setPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  }, []);

  /**
   * @returns {void}
   */
  const handleAddPreset = useCallback(() => {
    if (!canAddPreset) return;
    setShowColorPicker(true);
    setEditingPresetId(null);
    setIsAddingNew(true);
    setPreviewLight('#e8d5b5');
    setPreviewDark('#a0784c');
  }, [canAddPreset]);

  /**
   * @returns {void}
   */
  const handleConfirmAdd = useCallback(() => {
    const duplicate = presets.find(
      (p) =>
        p.light.toLowerCase() === previewLight.toLowerCase() &&
        p.dark.toLowerCase() === previewDark.toLowerCase()
    );
    if (duplicate) {
      setDuplicateCheck({
        light: previewLight,
        dark: previewDark,
        existingId: duplicate.id
      });
      return;
    }
    const maxId = presets.reduce((max, p) => {
      const num =
        typeof p.id === 'string' && p.id.startsWith('custom-')
          ? parseInt(p.id.split('-')[1], 10)
          : 0;
      return Math.max(max, num);
    }, 0);
    const newPreset = {
      id: `custom-${maxId + 1}`,
      name: `Custom ${maxId + 1}`,
      light: previewLight,
      dark: previewDark,
      isDefault: false,
      isDeletable: true
    };
    setPresets((prev) => [...prev, newPreset]);
    setShowColorPicker(false);
    setIsAddingNew(false);
  }, [presets, previewLight, previewDark]);

  /**
   * @returns {void}
   */
  const handleDuplicateRename = useCallback(() => {
    const maxId = presets.reduce((max, p) => {
      const num =
        typeof p.id === 'string' && p.id.startsWith('custom-')
          ? parseInt(p.id.split('-')[1], 10)
          : 0;
      return Math.max(max, num);
    }, 0);
    const newPreset = {
      id: `custom-${maxId + 1}`,
      name: `Custom ${maxId + 1}`,
      light: previewLight,
      dark: previewDark,
      isDefault: false,
      isDeletable: true
    };
    setPresets((prev) => [...prev, newPreset]);
    setDuplicateCheck(null);
    setShowColorPicker(false);
    setIsAddingNew(false);
  }, [presets, previewLight, previewDark]);

  /**
   * @returns {void}
   */
  const handleDuplicateMerge = useCallback(() => {
    setDuplicateCheck(null);
    setShowColorPicker(false);
    setIsAddingNew(false);
  }, []);

  /**
   * @param {DragEvent} _e - Drag event
   * @param {Object} preset - Preset being dragged
   * @returns {void}
   */
  const handleDragStart = useCallback(
    (_e, preset) => setDraggedPreset(preset),
    []
  );

  /**
   * @param {DragEvent} e - Drag over event
   * @param {Object} preset - Preset being dragged over
   * @returns {void}
   */
  const handleDragOver = useCallback((e, preset) => {
    e.preventDefault();
    setDragOverId(preset.id);
  }, []);

  /**
   * @returns {void}
   */
  const handleDragEnd = useCallback(() => {
    setDraggedPreset(null);
    setDragOverId(null);
  }, []);

  /**
   * @param {DragEvent} _e - Drop event
   * @param {Object} targetPreset - Target preset for drop
   * @returns {void}
   */
  const handleDrop = useCallback(
    (_e, targetPreset) => {
      if (!draggedPreset || draggedPreset.id === targetPreset.id) return;
      setPresets((prev) => {
        const newPresets = [...prev];
        const dragIndex = newPresets.findIndex(
          (p) => p.id === draggedPreset.id
        );
        const targetIndex = newPresets.findIndex(
          (p) => p.id === targetPreset.id
        );
        if (dragIndex === -1 || targetIndex === -1) return prev;
        const [removed] = newPresets.splice(dragIndex, 1);
        newPresets.splice(targetIndex, 0, removed);
        return newPresets;
      });
      setDraggedPreset(null);
      setDragOverId(null);
    },
    [draggedPreset]
  );

  /**
   * @param {PointerEvent} e - Pointer down on grid for swipe detection
   * @returns {void}
   */
  const handlePointerDown = useCallback((e) => {
    dragStartX.current = e.clientX;
  }, []);

  /**
   * @param {PointerEvent} e - Pointer up on grid for swipe detection
   * @returns {void}
   */
  const handlePointerUp = useCallback(
    (e) => {
      if (dragStartX.current === null) return;
      const dx = e.clientX - dragStartX.current;
      dragStartX.current = null;
      if (Math.abs(dx) > 60) {
        if (dx < 0 && currentPage < totalPages - 1)
          setCurrentPage((p) => p + 1);
        else if (dx > 0 && currentPage > 0) setCurrentPage((p) => p - 1);
      }
    },
    [currentPage, totalPages]
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (editMode) handleCancelEditMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editMode, handleCancelEditMode]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 overflow-hidden">
      <div className="flex-1 p-4 lg:p-6 lg:border-r border-border/30 flex items-center justify-center min-h-0">
        <BoardPreview light={previewLight} dark={previewDark} />
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-text-primary">
                {editMode ? 'Edit Themes' : 'Theme Presets'}
              </h2>
              {editMode && (
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  Edit Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <button
                    onClick={handleCancelEditMode}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-elevated text-text-secondary hover:bg-surface-hover border border-border/70 transition-all flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent hover:bg-accent-hover text-bg shadow-md transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Check className="w-3 h-3" />
                    Apply
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEnableEditMode}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-elevated text-text-secondary hover:bg-surface-hover border border-border/70 transition-all flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      hasChanges
                        ? 'bg-accent hover:bg-accent-hover text-bg shadow-md active:scale-95'
                        : 'bg-surface-elevated text-text-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {!showColorPicker ? (
            <>
              <div
                ref={gridRef}
                className="grid grid-cols-5 gap-2 transition-all duration-300"
                role="group"
                aria-label="Theme preset options"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
              >
                {pageItems.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isActive={
                      preset.light === previewLight &&
                      preset.dark === previewDark
                    }
                    onClick={handlePresetClick}
                    editMode={editMode}
                    onEdit={handleEditPreset}
                    onDelete={handleDeletePreset}
                    onRename={handleRenamePreset}
                    dragOverId={dragOverId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {showAddCard && pageItems.length < presetsPerPage && (
                  <AddPresetCard
                    onClick={handleAddPreset}
                    disabled={!canAddPreset}
                  />
                )}
              </div>
              <PaginationDots
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div>
              {isAddingNew && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-accent/10 rounded-lg border border-accent/20">
                  <Wand2 className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent">
                    New Theme
                  </span>
                  <button
                    onClick={() => {
                      setShowColorPicker(false);
                      setIsAddingNew(false);
                    }}
                    className="ml-auto p-1 hover:bg-accent/15 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-accent" />
                  </button>
                </div>
              )}
              {editingPresetId !== null && editMode && !isAddingNew && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-accent/10 rounded-lg border border-accent/20">
                  <Pencil className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-bold text-accent truncate">
                    Editing:{' '}
                    {presets.find((p) => p.id === editingPresetId)?.name ||
                      'Preset'}
                  </span>
                  <button
                    onClick={() => {
                      setEditingPresetId(null);
                      setShowColorPicker(false);
                    }}
                    className="ml-auto p-1 hover:bg-accent/15 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-accent" />
                  </button>
                </div>
              )}
              <ColorPickerPanel
                currentLight={previewLight}
                currentDark={previewDark}
                onColorChange={
                  editMode && editingPresetId !== null
                    ? handleEditColorChange
                    : handleCustomColorChange
                }
              />
              {isAddingNew && (
                <button
                  onClick={handleConfirmAdd}
                  className="mt-4 w-full py-2.5 rounded-lg text-sm font-bold bg-accent hover:bg-accent-hover text-bg shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Add Theme
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {duplicateCheck && (
        <DuplicateWarningDialog
          light={duplicateCheck.light}
          dark={duplicateCheck.dark}
          onRename={handleDuplicateRename}
          onMerge={handleDuplicateMerge}
          onCancel={() => setDuplicateCheck(null)}
        />
      )}
    </div>
  );
});

ThemeCustomization.displayName = 'ThemeCustomization';

export default ThemeCustomization;
