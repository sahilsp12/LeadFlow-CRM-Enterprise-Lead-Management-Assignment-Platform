import React from 'react';

export const Spinner = ({ message = 'Loading...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5">
    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    {message && <p className="text-muted small">{message}</p>}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="w-100 py-3">
    {[...Array(rows)].map((_, rIdx) => (
      <div key={rIdx} className="d-flex align-items-center gap-3 py-3 border-bottom border-light">
        {[...Array(cols)].map((_, cIdx) => (
          <div 
            key={cIdx} 
            className="shimmer-placeholder flex-grow-1" 
            style={{ 
              height: '20px', 
              opacity: 0.7 - (cIdx * 0.1),
              borderRadius: '4px' 
            }}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="card border-0 premium-card p-4 d-flex flex-column gap-3 w-100" style={{ minHeight: '130px' }}>
    <div className="shimmer-placeholder" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
    <div className="shimmer-placeholder" style={{ width: '60%', height: '28px', borderRadius: '6px' }}></div>
    <div className="shimmer-placeholder" style={{ width: '30%', height: '12px', borderRadius: '4px' }}></div>
  </div>
);

export default {
  Spinner,
  TableSkeleton,
  CardSkeleton
};
