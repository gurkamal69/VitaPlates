import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter an email.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/contact', {
        email,
      });
      setStatus('Message sent successfully!');
      setEmail(''); // Clear input
    } catch (error) {
      console.error('Error:', error);
      setStatus('Failed to send message. Try again later.');
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h2 className="navbar-brand">VitaPlates</h2>
            <p className="brand-subtitle">Your Daily Nutrition Partner</p>
          </div>
          <div className="footer-newsletter">
            <p className="preferred-diet"><strong>Stay Connected</strong></p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn">
                  Submit <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </form>
            {status && <p style={{ color: 'green', marginTop: '5px' }}>{status}</p>}
            <div className="social-icons-footer">
              <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="https://x.com/"><i className="fa-brands fa-twitter"></i></a>
              <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
            </div>
          </div>
          <div className="footer-contact">
            <p className="contact-title">Contact Info</p>
            <p className="contact-info">+91 77102-61904</p>
            <p className="contact-info">VitaPlates@gmail.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 VitaPlates</span>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Accessibility</a>
            <a href="#">Terms</a>
            <a href="#">Refunds</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
