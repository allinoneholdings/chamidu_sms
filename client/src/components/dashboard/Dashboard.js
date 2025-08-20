import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaChartLine, 
  FaCalendarAlt, 
  FaBell, 
  FaCog, 
  FaPlus,
  FaSearch,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaBookOpen,
  FaClipboardList
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalUsers: 0,
    recentAdmissions: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentClasses, setRecentClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh dashboard every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      const token = localStorage.getItem('token');
      
      // Fetch statistics
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalStudents: statsData.totalStudents || 0,
          totalClasses: statsData.totalClasses || 0,
          totalUsers: statsData.totalUsers || 0,
          recentAdmissions: statsData.recentAdmissions || 0,
          studentGrowth: statsData.studentGrowth || 0,
          recentClasses: statsData.recentClasses || 0
        });
      } else {
        console.error('Failed to fetch stats:', statsResponse.status);
        // Fallback to mock data
        setStats({
          totalStudents: 1250,
          totalClasses: 45,
          totalUsers: 89,
          recentAdmissions: 23,
          studentGrowth: 12,
          recentClasses: 3
        });
      }

      // Fetch recent students
      const studentsResponse = await fetch('/api/dashboard/recent-students?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setRecentStudents(studentsData);
      } else {
        console.error('Failed to fetch recent students:', studentsResponse.status);
        setRecentStudents([]);
      }

      // Fetch recent classes
      const classesResponse = await fetch('/api/dashboard/recent-classes?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setRecentClasses(classesData);
      } else {
        console.error('Failed to fetch recent classes:', classesResponse.status);
        setRecentClasses([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      // Set mock data on error
      setStats({
        totalStudents: 1250,
        totalClasses: 45,
        totalUsers: 89,
        recentAdmissions: 23,
        studentGrowth: 12,
        recentClasses: 3
      });
      setRecentStudents([]);
      setRecentClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getQuickActions = () => {
    const actions = [
      {
        title: 'Add Student',
        icon: <FaUserPlus />,
        link: '/students',
        color: 'primary',
        description: 'Enroll new students'
      },
      {
        title: 'Add Class',
        icon: <FaBookOpen />,
        link: '/classes',
        color: 'success',
        description: 'Create new classes'
      },
      {
        title: 'View Reports',
        icon: <FaFileAlt />,
        link: '/reports',
        color: 'info',
        description: 'Generate reports'
      },
      {
        title: 'Manage Users',
        icon: <FaUsers />,
        link: '/users',
        color: 'warning',
        description: 'User administration'
      }
    ];

    // Filter actions based on user role
    if (user?.role === 'student') {
      return actions.filter(action => action.title === 'View Reports');
    } else if (user?.role === 'admin') {
      return actions.filter(action => ['Add Student', 'Add Class'].includes(action.title));
    }
    
    return actions; // super_admin sees all
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.first_name}!</h1>
            <p>Here's what's happening at Excellence Academy today</p>
            <div className="user-role-badge">
              <span className={`role-badge ${user?.role}`}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={() => fetchDashboardData(true)} disabled={refreshing}>
              <FaSearch />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button className="btn btn-outline">
              <FaBell />
              <span>Notifications</span>
            </button>
            <button className="btn btn-outline">
              <FaCog />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon admissions">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalStudents.toLocaleString()}</h3>
              <p>Total Students</p>
              <div className={`stat-change ${stats.studentGrowth > 0 ? 'positive' : stats.studentGrowth < 0 ? 'negative' : 'neutral'}`}>
                <FaChartLine/> 
                {stats.studentGrowth > 0 ? `+${stats.studentGrowth}%` : stats.studentGrowth < 0 ? `${stats.studentGrowth}%` : '0%'} this month
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon  admissions">
              <FaGraduationCap />
            </div>
            <div className="stat-content">
              <h3>{stats.totalClasses}</h3>
              <p>Active Classes</p>
              <div className={`stat-change ${stats.recentClasses > 0 ? 'positive' : 'neutral'}`}>
                <FaChartLine /> 
                {stats.recentClasses > 0 ? `+${stats.recentClasses} new classes` : 'No new classes'} this month
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admissions">
              <FaChalkboardTeacher />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
              <div className="stat-change neutral">
                <FaChartLine size={0.8}/> No change
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon admissions ">
              <FaChartLine  />
            </div>
            <div className="stat-content">
              <h3>{stats.recentAdmissions}</h3>
              <p>Recent Admissions</p>
              <div className="stat-change positive">
                <FaChartLine /> +5 this week
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {getQuickActions().map((action, index) => (
              <Link key={index} to={action.link} className={`quick-action-card ${action.color}`}>
                <div className="action-icon">
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">
                  <FaEye />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="dashboard-content">
          {/* Recent Students */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Students</h3>
              <Link to="/students" className="view-all">View All</Link>
            </div>
            <div className="card-content">
              {recentStudents.length > 0 ? (
                <div className="recent-list">
                  {recentStudents.map(student => (
                    <div key={student._id} className="recent-item">
                      <div className="item-avatar">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </div>
                      <div className="item-info">
                        <h4>{student.first_name} {student.last_name}</h4>
                        <p>{student.email}</p>
                        <span className="item-meta">
                          {student.class_id?.class_name || 'Not Assigned'}
                        </span>
                      </div>
                      <div className="item-actions">
                        <Link to={`/students/${student._id}`} className="btn btn-sm btn-outline">
                          <FaEye />
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                          <Link to={`/students/${student._id}/edit`} className="btn btn-sm btn-outline">
                            <FaEdit />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaUsers className="empty-icon" />
                  <p>No students found</p>
                  <Link to="/students" className="btn btn-primary">Add First Student</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Classes */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Classes</h3>
              <Link to="/classes" className="view-all">View All</Link>
            </div>
            <div className="card-content">
              {recentClasses.length > 0 ? (
                <div className="recent-list">
                  {recentClasses.map(classItem => (
                    <div key={classItem._id} className="recent-item">
                      <div className="item-avatar class">
                        <FaGraduationCap />
                      </div>
                      <div className="item-info">
                        <h4>{classItem.class_name}</h4>
                        <p>{classItem.description || 'No description'}</p>
                        <span className="item-meta">
                          Capacity: {classItem.capacity} • {classItem.semester}
                        </span>
                      </div>
                      <div className="item-actions">
                        <Link to={`/classes/${classItem._id}`} className="btn btn-sm btn-outline">
                          <FaEye />
                        </Link>
                        {user?.role === 'super_admin' && (
                          <Link to={`/classes/${classItem._id}/edit`} className="btn btn-sm btn-outline">
                            <FaEdit />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaGraduationCap className="empty-icon" />
                  <p>No classes found</p>
                  <Link to="/classes" className="btn btn-primary">Add First Class</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Quick Access */}
        <div className="additional-actions">
          <h2>Additional Tools</h2>
          <div className="tools-grid">
            {user?.role === 'teacher' && (
              <div className="tool-card teacher-tool">
                <div className="tool-icon">
                  <FaChalkboardTeacher />
                </div>
                <h3>Teacher Dashboard</h3>
                <p>Access your classes and mark student attendance</p>
                <Link to="/teacher" className="btn btn-primary">Go to Teacher Dashboard</Link>
              </div>
            )}
            
            <div className="tool-card">
              <div className="tool-icon">
                <FaFileAlt />
              </div>
              <h3>Report Generator</h3>
              <p>Create comprehensive reports and analytics</p>
              <button className="btn btn-outline">Generate Report</button>
            </div>
            
            <div className="tool-card">
              <div className="tool-icon">
                <FaDownload />
              </div>
              <h3>Data Export</h3>
              <p>Export data in various formats for analysis</p>
              <button className="btn btn-outline">Export Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
