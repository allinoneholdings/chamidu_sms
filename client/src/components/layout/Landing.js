import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaChartLine, FaShieldAlt, FaLaptop, FaMobileAlt } from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">


      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="highlight">Excellence Academy</span>
            </h1>
            <p className="hero-subtitle">
              Empowering education through innovative student management solutions. 
              Streamline administrative tasks and focus on what matters most - student success.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/about" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-visual">
              <div className="floating-elements">
                <div className="floating-icon">📚</div>
                <div className="floating-icon">🎓</div>
                <div className="floating-icon">🔬</div>
                <div className="floating-icon">💻</div>
              </div>
              <div className="main-hero-image">
                <FaGraduationCap className="hero-graduation-cap" />
                <div className="hero-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Our System?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Comprehensive Student Management</h3>
              <p>Efficiently manage student records, admissions, and academic progress with our intuitive interface.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Role-Based Access Control</h3>
              <p>Secure system with different permission levels for admins and super admins, ensuring data integrity.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Real-Time Analytics</h3>
              <p>Track student performance, class statistics, and generate insightful reports for better decision making.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaLaptop />
              </div>
              <h3>Cross-Platform Access</h3>
              <p>Access your student management system from any device - desktop, tablet, or mobile phone.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaMobileAlt />
              </div>
              <h3>Mobile-First Design</h3>
              <p>Responsive design that works seamlessly across all devices and screen sizes.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaGraduationCap />
              </div>
              <h3>Academic Excellence</h3>
              <p>Support your institution's mission to provide quality education with our comprehensive tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About Excellence Academy</h2>
              <p>
                Excellence Academy is committed to providing the highest quality education and administrative 
                support to our students and staff. Our student management system represents our commitment 
                to innovation and efficiency in educational administration.
              </p>
              <p>
                With years of experience in education technology, we understand the unique challenges 
                faced by educational institutions. Our system is designed to simplify complex administrative 
                tasks while providing powerful insights into student performance and institutional effectiveness.
              </p>
              <div className="stats">
                <div className="stat">
                  <div className="stat-icon">👥</div>
                  <h3>500+</h3>
                  <p>Students</p>
                </div>
                <div className="stat">
                  <div className="stat-icon">🏫</div>
                  <h3>25+</h3>
                  <p>Classes</p>
                </div>
                <div className="stat">
                  <div className="stat-icon">👨‍🏫</div>
                  <h3>50+</h3>
                  <p>Faculty</p>
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-image-container">
                <div className="about-image">
                  <div className="image-placeholder">🎓</div>
                </div>
                <div className="about-decoration">
                  <div className="decoration-dot"></div>
                  <div className="decoration-line"></div>
                  <div className="decoration-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Institution?</h2>
          <p>Join hundreds of educational institutions already using our system</p>
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/testimonials" className="btn btn-outline btn-large">
              Read Testimonials
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
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

export default Landing;
