import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginPanel from './LoginPanel';
import '../styles/Navbar.css';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../API_LoginAndOtherFiles/firebase';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const navbarRef = useRef(null); // Ref to track navbar element

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle outside click to close navbar in mobile view
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isNavOpen && navbarRef.current && !navbarRef.current.contains(e.target)) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNavOpen]);

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal')) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    console.log("DOM fully loaded");
  }, []);

  const handleToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleGetStartedClick = () => {
    setShowLoginPanel(true);
  };

  const handleCloseModal = () => {
    setShowLoginPanel(false);
  };

  const handleProfileClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top" ref={navbarRef}>
        <div className="container">
          <a className="navbar-brand" href="home">
            <i className="fas fa-leaf"></i> VitaPlates
          </a>

          <button
            className={`navbar-toggler ${isNavOpen ? 'open' : ''}`}
            type="button"
            onClick={handleToggle}
            aria-controls="navbarNav"
            aria-expanded={isNavOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
            <ul className={`navbar-nav mx-auto ${isNavOpen ? 'active' : ''}`}>
              <li className="nav-item">
                {/* Remove dropdown-toggle and data-bs-toggle in mobile view */}
                <Link
                  className="nav-link"
                  to="/#"
                >
                  Home
                </Link>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/#">Home</Link></li>
                  <li><Link className="dropdown-item" to="/blog">Blog</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Meal Plans
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/mealplanner">Custom Meal Planner</Link></li>
                  <li><Link className="dropdown-item" to="/AIMeal">AI Meal Plans</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Growth
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/Yoga">With Yoga</Link></li>
                  <li><Link className="dropdown-item" to="/Gym">With Gym</Link></li>
                  <li><Link className="dropdown-item" to="/blog">Read Blogs</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  About Us
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/OurStory">Our Story</Link></li>
                  {/* <li><Link className="dropdown-item" to="/Team">Our Team</Link></li> */}
                </ul>
              </li>
            </ul>

            <div className="d-flex align-items-center navbar-actions">
              {user ? (
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={user.photoURL || 'default-avatar.png'}
                    alt="User Profile"
                    className="profile-icon"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                    }}
                    onClick={handleProfileClick}
                  />
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div
                  className="btn-flip me-3"
                  data-back="Sign-Up"
                  data-front="Get Started"
                  onClick={handleGetStartedClick}
                ></div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {showLoginPanel && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" onClick={handleBackdropClick}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <LoginPanel />
            </div>
          </div>
        </div>
      )}
      {showLoginPanel && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default Navbar;