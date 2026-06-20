import React, { useEffect } from 'react';

const Modal = ({ show, onClose, title, children, size = '' }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div>
      {/* Modal Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onClose} 
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal Dialog Container */}
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        style={{ zIndex: 1050 }}
        role="dialog"
      >
        <div className={`modal-dialog modal-dialog-centered ${size}`} role="document">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
            {/* Modal Header */}
            <div className="modal-header border-bottom border-light px-4 py-3">
              <h5 className="modal-title display-font fw-semibold text-dark">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                aria-label="Close" 
                onClick={onClose}
              ></button>
            </div>
            {/* Modal Body */}
            <div className="modal-body p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
