import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import AboutUs from './components/layout/AboutUs';
import Testimonials from './components/layout/Testimonials';
import AdminLogin from './components/auth/AdminLogin';
import TeacherLogin from './components/auth/TeacherLogin';

import Dashboard from './components/dashboard/Dashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import Students from './components/students/Students';
import Classes from './components/classes/Classes';
import Users from './components/users/Users';
import PrivateRoute from './components/routing/PrivateRoute';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
    
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/teacher" 
              element={
                <PrivateRoute>
                  <TeacherDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/students" 
              element={
                <PrivateRoute>
                  <Students />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/classes" 
              element={
                <PrivateRoute>
                  <Classes />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
