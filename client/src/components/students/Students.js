import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Students.css';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    email: '',
    phone_no: '',
    address: '',
    class_id: '',
    admission_date: new Date().toISOString().split('T')[0]
  });

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes for dropdown
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
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      email: '',
      phone_no: '',
      address: '',
      class_id: '',
      admission_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
      email: student.email,
      phone_no: student.phone_no,
      address: student.address,
      class_id: student.class_id?._id || student.class_id,
      admission_date: student.admission_date ? student.admission_date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/students/${student._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('Student deleted successfully');
          fetchStudents();
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to delete student');
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingStudent ? `/api/students/${editingStudent._id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`Student ${editingStudent ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        fetchStudents();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${editingStudent ? 'update' : 'add'} student`);
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(`Failed to ${editingStudent ? 'update' : 'add'} student`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="students-loading">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="students">
      <div className="container">
        <div className="students-header">
          <div className="header-content">
            <h1>Students Management</h1>
            <p>Manage student information, enrollment, and academic records</p>
          </div>
          <div className="header-actions">
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <button className="btn btn-primary" onClick={handleAddStudent}>
                <FaPlus /> Add New Student
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
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="students-content">
          {filteredStudents.length === 0 ? (
            <div className="no-students">
              <p>No students found.</p>
            </div>
          ) : (
            <div className="students-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Class</th>
                    <th>Admission Date</th>
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student._id}>
                      <td>
                        <div className="student-name">
                          {student.first_name} {student.last_name}
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.phone_no}</td>
                      <td>{student.class_id?.class_name || 'Not Assigned'}</td>
                      <td>{new Date(student.admission_date).toLocaleDateString()}</td>
                      {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-secondary" 
                              title="Edit"
                              onClick={() => handleEditStudent(student)}
                            >
                              <FaEdit />
                            </button>
                            {user?.role === 'super_admin' && (
                              <button 
                                className="btn btn-sm btn-danger" 
                                title="Delete"
                                onClick={() => handleDeleteStudent(student)}
                              >
                                <FaTrash />
                              </button>
                            )}
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

        {/* Modal for Add/Edit Student */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
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
                  <div className="form-group">
                    <label htmlFor="phone_no">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone_no"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date_of_birth">Date of Birth *</label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="admission_date">Admission Date *</label>
                    <input
                      type="date"
                      id="admission_date"
                      name="admission_date"
                      value={formData.admission_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="class_id">Class *</label>
                  <select
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map(classItem => (
                      <option key={classItem._id} value={classItem._id}>
                        {classItem.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  ></textarea>
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
                    {editingStudent ? 'Update Student' : 'Add Student'}
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

export default Students;
