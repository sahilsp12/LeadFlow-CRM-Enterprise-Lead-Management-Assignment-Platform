import React from 'react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const numbers = [];
    const delta = 2; // Number of pages to show before and after current page
    
    for (let i = 1; i <= pages; i++) {
      if (
        i === 1 ||
        i === pages ||
        (i >= page - delta && i <= page + delta)
      ) {
        numbers.push(i);
      } else if (
        numbers[numbers.length - 1] !== '...' &&
        (i < page - delta || i > page + delta)
      ) {
        numbers.push('...');
      }
    }
    return numbers;
  };

  return (
    <nav className="d-flex justify-content-between align-items-center mt-4 px-2">
      <div className="text-muted small">
        Page <strong>{page}</strong> of {pages}
      </div>
      <ul className="pagination pagination-sm m-0">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
        </li>
        {getPageNumbers().map((num, idx) => (
          <li 
            key={idx} 
            className={`page-item ${num === page ? 'active' : ''} ${num === '...' ? 'disabled' : ''}`}
          >
            {num === '...' ? (
              <span className="page-link">...</span>
            ) : (
              <button className="page-link" onClick={() => onPageChange(num)}>
                {num}
              </button>
            )}
          </li>
        ))}
        <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
