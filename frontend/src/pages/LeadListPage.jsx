import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Table from '../components/Table';
import Pagination from '../components/Pagination';

const LeadListPage = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filter & Query parameters state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Debounce search inputs
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', {
        params: {
          page,
          limit: 10,
          search,
          status,
          source,
          sortBy,
          sortOrder
        }
      });
      if (res.data.success) {
        setLeads(res.data.data.leads);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load leads list');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, source, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to soft-delete the lead for "${name}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/leads/${id}`);
      if (res.data.success) {
        toast.success(`Lead "${name}" successfully deleted!`);
        // Refresh list
        fetchLeads();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <i className="bi bi-arrow-down-up text-muted ms-1 small"></i>;
    return sortOrder === 'ASC' 
      ? <i className="bi bi-sort-up text-primary ms-1 small"></i> 
      : <i className="bi bi-sort-down text-primary ms-1 small"></i>;
  };

  const getStatusBadge = (leadStatus) => {
    const mapping = {
      New: 'status-new',
      Contacted: 'status-contacted',
      Qualified: 'status-qualified',
      Lost: 'status-lost',
      Closed: 'status-closed'
    };
    return <span className={`badge-status ${mapping[leadStatus] || 'bg-secondary'}`}>{leadStatus}</span>;
  };

  const headers = [
    <span onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name {getSortIcon('name')}</span>,
    <span>Contact</span>,
    <span onClick={() => handleSort('source')} style={{ cursor: 'pointer' }}>Source {getSortIcon('source')}</span>,
    <span onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {getSortIcon('status')}</span>,
    <span>Assigned Agent</span>,
    <span onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Created At {getSortIcon('createdAt')}</span>,
    <span className="text-end">Actions</span>
  ];

  const renderRow = (lead) => (
    <tr key={lead.id} className="border-bottom border-light">
      <td className="py-3 px-4 fw-semibold text-dark">{lead.name}</td>
      <td className="py-3 px-4 small text-muted">
        <div><i className="bi bi-envelope me-1"></i>{lead.email || '-'}</div>
        <div><i className="bi bi-telephone me-1"></i>{lead.phone || '-'}</div>
      </td>
      <td className="py-3 px-4 text-dark small">{lead.source}</td>
      <td className="py-3 px-4">{getStatusBadge(lead.status)}</td>
      <td className="py-3 px-4">
        {lead.assignedAgent ? (
          <div>
            <strong className="text-dark d-block" style={{ fontSize: '13px' }}>{lead.assignedAgent.name}</strong>
            <span className="text-muted small" style={{ fontSize: '11px' }}>{lead.assignedAgent.email}</span>
          </div>
        ) : (
          <span className="text-secondary small italic"><i className="bi bi-person-dash me-1"></i>Unassigned</span>
        )}
      </td>
      <td className="py-3 px-4 text-muted small">
        {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </td>
      <td className="py-3 px-4 text-end">
        <div className="d-inline-flex gap-2">
          <Link 
            to={`/leads/${lead.id}`} 
            className="btn btn-sm btn-outline-primary px-2.5 py-1"
            title="View Details"
          >
            <i className="bi bi-eye"></i>
          </Link>
          
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <>
              <Link 
                to={`/leads/${lead.id}/edit`} 
                className="btn btn-sm btn-outline-warning px-2.5 py-1"
                title="Edit Lead"
              >
                <i className="bi bi-pencil"></i>
              </Link>
              <button 
                onClick={() => handleDelete(lead.id, lead.name)} 
                className="btn btn-sm btn-outline-danger px-2.5 py-1"
                title="Delete Lead"
              >
                <i className="bi bi-trash"></i>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="display-font text-dark fw-bold mb-1">Leads Registry</h2>
          <p className="text-muted">Browse, query, and manage sales prospects records.</p>
        </div>
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <Link to="/leads/create" className="btn btn-accent px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-person-plus-fill"></i>
            Create New Lead
          </Link>
        )}
      </div>

      {/* Query Filters Board */}
      <div className="card border-0 premium-card p-4 mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search leads by name, email, or phone..."
                className="form-control border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <select
              className="form-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">Filter by Status: All</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <select
              className="form-select"
              value={source}
              onChange={(e) => { setSource(e.target.value); setPage(1); }}
            >
              <option value="">Filter by Channel Source: All</option>
              <option value="Web">Web</option>
              <option value="Referral">Referral</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Facebook Ads">Facebook Ads</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Partner">Partner</option>
              <option value="RandomUser API Suggestion">RandomUser API Suggestion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Datagrid Table */}
      <Table 
        headers={headers}
        data={leads}
        renderRow={renderRow}
        loading={loading}
        emptyMessage="No leads match your filter parameters."
      />

      {/* Pagination Controls */}
      <Pagination 
        page={pagination.page}
        pages={pagination.pages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default LeadListPage;
