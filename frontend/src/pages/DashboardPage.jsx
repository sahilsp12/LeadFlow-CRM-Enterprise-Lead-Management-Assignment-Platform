import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import DashboardStatCard from '../components/DashboardStatCard';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load dashboard metrics');
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="alert alert-danger">Failed to calculate analytics stats.</div>;

  // Chart 1: Status Bar Chart
  const statusLabels = Object.keys(stats.statusBreakdown);
  const statusValues = Object.values(stats.statusBreakdown);
  const statusData = {
    labels: statusLabels,
    datasets: [
      {
        label: 'Number of Leads',
        data: statusValues,
        backgroundColor: [
          'rgba(14, 165, 233, 0.75)', // Sky / New
          'rgba(79, 70, 229, 0.75)',  // Indigo / Contacted
          'rgba(16, 185, 129, 0.75)',  // Emerald / Qualified
          'rgba(239, 68, 68, 0.75)',   // Rose / Lost
          'rgba(100, 116, 139, 0.75)'  // Slate / Closed
        ],
        borderRadius: 6
      }
    ]
  };

  // Chart 2: Source Doughnut Chart
  const sourceLabels = Object.keys(stats.sourceBreakdown);
  const sourceValues = Object.values(stats.sourceBreakdown);
  const sourceData = {
    labels: sourceLabels.length > 0 ? sourceLabels : ['No Source Data'],
    datasets: [
      {
        data: sourceValues.length > 0 ? sourceValues : [1],
        backgroundColor: [
          '#6366f1',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#ec4899',
          '#8b5cf6'
        ],
        borderWidth: 2
      }
    ]
  };

  const activeLeadsCount = (stats.statusBreakdown.New || 0) + 
                         (stats.statusBreakdown.Contacted || 0) + 
                         (stats.statusBreakdown.Qualified || 0);

  const getActionIcon = (action) => {
    switch (action) {
      case 'Lead Created': return 'bi-plus-circle text-success';
      case 'Lead Assigned': return 'bi-person-check text-info';
      case 'Status Changed': return 'bi-arrow-left-right text-warning';
      case 'Lead Updated': return 'bi-pencil-square text-primary';
      default: return 'bi-info-circle text-secondary';
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="display-font text-dark fw-bold mb-1">Analytics Dashboard</h2>
        <p className="text-muted">Welcome, {user.name}. Here is your operational lead status summary.</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            title="Total Leads"
            value={stats.totalLeads}
            icon="bi-people-fill"
            variant="primary"
            loading={loading}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            title="Active Leads"
            value={activeLeadsCount}
            subtitle="New, Contacted & Qualified"
            icon="bi-clock-history"
            variant="info"
            loading={loading}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            title="Qualified Leads"
            value={stats.statusBreakdown.Qualified || 0}
            icon="bi-patch-check-fill"
            variant="success"
            loading={loading}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardStatCard
            title="Closed Deals"
            value={stats.statusBreakdown.Closed || 0}
            icon="bi-check2-all"
            variant="secondary"
            loading={loading}
          />
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-7">
          <div className="card border-0 premium-card p-4 h-100">
            <h5 className="display-font text-dark mb-4 fw-semibold">Leads by Status</h5>
            <div style={{ height: '280px', position: 'relative' }}>
              <Bar 
                data={statusData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 premium-card p-4 h-100">
            <h5 className="display-font text-dark mb-4 fw-semibold">Leads by Channel Source</h5>
            <div style={{ height: '280px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={sourceData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Feed & Agent Workloads */}
      <div className="row g-4">
        {/* Recent Activities Feed */}
        <div className={user.role === 'AGENT' ? 'col-12' : 'col-12 col-lg-7'}>
          <div className="card border-0 premium-card p-4 h-100">
            <h5 className="display-font text-dark mb-4 fw-semibold">Recent Operational Activities</h5>
            <div className="list-group list-group-flush">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((log) => (
                  <div key={log.id} className="list-group-item px-0 py-3 border-light">
                    <div className="d-flex align-items-start gap-3">
                      <div className="mt-1">
                        <i className={`bi ${getActionIcon(log.action)}`} style={{ fontSize: '18px' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark" style={{ fontSize: '14px' }}>{log.action}</strong>
                          <span className="text-muted small" style={{ fontSize: '11px' }}>
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-muted mb-1 small">{log.description}</p>
                        <div className="d-flex gap-2 align-items-center">
                          {log.lead && (
                            <span className="badge bg-light text-secondary border small" style={{ fontSize: '10px' }}>
                              Lead: {log.lead.name}
                            </span>
                          )}
                          <span className="text-muted small" style={{ fontSize: '10px' }}>
                            By: {log.user ? log.user.name : 'System'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted small">No operational logs recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Agent Workloads List (Admin/Manager only) */}
        {user.role !== 'AGENT' && (
          <div className="col-12 col-lg-5">
            <div className="card border-0 premium-card p-4 h-100">
              <h5 className="display-font text-dark mb-4 fw-semibold">Agent Active Load Ranking</h5>
              <div className="table-responsive border-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="py-2.5">Agent</th>
                      <th scope="col" className="py-2.5 text-center">Active Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.agentLoads.length > 0 ? (
                      stats.agentLoads.map((agent) => (
                        <tr key={agent.id}>
                          <td className="py-3">
                            <div className="fw-semibold text-dark">{agent.name}</div>
                            <span className="text-muted small">{agent.email}</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`badge rounded-pill ${agent.activeLeadsCount > 5 ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} px-3 py-1.5`} style={{ fontSize: '12px' }}>
                              <strong>{agent.activeLeadsCount}</strong> active
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-5 text-muted small">
                          No sales agents registered in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
