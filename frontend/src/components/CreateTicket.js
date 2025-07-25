import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import '../styles/CreateTicket.css';

const CreateTicket = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ticketService.createTicket({
        ...formData,
        reporter_id: user.id
      });
      
      // Success! Navigate to tickets list
      navigate('/tickets');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityDescription = (priority) => {
    const descriptions = {
      low: 'Minor issues that don\'t affect core functionality',
      medium: 'Issues that affect some functionality but have workarounds',
      high: 'Major issues that significantly impact functionality',
      critical: 'Critical issues that block core functionality or affect security'
    };
    return descriptions[priority];
  };

  return (
    <div className="create-ticket">
      <div className="create-ticket-header">
        <h1>
          <i className="fas fa-plus"></i>
          Create New Ticket
        </h1>
        <p>Report an issue or request support</p>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            required
            maxLength={200}
          />
          <small className="form-hint">
            Be specific and concise (max 200 characters)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the issue including steps to reproduce, expected behavior, and any error messages"
            required
            rows={8}
          />
          <small className="form-hint">
            Provide as much detail as possible to help us resolve your issue quickly
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="priority">
            Priority <span className="required">*</span>
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical Priority</option>
          </select>
          <small className="form-hint priority-hint">
            <strong>{formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}:</strong> {getPriorityDescription(formData.priority)}
          </small>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/tickets')}
            className="cancel-btn"
          >
            <i className="fas fa-times"></i>
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Create Ticket
              </>
            )}
          </button>
        </div>
      </form>

      <div className="create-ticket-info">
        <h3>
          <i className="fas fa-info-circle"></i>
          What happens next?
        </h3>
        <ul>
          <li>Your ticket will be automatically categorized using AI</li>
          <li>An admin will review and assign your ticket</li>
          <li>You'll be notified of any status updates</li>
          <li>You can track progress on the tickets page</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTicket;
