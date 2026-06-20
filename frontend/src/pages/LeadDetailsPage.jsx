import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LeadDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick status update states
  const [status, setStatus] = useState('');
  const [noteAppend, setNoteAppend] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchLeadDetails = useCallback(async () => {
    try {
      const leadRes = await api.get(`/leads/${id}`);
      if (leadRes.data.success) {
        setLead(leadRes.data.data.lead);
        setStatus(leadRes.data.data.lead.status);
      }

      const logsRes = await api.get(`/logs/lead/${id}`);
      if (logsRes.data.success) {
        setLogs(logsRes.data.data.logs);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retrieve lead profile');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  const handleUpdateStatusAndNotes = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      // Build notes string: if notes already exist, we append the new notes with a timestamp divider
      let newNotes = lead.notes || '';
      if (noteAppend.trim() !== '') {
        const timestamp = new Date().toLocaleString();
        const divider = newNotes ? '\n\n' : '';
        newNotes += `${divider}[Note added by ${user.name} on ${timestamp}]:\n${noteAppend}`;
      }

      const res = await api.put(`/leads/${id}`, {
        status,
        notes: newNotes
      });

      if (res.data.success) {
        toast.success('Lead status and notes updated!');
        setNoteAppend(''); // Clear append textbox
        fetchLeadDetails(); // Reload data
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setBtnLoading(false);
    }
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!lead) return <div className="alert alert-danger">Lead record could not be loaded.</div>;

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/leads" className="btn btn-outline-secondary btn-sm px-2.5 py-1.5">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="display-font text-dark fw-bold m-0">{lead.name}</h2>
              {getStatusBadge(lead.status)}
            </div>
            <p className="text-muted m-0 small">Lead ID: {lead.id}</p>
          </div>
        </div>
        
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <Link to={`/leads/${lead.id}/edit`} className="btn btn-warning px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-pencil-square"></i>
            Edit Lead Profile
          </Link>
        )}
      </div>

      <div className="row g-4">
        {/* Left Side: Lead profile info and notes updates */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 premium-card p-4 mb-4">
            <h5 className="display-font text-dark mb-4 fw-semibold border-bottom pb-2">Client Profile Details</h5>
            
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="small text-muted mb-1">Email Address</div>
                <div className="fw-medium text-dark">{lead.email || <span className="text-secondary small italic">Not provided</span>}</div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="small text-muted mb-1">Phone Number</div>
                <div className="fw-medium text-dark">{lead.phone || <span className="text-secondary small italic">Not provided</span>}</div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="small text-muted mb-1">Acquisition Source</div>
                <div className="fw-medium text-dark">{lead.source}</div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="small text-muted mb-1">Assigned Executive Agent</div>
                <div className="fw-medium text-dark">
                  {lead.assignedAgent ? (
                    <span><i className="bi bi-person-badge text-primary me-1"></i>{lead.assignedAgent.name}</span>
                  ) : (
                    <span className="text-danger small italic"><i className="bi bi-exclamation-circle me-1"></i>Unassigned</span>
                  )}
                </div>
              </div>
              <div className="col-12">
                <div className="small text-muted mb-1">Created By</div>
                <div className="small text-dark">
                  {lead.creator ? `${lead.creator.name} (${lead.creator.email})` : 'System Auto'} on {new Date(lead.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Read-only historical Notes Log */}
            <div className="mt-4 pt-3 border-top">
              <div className="small text-muted mb-2">Internal Conversation & Updates Log</div>
              <div className="p-3 bg-light rounded text-dark small overflow-auto" style={{ maxHeight: '250px', whiteSpace: 'pre-line', fontFamily: 'var(--font-family-secondary)' }}>
                {lead.notes || <span className="text-muted italic">No logs recorded yet.</span>}
              </div>
            </div>
          </div>

          {/* Quick status update & note append form */}
          <div className="card border-0 premium-card p-4">
            <h5 className="display-font text-dark mb-3 fw-semibold">Update Status & Append Notes</h5>
            <form onSubmit={handleUpdateStatusAndNotes}>
              <div className="mb-3">
                <label htmlFor="quickStatus" className="form-label small text-muted">Lead Status</label>
                <select
                  id="quickStatus"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="noteAppend" className="form-label small text-muted">Append New Note</label>
                <textarea
                  id="noteAppend"
                  rows="3"
                  className="form-control small"
                  placeholder="Enter a new update notes here. This will be appended to the conversation history log..."
                  value={noteAppend}
                  onChange={(e) => setNoteAppend(e.target.value)}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="btn btn-primary px-4 d-flex align-items-center gap-2"
                >
                  {btnLoading && (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Audit Log Timeline */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 premium-card p-4 h-100">
            <h5 className="display-font text-dark mb-4 fw-semibold border-bottom pb-2">Audit Event Timeline</h5>
            <div className="timeline-container px-2">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={log.id} className="d-flex mb-4 position-relative">
                    {/* Vertical connecting line */}
                    {index < logs.length - 1 && (
                      <div className="position-absolute bg-secondary bg-opacity-25" style={{ width: '2px', left: '11px', top: '24px', bottom: '-28px' }}></div>
                    )}
                    
                    {/* Bullet marker */}
                    <div className="rounded-circle bg-white border border-2 border-primary d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '24px', height: '24px', flexShrink: 0, zIndex: 1 }}>
                      <span style={{ fontSize: '10px' }}>•</span>
                    </div>

                    <div className="ms-3 flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark small">{log.action}</strong>
                        <span className="text-muted small" style={{ fontSize: '10px' }}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted small m-0" style={{ fontSize: '12px' }}>{log.description}</p>
                      <span className="text-muted small italic" style={{ fontSize: '10px' }}>
                        By: {log.user ? log.user.name : 'System'} ({log.user ? log.user.role : 'Core'})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted small">No audit log records for this lead.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsPage;
