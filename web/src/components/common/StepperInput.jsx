import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';


/**
 * A universal stepper input: numeric field with -/+ buttons, no browser spinners.
 */
function StepperInput({
  value,
  onChange,
  min = 1,
  max = undefined,
  step = 1,
  className = '',
  inputClass = '',
  ...rest
}) {
  const inputRef = useRef(null);

  // Select value on focus (for better UX)
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const handleInput = e => {
    let v = e.target.value.replace(/[^0-9.]/g, '');
    onChange(v);
  };

  const inc = () => {
    let next = (parseFloat(value) || min || 1) + step;
    if (typeof max === 'number') next = Math.min(max, next);
    onChange(String(next));
  };

  const dec = () => {
    let next = (parseFloat(value) || min || 1) - step;
    if (typeof min === 'number') next = Math.max(min, next);
    onChange(String(next));
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        className="btn btn-xs btn-outline join-item"
        type="button"
        tabIndex={-1}
        onClick={dec}
        aria-label="Decrement"
      >-</button>
      <input
        ref={inputRef}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInput}
        className={`input input-xs w-14 text-center ${inputClass}`}
        {...rest}
      />
      <button
        className="btn btn-xs btn-outline join-item"
        type="button"
        tabIndex={-1}
        onClick={inc}
        aria-label="Increment"
      >+</button>
    </div>
  );
}

StepperInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  className: PropTypes.string,
  inputClass: PropTypes.string,
};

export default StepperInput;