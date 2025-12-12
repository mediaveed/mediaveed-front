import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { TopBannerAd, FooterBannerAd, ResponsiveAdWrapper } from './Adbanner';
import AuthModal from './AuthModal';
import './components.css';
import { fetchProfile } from '../api/profile';
import { trackButtonClick, trackNavigation } from '../utils/analytics.js';
import { readAuthToken, persistAuthToken, clearAuthToken } from '../utils/token.js';

const showHighlightAdmin = import.meta.env.VITE_SHOW_HIGHLIGHT_ADMIN === 'true';

const Layout = ({ children, currentPage = 'home', onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ show: false, mode: 'login' });
  const tokenRef = useRef('');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [navScrollState, setNavScrollState] = useState({ canScrollLeft: false, canScrollRight: false });
  const navScrollRef = useRef(null);

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
    trackButtonClick(`nav-${link}`, { location: 'layout' });
    trackNavigation(link, { source: 'layout_nav' });
    if (onNavigate) {
      onNavigate(link);
    }
  };

  const getStoredToken = useCallback(() => readAuthToken(), []);

  const storeToken = (token, remember = false) => {
    if (!token) return;
    persistAuthToken(token, remember);
    tokenRef.current = token;
  };

  const clearToken = () => {
    clearAuthToken();
    tokenRef.current = '';
  };

  const refreshProfile = useCallback(() => {
    const stored = getStoredToken();
    if (!stored) {
      setUser(null);
      return;
    }
    tokenRef.current = stored;
    fetchProfile()
      .then((payload) => {
        setUser(payload.user || null);
      })
      .catch((err) => {
        console.log(err);
        setUser(null);
      });
  }, [getStoredToken]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const handleStorage = () => {
      tokenRef.current = getStoredToken();
      refreshProfile();
    };
    const poll = () => {
      const stored = getStoredToken();
      if (stored !== tokenRef.current) {
        tokenRef.current = stored;
        refreshProfile();
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = window.setInterval(poll, 4000);
    poll();
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(interval);
    };
  }, [getStoredToken, refreshProfile]);

  const handleAuthSuccess = ({ token, user: nextUser, remember }) => {
    if (token) {
      storeToken(token, remember);
    }
    setUser(nextUser || null);
    setAuthModal({ show: false, mode: 'login' });
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
  };

  const closeNav = () => {
    const toggle = document.querySelector('.navbar-toggler');
    const collapse = document.getElementById('basic-navbar-nav');
    if (toggle && collapse?.classList.contains('show')) {
      toggle.click();
    }
  };

  const handleNavAndClose = (event, link) => {
    handleNavClick(event, link);
    closeNav();
  };

  const openAuthModal = (mode) => {
    closeNav();
    setAuthModal({ show: true, mode });
  };
  const closeAuthModal = () => setAuthModal({ show: false, mode: 'login' });

  const updateNavScrollState = useCallback(() => {
    const scroller = navScrollRef.current;
    if (!scroller) {
      setNavScrollState({ canScrollLeft: false, canScrollRight: false });
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
    setNavScrollState({
      canScrollLeft: scrollLeft > 4,
      canScrollRight: scrollLeft < maxScrollLeft - 4,
    });
  }, []);

  useEffect(() => {
    const scroller = navScrollRef.current;
    if (!scroller) return;
    updateNavScrollState();
    scroller.addEventListener('scroll', updateNavScrollState);
    window.addEventListener('resize', updateNavScrollState);
    return () => {
      scroller.removeEventListener('scroll', updateNavScrollState);
      window.removeEventListener('resize', updateNavScrollState);
    };
  }, [updateNavScrollState]);

  useEffect(() => {
    updateNavScrollState();
  }, [updateNavScrollState, toolsOpen, currentPage]);

  const scrollNavLinks = (delta) => {
    const scroller = navScrollRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: delta, behavior: 'smooth' });
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
          <Navbar.Brand href="/" className="brand-logo" onClick={(e) => handleNavAndClose(e, 'home')}>
          
            <span className="logo-text">
              <img src="/images/logo.png" alt=""/><span className="logo-dot">.</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle 
            aria-controls="basic-navbar-nav"
            className="navbar-toggler"
          />
          
          <Navbar.Collapse id="basic-navbar-nav" className="nav-collapse">
            <Nav className="nav-links-left">
              <Nav.Link
                href="#home"
                className={currentPage === 'home' ? 'active' : ''}
                onClick={(e) => handleNavAndClose(e, 'home')}
              >
                <i className="bi bi-house-door-fill p-1"></i>
                Home
              </Nav.Link>
            </Nav>
            <div className="nav-links-wrapper">
              <button
                type="button"
                className={`nav-scroll-indicator nav-scroll-indicator--left ${navScrollState.canScrollLeft ? '' : 'nav-scroll-indicator--hidden'}`}
                onClick={() => scrollNavLinks(-260)}
                disabled={!navScrollState.canScrollLeft}
                aria-label="Scroll navigation left"
              >
                <i className="bi bi-arrow-left-short" />
              </button>
              <div
                className={`nav-links-scroll ${toolsOpen ? 'nav-links-scroll-open' : ''}`}
                ref={navScrollRef}
              >
                <Nav className="nav-links">
                  <Nav.Link
                    href="#features"
                    className={currentPage === 'features' ? 'active' : ''}
                    onClick={(e) => handleNavAndClose(e, 'features')}
                  >
                    <i className="bi bi-stars p-1"></i>
                    Features
                  </Nav.Link>
                  <Nav.Link
                    href="#how-it-works"
                    className={currentPage === 'how-it-works' ? 'active' : ''}
                    onClick={(e) => handleNavAndClose(e, 'how-it-works')}
                  >
                    <i className="bi bi-gear-fill p-1"></i>
                    How It Works
                  </Nav.Link>
                  <Nav.Link
                    href="#supported"
                    className={currentPage === 'supported' ? 'active' : ''}
                    onClick={(e) => handleNavAndClose(e, 'supported')}
                  >
                    <i className="bi bi-check-circle-fill p-1"></i>
                    Supported
                  </Nav.Link>
                <NavDropdown
                  title={
                    <span>
                      <i className="bi bi-tools p-1"></i>
                      Tools &amp; Automation
                    </span>
                  }
                  id="tools-nav"
                  className={currentPage === 'highlight-tool' ? 'active-dropdown' : ''}
                  menuVariant="dark"
                  align="start"
                  show={toolsOpen}
                  onToggle={(next) => setToolsOpen(next)}
                >
                  <NavDropdown.Item
                    href="#tools-highlight"
                    active={currentPage === 'highlight-tool'}
                    onClick={(e) => handleNavAndClose(e, 'highlight-tool')}
                  >
                    <div className="nav-tool-item">
                      <div className="nav-tool-heading">
                        <span>
                          <i className="bi bi-magic p-1" />
                          Highlight Generator
                        </span>
                        <span className="nav-tool-badge">Beta</span>
                      </div>
                      <small className="nav-tool-desc">AI-powered clip detection &amp; reel exports</small>
                    </div>
                  </NavDropdown.Item>
                </NavDropdown>
                {showHighlightAdmin && (
                  <Nav.Link
                    href="#tools-highlight-admin"
                    className={currentPage === 'highlight-admin' ? 'active nav-admin-link' : 'nav-admin-link'}
                    onClick={(e) => handleNavAndClose(e, 'highlight-admin')}
                  >
                    <i className="bi bi-activity p-1" />
                    Recent Highlights (Ops)
                  </Nav.Link>
                )}
                <Nav.Link
                  href="#blog"
                  className={currentPage === 'blog' ? 'active' : ''}
                  onClick={(e) => handleNavAndClose(e, 'blog')}
                >
                  <i className="bi bi-journal-text p-1"></i>
                  Blog
                </Nav.Link>
                <Nav.Link
                  href="#about"
                  className={currentPage === 'about' ? 'active' : ''}
                  onClick={(e) => handleNavAndClose(e, 'about')}
                >
                  <i className="bi bi-people-fill p-1"></i>
                  About
                </Nav.Link>
                <Nav.Link
                  href="#faq"
                  className={currentPage === 'faq' ? 'active' : ''}
                  onClick={(e) => handleNavAndClose(e, 'faq')}
                >
                  <i className="bi bi-question-circle-fill p-1"></i>
                  FAQ
                </Nav.Link>
                  <Nav.Link
                    href="#contact"
                    className={currentPage === 'contact' ? 'active' : ''}
                    onClick={(e) => handleNavAndClose(e, 'contact')}
                  >
                    <i className="bi bi-envelope-fill p-1"></i>
                    Contact
                  </Nav.Link>
                </Nav>
              </div>
              <button
                type="button"
                className={`nav-scroll-indicator nav-scroll-indicator--right ${navScrollState.canScrollRight ? '' : 'nav-scroll-indicator--hidden'}`}
                onClick={() => scrollNavLinks(260)}
                disabled={!navScrollState.canScrollRight}
                aria-label="Scroll navigation right"
              >
                <i className="bi bi-arrow-right-short" />
              </button>
            </div>
            <div className="nav-cta mt-3 mt-lg-0">
              {user ? (
                <NavDropdown
                  align="end"
                  title={
                    <div className="nav-avatar-trigger">
                      <div className="nav-avatar">{(user.name || user.email || 'U')[0].toUpperCase()}</div>
                      <i className="bi bi-chevron-down" aria-hidden="true" />
                    </div>
                  }
                  id="nav-account-dropdown"
                  className="nav-avatar-dropdown"
                >
                  <NavDropdown.Header>
                    <div className="nav-profile-heading">
                      <strong>{user.name || 'Creator'}</strong>
                      <small>{user.email}</small>
                    </div>
                  </NavDropdown.Header>
                  <NavDropdown.Item onClick={(e) => handleNavClick(e, 'highlight-tool')}>
                    Open Highlight Generator
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <div className="nav-auth-buttons">
                  <Button variant="outline-light" size="sm" onClick={() => openAuthModal('login')}>
                    Sign in
                  </Button>
                  <Button variant="warning" size="sm" onClick={() => openAuthModal('signup')}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* TOP BANNER AD */}
        <div className="ad-section ad-section-top">
          <Container>
            <ResponsiveAdWrapper type="top">
              <TopBannerAd />
            </ResponsiveAdWrapper>
          </Container>
        </div>
        {children}
        {/* FOOTER AD */}
        <div className="ad-section ad-section-footer">
          <ResponsiveAdWrapper type="footer">
            <FooterBannerAd />
          </ResponsiveAdWrapper>
        </div>
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
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'highlight-tool')}>Highlight Generator</button>
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'legal')}>Legal</button>
              <button type="button" className="footer-link" onClick={(e) => handleNavClick(e, 'metadata')}>Metadata</button>
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

      <AuthModal
        show={authModal.show}
        mode={authModal.mode}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Layout;
