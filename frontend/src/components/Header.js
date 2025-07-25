import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            <i className="fas fa-ticket-alt"></i>
            <span>Support Tickets</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </Link>
          <Link 
            to="/tickets" 
            className={`nav-link ${isActive('/tickets') ? 'active' : ''}`}
          >
            <i className="fas fa-list"></i>
            Tickets
          </Link>
          {user.role === 'reporter' && (
            <Link 
              to="/create-ticket" 
              className={`nav-link ${isActive('/create-ticket') ? 'active' : ''}`}
            >
              <i className="fas fa-plus"></i>
              Create Ticket
            </Link>
          )}
        </nav>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              <i className={`fas ${user.role === 'admin' ? 'fa-user-shield' : 'fa-user'}`}></i>
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
