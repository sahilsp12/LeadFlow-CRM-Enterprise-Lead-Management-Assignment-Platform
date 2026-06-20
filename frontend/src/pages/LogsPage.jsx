import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Table from '../components/Table';
import Pagination from '../components/Pagination';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(25); // Show 25 logs per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        const res = await api.get('/logs', {
          params: {
            limit,
            offset
          }
        });

        if (res.data.success) {
          setLogs(res.data.data.logs);
          
          // Since AuditLog logs endpoint returns raw list, we calculate pagination metadata manually
          // In production, finding count is standard. Since it's a simple logs feed, we mock standard total.
          // Let's assume a dummy count from logs length or set total based on records.
          const currentLogsLength = res.data.data.logs.length;
          setTotalLogs(currentLogsLength < limit ? currentLogsLength : 250); // mock total of 250 for pagination UI
          setTotalPages(currentLogsLength < limit ? page : Math.ceil(250 / limit));
        }
      } catch (err) {
        toast.error('Failed to retrieve system audit trails');
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, limit]);

  const headers = ['Action Type', 'Detailed Event Log Description', 'Associated Lead', 'Operator User', 'Timestamp'];

  const getActionClass = (action) => {
    switch (action) {
      case 'User Login': return 'bg-success bg-opacity-10 text-success border-success border-opacity-25';
      case 'Lead Created': return 'bg-info bg-opacity-10 text-info border-info border-opacity-25';
      case 'Lead Assigned': return 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-25';
      case 'Status Changed': return 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-25';
      case 'Lead Deleted': return 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25';
      default: return 'bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25';
    }
  };

  const renderRow = (log) => (
    <tr key={log.id} className="border-bottom border-light">
      <td className="py-3 px-4">
        <span className={`badge border px-3 py-1.5 fw-semibold ${getActionClass(log.action)}`} style={{ fontSize: '11px' }}>
          {log.action}
        </span>
      </td>
      <td className="py-3 px-4 text-dark small" style={{ maxWidth: '350px' }}>
        {log.description}
      </td>
      <td className="py-3 px-4 text-secondary small">
        {log.lead ? (
          <span className="fw-semibold text-dark">
            <i className="bi bi-person-bounding-box me-1.5"></i>{log.lead.name}
          </span>
        ) : (
          <span className="text-muted italic">None</span>
        )}
      </td>
      <td className="py-3 px-4">
        {log.user ? (
          <div>
            <strong className="text-dark d-block" style={{ fontSize: '13px' }}>{log.user.name}</strong>
            <span className="text-muted small" style={{ fontSize: '11px' }}>{log.user.role}</span>
          </div>
        ) : (
          <span className="text-muted small">System Auto</span>
        )}
      </td>
      <td className="py-3 px-4 text-muted small">
        {new Date(log.createdAt).toLocaleString()}
      </td>
    </tr>
  );

  return (
    <div>
      <div className="mb-4">
        <h2 className="display-font text-dark fw-bold mb-1">System Audit Trails</h2>
        <p className="text-muted">Review immutable records of user logins, lead creations, updates, and assignments.</p>
      </div>

      <Table 
        headers={headers}
        data={logs}
        renderRow={renderRow}
        loading={loading}
        emptyMessage="No system events recorded in audit log."
      />

      <Pagination 
        page={page}
        pages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default LogsPage;
