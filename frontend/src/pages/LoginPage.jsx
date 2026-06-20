import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Input from '../components/Input';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required')
});

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [btnLoading, setBtnLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setBtnLoading(true);
    const result = await login(data.email, data.password);
    setBtnLoading(false);
    
    if (result.success) {
      toast.success('Welcome to Waanee CRM!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container-fluid p-0 overflow-hidden" style={{ minHeight: '100vh' }}>
      <div className="row g-0" style={{ minHeight: '100vh' }}>
        
        {/* Left Branding Column (Visible on lg screens and up) */}
        <div className="col-lg-7 d-none d-lg-flex login-branding-col position-relative">
          <div className="z-1 px-5">
            <div className="d-flex align-items-center gap-3 mb-5">
              <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center text-white" style={{ width: '45px', height: '45px' }}>
                <i className="bi bi-rocket-takeoff-fill" style={{ fontSize: '24px' }}></i>
              </div>
              <h2 className="m-0 display-font fw-bold text-white">Waanee CRM</h2>
            </div>
            
            <h1 className="display-4 fw-bold text-white mb-4 display-font" style={{ lineHeight: '1.2' }}>
              Accelerate your sales pipeline with <span className="text-info">Smart Auto-Assignment</span>
            </h1>
            <p className="text-secondary mb-5 fs-5" style={{ maxWidth: '500px', lineHeight: '1.6' }}>
              Experience the power of a transaction-safe lead load balancer. Auto-routes prospects to the least loaded agents instantly.
            </p>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3 text-secondary">
                <i className="bi bi-patch-check-fill text-info" style={{ fontSize: '20px' }}></i>
                <span>Least-loaded assignment with row-level database serialization.</span>
              </div>
              <div className="d-flex align-items-center gap-3 text-secondary">
                <i className="bi bi-patch-check-fill text-info" style={{ fontSize: '20px' }}></i>
                <span>HttpOnly secure cookies and refresh token rotation (RTR).</span>
              </div>
              <div className="d-flex align-items-center gap-3 text-secondary">
                <i className="bi bi-patch-check-fill text-info" style={{ fontSize: '20px' }}></i>
                <span>Immutable activity audit trails and lead updates history.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="col-12 col-lg-5 d-flex align-items-center justify-content-center bg-app px-4 py-5" style={{ backgroundColor: 'var(--bg-app)' }}>
          <div className="card border-0 premium-card p-4 p-md-5 w-100" style={{ maxWidth: '440px' }}>
            <div className="text-center mb-4">
              <div className="d-lg-none d-inline-flex align-items-center gap-2 mb-3">
                <i className="bi bi-rocket-takeoff-fill text-primary" style={{ fontSize: '28px' }}></i>
                <h3 className="m-0 display-font fw-bold text-dark">Waanee CRM</h3>
              </div>
              <h2 className="display-font text-dark fw-bold mb-1">Welcome Back</h2>
              <p className="text-muted small">Sign in to manage your sales pipeline</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. admin@waanee.ai"
                error={errors.email}
                {...register('email')}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                error={errors.password}
                {...register('password')}
              />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="rememberMe" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label text-secondary small" htmlFor="rememberMe">Remember me</label>
                </div>
                <a href="#forgot" className="small text-decoration-none text-primary" onClick={(e) => {e.preventDefault(); toast.info("Password recovery is simulated.");}}>Forgot password?</a>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 d-flex justify-content-center align-items-center gap-2"
                disabled={btnLoading}
              >
                {btnLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-top border-light">
              <div className="small text-muted mb-2 text-center">Demo Credentials:</div>
              <div className="small bg-light bg-opacity-25 p-3 rounded border border-light" style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <div>Admin: admin@waanee.ai / admin123</div>
                <div>Manager: manager@waanee.ai / manager123</div>
                <div>Agent: agent@waanee.ai / agent123</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
