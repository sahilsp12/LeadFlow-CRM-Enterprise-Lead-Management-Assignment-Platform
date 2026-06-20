import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';

const schema = yup.object().shape({
  name: yup.string().required('Name is required').max(100),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: yup.string().required('Role is required')
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'AGENT'
    }
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data.users);
      }
    } catch (err) {
      toast.error('Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    setBtnLoading(true);
    try {
      const res = await api.post('/users', data);
      if (res.data.success) {
        toast.success('User created successfully!');
        setShowModal(false);
        reset();
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to soft-delete the user "${name}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/users/${id}`);
      if (res.data.success) {
        toast.success(`User "${name}" successfully deleted!`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const headers = ['Name', 'Email Address', 'Role Badge', 'Created At', 'Actions'];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <span className="role-badge role-admin">ADMIN</span>;
      case 'MANAGER': return <span className="role-badge role-manager">MANAGER</span>;
      case 'AGENT': return <span className="role-badge role-agent">AGENT</span>;
      default: return <span className="role-badge bg-secondary text-white">{role}</span>;
    }
  };

  const renderRow = (userItem) => (
    <tr key={userItem.id} className="border-bottom border-light">
      <td className="py-3 px-4 fw-semibold text-dark">{userItem.name}</td>
      <td className="py-3 px-4 text-muted small">{userItem.email}</td>
      <td className="py-3 px-4">{getRoleBadge(userItem.role)}</td>
      <td className="py-3 px-4 text-muted small">
        {new Date(userItem.createdAt).toLocaleString()}
      </td>
      <td className="py-3 px-4">
        <button 
          onClick={() => handleDelete(userItem.id, userItem.name)} 
          className="btn btn-sm btn-outline-danger px-2.5 py-1"
          title="Delete User"
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="display-font text-dark fw-bold mb-1">User Directory</h2>
          <p className="text-muted">Register, search, and manage system roles and permissions.</p>
        </div>
        <button 
          className="btn btn-accent px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-person-plus-fill"></i>
          Register User
        </button>
      </div>

      <Table 
        headers={headers}
        data={users}
        renderRow={renderRow}
        loading={loading}
        emptyMessage="No users registered in directory."
      />

      {/* Creation Popup Dialog */}
      <Modal 
        show={showModal} 
        onClose={() => { setShowModal(false); reset(); }} 
        title="Register New User"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input 
            label="Full Name"
            name="name"
            placeholder="e.g. Jane Agent"
            error={errors.name}
            {...register('name')}
          />
          <Input 
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. jane@waanee.ai"
            error={errors.email}
            {...register('email')}
          />
          <Input 
            label="Initial Password"
            name="password"
            type="password"
            placeholder="Min 6 characters"
            error={errors.password}
            {...register('password')}
          />

          <div className="mb-4">
            <label htmlFor="role" className="form-label fw-medium text-dark" style={{ fontSize: '14px' }}>
              System Permission Role
            </label>
            <select
              id="role"
              className={`form-select ${errors.role ? 'is-invalid' : ''}`}
              {...register('role')}
            >
              <option value="AGENT">AGENT (Read assigned leads, update status & notes)</option>
              <option value="MANAGER">MANAGER (CRUD leads, assign agents)</option>
              <option value="ADMIN">ADMIN (Full privileges, manage directory, audit logs)</option>
            </select>
            {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top border-light">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={() => { setShowModal(false); reset(); }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary px-4 d-flex align-items-center gap-2"
              disabled={btnLoading}
            >
              {btnLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              Save User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
