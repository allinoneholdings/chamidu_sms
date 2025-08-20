import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';
import './Auth.css';

const TeacherLogin = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

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
        if (result.user && result.user.role === 'teacher') {
          toast.success('Teacher login successful!');
          navigate('/teacher');
        } else {
          toast.error('This login is for teachers only. Please use the appropriate login portal.');
          // Reset form
          setFormData({ user_name: '', password: '' });
        }
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
    <div className="auth-container teacher-login">
      <div className="auth-card teacher-card">
        <div className="auth-header">
          <div className="logo-section">
            <div className="logo-icon teacher-icon">👨‍🏫</div>
            <h1>Teacher Portal</h1>
          </div>
          <h2>Teacher Access</h2>
          <p>Sign in to access your teaching dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group ">
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
                placeholder="Enter your teacher username"
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
                placeholder="Enter your password"
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
            className="btn btn-primary teacher-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                <FaChalkboardTeacher /> Sign In to Teacher Portal
              </>
            )}
          </button>
        </form>

        
        <div className="auth-footer">
          <Link to="/" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="teacher-note">
            <FaChalkboardTeacher /> Teacher Access Only
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
