import React from "react";
import Navbar from "../components/Navbar"; 
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <section className="hero">
        <div className="hero-content">
          <span className="badge">AI-Powered Smart City Initiative</span>
          <h1 className="gradient-text">Urban Issue Intelligence Platform</h1>
          <p>Empowering citizens to build smarter cities through real-time AI data analysis and transparent reporting.</p>
          <div className="actions">
            <a href="/login" className="btn-primary">Citizen Login</a>
            <a href="/report" className="btn-secondary">Report Issue</a>
          </div>
        </div>
      </section>

      <section className="features-grid container">
        <div className="glass-card">
          <h3>📍 Real-Time</h3>
          <p>Instant reporting with GPS integration.</p>
        </div>
        <div className="glass-card">
          <h3>🤖 AI Insights</h3>
          <p>Automated priority sorting for authorities.</p>
        </div>
        <div className="glass-card">
          <h3>🗺️ Live Map</h3>
          <p>Track city-wide progress transparently.</p>
        </div>
      </section>
    </div>
  );
}