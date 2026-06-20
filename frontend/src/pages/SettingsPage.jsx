import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import Input from '../components/Input';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference Checks
  const [emailNotify, setEmailNotify] = useState(true);
  const [autoEnrich, setAutoEnrich] = useState(true);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success("Profile preferences saved locally! (Simulation)");
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    toast.success("Security credentials updated! (Simulation)");
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="mb-4">
        <h2 className="display-font text-dark fw-bold mb-1">Account Settings</h2>
        <p className="text-muted">Manage your profile, theme settings, notifications, and passwords.</p>
      </div>

      {/* Grid Settings Panels */}
      <div className="d-flex flex-column gap-4">
        
        {/* Panel 1: Profile Details */}
        <div className="card border-0 premium-card p-4">
          <h5 className="display-font text-dark mb-4 fw-semibold border-bottom pb-2">
            <i className="bi bi-person-fill me-2 text-primary"></i>Profile Details
          </h5>
          <form onSubmit={handleUpdateProfile}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small text-muted">Authorization Role</label>
                <input 
                  type="text" 
                  className="form-control bg-light bg-opacity-25" 
                  value={user?.role || ''} 
                  disabled
                />
                <div className="form-text small text-muted" style={{ fontSize: '11px' }}>
                  Role values are fixed by system administrators.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-top d-flex justify-content-end">
              <button type="submit" className="btn btn-primary px-4">
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: Theme & Layout Preferences */}
        <div className="card border-0 premium-card p-4">
          <h5 className="display-font text-dark mb-4 fw-semibold border-bottom pb-2">
            <i className="bi bi-palette-fill me-2 text-primary"></i>UI & Theme Preferences
          </h5>
          
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong className="text-dark d-block">Dark / Light Interface Theme</strong>
                <span className="text-muted small">Choose between the high-fidelity dark SaaS style or modern light CRM layout.</span>
              </div>
              <button 
                onClick={toggleTheme} 
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                type="button"
              >
                {theme === 'light' ? (
                  <>
                    <i className="bi bi-moon-fill"></i> Switch to Dark Mode
                  </>
                ) : (
                  <>
                    <i className="bi bi-sun-fill text-warning"></i> Switch to Light Mode
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-top pt-3">
            <strong className="text-dark d-block mb-3">Operational Preferences</strong>
            <div className="form-check form-switch mb-2">
              <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                id="emailNotifySwitch"
                checked={emailNotify}
                onChange={() => setEmailNotify(!emailNotify)}
              />
              <label className="form-check-label text-dark small" htmlFor="emailNotifySwitch">
                Send automated email alerts on new lead assignment triggers.
              </label>
            </div>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                id="autoEnrichSwitch"
                checked={autoEnrich}
                onChange={() => setAutoEnrich(!autoEnrich)}
              />
              <label className="form-check-label text-dark small" htmlFor="autoEnrichSwitch">
                Allow AI lead suggestion autofill data enrichment prompts.
              </label>
            </div>
          </div>
        </div>

        {/* Panel 3: Change Password */}
        <div className="card border-0 premium-card p-4">
          <h5 className="display-font text-dark mb-4 fw-semibold border-bottom pb-2">
            <i className="bi bi-lock-fill me-2 text-primary"></i>Security Credentials
          </h5>
          <form onSubmit={handleUpdatePassword}>
            <div className="row">
              <div className="col-12 col-md-4">
                <div className="mb-3">
                  <label className="form-label small text-muted">Current Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="mb-3">
                  <label className="form-label small text-muted">New Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="mb-3">
                  <label className="form-label small text-muted">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary px-4">
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
