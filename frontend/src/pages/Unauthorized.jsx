import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container py-5 text-center mt-5">
      <div className="card shadow-lg p-5 mx-auto border-0 premium-card" style={{ maxWidth: '500px' }}>
        <div className="text-danger mb-4">
          <i className="bi bi-shield-slash-fill" style={{ fontSize: '4.5rem' }}></i>
        </div>
        <h2 className="mb-2 display-font text-dark fw-bold">Access Denied</h2>
        <h5 className="text-secondary mb-3">403 Forbidden</h5>
        <p className="text-muted mb-4 small">
          You do not have the required permissions to access this screen. Please contact your system administrator if you believe this is an error.
        </p>
        <div>
          <Link to="/dashboard" className="btn btn-primary px-4 py-2">
            <i className="bi bi-house-door me-2"></i>Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
