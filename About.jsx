import React from "react";
import Navbar from "../components/Navbar";

// --- IMAGE IMPORTS ---
import raviImg from "../assets/raviImg.jpeg";
import nitinImg from "../assets/nitinImg.jpeg";
import vivekImg from "../assets/vivekImg.jpeg";

export default function About() {
  // Professional Team Data Array
  const team = [
    {
      name: "Ravikaran",
      
      image: raviImg, 
      
    },
    {
      name: "Nitin",
      
      image: nitinImg, 
      
    },
    {
      name: "Vivek",
      
      image: vivekImg, 
     
    }
  ];

  return (
    <div className="about-page">
      <Navbar />
      <style>{`
        .about-page { background: #020617; min-height: 100vh; color: #f8fafc; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        
        .hero-section {
          padding: 80px 10%;
          text-align: center;
          background: radial-gradient(circle at top, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
        }

        .gradient-text { 
          background: linear-gradient(to right, #fff, #3b82f6); 
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
          font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 800; margin-bottom: 20px;
          letter-spacing: -1px;
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px 80px; }

        .glass-card { 
          background: rgba(255, 255, 255, 0.03); 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          padding: clamp(30px, 5vw, 60px); border-radius: 40px; backdrop-filter: blur(15px);
          margin-bottom: 80px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .vision-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 50px; align-items: center; }

        .sdg-box { 
          background: linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(2, 6, 23, 0.9)); 
          padding: 35px; border-radius: 25px; border-left: 6px solid #3b82f6;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .team-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 30px; margin-top: 50px; 
        }

        .team-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 30px; padding: 50px 30px; text-align: center;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .team-card:hover {
          transform: translateY(-15px);
          border-color: #3b82f6;
          box-shadow: 0 30px 60px rgba(59, 130, 246, 0.2);
        }

        .member-img {
          width: 160px; height: 160px; border-radius: 50%; 
          object-fit: cover; margin: 0 auto 25px;
          border: 4px solid #3b82f6; padding: 6px; background: #020617;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .tech-tags { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 12px; margin-top: 30px; }
        .tag { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 8px 18px; border-radius: 100px; font-size: 0.85rem; font-weight: 700; border: 1px solid rgba(59, 130, 246, 0.3); }

        @media (max-width: 900px) {
          .vision-grid { grid-template-columns: 1fr; text-align: center; }
          .tech-tags { justify-content: center; }
          .hero-section { padding: 80px 20px 40px; }
          .team-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="hero-section">
        <h1 className="gradient-text">Urban Intelligence Core</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          Meet the team redefining how cities interact with their citizens through real-time data and AI-driven resolution.
        </p>
      </section>

      <div className="container">
        <div className="glass-card">
          <div className="vision-grid">
            <div>
              <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '20px' }}>Our Mission</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.9', fontSize: '1.1rem' }}>
                We believe that <b>transparency</b> is the foundation of a modern city. By empowering Ravikaran's vision, 
                our platform acts as a digital nervous system, identifying infrastructure gaps 
                and ensuring they are addressed with maximum efficiency and accountability.
              </p>
              <div className="tech-tags">
                <span className="tag">🚀 REACT 18</span>
                <span className="tag">🔥 FIREBASE</span>
                <span className="tag">📍 LEAFLET</span>
                <span className="tag">⚡ VITE</span>
              </div>
            </div>
            <div className="sdg-box">
              <h4 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.3rem' }}>
                <span style={{ fontSize: '2rem' }}>🌍</span> SDG Goal 11
              </h4>
              <p style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '15px', lineHeight: '1.6' }}>
                Our architecture is strictly built to support the UN mandate for <b>Sustainable Cities and Communities</b>, 
                improving urban safety and disaster resilience.
              </p>
            </div>
          </div>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '2.8rem', color: '#fff', marginBottom: '10px', letterSpacing: '-1px' }}>Leadership Team</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '60px', fontSize: '1.1rem' }}>The engineers and visionaries behind the project.</p>

        <div className="team-grid">
          {team.map((member, idx) => (
            <div className="team-card" key={idx}>
              <img src={member.image} alt={member.name} className="member-img" />
              <h3 style={{ color: '#fff', fontSize: '1.7rem', marginBottom: '8px' }}>{member.name}</h3>
              <p style={{ color: '#3b82f6', fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{member.role}</p>
              <p style={{ color: '#94a3b8', marginTop: '20px', fontSize: '1rem', lineHeight: '1.7' }}>{member.bio}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '120px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px', textAlign: 'center' }}>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>
            Built with ❤️ by Team Urban Intelligence | © 2026 
          </p>
        </div>
      </div>
    </div>
  );
}