import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const { user_name, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!user_name || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData);
      if (result.success) {
        toast.success('Admin login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-login">
      <div className="auth-card admin-card">
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-icon admin-icon">🛡️</div>
            <h1>Admin Portal</h1>
          </div>
          <h2>Administrator Access</h2>
          <p>Sign in to manage the system</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="user_name" className="form-label">
              Username
            </label>
            <div className="input-group">
              <FaUser className="input-icon" style={{ marginRight: '8px' }} />
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={user_name}
                onChange={onChange}
                className="form-control"
                placeholder="Enter admin username"
                required
                style={{ paddingLeft: '50px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password      
            </label>
            <div className="input-group">
              <FaLock className="input-icon" style={{ marginRight: '8px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                className="form-control"
                placeholder="Enter admin password"
                required
                style={{ paddingLeft: '50px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary admin-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="security-note">
            <FaShieldAlt /> Secure Admin Access
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

