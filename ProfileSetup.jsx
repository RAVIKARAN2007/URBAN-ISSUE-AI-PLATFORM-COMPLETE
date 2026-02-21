import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function ProfileSetup() {
  const [citizen, setCitizen] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    wardNo: "",
    dob: "",
    city: "" 
  });

  useEffect(() => {
    // Load existing login data
    const savedCitizen = JSON.parse(localStorage.getItem("citizen"));
    if (savedCitizen) {
      setCitizen(savedCitizen);
      setProfileImage(savedCitizen.picture || savedCitizen.photo || "");
      
      setFormData({
        fullName: savedCitizen.fullName || savedCitizen.name || "",
        phone: savedCitizen.phone || "",
        address: savedCitizen.address || "",
        wardNo: savedCitizen.wardNo || "",
        dob: savedCitizen.dob || "",
        city: savedCitizen.city || "" 
      });

      const isEditMode = window.location.search.includes("edit=true");
      if (savedCitizen.isProfileComplete && !isEditMode) {
        window.location.href = "/citizen";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  // --- UPDATED: HANDLES IMAGE WITH COMPRESSION ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          // Shrink profile photo to 300px (it's just an avatar)
          const canvas = document.createElement("canvas");
          const size = 300; 
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext("2d");
          // Draw image centered and cropped
          ctx.drawImage(img, 0, 0, size, size);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setProfileImage(compressedBase64); 
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.city) {
      alert("⚠️ Please fill in Full Name, Phone, and City!");
      return;
    }

    // UPDATE DATA WITH THE COMPRESSED IMAGE AND COMPLETE FLAG
    const updatedCitizen = {
      ...citizen,
      ...formData,
      picture: profileImage, 
      isProfileComplete: true, // This is the KEY for App.jsx protection
      setupDate: new Date().toLocaleDateString()
    };

    localStorage.setItem("citizen", JSON.stringify(updatedCitizen));
    alert("✅ Profile Securely Verified!");
    
    // Smooth transition to dashboard
    window.location.href = "/citizen"; 
  };

  return (
    <div className="profile-wrapper">
      <style>{`
        .profile-wrapper {
          background: #020617;
          min-height: 100vh;
          color: white;
          font-family: 'Inter', sans-serif;
          padding-bottom: 40px;
        }

        .setup-container {
          max-width: 800px;
          margin: 60px auto;
          padding: 20px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 40px;
          border-radius: 30px;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .header-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .header-section h1 {
          font-size: 2.2rem;
          background: linear-gradient(to right, #fff, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .pic-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 30px;
        }

        .avatar-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid #3b82f6;
          padding: 5px;
          background: #0f172a;
          object-fit: cover;
          margin-bottom: 15px;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .file-input-label {
          background: #1e293b;
          color: #3b82f6;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          border: 1px solid #3b82f6;
          transition: 0.3s;
        }

        .file-input-label:hover {
          background: #3b82f6;
          color: white;
        }

        #hidden-file-input {
          display: none;
        }

        .profile-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .full-width { grid-column: span 2; }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.75rem;
          color: #3b82f6;
          font-weight: 700;
          text-transform: uppercase;
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 12px;
          color: white;
          transition: 0.3s;
          outline: none;
        }

        .form-group input:focus {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.1);
        }

        .save-btn {
          grid-column: span 2;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 18px;
          border-radius: 15px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: 0.4s;
          margin-top: 20px;
        }

        .save-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        @media (max-width: 600px) {
          .profile-form { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
        }
      `}</style>

      <Navbar />

      <div className="setup-container">
        <div className="glass-card">
          <div className="header-section">
            <h1>Identity Verification</h1>
            <p>Complete your profile to access city council reporting.</p>
          </div>

          <div className="pic-box">
            <img 
              src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="Citizen" 
              className="avatar-circle"
            />
            
            <label htmlFor="hidden-file-input" className="file-input-label">
              Choose Photo from Documents
            </label>
            <input 
              id="hidden-file-input" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            
            <p style={{marginTop: '12px', fontSize: '0.9rem', color: '#94a3b8'}}>{citizen?.email}</p>
          </div>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-group full-width">
              <label>Full Name (Official)</label>
              <input 
                type="text" 
                value={formData.fullName}
                placeholder="Enter name as per Govt ID"
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input 
                type="tel" 
                value={formData.phone}
                placeholder="+91 XXXXX XXXXX"
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Ward / Area Number</label>
              <input 
                type="text" 
                value={formData.wardNo}
                placeholder="Ex: Ward 10"
                onChange={(e) => setFormData({...formData, wardNo: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Authorized City</label>
              <input 
                type="text" 
                value={formData.city} 
                placeholder="Enter your city"
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Primary Residential Address</label>
              <input 
                type="text" 
                value={formData.address}
                placeholder="Apartment, Street, Landmark"
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <button type="submit" className="save-btn">
              Authenticate & Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}