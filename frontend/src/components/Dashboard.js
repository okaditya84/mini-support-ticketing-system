import React, { useState, useEffect } from 'react';
import ticketService from '../services/ticketService';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsResponse = await ticketService.getStats();
      setStats(statsResponse.data);

      // Fetch recent tickets
      const ticketsResponse = await ticketService.getTickets();
      const tickets = ticketsResponse.data;
      
      // Show different tickets based on user role
      let filteredTickets;
      if (user.role === 'reporter') {
        filteredTickets = tickets.filter(ticket => ticket.reporter.id === user.id);
      } else {
        // For admins, show all tickets but prioritize assigned ones
        filteredTickets = tickets.sort((a, b) => {
          if (a.assigned_admin?.id === user.id && b.assigned_admin?.id !== user.id) return -1;
          if (b.assigned_admin?.id === user.id && a.assigned_admin?.id !== user.id) return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
      }
      
      setRecentTickets(filteredTickets.slice(0, 5));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#dc3545',
      'in-progress': '#ffc107',
      closed: '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          <i className="fas fa-redo"></i>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>
          <i className="fas fa-tachometer-alt"></i>
          Dashboard
        </h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.total_tickets || 0}</h3>
            <p>Total Tickets</p>
          </div>
        </div>

        <div className="stat-card open">
          <div className="stat-icon">
            <i className="fas fa-folder-open"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.status_breakdown?.open || 0}</h3>
            <p>Open Tickets</p>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">
            <i className="fas fa-spinner"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.status_breakdown?.in_progress || 0}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card closed">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats?.status_breakdown?.closed || 0}</h3>
            <p>Closed Tickets</p>
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="priority-breakdown">
        <h2>Priority Breakdown</h2>
        <div className="priority-bars">
          {stats?.priority_breakdown && Object.entries(stats.priority_breakdown).map(([priority, count]) => (
            <div key={priority} className="priority-bar">
              <div className="priority-label">
                <span className="priority-name" style={{ color: getPriorityColor(priority) }}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
                <span className="priority-count">{count}</span>
              </div>
              <div className="priority-progress">
                <div 
                  className="priority-fill"
                  style={{ 
                    width: `${(count / stats.total_tickets) * 100}%`,
                    backgroundColor: getPriorityColor(priority)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="recent-tickets">
        <h2>
          {user.role === 'reporter' ? 'Your Recent Tickets' : 'Recent Tickets'}
        </h2>
        {recentTickets.length === 0 ? (
          <div className="no-tickets">
            <i className="fas fa-inbox"></i>
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="tickets-list">
            {recentTickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <h3>{ticket.title}</h3>
                  <div className="ticket-badges">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <p className="ticket-description">
                  {ticket.description.length > 100 
                    ? ticket.description.substring(0, 100) + '...'
                    : ticket.description
                  }
                </p>
                <div className="ticket-meta">
                  <span className="ticket-reporter">
                    <i className="fas fa-user"></i>
                    {ticket.reporter.name}
                  </span>
                  {ticket.assigned_admin && (
                    <span className="ticket-admin">
                      <i className="fas fa-user-shield"></i>
                      {ticket.assigned_admin.name}
                    </span>
                  )}
                  <span className="ticket-date">
                    <i className="fas fa-clock"></i>
                    {formatDate(ticket.created_at)}
                  </span>
                  {ticket.category && (
                    <span className="ticket-category">
                      <i className="fas fa-tag"></i>
                      {ticket.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
