import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaChartBar
} from 'react-icons/fa';
import AttendanceSummaryCards from './AttendanceSummaryCards';
import AttendanceReport from './AttendanceReport';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Attendance report modal state
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    selectedStatus: null,
    timeframe: null,
    dateRange: null
  });

  useEffect(() => {
    if (user && user._id) {
      console.log('TeacherDashboard: User loaded:', user);
      fetchTeacherClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      console.log('Class or date changed, fetching fresh data...');
      // Reset attendance data when class or date changes
      setAttendanceData({});
      fetchClassStudents();
      fetchAttendanceData();
    }
  }, [selectedClass, selectedDate]);

  const fetchTeacherClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching classes for teacher:', user._id);
      console.log('User object:', user);
      
      const response = await fetch(`/api/classes/teacher/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched classes:', data);
        setTeacherClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0]);
        } else {
          setSelectedClass(null);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch classes:', errorData);
        toast.error(errorData.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Error fetching classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classes/${selectedClass._id}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      toast.error('Error fetching students');
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching attendance data for class:', selectedClass._id, 'date:', selectedDate);
      
      const response = await fetch(`/api/attendance/class/${selectedClass._id}/date/${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched attendance data:', data);
        
        const attendanceMap = {};
        data.forEach(record => {
          const sid = (record.student_id && typeof record.student_id === 'object') ? record.student_id._id : record.student_id;
          attendanceMap[sid] = record.status;
        });
        
        console.log('Processed attendance map:', attendanceMap);
        setAttendanceData(attendanceMap);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch attendance data:', errorData);
        // If no attendance data exists yet, set default values
        if (response.status === 404) {
          const defaultAttendance = {};
          students.forEach(student => {
            defaultAttendance[student._id] = 'present';
          });
          setAttendanceData(defaultAttendance);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Set default attendance values on error
      const defaultAttendance = {};
      students.forEach(student => {
        defaultAttendance[student._id] = 'present';
      });
      setAttendanceData(defaultAttendance);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    console.log(`Changing attendance for student ${studentId} to ${status}`);
    setAttendanceData(prev => {
      const newData = {
        ...prev,
        [studentId]: status
      };
      console.log('Updated attendance data:', newData);
      return newData;
    });
  };

  const saveAttendance = async () => {
    if (!selectedClass || !students.length) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const attendanceRecords = students.map(student => ({
        class_id: selectedClass._id,
        student_id: student._id,
        date: selectedDate,
        status: attendanceData[student._id] || 'present',
        marked_by: user._id
      }));

      console.log('Saving attendance records:', attendanceRecords);

      const response = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ records: attendanceRecords })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Attendance saved successfully:', result);
        
        // Update local state immediately for better UX
        const newAttendanceData = { ...attendanceData };
        students.forEach(student => {
          newAttendanceData[student._id] = attendanceData[student._id] || 'present';
        });
        setAttendanceData(newAttendanceData);
        
        toast.success('Attendance saved successfully!');
        
        // Refresh attendance data from server to ensure consistency
        await fetchAttendanceData();
      } else {
        const errorData = await response.json();
        console.error('Failed to save attendance:', errorData);
        toast.error(errorData.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FaCheckCircle className="status-icon present" />;
      case 'absent':
        return <FaTimesCircle className="status-icon absent" />;
      case 'late':
        return <FaClock className="status-icon late" />;
      case 'excused':
        return <FaExclamationTriangle className="status-icon excused" />;
      default:
        return <FaCheckCircle className="status-icon present" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#28a745';
      case 'absent':
        return '#dc3545';
      case 'late':
        return '#ffc107';
      case 'excused':
        return '#6c757d';
      default:
        return '#28a745';
    }
  };

  const handleSummaryCardClick = (status, dateRangeInfo) => {
    setReportModal({
      isOpen: true,
      selectedStatus: status,
      timeframe: dateRangeInfo.timeframe,
      dateRange: {
        startDate: dateRangeInfo.startDate,
        endDate: dateRangeInfo.endDate
      }
    });
  };

  const closeReportModal = () => {
    setReportModal({
      isOpen: false,
      selectedStatus: null,
      timeframe: null,
      dateRange: null
    });
  };

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (teacherClasses.length === 0) {
    return (
      <div className="teacher-dashboard">
        <div className="dashboard-header">
          <h1>Teacher Dashboard</h1>
          <p>Welcome back, {user.first_name} {user.last_name}</p>
        </div>
        
        <div className="no-classes">
          <div className="no-classes-content">
            <div className="no-classes-icon">📚</div>
            <h2>No Classes Assigned</h2>
            <p>You don't have any classes assigned yet. This could be because:</p>
            <ul>
              <li>Classes haven't been created yet</li>
              <li>Classes haven't been assigned to you</li>
              <li>You're new to the system</li>
            </ul>
            <p>Please contact an administrator to get classes assigned to you.</p>
            <div className="no-classes-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p>Welcome back, {user.first_name} {user.last_name}</p>
      </div>

      <div className="dashboard-content">
        <div className="class-selector">
          <label htmlFor="class-select">Select Class:</label>
          <select
            id="class-select"
            value={selectedClass?._id || ''}
            onChange={(e) => {
              const classObj = teacherClasses.find(c => c._id === e.target.value);
              setSelectedClass(classObj);
            }}
          >
            {teacherClasses.map(cls => (
              <option key={cls._id} value={cls._id}>
                {cls.class_name} - {cls.semester} {cls.academic_year}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="class-info">
            <h2>{selectedClass.class_name}</h2>
            <p><strong>Semester:</strong> {selectedClass.semester} {selectedClass.academic_year}</p>
            <p><strong>Capacity:</strong> {selectedClass.capacity} students</p>
            <p><strong>Current Students:</strong> {students.length}</p>
          </div>
        )}

        {selectedClass && (
          <AttendanceSummaryCards
            selectedClass={selectedClass}
            onCardClick={handleSummaryCardClick}
          />
        )}

        {selectedClass && students.length > 0 && (
          <div className="attendance-section">
            <div className="attendance-header">
              <h3>Mark Attendance</h3>
              <div className="date-selector">
                <label htmlFor="date-select">Date:</label>
                <input
                  type="date"
                  id="date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="attendance-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td>{student.first_name} {student.last_name}</td>
                      <td>{student.email}</td>
                      <td>
                        {getStatusIcon(attendanceData[student._id] || 'present')}
                        <span style={{ color: getStatusColor(attendanceData[student._id] || 'present') }}>
                          {attendanceData[student._id] || 'present'}
                        </span>
                      </td>
                      <td>
                        <div className="status-buttons">
                          <button
                            className={`status-btn ${(attendanceData[student._id] || 'present') === 'present' ? 'active' : ''}`}
                            onClick={() => handleAttendanceChange(student._id, 'present')}
                          >
                            Present
                          </button>
                          <button
                            className={`status-btn ${(attendanceData[student._id] || 'present') === 'absent' ? 'active' : ''}`}
                            onClick={() => handleAttendanceChange(student._id, 'absent')}
                          >
                            Absent
                          </button>
                          <button
                            className={`status-btn ${(attendanceData[student._id] || 'present') === 'late' ? 'active' : ''}`}
                            onClick={() => handleAttendanceChange(student._id, 'late')}
                          >
                            Late
                          </button>
                          <button
                            className={`status-btn ${(attendanceData[student._id] || 'present') === 'excused' ? 'active' : ''}`}
                            onClick={() => handleAttendanceChange(student._id, 'excused')}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="attendance-actions">
              <button
                className="save-btn"
                onClick={saveAttendance}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        )}
      </div>

      <AttendanceReport
        isOpen={reportModal.isOpen}
        onClose={closeReportModal}
        selectedStatus={reportModal.selectedStatus}
        timeframe={reportModal.timeframe}
        dateRange={reportModal.dateRange}
        selectedClass={selectedClass}
      />
    </div>
  );
};

export default TeacherDashboard;

