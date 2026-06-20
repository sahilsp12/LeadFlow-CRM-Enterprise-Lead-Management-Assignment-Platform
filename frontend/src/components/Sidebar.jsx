import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ collapsed }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={`sidebar-wrapper d-flex flex-column ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand logo container */}
      <div className="sidebar-brand-wrapper">
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <i className="bi bi-rocket-takeoff-fill text-info" style={{ fontSize: '24px' }}></i>
          <h4 className="m-0 sidebar-brand">Waanee CRM</h4>
        </div>
      </div>

      {/* Nav items list */}
      <div className="flex-grow-1 py-4">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
          title={collapsed ? 'Dashboard' : ''}
        >
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/leads" 
          className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
          title={collapsed ? 'Leads Listing' : ''}
        >
          <i className="bi bi-person-lines-fill"></i>
          <span>Leads Registry</span>
        </NavLink>

        {/* Manager and Admin only */}
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <NavLink 
            to="/leads/create" 
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? 'Create Lead' : ''}
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Lead</span>
          </NavLink>
        )}

        {/* Admin only */}
        {user.role === 'ADMIN' && (
          <NavLink 
            to="/users" 
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? 'User Directory' : ''}
          >
            <i className="bi bi-people-fill"></i>
            <span>User Directory</span>
          </NavLink>
        )}

        {/* Admin only */}
        {user.role === 'ADMIN' && (
          <NavLink 
            to="/logs" 
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? 'System Logs' : ''}
          >
            <i className="bi bi-journal-text"></i>
            <span>System Logs</span>
          </NavLink>
        )}

        {/* Settings - Available to all roles */}
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
          title={collapsed ? 'Settings' : ''}
        >
          <i className="bi bi-gear-fill"></i>
          <span>Settings</span>
        </NavLink>
      </div>

      {/* User profile drawer */}
      <div className="p-3 border-top border-secondary border-opacity-10 mt-auto bg-black bg-opacity-20">
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white text-truncate fw-medium small">{user.name}</div>
              <div className="text-muted text-truncate" style={{ fontSize: '11px' }}>{user.role}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
