import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaGraduationCap, FaQuoteLeft, FaStar, FaUsers, FaChartLine, FaAward } from 'react-icons/fa';
import './Testimonials.css';

const Testimonials = () => {
  const { isAuthenticated } = useAuth();

  const testimonials = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Principal, Bright Future Academy",
      content: "Excellence Academy's student management system has revolutionized how we handle administrative tasks. The intuitive interface and comprehensive features have saved us countless hours while improving our data accuracy.",
      rating: 5,
      avatar: "SJ"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Administrative Director, Global Learning Institute",
      content: "The role-based access control and security features give us peace of mind. Our staff can focus on teaching while the system handles all the administrative complexity seamlessly.",
      rating: 5,
      avatar: "MC"
    },
    {
      id: 3,
      name: "Prof. Emily Rodriguez",
      role: "Dean of Students, Innovation University",
      content: "The analytics and reporting capabilities are outstanding. We can now make data-driven decisions about our programs and student support services with confidence.",
      rating: 5,
      avatar: "ER"
    },
    {
      id: 4,
      name: "David Thompson",
      role: "IT Manager, Tech Academy",
      content: "Implementation was smooth and the support team was incredibly helpful. The system integrates perfectly with our existing infrastructure and scales beautifully as we grow.",
      rating: 5,
      avatar: "DT"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Registrar, Excellence College",
      content: "Managing student records has never been easier. The system's search and filter capabilities make finding information quick and efficient, even with thousands of students.",
      rating: 5,
      avatar: "LW"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Head of Administration, Future Leaders School",
      content: "The mobile responsiveness is fantastic. Our staff can access the system from anywhere, making remote work and on-the-go management a breeze.",
      rating: 5,
      avatar: "JW"
    }
  ];

  const successStories = [
    {
      title: "500+ Students Managed",
      description: "Successfully managing a large student body with improved efficiency",
      icon: <FaUsers />
    },
    {
      title: "98% User Satisfaction",
      description: "Overwhelmingly positive feedback from administrators and staff",
      icon: <FaAward />
    },
    {
      title: "40% Time Savings",
      description: "Significant reduction in administrative overhead and paperwork",
      icon: <FaChartLine />
    }
  ];

  return (
    <div className="testimonials">
      {/* Hero Section */}
      <section className="testimonials-hero">
        <div className="container">
          <div className="testimonials-hero-content">
            <h1>What Our Clients Say</h1>
            <p>Discover how educational institutions are transforming their operations with our student management system</p>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="testimonials-section">
        <div className="container">
          <h2>Client Testimonials</h2>
          <div className="testimonials-grid">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">
                    {testimonial.avatar}
                  </div>
                  <div className="testimonial-info">
                    <h3>{testimonial.name}</h3>
                    <p>{testimonial.role}</p>
                    <div className="rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="star filled" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="testimonial-content">
                  <FaQuoteLeft className="quote-icon" />
                  <p>{testimonial.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="success-stories">
        <div className="container">
          <h2>Success Stories</h2>
          <div className="stories-grid">
            {successStories.map((story, index) => (
              <div key={index} className="story-card">
                <div className="story-icon">
                  {story.icon}
                </div>
                <h3>{story.title}</h3>
                <p>{story.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="testimonials-cta">
        <div className="container">
          <h2>Ready to Join Our Success Stories?</h2>
          <p>Join hundreds of educational institutions already benefiting from our system</p>
          <div className="cta-buttons">
            {!isAuthenticated ? (
              <Link to="/login" className="btn btn-primary btn-large">
                Get Started Today
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard
              </Link>
            )}
            <Link to="/about" className="btn btn-outline btn-large">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="testimonials-footer">
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

export default Testimonials;
