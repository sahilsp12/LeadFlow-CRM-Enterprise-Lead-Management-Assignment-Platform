import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content Pane */}
      <div className="content-wrapper d-flex flex-column">
        {/* Navbar receiving the toggle handler */}
        <Navbar onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        
        <main className="p-4 flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 75px)' }}>
          <div className="container-fluid py-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
