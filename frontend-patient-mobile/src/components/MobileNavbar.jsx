import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    // Remove body scroll lock
    document.body.classList.remove('menu-open');
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Toggle body scroll lock
    if (!isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    document.body.classList.remove('menu-open');
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="nav-brand">
            <h1>🏥 Ashwini Patient Portal</h1>
          </div>
          
          <button 
            className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>

          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
              Profile
            </Link>
            <Link to="/measurements" className={`nav-link ${isActive('/measurements')}`}>
              Vitals
            </Link>
            <Link to="/prescription" className={`nav-link ${isActive('/prescription')}`}>
              Prescription
            </Link>
            <Link to="/visits" className={`nav-link ${isActive('/visits')}`}>
              Visits
            </Link>
            <Link to="/health-progress" className={`nav-link ${isActive('/health-progress')}`}>
              Health Progress
            </Link>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      {/* Overlay for mobile menu */}
      <div 
        className={`nav-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-hidden="true"
      ></div>
    </>
  );
};

export default MobileNavbar;
