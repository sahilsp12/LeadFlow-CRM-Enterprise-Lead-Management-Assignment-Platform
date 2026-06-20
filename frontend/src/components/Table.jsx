import React from 'react';
import { TableSkeleton } from './Loader';
import EmptyState from './EmptyState';

const Table = ({ 
  headers, 
  data, 
  renderRow, 
  loading, 
  emptyMessage, 
  emptyTitle = "No records found", 
  onEmptyActionClick, 
  emptyActionText 
}) => {
  return (
    <div className="table-responsive bg-white rounded shadow-sm border border-light">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="py-3 px-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-4">
                <TableSkeleton rows={5} cols={headers.length} />
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length} className="py-4">
                <EmptyState 
                  title={emptyTitle} 
                  message={emptyMessage} 
                  onActionClick={onEmptyActionClick}
                  actionText={emptyActionText}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
