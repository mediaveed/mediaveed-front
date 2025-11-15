import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './components.css';


const Layout = ({ children, currentPage = 'home', onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavClick = (event, link) => {
    event.preventDefault();
    if (onNavigate) {
      onNavigate(link);
    }
  };

  return (
    <div className="main-container">
      <div className="gradient-orb gradient-orb-1"></div>
      <div className="gradient-orb gradient-orb-2"></div>
      <div className="gradient-orb gradient-orb-3"></div>

      <div className="background-pattern"></div>

      {/* Navbar */}
      <Navbar variant="dark" expand="lg" className={`custom-navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <Container>
          <Navbar.Brand href="/" className="brand-logo" onClick={(e) => handleNavClick(e, 'home')}>
          
            <span className="logo-text">
              <img src="/images/logo.png" alt=""/><span className="logo-dot">.</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle 
            aria-controls="basic-navbar-nav"
            className="navbar-toggler"
          />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto nav-links">
              <Nav.Link 
                href="#home" 
                className={currentPage === 'home' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'home')}
              >
                <i className="bi bi-house-door-fill p-1"></i>
                Home
              </Nav.Link>
              <Nav.Link 
                href="#features"
                className={currentPage === 'features' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'features')}
              >
                <i className="bi bi-stars p-1"></i>
                Features
              </Nav.Link>
              <Nav.Link 
                href="#how-it-works"
                className={currentPage === 'how-it-works' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'how-it-works')}
              >
                <i className="bi bi-gear-fill p-1"></i>
                How It Works
              </Nav.Link>
              <Nav.Link 
                href="#supported"
                className={currentPage === 'supported' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'supported')}
              >
                <i className="bi bi-check-circle-fill p-1"></i>
                Supported
              </Nav.Link>
              <Nav.Link 
                href="#blog"
                className={currentPage === 'blog' ? 'active' : ''}
                onClick={(e) => handleNavClick(e, 'blog')}
              >
                <i className="bi bi-journal-text p-1"></i>
                Blog
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
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'home')}>Home</button>
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'features')}>Features</button>
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'how-it-works')}>How It Works</button>
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'supported')}>Supported</button>
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'blog')}>Blog</button>
            </div>
          </div>
          <div className="text-center mt-3" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            <p className="mb-0">
              © {new Date().getFullYear()} MediaVeed. Made with{' '}
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
