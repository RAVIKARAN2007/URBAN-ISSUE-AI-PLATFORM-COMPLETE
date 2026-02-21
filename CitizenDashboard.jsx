import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { db } from "../firebase"; 
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "../styles/citizen.css";

export default function CitizenDashboard() {
  const [myIssues, setMyIssues] = useState([]);
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCitizen = JSON.parse(localStorage.getItem("citizen"));
    
    if (savedCitizen) {
      setCitizen(savedCitizen);
      fetchMyReports(savedCitizen.email);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchMyReports = async (email) => {
    try {
      setLoading(true);
      const q = query(collection(db, "reports"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      const reports = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });

      reports.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMyIssues(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: CITIZEN VERIFICATION LOGIC ---
  const handleVerification = async (reportId, userResponse) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      
      // Update Firestore with the citizen's confirmation
      await updateDoc(reportRef, {
        citizenConfirmation: userResponse,
        confirmationDate: new Date().toISOString(),
        // If citizen says "No", we can optionally move status back to 'Re-Opened'
        status: userResponse === "Fixed" ? "Resolved" : "Re-Opened"
      });

      // Update local state UI
      setMyIssues(myIssues.map(issue => 
        issue.id === reportId 
        ? { ...issue, citizenConfirmation: userResponse, status: userResponse === "Fixed" ? "Resolved" : "Re-Opened" } 
        : issue
      ));

      alert(userResponse === "Fixed" ? "✅ Thank you for confirming!" : "⚠️ Admin notified that the issue persists.");
    } catch (error) {
      console.error("Error updating verification:", error);
    }
  };

  const deleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to take back this report? This will remove it from city records.")) {
      try {
        await deleteDoc(doc(db, "reports", reportId));
        setMyIssues(myIssues.filter(issue => issue.id !== reportId));
        alert("🗑️ Report successfully withdrawn.");
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("Failed to delete report.");
      }
    }
  };

  if (!loading && (!citizen || !citizen.isProfileComplete)) {
    window.location.href = "/profile-setup";
    return null;
  }

  if (loading) return <div className="loading-screen">Syncing with Command Center...</div>;

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-layout">
        
        {/* SIDEBAR: Profile Card */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="avatar-wrapper">
              <img src={citizen.picture || citizen.photo || "https://via.placeholder.com/150"} alt="User Profile" />
              <div className="online-indicator"></div>
            </div>
            <h3>{citizen.fullName || citizen.name}</h3>
            <p className="user-email">{citizen.email}</p>
            
            <hr className="divider" />
            
            <div className="user-details">
              <div className="detail-item">
                <span>📍 Location</span>
                <strong>{citizen.city}</strong>
              </div>
              <div className="detail-item">
                <span>📞 Contact</span>
                <strong>{citizen.phone || "Not Set"}</strong>
              </div>
              <div className="detail-item">
                <span>🏛️ Ward</span>
                <strong>{citizen.wardNo || "N/A"}</strong>
              </div>
            </div>

            <Link to="/profile-setup?edit=true" className="edit-profile-btn">Edit Profile</Link>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          <header className="main-header">
            <div>
              <h1>Welcome Back, {(citizen.fullName || citizen.name).split(' ')[0]}!</h1>
              <p>Track your reported urban issues and city updates.</p>
            </div>
            <div className="header-actions">
              <Link to="/report" className="primary-btn">+ Report New Issue</Link>
            </div>
          </header>

          <section className="stats-grid">
            <div className="stat-box">
              <span>Total Reports</span>
              <h2>{myIssues.length}</h2>
            </div>
            <div className="stat-box">
              <span>Resolved</span>
              <h2 className="text-green">{myIssues.filter(i => i.status === 'Resolved').length}</h2>
            </div>
            <div className="stat-box">
              <span>Pending</span>
              <h2 className="text-orange">{myIssues.filter(i => i.status === 'Pending' || !i.status).length}</h2>
            </div>
          </section>

          <h2 style={{marginBottom: '20px'}}>Your Recent Activities</h2>
          <div className="issues-list">
            {myIssues.length > 0 ? (
              myIssues.map((issue) => (
                <div key={issue.id}>
                  <div className="issue-row">
                    <div className="issue-visual">
                      {issue.imageURL || issue.image ? (
                        <img src={issue.imageURL || issue.image} alt="Evidence" className="issue-thumb" />
                      ) : (
                        <div className="no-thumb">No Image</div>
                      )}
                    </div>

                    <div className="issue-info">
                      <div className="issue-header-flex">
                        <h4>{issue.problem || issue.category}</h4>
                        {issue.isAiVerified && <span className="ai-tag-mini">AI Verified</span>}
                      </div>
                      <p>{issue.description?.substring(0, 80)}...</p>
                      <span className="report-date">{issue.date}</span>
                    </div>

                    <div className="issue-meta">
                      <span className="issue-city">📍 {issue.city}</span>
                      <span className={`status-pill ${(issue.status || 'Pending').toLowerCase().replace(" ", "-")}`}>
                        {issue.status || "Pending"}
                      </span>
                      <button className="delete-report-btn" onClick={() => deleteReport(issue.id)}>
                        Take Back Report
                      </button>
                    </div>
                  </div>

                  {/* CREATIVE ADDITION: VERIFICATION PROMPT */}
                  {issue.status === "Resolved" && !issue.citizenConfirmation && (
                    <div className="verification-card">
                      <p>✨ Admin marked this as <b>Resolved</b>. Did it solve your problem?</p>
                      <div className="verif-btn-group">
                        <button 
                          className="verif-btn-yes" 
                          onClick={() => handleVerification(issue.id, "Fixed")}
                        >
                          Yes, It's Fixed
                        </button>
                        <button 
                          className="verif-btn-no" 
                          onClick={() => handleVerification(issue.id, "Not Fixed")}
                        >
                          No, Still Broken
                        </button>
                      </div>
                    </div>
                  )}

                  {issue.citizenConfirmation === "Fixed" && (
                    <div className="verif-success-msg">
                      🎉 You confirmed this issue is resolved.
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🏙️</div>
                <p>No issues reported yet. Your city needs your help!</p>
                <Link to="/report" className="start-btn">File First Report</Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        /* CSS for the Verification Feature */
        .verification-card {
          background: linear-gradient(90deg, #1e293b, #0f172a);
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 15px 20px;
          margin-top: -10px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideDown 0.4s ease-out;
        }
        .verif-btn-group { display: flex; gap: 10px; }
        .verif-btn-yes { background: #22c55e; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
        .verif-btn-no { background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
        .verif-success-msg { color: #22c55e; font-size: 0.85rem; padding: 10px; font-weight: bold; }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .verification-card { flex-direction: column; gap: 15px; text-align: center; }
        }
      `}</style>
    </div>
  );
}