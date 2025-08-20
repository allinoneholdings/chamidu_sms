import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes, FaGraduationCap, FaUser, FaSignOutAlt, FaChalkboardTeacher } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Check if user is admin or super admin
  const isAdminUser = user?.role === 'admin' || user?.role === 'super_admin';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <FaGraduationCap className="brand-icon" />
          <span>Excellence Academy</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          
          <Link to="/about" className="nav-link" onClick={closeMenu}>
            About
          </Link>
          
          <Link to="/testimonials" className="nav-link" onClick={closeMenu}>
            Testimonials
          </Link>
          
          {isAuthenticated && user?.role === 'teacher' && (
            <Link to="/teacher" className="nav-link teacher-nav-link" onClick={closeMenu}>
              Teacher Dashboard
            </Link>
          )}
          
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
              Dashboard
            </Link>
          )}
          
          {isAuthenticated && user?.role === 'student' && (
            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
              Dashboard
            </Link>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className={`user-menu ${showUserMenu ? 'show' : ''}`} ref={userMenuRef}>
              <div className="user-info" onClick={toggleUserMenu}>
                <FaUser className="user-icon" />
                <span className="user-name">{user?.first_name} {user?.last_name}</span>
                <span className={`user-role ${user?.role === 'teacher' ? 'teacher-role' : ''}`}>
                  {user?.role === 'teacher' ? '👨‍🏫 Teacher' : 
                   user?.role === 'admin' ? '👨‍💼 Admin' :
                   user?.role === 'super_admin' ? '👑 Super Admin' :
                   user?.role === 'student' ? '👨‍🎓 Student' : user?.role}
                </span>
              </div>
              <button className="logout-btn" onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
