import React, { useState, useEffect } from 'react';
import ticketService from '../services/ticketService';
import { getAllUsers } from '../services/authService';
import '../styles/TicketList.css';

const TicketList = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_admin: '',
    reporter: ''
  });
  const [editingTicket, setEditingTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
    setUsers(getAllUsers());
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTickets(filters);
      let filteredTickets = response.data;

      // Filter tickets based on user role
      if (user.role === 'reporter') {
        filteredTickets = filteredTickets.filter(ticket => ticket.reporter.id === user.id);
      }

      setTickets(filteredTickets);
      setError('');
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assigned_admin: '',
      reporter: ''
    });
  };

  const handleTicketUpdate = async (ticketId, updateData) => {
    try {
      await ticketService.updateTicket(ticketId, updateData);
      await fetchTickets(); // Refresh the list
      setEditingTicket(null);
    } catch (err) {
      console.error('Failed to update ticket:', err);
      alert('Failed to update ticket');
    }
  };

  const handleAnalyzeTicket = async (ticketId) => {
    try {
      await ticketService.analyzeTicket(ticketId);
      await fetchTickets(); // Refresh to show updated category
    } catch (err) {
      console.error('Failed to analyze ticket:', err);
      alert('Failed to analyze ticket');
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAdmins = () => users.filter(u => u.role === 'admin');
  const getReporters = () => users.filter(u => u.role === 'reporter');

  if (loading) {
    return (
      <div className="tickets-loading">
        <div className="spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tickets-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={fetchTickets} className="retry-btn">
          <i className="fas fa-redo"></i>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      <div className="ticket-list-header">
        <h1>
          <i className="fas fa-list"></i>
          {user.role === 'reporter' ? 'Your Tickets' : 'All Tickets'}
        </h1>
        <span className="ticket-count">{tickets.length} tickets</span>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priority:</label>
          <select 
            value={filters.priority} 
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {user.role === 'admin' && (
          <div className="filter-group">
            <label>Assigned Admin:</label>
            <select 
              value={filters.assigned_admin} 
              onChange={(e) => handleFilterChange('assigned_admin', e.target.value)}
            >
              <option value="">All Admins</option>
              <option value="unassigned">Unassigned</option>
              {getAdmins().map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="filter-group">
            <label>Reporter:</label>
            <select 
              value={filters.reporter} 
              onChange={(e) => handleFilterChange('reporter', e.target.value)}
            >
              <option value="">All Reporters</option>
              {getReporters().map(reporter => (
                <option key={reporter.id} value={reporter.id}>
                  {reporter.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={clearFilters} className="clear-filters-btn">
          <i className="fas fa-times"></i>
          Clear Filters
        </button>
      </div>

      {/* Tickets */}
      {tickets.length === 0 ? (
        <div className="no-tickets">
          <i className="fas fa-inbox"></i>
          <p>No tickets found</p>
          <small>Try adjusting your filters or create a new ticket</small>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <div key={ticket.id} className={`ticket-card ${editingTicket === ticket.id ? 'editing' : ''}`}>
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

              <p className="ticket-description">{ticket.description}</p>

              <div className="ticket-meta">
                <div className="meta-row">
                  <span className="meta-item">
                    <i className="fas fa-user"></i>
                    <strong>Reporter:</strong> {ticket.reporter.name}
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-clock"></i>
                    <strong>Created:</strong> {formatDate(ticket.created_at)}
                  </span>
                </div>
                
                {ticket.assigned_admin && (
                  <div className="meta-row">
                    <span className="meta-item">
                      <i className="fas fa-user-shield"></i>
                      <strong>Assigned to:</strong> {ticket.assigned_admin.name}
                    </span>
                  </div>
                )}

                {ticket.category && (
                  <div className="meta-row">
                    <span className="meta-item">
                      <i className="fas fa-tag"></i>
                      <strong>Category:</strong> {ticket.category}
                    </span>
                  </div>
                )}

                {ticket.closed_at && (
                  <div className="meta-row">
                    <span className="meta-item">
                      <i className="fas fa-check-circle"></i>
                      <strong>Closed:</strong> {formatDate(ticket.closed_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions for Admins */}
              {user.role === 'admin' && (
                <div className="ticket-actions">
                  {editingTicket === ticket.id ? (
                    <div className="edit-form">
                      <div className="edit-row">
                        <select
                          onChange={(e) => handleTicketUpdate(ticket.id, { status: e.target.value })}
                          defaultValue={ticket.status}
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>

                        <select
                          onChange={(e) => handleTicketUpdate(ticket.id, { 
                            assigned_admin_id: e.target.value || null 
                          })}
                          defaultValue={ticket.assigned_admin?.id || ''}
                        >
                          <option value="">Unassigned</option>
                          {getAdmins().map(admin => (
                            <option key={admin.id} value={admin.id}>
                              {admin.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="edit-actions">
                        <button 
                          onClick={() => setEditingTicket(null)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button 
                        onClick={() => setEditingTicket(ticket.id)}
                        className="edit-btn"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      
                      {!ticket.assigned_admin || ticket.assigned_admin.id !== user.id ? (
                        <button 
                          onClick={() => handleTicketUpdate(ticket.id, { assigned_admin_id: user.id })}
                          className="assign-btn"
                        >
                          <i className="fas fa-hand-paper"></i>
                          Assign to Me
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleTicketUpdate(ticket.id, { assigned_admin_id: null })}
                          className="unassign-btn"
                        >
                          <i className="fas fa-hand-paper"></i>
                          Unassign
                        </button>
                      )}

                      <button 
                        onClick={() => handleAnalyzeTicket(ticket.id)}
                        className="analyze-btn"
                        title="Re-analyze with AI"
                      >
                        <i className="fas fa-brain"></i>
                        Analyze
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
