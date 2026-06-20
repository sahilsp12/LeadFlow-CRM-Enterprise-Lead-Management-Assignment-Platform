import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  status: yup.string().required('Initial status is required'),
  assignedTo: yup.string().nullable().notRequired().transform((v) => v === '' ? null : v),
  notes: yup.string().nullable().notRequired()
});

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      source: 'Web',
      status: 'New',
      assignedTo: '',
      notes: ''
    }
  });

  // Fetch agents list to fill assignment dropdown on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get('/users', { params: { role: 'AGENT' } });
        if (res.data.success) {
          setAgents(res.data.data.users);
        }
      } catch (err) {
        console.error('Failed to load agents dropdown:', err.message);
        toast.warning('Could not retrieve agent directory. Auto-assignment will still function.');
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const onSubmit = async (data) => {
    setBtnLoading(true);
    try {
      const res = await api.post('/leads', data);
      if (res.data.success) {
        toast.success('Lead created and assigned successfully!');
        navigate('/leads');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setBtnLoading(false);
    }
  };

  // Call suggestion enrichment endpoint to seed data
  const handleFetchSuggestion = async () => {
    setSuggestLoading(true);
    try {
      const res = await api.get('/leads/suggest');
      if (res.data.success) {
        const { name, email, phone, source, notes } = res.data.data.suggestion;
        setValue('name', name);
        setValue('email', email);
        setValue('phone', phone);
        setValue('source', source);
        setValue('notes', notes);
        toast.success('Form populated with proposal data!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retrieve proposal from external API');
    } finally {
      setSuggestLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="display-font text-dark fw-bold mb-1">Create Lead</h2>
          <p className="text-muted">Register a new client prospect in the database.</p>
        </div>
        <button
          type="button"
          onClick={handleFetchSuggestion}
          disabled={suggestLoading}
          className="btn btn-outline-primary d-flex align-items-center gap-2"
        >
          {suggestLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <i className="bi bi-magic"></i>
          )}
          Autofill with RandomUser
        </button>
      </div>

      <div className="card border-0 premium-card p-4 p-md-5">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12 col-md-6">
              <Input
                label="Full Name *"
                name="name"
                placeholder="e.g. John Doe"
                error={errors.name}
                {...register('name')}
              />
            </div>
            <div className="col-12 col-md-6">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. john.doe@example.com"
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
                placeholder="e.g. 555-0100"
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
                  Initial Status *
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
                  <option value="">-- Let Auto-Assignment Pick Least Loaded Agent --</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
                <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                  If left empty, system automatically links lead to agent with lowest active load.
                </div>
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
              placeholder="Provide background information or initial communication records..."
              className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
              {...register('notes')}
            ></textarea>
            {errors.notes && <div className="invalid-feedback">{errors.notes.message}</div>}
          </div>

          <div className="d-flex justify-content-end gap-3 pt-3 border-top border-light">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2"
              onClick={() => navigate('/leads')}
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
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadPage;
