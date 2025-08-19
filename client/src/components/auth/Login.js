import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
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
        toast.success('Login successful!');
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-icon">🎓</div>
            <h1>Excellence Academy</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="user_name" className="form-label">
              Username
            </label>
            <div className="input-group">
              <FaUser className="input-icon" style={{ marginRight: '8px' }} /> {/* Added margin to the icon */}
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={user_name}
                onChange={onChange}
                className="form-control"
                placeholder="Enter your username"
                required
                style={{ paddingLeft: '50px' }} // Added padding to the left to create space for the icon
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password      
            </label>
            <div className="input-group">
              <FaLock className="input-icon" style={{ marginRight: '8px' }} /> {/* Added margin to the icon */}
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                className="form-control"
                placeholder="Enter your password"
                required
                style={{ paddingLeft: '50px' }} // Added padding to the left to create space for the icon
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
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="demo-accounts">
          <h4>Demo Accounts</h4>
          <div className="account-info">
            <div className="account-item">
              <strong>Super Admin:</strong> superadmin / admin123
            </div>
            <div className="account-item">
              <strong>Admin:</strong> admin / admin123
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <Link to="/" className="auth-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;   

