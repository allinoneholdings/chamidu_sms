import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaUserShield, FaGraduationCap, FaTimes, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    user_code: '',
    user_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'student'
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const generateUserCode = (role) => {
    const rolePrefix = {
      'super_admin': 'SA',
      'admin': 'AD',
      'student': 'ST'
    };
    const prefix = rolePrefix[role] || 'ST';
    const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${number}`;
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      user_code: '',
      user_name: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'student'
    });
    setShowModal(true);
  };

  const handleEditUser = (userItem) => {
    setEditingUser(userItem);
    setFormData({
      user_code: userItem.user_code,
      user_name: userItem.user_name,
      first_name: userItem.first_name,
      last_name: userItem.last_name,
      email: userItem.email,
      password: '', // Don't pre-fill password for security
      role: userItem.role
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userItem) => {
    if (window.confirm(`Are you sure you want to delete ${userItem.first_name} ${userItem.last_name}?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${userItem._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('User deleted successfully');
          fetchUsers();
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      // Generate user code if adding new user
      const submitData = {
        ...formData,
        user_code: editingUser ? formData.user_code : generateUserCode(formData.role)
      };

      // Remove password from update if it's empty
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(`User ${editingUser ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${editingUser ? 'update' : 'add'} user`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(`Failed to ${editingUser ? 'update' : 'add'} user`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(userItem =>
    userItem.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.user_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <FaUserShield className="role-icon super-admin" />;
      case 'admin':
        return <FaUser className="role-icon admin" />;
      case 'student':
        return <FaGraduationCap className="role-icon student" />;
      default:
        return <FaUser className="role-icon" />;
    }
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      'super_admin': 'badge-super-admin',
      'admin': 'badge-admin',
      'student': 'badge-student'
    };
    
    return <span className={`role-badge ${roleClasses[role]}`}>{role.replace('_', ' ')}</span>;
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users">
      <div className="container">
        <div className="users-header">
          <div className="header-content">
            <h1>Users Management</h1>
            <p>Manage system users, roles, and access permissions</p>
          </div>
          <div className="header-actions">
            {user?.role === 'super_admin' && (
              <button className="btn btn-primary" onClick={handleAddUser}>
                <FaPlus /> Add New User
              </button>
            )}
            <button className="btn btn-outline" onClick={() => window.print()}>
              <FaFileAlt /> Export
            </button>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name, email, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="users-content">
          {filteredUsers.length === 0 ? (
            <div className="no-users">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Code</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    {user?.role === 'super_admin' && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(userItem => (
                    <tr key={userItem._id}>
                      <td>
                        <div className="user-info">
                          {getRoleIcon(userItem.role)}
                          <div className="user-details">
                            <div className="user-name">
                              {userItem.first_name} {userItem.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{userItem.user_code}</td>
                      <td>{userItem.user_name}</td>
                      <td>{userItem.email}</td>
                      <td>{getRoleBadge(userItem.role)}</td>
                      {user?.role === 'super_admin' && (
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-secondary" 
                              title="Edit"
                              onClick={() => handleEditUser(userItem)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger" 
                              title="Delete"
                              onClick={() => handleDeleteUser(userItem)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Add/Edit User */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name *</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="user_name">Username *</label>
                    <input
                      type="text"
                      id="user_name"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Unique username"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Role *</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {editingUser && (
                  <div className="form-group">
                    <label htmlFor="user_code">User Code</label>
                    <input
                      type="text"
                      id="user_code"
                      name="user_code"
                      value={formData.user_code}
                      onChange={handleInputChange}
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="password">
                    Password {editingUser ? '(Leave empty to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    placeholder={editingUser ? 'Enter new password or leave empty' : 'Enter password'}
                    minLength="6"
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
