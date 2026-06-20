import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  name, 
  type = 'text', 
  error, 
  placeholder, 
  className = '', 
  ...rest 
}, ref) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label fw-medium text-dark" style={{ fontSize: '14px' }}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        ref={ref}
        placeholder={placeholder}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        {...rest}
      />
      {error && (
        <div className="invalid-feedback fw-semibold" style={{ fontSize: '12px' }}>
          {error.message}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
