import React from 'react';

const EmptyState = ({ 
  icon = 'bi-folder-x', 
  title = 'No records found', 
  message = 'Try modifying your filter parameters or search queries.', 
  actionText, 
  onActionClick 
}) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center px-4">
      <div className="bg-light bg-opacity-10 d-inline-flex p-4 rounded-circle text-muted mb-3 border border-light">
        <i className={`bi ${icon}`} style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
      </div>
      <h4 className="display-font fw-semibold text-dark mb-1">{title}</h4>
      <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '400px' }}>
        {message}
      </p>
      {actionText && onActionClick && (
        <button 
          onClick={onActionClick} 
          type="button" 
          className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
