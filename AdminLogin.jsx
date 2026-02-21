import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false); // Hacker danger state
  const navigate = useNavigate();

  // 1. AUTHORIZED ADMIN TEAM
  const AUTHORIZED_ADMINS = [
    "admin.ravikaran@gmail.com",
    "team.one@urbanissues.ai",
    "team.two@urbanissues.ai",
    "admin.chennai@gmail.com",
    "admin.jaipur@gmail.com"
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const isAuthorizedEmail = AUTHORIZED_ADMINS.includes(email.toLowerCase());
    const isCorrectPassword = password === "Admin@01917711924"; 

    setTimeout(() => {
      if (isAuthorizedEmail && isCorrectPassword) {
        const adminSession = {
          email: email,
          role: "SUPER_ADMIN",
          token: "SESSION_" + Math.random().toString(36).substr(2),
          loginTime: new Date().getTime()
        };

        localStorage.setItem("adminUser", JSON.stringify(adminSession));
        navigate("/admin-dashboard");
      } else {
        // TRIGGER DANGER STATE
        setError(true);
        // Reset error after 3 seconds so they can try again
        setTimeout(() => setError(false), 3000);
      }
      setLoading(false);
    }, 1200); 
  };

  return (
    <div className={`admin-login-wrapper ${error ? "system-danger" : ""}`}>
      <style>{`
        .admin-login-wrapper {
          background: #020617;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', monospace; /* Hacker Font */
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }

        /* Matrix-like Background Scanline */
        .admin-login-wrapper::before {
          content: " ";
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                      linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
          z-index: 2;
        }

        /* DANGER MODE: RED SCREEN PULSE */
        .system-danger {
          background: #2e0000 !important;
          animation: shake 0.2s infinite;
        }

        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          20% { transform: translate(-3px, 0px) rotate(-1deg); }
          40% { transform: translate(3px, 2px) rotate(1deg); }
          60% { transform: translate(-1px, -1px) rotate(1deg); }
          80% { transform: translate(-3px, 1px) rotate(-1deg); }
          100% { transform: translate(1px, -2px) rotate(0deg); }
        }

        .login-card {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #3b82f6;
          padding: 40px;
          border-radius: 4px; /* Sharp corners for hacker feel */
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 10;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          text-align: center;
        }

        .system-danger .login-card {
          border-color: #ff0000;
          box-shadow: 0 0 40px #ff0000;
        }

        h2 { color: #3b82f6; margin-bottom: 5px; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 2px; }
        .system-danger h2 { color: #ff0000; }

        .status-msg { 
          color: #3b82f6; 
          font-size: 0.8rem; 
          margin-bottom: 25px; 
          display: block;
        }
        .system-danger .status-msg { color: #ff0000; font-weight: bold; }

        .input-group { text-align: left; margin-bottom: 20px; }
        .input-group label { color: #3b82f6; font-size: 0.7rem; font-weight: bold; margin-bottom: 5px; display: block; }
        
        input {
          width: 100%;
          padding: 12px;
          background: #000;
          border: 1px solid #3b82f6;
          color: #00ff00; /* Green hacker text */
          font-family: 'Courier New', monospace;
          outline: none;
          box-sizing: border-box;
        }

        input:focus {
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
        }

        .system-danger input {
          border-color: #ff0000;
          color: #ff0000;
        }

        .btn {
          width: 100%;
          padding: 15px;
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn:hover {
          background: #3b82f6;
          color: black;
          box-shadow: 0 0 20px #3b82f6;
        }

        .system-danger .btn {
          border-color: #ff0000;
          color: #ff0000;
        }

        .danger-alert {
          background: #ff0000;
          color: white;
          padding: 10px;
          margin-top: 15px;
          font-size: 0.8rem;
          font-weight: bold;
          display: none;
        }
        .system-danger .danger-alert { display: block; animation: blink 0.5s infinite; }

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <div className="login-card">
        <h2>{error ? "SECURITY BREACH" : "ADMIN LOGIN"}</h2>
        <span className="status-msg">
          {error ? "CRITICAL: UNAUTHORIZED ACCESS DETECTED" : "[ SYSTEM STANDBY ]"}
        </span>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>SOURCE_EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>ENCRYPTION_KEY</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "DECRYPTING..." : "ENTER SYSTEM"}
          </button>
        </form>

        <div className="danger-alert">
          WARNING: IP LOGGED. TRACING IDENTITY...
        </div>
      </div>
    </div>
  );
}