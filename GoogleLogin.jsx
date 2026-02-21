import React, { useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import Navbar from "../components/Navbar";
import googleLogo from "../assets/googlelogo.jpg"; 

export default function GoogleLogin() {

  // --- AUTO-LOGIN CHECK ---
  useEffect(() => {
    const savedCitizen = localStorage.getItem("citizen");
    if (savedCitizen) {
      // If user is already found, send them to the dashboard automatically
      window.location.href = "/citizen"; 
    }
  }, []);

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const citizen = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        phone: user.phoneNumber || "",
        city: "",
        address: "",
        uid: user.uid // Unique ID from Google
      };

      // SAVE TO LOCAL STORAGE
      localStorage.setItem("citizen", JSON.stringify(citizen));
      
      // Redirect to profile setup for new users or dashboard
      window.location.href = "/profile-setup"; 
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Please check your popup settings.");
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background-color: #050816;
          font-family: 'Inter', -apple-system, sans-serif;
          color: white;
          display: flex;
          flex-direction: column;
        }

        .login-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .bg-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          background: rgba(37, 99, 235, 0.15);
          filter: blur(100px);
          border-radius: 50%;
          z-index: 0;
        }

        .login-card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .login-card h2 {
          font-size: 2rem;
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .login-card p {
          color: #94a3b8;
          margin-bottom: 32px;
          font-size: 0.95rem;
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          background: white;
          color: #1e293b;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .google-btn:hover {
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .google-btn img {
          width: 20px;
          height: 20px;
        }

        .footer-text {
          margin-top: 24px;
          font-size: 0.8rem;
          color: #64748b;
        }
      `}</style>

      <Navbar />

      <div className="login-content">
        <div className="bg-glow"></div>
        
        <div className="login-card">
          <h2>Citizen Login</h2>
          <p>Sign in to report and track urban issues in your city.</p>
          
          <button className="google-btn" onClick={loginGoogle}>
             <img 
                src={googleLogo} 
                alt="Google logo" 
              style={{ width: "20px", height: "20px", marginRight: "10px" }} 
               />
               Continue with Google
           </button>

          <div className="footer-text">
            Secure login powered by Firebase AI
          </div>
        </div>
      </div>
    </div>
  );
}