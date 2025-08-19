import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaGraduationCap, FaUsers, FaChartLine, FaShieldAlt, FaLaptop, FaMobileAlt, FaAward, FaHeart } from 'react-icons/fa';
import './AboutUs.css';

const AboutUs = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1>About Excellence Academy</h1>
            <p>Empowering education through innovative technology and dedicated support</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At Excellence Academy, we believe that every educational institution deserves access to 
                powerful, intuitive tools that streamline administrative processes and enhance the learning experience. 
                Our mission is to provide innovative student management solutions that empower educators to focus 
                on what matters most - student success.
              </p>
              <p>
                We understand the unique challenges faced by educational institutions in today's digital age. 
                From managing student records to tracking academic progress, our comprehensive system is designed 
                to simplify complex administrative tasks while providing valuable insights for better decision-making.
              </p>
            </div>
            <div className="mission-visual">
              <div className="mission-icon">
                <FaHeart />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="what-we-do">
        <div className="container">
          <h2>What We Do</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <FaUsers />
              </div>
              <h3>Student Management</h3>
              <p>Comprehensive student information management including admissions, records, and academic tracking.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaChartLine />
              </div>
              <h3>Analytics & Reporting</h3>
              <p>Real-time analytics and detailed reports to help institutions make data-driven decisions.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaShieldAlt />
              </div>
              <h3>Security & Compliance</h3>
              <p>Enterprise-grade security with role-based access control to protect sensitive student data.</p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <FaLaptop />
              </div>
              <h3>Cross-Platform Access</h3>
              <p>Access your system from any device with our responsive, mobile-first design approach.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="core-values">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FaAward />
              </div>
              <h3>Excellence</h3>
              <p>We strive for excellence in everything we do, from product development to customer support.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FaHeart />
              </div>
              <h3>Passion</h3>
              <p>We're passionate about education and committed to helping institutions succeed.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FaShieldAlt />
              </div>
              <h3>Trust</h3>
              <p>We build trust through transparency, reliability, and exceptional service.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <FaGraduationCap />
              </div>
              <h3>Innovation</h3>
              <p>We continuously innovate to provide cutting-edge solutions for modern education.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Transform Your Institution?</h2>
          <p>Join hundreds of educational institutions already using our system</p>
          <div className="cta-buttons">
            {!isAuthenticated ? (
              <Link to="/login" className="btn btn-primary btn-large">
                Get Started
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard
              </Link>
            )}
            <Link to="/testimonials" className="btn btn-outline btn-large">
              Read Testimonials
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Excellence Academy</h3>
              <p>Empowering education through technology and innovation.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/testimonials">Testimonials</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: info@excellenceacademy.edu</p>
              <p>Phone: (555) 123-4567</p>
              <p>Address: 123 Education St, Learning City</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Excellence Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

