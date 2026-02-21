import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logoImg from "../assets/logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [citizen, setCitizen] = useState(null);

  // --- CHECK LOGIN STATUS ---
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("citizen"));
    if (savedUser) {
      setCitizen(savedUser);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem("citizen"); // Clear session
    setCitizen(null); // Update UI
    window.location.href = "/login"; // Redirect
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src={logoImg} alt="Logo" style={{ height: "40px", marginRight: "10px" }} />
          Urban<span>Issues</span> AI
        </Link>

        {/* Hamburger Icon - Only visible on Mobile */}
        <div className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? "mobile-active" : ""}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          <Link to="/map" onClick={() => setIsMenuOpen(false)}>City Map</Link>
          
          {/* Dashboard Link - Only if logged in */}
          {citizen && (
            <Link to="/citizen" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
          )}

          <Link to="/report" className="nav-report-btn" onClick={() => setIsMenuOpen(false)}>Report Issue</Link>
          
          <div className="nav-auth">
            {citizen ? (
              <>
                <span className="user-welcome" style={{color: '#3b82f6', marginRight: '10px', fontSize: '0.9rem'}}>
                  Hi, {citizen.fullName || citizen.name}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="logout-btn"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    padding: '8px 15px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/admin-login" className="admin-link" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}