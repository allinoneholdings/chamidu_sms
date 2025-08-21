import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaPrint, 
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import './AttendanceReport.css';

const AttendanceReport = ({ 
  isOpen, 
  onClose, 
  selectedStatus, 
  timeframe, 
  dateRange, 
  selectedClass 
}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && selectedClass && selectedStatus && dateRange) {
      fetchAttendanceReport();
    }
  }, [isOpen, selectedClass, selectedStatus, dateRange]);

  const fetchAttendanceReport = async () => {
    if (!selectedClass || !selectedStatus || !dateRange) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/attendance/class/${selectedClass._id}/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Filter students by the selected status
        const filteredStudents = data.summary.filter(student => 
          student[selectedStatus] > 0
        );

        // Sort by count (highest first)
        filteredStudents.sort((a, b) => b[selectedStatus] - a[selectedStatus]);

        setStudents(filteredStudents);
      } else {
        console.error('Failed to fetch attendance report');
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      present: {
        icon: FaCheckCircle,
        label: 'Present',
        color: '#28a745',
        bgColor: '#d4edda'
      },
      absent: {
        icon: FaTimesCircle,
        label: 'Absent',
        color: '#dc3545',
        bgColor: '#f8d7da'
      },
      late: {
        icon: FaClock,
        label: 'Late',
        color: '#ffc107',
        bgColor: '#fff3cd'
      },
      excused: {
        icon: FaExclamationTriangle,
        label: 'Excused',
        color: '#6c757d',
        bgColor: '#e2e3e5'
      }
    };
    return configs[status];
  };

  const getTimeframeLabel = (timeframe) => {
    const labels = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year'
    };
    return labels[timeframe] || timeframe;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToCSV = async () => {
    if (!students.length) return;

    setExporting(true);
    try {
      const csvContent = generateCSV();
      downloadCSV(csvContent, `attendance_report_${selectedStatus}_${timeframe}.csv`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const generateCSV = () => {
    const headers = ['Student Name', 'Email', 'Status Count', 'Total Classes', 'Percentage'];
    const rows = students.map(student => [
      `${student.student.first_name} ${student.student.last_name}`,
      student.student.email || 'N/A',
      student[selectedStatus],
      student.total,
      `${((student[selectedStatus] / student.total) * 100).toFixed(1)}%`
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  if (!isOpen) return null;

  const statusConfig = getStatusConfig(selectedStatus);
  const IconComponent = statusConfig.icon;

  return (
    <div className="attendance-report-overlay">
      <div className="attendance-report-modal">
        <div className="report-header">
          <button className="close-btn" onClick={onClose}>
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="report-title">
            <div className="status-badge" style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}>
              <IconComponent />
              <span>{statusConfig.label}</span>
            </div>
            <h2>Attendance Report</h2>
            <p className="report-subtitle">
              {getTimeframeLabel(timeframe)} • {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </p>
          </div>

          <div className="report-actions">
            <button 
              className="action-btn export-btn" 
              onClick={exportToCSV}
              disabled={exporting || !students.length}
            >
              <FaDownload />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            <button 
              className="action-btn print-btn" 
              onClick={printReport}
              disabled={!students.length}
            >
              <FaPrint />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="report-content">
          {loading ? (
            <div className="report-loading">
              <div className="loading-spinner"></div>
              <span>Loading attendance data...</span>
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="report-summary">
                <div className="summary-stat">
                  <FaUsers />
                  <div>
                    <span className="stat-number">{students.length}</span>
                    <span className="stat-label">Students</span>
                  </div>
                </div>
                <div className="summary-stat">
                  <IconComponent />
                  <div>
                    <span className="stat-number">
                      {students.reduce((sum, student) => sum + student[selectedStatus], 0)}
                    </span>
                    <span className="stat-label">Total {statusConfig.label} Count</span>
                  </div>
                </div>
              </div>

              <div className="students-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>{statusConfig.label} Count</th>
                      <th>Total Classes</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.student._id}>
                        <td>
                          <div className="student-info">
                            <span className="student-name">
                              {student.student.first_name} {student.student.last_name}
                            </span>
                          </div>
                        </td>
                        <td>{student.student.email || 'N/A'}</td>
                        <td>
                          <span className="status-count" style={{ color: statusConfig.color }}>
                            {student[selectedStatus]}
                          </span>
                        </td>
                        <td>{student.total}</td>
                        <td>
                          <span className="percentage">
                            {((student[selectedStatus] / student.total) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">📊</div>
              <h3>No Data Available</h3>
              <p>No students found with {selectedStatus} status for the selected timeframe.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;

