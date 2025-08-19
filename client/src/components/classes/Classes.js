import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Classes.css';

const Classes = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    class_name: '',
    description: '',
    capacity: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    semester: 'Fall'
  });

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        toast.error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    setEditingClass(null);
    setFormData({
      class_name: '',
      description: '',
      capacity: '',
      academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      semester: 'Fall'
    });
    setShowModal(true);
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      class_name: classItem.class_name,
      description: classItem.description || '',
      capacity: classItem.capacity?.toString() || '',
      academic_year: classItem.academic_year,
      semester: classItem.semester || 'Fall'
    });
    setShowModal(true);
  };

  const handleDeleteClass = async (classItem) => {
    if (window.confirm(`Are you sure you want to delete ${classItem.class_name}?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/classes/${classItem._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('Class deleted successfully');
          fetchClasses();
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to delete class');
        }
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingClass ? `/api/classes/${editingClass._id}` : '/api/classes';
      const method = editingClass ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity)
        })
      });

      if (response.ok) {
        toast.success(`Class ${editingClass ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        fetchClasses();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${editingClass ? 'update' : 'add'} class`);
      }
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error(`Failed to ${editingClass ? 'update' : 'add'} class`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="classes-loading">
        <div className="spinner"></div>
        <p>Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="classes">
      <div className="container">
        <div className="classes-header">
          <div className="header-content">
            <h1>Classes Management</h1>
            <p>Organize academic classes, schedules, and capacity management</p>
          </div>
          <div className="header-actions">
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <button className="btn btn-primary" onClick={handleAddClass}>
                <FaPlus /> Add New Class
              </button>
            )}
            <button className="btn btn-outline" onClick={() => window.print()}>
              <FaFileAlt /> Export
            </button>
          </div>
        </div>

        <div className="classes-content">
          {classes.length === 0 ? (
            <div className="no-classes">
              <p>No classes found.</p>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map(classItem => (
                <div key={classItem._id} className="class-card">
                  <div className="class-header">
                    <h3>{classItem.class_name}</h3>
                    <div className="class-actions">
                      {user?.role === 'super_admin' && (
                        <button 
                          className="btn btn-sm btn-secondary" 
                          title="Edit"
                          onClick={() => handleEditClass(classItem)}
                        >
                          <FaEdit />
                        </button>
                      )}
                      {user?.role === 'super_admin' && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          title="Delete"
                          onClick={() => handleDeleteClass(classItem)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="class-description">{classItem.description}</p>
                  <div className="class-details">
                    <div className="detail-item">
                      <span className="detail-label">Capacity:</span>
                      <span className="detail-value">{classItem.capacity} students</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Academic Year:</span>
                      <span className="detail-value">{classItem.academic_year}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Semester:</span>
                      <span className="detail-value">{classItem.semester}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Add/Edit Class */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="class_name">Class Name *</label>
                  <input
                    type="text"
                    id="class_name"
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Computer Science 101"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description of the class"
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="capacity">Capacity *</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="100"
                      placeholder="Maximum students"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="semester">Semester *</label>
                    <select
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="academic_year">Academic Year *</label>
                  <input
                    type="text"
                    id="academic_year"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2024-2025"
                    pattern="[0-9]{4}-[0-9]{4}"
                    title="Format: YYYY-YYYY (e.g., 2024-2025)"
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
                    {editingClass ? 'Update Class' : 'Add Class'}
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

export default Classes;
