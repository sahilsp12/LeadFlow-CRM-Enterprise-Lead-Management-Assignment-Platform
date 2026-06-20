import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../api/axios';
import { toast } from 'react-toastify';
import Input from '../components/Input';

const schema = yup.object().shape({
  name: yup.string().required('Lead name is required').max(100, 'Name must not exceed 100 characters'),
  email: yup.string().nullable().notRequired().transform((v) => v === '' ? null : v).email('Invalid email address'),
  phone: yup.string().nullable().notRequired(),
  source: yup.string().required('Source channel is required'),
  status: yup.string().required('Status is required'),
  assignedTo: yup.string().nullable().notRequired().transform((v) => v === '' ? null : v),
  notes: yup.string().nullable().notRequired()
});

const EditLeadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [leadLoading, setLeadLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const fetchDropdownsAndLead = async () => {
      try {
        // 1. Fetch agents
        const agentsRes = await api.get('/users', { params: { role: 'AGENT' } });
        if (agentsRes.data.success) {
          setAgents(agentsRes.data.data.users);
        }
        setAgentsLoading(false);

        // 2. Fetch lead details
        const leadRes = await api.get(`/leads/${id}`);
        if (leadRes.data.success) {
          const lead = leadRes.data.data.lead;
          setValue('name', lead.name);
          setValue('email', lead.email || '');
          setValue('phone', lead.phone || '');
          setValue('source', lead.source);
          setValue('status', lead.status);
          setValue('assignedTo', lead.assignedTo || '');
          setValue('notes', lead.notes || '');
        }
      } catch (err) {
        toast.error('Failed to load lead details');
        navigate('/leads');
      } finally {
        setLeadLoading(false);
      }
    };

    fetchDropdownsAndLead();
  }, [id, setValue, navigate]);

  const onSubmit = async (data) => {
    setBtnLoading(true);
    try {
      const res = await api.put(`/leads/${id}`, data);
      if (res.data.success) {
        toast.success('Lead records updated successfully!');
        navigate(`/leads/${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setBtnLoading(false);
    }
  };

  if (leadLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-4">
        <h2 className="display-font text-dark fw-bold mb-1">Edit Lead</h2>
        <p className="text-muted">Update lead profile details and sales agent assignments.</p>
      </div>

      <div className="card border-0 premium-card p-4 p-md-5">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12 col-md-6">
              <Input
                label="Full Name *"
                name="name"
                error={errors.name}
                {...register('name')}
              />
            </div>
            <div className="col-12 col-md-6">
              <Input
                label="Email Address"
                name="email"
                type="email"
                error={errors.email}
                {...register('email')}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-6">
              <Input
                label="Phone Number"
                name="phone"
                error={errors.phone}
                {...register('phone')}
              />
            </div>
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="source" className="form-label fw-medium text-dark" style={{ fontSize: '14px' }}>
                  Source Channel *
                </label>
                <select
                  id="source"
                  className={`form-select ${errors.source ? 'is-invalid' : ''}`}
                  {...register('source')}
                >
                  <option value="Web">Web Site</option>
                  <option value="Referral">Client Referral</option>
                  <option value="Google Ads">Google Search Ads</option>
                  <option value="Facebook Ads">Facebook Social Ads</option>
                  <option value="Cold Call">Cold Outreach</option>
                  <option value="Partner">Business Partner</option>
                  <option value="RandomUser API Suggestion">RandomUser API Suggestion</option>
                </select>
                {errors.source && <div className="invalid-feedback">{errors.source.message}</div>}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="status" className="form-label fw-medium text-dark" style={{ fontSize: '14px' }}>
                  Status *
                </label>
                <select
                  id="status"
                  className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                  {...register('status')}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                  <option value="Closed">Closed</option>
                </select>
                {errors.status && <div className="invalid-feedback">{errors.status.message}</div>}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label htmlFor="assignedTo" className="form-label fw-medium text-dark" style={{ fontSize: '14px' }}>
                  Assigned Agent
                </label>
                <select
                  id="assignedTo"
                  className={`form-select ${errors.assignedTo ? 'is-invalid' : ''}`}
                  disabled={agentsLoading}
                  {...register('assignedTo')}
                >
                  <option value="">-- Unassigned (Set Auto-Assignment) --</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
                {errors.assignedTo && <div className="invalid-feedback">{errors.assignedTo.message}</div>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="form-label fw-medium text-dark" style={{ fontSize: '14px' }}>
              Lead Notes / Description
            </label>
            <textarea
              id="notes"
              rows="4"
              className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
              {...register('notes')}
            ></textarea>
            {errors.notes && <div className="invalid-feedback">{errors.notes.message}</div>}
          </div>

          <div className="d-flex justify-content-end gap-3 pt-3 border-top border-light">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2"
              onClick={() => navigate(`/leads/${id}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={btnLoading}
              className="btn btn-primary px-5 py-2 d-flex align-items-center gap-2"
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
  );
};

export default EditLeadPage;
