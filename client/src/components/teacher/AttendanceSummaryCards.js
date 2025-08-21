import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUsers
} from 'react-icons/fa';
import './AttendanceSummaryCards.css';

const AttendanceSummaryCards = ({ selectedClass, onCardClick }) => {
  const [timeframe, setTimeframe] = useState('today');
  const [summaryData, setSummaryData] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0
  });
  const [loading, setLoading] = useState(false);
  const [currentDateRange, setCurrentDateRange] = useState({ startDate: '', endDate: '' });

  const timeframes = [
    { key: 'today', label: 'Today', icon: FaCalendarAlt },
    { key: 'week', label: 'This Week', icon: FaCalendarAlt },
    { key: 'month', label: 'This Month', icon: FaCalendarAlt },
    { key: 'year', label: 'This Year', icon: FaCalendarAlt }
  ];

  useEffect(() => {
    if (selectedClass) {
      console.log('Selected class or timeframe changed, fetching attendance summary...');
      fetchAttendanceSummary();
    }
  }, [selectedClass, timeframe]);

  const fetchAttendanceSummary = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Calculate date range based on timeframe
      const { startDate, endDate } = getDateRange(timeframe);
      
      // Debug logging
      console.log(`Fetching attendance for timeframe: ${timeframe}`);
      console.log(`Date range: ${startDate} to ${endDate}`);
      
      // Store current date range for display
      setCurrentDateRange({ startDate, endDate });
      
      // Validate date format
      if (!startDate || !endDate || !startDate.match(/^\d{4}-\d{2}-\d{2}$/) || !endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.error('Invalid date format:', { startDate, endDate });
        return;
      }
      
      const response = await fetch(
        `/api/attendance/class/${selectedClass._id}/summary?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

              if (response.ok) {
          const data = await response.json();
          console.log('Received attendance data:', data);
          
          // Calculate summary counts
          const summary = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          };

          if (data.summary && data.summary.length > 0) {
            data.summary.forEach(student => {
              summary.present += student.present || 0;
              summary.absent += student.absent || 0;
              summary.late += student.late || 0;
              summary.excused += student.excused || 0;
            });
          } else {
            console.log('No attendance data found for the selected date range');
          }

          setSummaryData(summary);
        } else {
          console.error('Failed to fetch attendance summary');
          // Set default values if no data
          setSummaryData({
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          });
        }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateRange = (timeframe) => {
    const now = new Date();
    let startDate, endDate;

    switch (timeframe) {
      case 'today':
        // For today, use the current date in local timezone
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = today;
        endDate = today;
        break;
      case 'week':
        // Calculate Monday of current week (Monday = 1, Sunday = 0)
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
        startDate = monday;
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Format dates as YYYY-MM-DD without timezone conversion
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  const handleCardClick = (status) => {
    if (onCardClick) {
      const { startDate, endDate } = getDateRange(timeframe);
      onCardClick(status, { startDate, endDate, timeframe });
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      present: {
        icon: FaCheckCircle,
        label: 'Students Present',
        color: '#28a745',
        bgColor: '#d4edda',
        borderColor: '#c3e6cb'
      },
      absent: {
        icon: FaTimesCircle,
        label: 'Students Absent',
        color: '#dc3545',
        bgColor: '#f8d7da',
        borderColor: '#f5c6cb'
      },
      late: {
        icon: FaClock,
        label: 'Students Late',
        color: '#ffc107',
        bgColor: '#fff3cd',
        borderColor: '#ffeaa7'
      },
      excused: {
        icon: FaExclamationTriangle,
        label: 'Students Excused',
        color: '#6c757d',
        bgColor: '#e2e3e5',
        borderColor: '#d6d8db'
      }
    };
    return configs[status];
  };

  if (!selectedClass) {
    return null;
  }

  return (
    <div className="attendance-summary-section">
      <div className="summary-header">
        <h3>Attendance Summary</h3>
        <div className="timeframe-filter">
          {timeframes.map((tf) => {
            const IconComponent = tf.icon;
            return (
              <button
                key={tf.key}
                className={`timeframe-btn ${timeframe === tf.key ? 'active' : ''}`}
                onClick={() => setTimeframe(tf.key)}
              >
                <IconComponent />
                <span>{tf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {currentDateRange.startDate && currentDateRange.endDate && (
        <div className="date-range-display">
          <span className="date-range-label">Showing data for:</span>
          <span className="date-range-value">
            {formatDisplayDate(currentDateRange.startDate)} - {formatDisplayDate(currentDateRange.endDate)}
          </span>
        </div>
      )}

      <div className="summary-cards">
        {Object.entries(summaryData).map(([status, count]) => {
          const config = getStatusConfig(status);
          const IconComponent = config.icon;
          
          return (
            <div
              key={status}
              className="summary-card"
              onClick={() => handleCardClick(status)}
              style={{
                borderColor: config.borderColor,
                backgroundColor: config.bgColor
              }}
            >
              <div className="card-icon" style={{ color: config.color }}>
                <IconComponent />
              </div>
              <div className="card-content">
                <div className="card-count">{count}</div>
                <div className="card-label">{config.label}</div>
              </div>
              <div className="card-arrow">→</div>
            </div>
          );
        })}
      </div>


      {loading && (
        <div className="summary-loading">
          <div className="loading-spinner"></div>
          <span>Loading attendance data...</span>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummaryCards;
