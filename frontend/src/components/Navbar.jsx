import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    { id: 1, text: "Least-loaded agent logic assigned a new lead", time: "5 mins ago" },
    { id: 2, text: "Manager modified lead 'Loraci Fernandes'", time: "1 hour ago" },
    { id: 3, text: "System check completed successfully", time: "2 hours ago" }
  ];

  return (
    <nav className="navbar navbar-expand navbar-light border-bottom px-4 py-2 sticky-top shadow-sm">
      <div className="container-fluid p-0">
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          type="button"
          className="btn btn-outline-secondary border-0 p-2 me-3 d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px' }}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <i className={`bi ${sidebarCollapsed ? 'bi-indent' : 'bi-dedent'}`} style={{ fontSize: '20px', color: 'var(--text-main)' }}></i>
        </button>

        {/* Global Search Bar Mockup */}
        <div className="d-none d-md-flex align-items-center flex-grow-1" style={{ maxWidth: '300px' }}>
          <div className="input-group">
            <span className="input-group-text bg-light bg-opacity-25 border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              placeholder="Search leads, settings..." 
              className="form-control border-start-0 bg-light bg-opacity-25"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="ms-auto d-flex align-items-center gap-3">
          
          {/* Light/Dark Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserDropdown(false); }}
              type="button"
              className="btn btn-outline-secondary border-0 rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
            >
              <i className="bi bi-bell-fill" style={{ fontSize: '18px', color: 'var(--text-main)' }}></i>
              <span className="position-absolute top-1 start-75 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </button>
            
            {showNotifications && (
              <div 
                className="position-absolute end-0 mt-2 card border-0 premium-card p-3 shadow-lg"
                style={{ width: '280px', zIndex: 1100, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}
              >
                <div className="fw-semibold text-dark mb-2 pb-1 border-bottom" style={{ fontSize: '14px' }}>Notifications</div>
                <div className="list-group list-group-flush">
                  {mockNotifications.map(n => (
                    <div key={n.id} className="py-2 list-group-item bg-transparent px-0 border-light">
                      <div className="small text-dark" style={{ fontSize: '12px', lineHeight: '1.4' }}>{n.text}</div>
                      <span className="text-muted" style={{ fontSize: '10px' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile avatar & Dropdown */}
          {user && (
            <div className="position-relative">
              <button
                onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifications(false); }}
                type="button"
                className="btn btn-outline-secondary border-0 p-0 rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                style={{ width: '38px', height: '38px' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {showUserDropdown && (
                <div 
                  className="position-absolute end-0 mt-2 card border-0 premium-card p-2 shadow-lg"
                  style={{ width: '180px', zIndex: 1100, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}
                >
                  <div className="px-3 py-2 border-bottom mb-1">
                    <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '13px' }}>{user.name}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: '10px' }}>{user.role}</div>
                  </div>
                  
                  <Link 
                    to="/settings" 
                    className="dropdown-item px-3 py-2 rounded text-dark small d-flex align-items-center gap-2"
                    onClick={() => setShowUserDropdown(false)}
                    style={{ fontSize: '13px' }}
                  >
                    <i className="bi bi-gear"></i> Settings
                  </Link>

                  <button
                    onClick={() => { logout(); setShowUserDropdown(false); }}
                    className="dropdown-item px-3 py-2 rounded text-danger small d-flex align-items-center gap-2 border-0 bg-transparent text-start"
                    style={{ fontSize: '13px' }}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
