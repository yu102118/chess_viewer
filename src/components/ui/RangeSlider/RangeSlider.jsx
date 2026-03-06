import React from 'react';

/**
 * Styled range slider wrapping a native `<input type="range">`.
 * @param {Object} props
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} [props.step] - Step increment
 * @param {number} props.value - Controlled value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.className=''] - Additional Tailwind classes
 * @returns {JSX.Element}
 */
const RangeSlider = React.memo(
  ({ min, max, step, value, onChange, className = '' }) => {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={`
        flex-1 h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent
        ${className}
      `}
      />
    );
  }
);

RangeSlider.displayName = 'RangeSlider';

export default RangeSlider;
