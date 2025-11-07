import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './components.module.css';

const Layout = ({ children }) => {
  const [activeLink, setActiveLink] = useState('home');

  // Set active link based on current hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActiveLink(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className="main-container">
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>

      <div className="background-pattern"></div>

      {/* Navbar */}
      <Navbar variant="dark" expand="lg" className="custom-navbar">
        <Container>
          <Navbar.Brand href="/" className="brand-logo">
            <i 
              className="bi bi-film m-2" 
              style={{ 
                fontSize: '1.8rem', 
                color: '#ffffff' 
              }}
            ></i>
            <span className="logo-text">
              MediaVeed<span className="logo-dot">.</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle 
            aria-controls="basic-navbar-nav"
            className="navbar-toggler"
          />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto nav-links">
              <Nav.Link 
                href="/" 
                className={activeLink === 'home' ? 'active' : ''}
                onClick={() => handleNavClick('home')}
              >
                <i className="bi bi-house-door-fill"></i>
                Home
              </Nav.Link>
              <Nav.Link 
                href="#features"
                className={activeLink === 'features' ? 'active' : ''}
                onClick={() => handleNavClick('features')}
              >
                <i className="bi bi-stars"></i>
                Features
              </Nav.Link>
              <Nav.Link 
                href="#how-it-works"
                className={activeLink === 'how-it-works' ? 'active' : ''}
                onClick={() => handleNavClick('how-it-works')}
              >
                <i className="bi bi-gear-fill"></i>
                How It Works
              </Nav.Link>
              <Nav.Link 
                href="#supported"
                className={activeLink === 'supported' ? 'active' : ''}
                onClick={() => handleNavClick('supported')}
              >
                <i className="bi bi-check-circle-fill"></i>
                Supported
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <div className="content-wrapper">
        {children}
      </div>

      {/* Footer */}
      <footer className="custom-footer">
        <Container>
          <div className="footer-content">
            <div className="footer-warning">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>For personal use only. Respect copyright laws.</span>
            </div>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#contact">Contact</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>
          <div className="text-center mt-3" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            <p className="mb-0">
              © {new Date().getFullYear()} VideoGrab. Made with{' '}
              <i className="bi bi-heart-fill" style={{ color: '#ec4899' }}></i>
              {' '}for content creators
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;